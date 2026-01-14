# Deployment Guide

This guide covers deploying the Burjo Accounting System to production.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Production Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/evermore6/accounting.git
cd accounting

# Create production environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Configure Environment Variables

**Backend (.env):**
```env
PORT=3001
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=burjo_accounting
DB_USER=postgres
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# JWT
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECRET_KEY
JWT_EXPIRES_IN=7d

# App
APPROVAL_THRESHOLD=500000
CURRENCY=IDR

# CORS
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Burjo Accounting System
```

### 4. Docker Compose Production Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: burjo-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: burjo_accounting
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - burjo-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: burjo-backend-prod
    restart: always
    depends_on:
      - postgres
    environment:
      PORT: 3001
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: burjo_accounting
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      APPROVAL_THRESHOLD: 500000
      CURRENCY: IDR
      CORS_ORIGIN: https://yourdomain.com
    networks:
      - burjo-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: burjo-frontend-prod
    restart: always
    depends_on:
      - backend
    networks:
      - burjo-network

  nginx:
    image: nginx:alpine
    container_name: burjo-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
    networks:
      - burjo-network

volumes:
  postgres_data:

networks:
  burjo-network:
    driver: bridge
```

### 5. Production Dockerfiles

**Backend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["npm", "start"]
```

**Frontend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 6. Nginx Configuration

Create `nginx.prod.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 7. SSL Certificate Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Database Backup

### Automated Daily Backups

Create backup script `/opt/burjo-backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/burjo"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/burjo_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker exec burjo-postgres-prod pg_dump -U postgres burjo_accounting > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

Make it executable and add to cron:

```bash
chmod +x /opt/burjo-backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /opt/burjo-backup.sh
```

### Manual Backup

```bash
# Backup
docker exec burjo-postgres-prod pg_dump -U postgres burjo_accounting > backup.sql

# Restore
cat backup.sql | docker exec -i burjo-postgres-prod psql -U postgres burjo_accounting
```

## Monitoring

### Application Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Health Checks

Add to monitoring:
- Backend health: `https://api.yourdomain.com/health`
- Frontend: `https://yourdomain.com`
- Database: `docker exec burjo-postgres-prod pg_isready`

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Set up automated backups
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Use environment variables for secrets
- [ ] Restrict database access

## Performance Optimization

1. **Database Indexing**: Already implemented in migrations
2. **Connection Pooling**: Configured in backend (max: 20)
3. **Nginx Caching**: Add caching for static assets
4. **CDN**: Consider using CDN for frontend assets
5. **Database Tuning**: Adjust PostgreSQL settings based on server resources

## Troubleshooting

### Backend won't start
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Database connection issues
```bash
docker exec -it burjo-postgres-prod psql -U postgres
```

### Reset application
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run new migrations if any
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

## Support

For production support, contact your system administrator or create an issue on GitHub.
