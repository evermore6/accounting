# Accounting System Review & Deployment Plan
_(Dokumen bilingual: narasi penjelasan dalam Bahasa Indonesia, istilah akuntansi/teknis dalam Bahasa Inggris.)_

## 1. Ringkasan review kode dan akuntansi secara umum
- Kode backend masih terfokus pada autentikasi; belum ada service akuntansi yang menjalankan double-entry dan validasi keseimbangan debit/kredit.
- Skema SQL existing belum menyimpan `normal_balance`, belum ada pemisahan header/detail jurnal, dan belum ada constraint untuk memastikan total debit = total kredit per jurnal.
- JWT masih memakai fallback secret hard-coded secara statis dan belum ada refresh token/rotasi; RBAC hanya berupa string role tanpa guard di route-level.
- Error handling masih langsung mengekspose pesan mentah dari error throw.
- Struktur folder belum memisahkan layer (controller/service/repository) secara konsisten dan belum ada modul reporting.
- Belum ada Prisma schema; migrasi SQL manual tidak mencakup kebutuhan laporan (Ledger, Trial Balance, Income Statement, Balance Sheet) berbasis jurnal.

## 2. Daftar masalah dan perbaikan yang harus dilakukan (prioritas)
1. **(High)** Tambahkan layer service & repository untuk transaksi akuntansi dengan validasi keseimbangan jurnal (total debit = total kredit) dan penerapan double-entry.
2. **(High)** Perbaiki skema akun: tambah `account_type`, `normal_balance`, dan relasi parent-child; tambahkan constraint check pada jurnal detail (debit XOR credit > 0).
3. **(High)** Perkuat JWT & RBAC: wajibkan `JWT_SECRET` dari env, tambah middleware role guard (admin/accountant/owner), serta refresh token flow dengan revoke list.
4. **(Medium)** Centralized error handler yang menghapus stack/error mentah, logging terstruktur (request id) dan audit trail untuk perubahan finansial.
5. **(Medium)** Tambah input validation (Joi/zod) di controller untuk transaksi, akun, dan laporan.
6. **(Medium)** Tambah security middleware (helmet, rate limit), konfigurasi CORS berbasis env, dan pemisahan config dev/prod.
7. **(Medium)** Siapkan generator laporan (Journal, Ledger, Trial Balance, Income Statement, Balance Sheet) yang membaca dari tabel jurnal.
8. **(Low)** Rapikan struktur folder sesuai arsitektur berlapis dan buat dokumentasi deployment + contoh env produksi.

## 3. Struktur folder hasil refactor
```
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
      logger.ts
      security.ts
    middleware/
      errorHandler.ts
      auth.ts
      rateLimit.ts
    modules/
      auth/ (controller, service, repository)
      accounts/
      journal/
      transactions/
      reports/
    prisma/
      client.ts
    utils/
      validation.ts
  prisma/
    schema.prisma
frontend/
  src/
    api/
    components/
    pages/
    hooks/
  public/
```

## 4. Contoh kode hasil refactor (bagian penting)
*(contoh service untuk target arsitektur Prisma setelah migrasi data)*
```ts
// modules/journal/journal.service.ts
import { prisma } from '../../prisma/client';
import { Prisma } from '@prisma/client';

export async function postJournal(input: {
  reference: string;
  entryDate: Date;
  description?: string;
  lines: { accountId: string; debit: Prisma.Decimal; credit: Prisma.Decimal }[];
  userId: string;
}) {
  const totalDebit = input.lines.reduce((sum, l) => sum.plus(l.debit), new Prisma.Decimal(0));
  const totalCredit = input.lines.reduce((sum, l) => sum.plus(l.credit), new Prisma.Decimal(0));
  if (!totalDebit.equals(totalCredit)) {
    throw new Error('Total debit must equal total credit');
  }

  return prisma.$transaction(async (tx) => {
    const header = await tx.journalEntry.create({
      data: {
        reference: input.reference,
        entryDate: input.entryDate,
        description: input.description,
        createdById: input.userId,
      },
    });

    await tx.journalLine.createMany({
      data: input.lines.map((line) => ({
        journalEntryId: header.id,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
      })),
    });

    return header;
  });
}
```

## 5. Prisma schema terbaru + catatan migration
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum BalanceType {
  DEBIT
  CREDIT
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  passwordHash String
  firstName   String
  lastName    String
  role        String   @default("user") // admin | accountant | owner
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  journalEntries   JournalEntry[] @relation("JournalCreatedBy")
  journalApprovals JournalEntry[] @relation("JournalApprovedBy")
  transactions     Transaction[]  @relation("TransactionCreatedBy")
}

model Account {
  id            String      @id @default(uuid())
  accountNumber String      @unique
  name          String
  type          AccountType
  normalBalance BalanceType
  parentId      String?     @db.Uuid
  parent        Account?    @relation("AccountHierarchy", fields: [parentId], references: [id])
  children      Account[]   @relation("AccountHierarchy")
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  journalLines  JournalLine[]
}

model JournalEntry {
  id           String        @id @default(uuid())
  reference    String        @unique
  entryDate    DateTime
  description  String?
  status       String        @default("posted") // posted | draft | reversed
  createdById  String
  approvedById String?
  createdBy    User          @relation("JournalCreatedBy", fields: [createdById], references: [id])
  approvedBy   User?         @relation("JournalApprovedBy", fields: [approvedById], references: [id])
  lines        JournalLine[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model JournalLine {
  id             String       @id @default(uuid())
  journalEntryId String
  accountId      String
  debit          Decimal      @default(0)
  credit         Decimal      @default(0)
  entry          JournalEntry @relation(fields: [journalEntryId], references: [id])
  account        Account      @relation(fields: [accountId], references: [id])

  /// Add check constraint via migration: (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
  @@index([accountId])
}

model Transaction {
  id             String       @id @default(uuid())
  transactionDate DateTime
  description    String
  source         String       // e.g. "sales", "purchase"
  referenceNumber String?
  journalEntry   JournalEntry? @relation(fields: [journalEntryId], references: [id]) // nullable for draft/unposted
  journalEntryId String?      @db.Uuid
  createdById    String
  createdBy      User         @relation("TransactionCreatedBy", fields: [createdById], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

**Catatan migration aman:**
- Tambahkan kolom baru (`normal_balance`, `account_type`, `parent_id`) dengan default untuk menjaga data existing; isi nilai default berdasarkan mapping manual sebelum menambahkan constraint `NOT NULL`.
- Pindahkan data transaksi lama ke `JournalEntry` + `JournalLine` menggunakan skrip migrasi idempotent, lalu tambahkan foreign key dari transaksi ke jurnal.
- Gunakan check constraint di `journal_lines` untuk mencegah debit & credit sekaligus; gunakan trigger atau constraint agregat (materialized view + check) untuk memastikan total debit = total kredit per `journal_entries`.
- Jalankan migrasi dengan transaksi dan backup terlebih dahulu.

## 6. Checklist kesiapan production
- [ ] JWT secret & refresh secret berbeda, diambil dari environment; refresh token blacklist disimpan di DB/Redis.
- [ ] RBAC middleware diterapkan pada semua route (admin, accountant, owner); audit log pada tindakan finansial.
- [ ] Input validation (Joi/zod) untuk akun, transaksi, jurnal, laporan.
- [ ] Helmet, CORS berbasis env, rate limiting (per IP + per user), dan request logging terstruktur.
- [ ] Error handler terpusat dengan kode error yang dapat dilacak tanpa stack trace mentah.
- [ ] Migrations & seed for basic chart of accounts (English names).
- [ ] Backups otomatis PostgreSQL + monitoring (healthcheck & metrics).
- [ ] CI pipeline: lint, test, prisma migrate, build, container scan.
- [ ] Observability: request id, structured logging, minimal APM hooks.
- [ ] Frontend .env produksi (API base URL, Sentry DSN optional).

## 7. Langkah-langkah deployment dari local sampai website live
1. **Persiapan lokal**: `cp backend/.env.example backend/.env`, isi nilai; jalankan `npm install` (backend & frontend), `npx prisma migrate deploy`, `npm run build`.
2. **Build container**: `docker build -t burjo-backend ./backend` dan `docker build -t burjo-frontend ./frontend`.
3. **Docker Compose (server)**: create network `accounting-net`; run PostgreSQL with volume; run `docker-compose up -d` when using the combined compose file.
4. **Migrasi di server**: `docker run --rm --network accounting-net -e DATABASE_URL=... burjo-backend npx prisma migrate deploy`.
5. **Konfigurasi Nginx** (reverse proxy + SSL):
   ```
   server {
     listen 80;
     server_name example.com;
     location /api/ {
       proxy_pass http://backend:3000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
     location / { proxy_pass http://frontend:3000; }
   }
   ```
6. **Systemd/auto-restart**: gunakan `restart: always` di compose atau systemd unit untuk menjaga kontainer berjalan.
7. **Monitoring & backup**: aktifkan healthcheck di compose, log rotation, dan jadwalkan `pg_dump` harian ke storage terpisah.
