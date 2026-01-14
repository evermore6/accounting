# Burjo Accounting System - Frontend

Modern React frontend for the Burjo Accounting System with TypeScript, Tailwind CSS, and Recharts.

## Features

- **Role-Based Dashboard**: Different views for Owner, Admin, Staff, and Viewer
- **Transaction Management**: Create, view, and approve transactions
- **Financial Reports**: Interactive reports with charts
- **Inventory Tracking**: Real-time stock monitoring
- **User Management**: Admin interface for user control
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Socket.io integration for notifications

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Burjo Accounting System
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout/      # Layout components (Navbar, Sidebar)
│   │   ├── Common/      # Common components (Button, Input, Table)
│   │   ├── Forms/       # Form components
│   │   ├── Reports/     # Report components
│   │   └── Dashboard/   # Dashboard components
│   ├── pages/          # Page components
│   ├── context/        # React context providers
│   ├── services/       # API service layer
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   ├── App.tsx         # Main app component
│   └── index.tsx       # Application entry point
├── public/             # Static assets
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## Available Routes

- `/login` - Login page
- `/dashboard` - Main dashboard
- `/transactions` - Transaction list and management
- `/journal` - Journal entries view
- `/reports` - Financial reports
- `/inventory` - Inventory management
- `/users` - User management (Admin only)

## Authentication

The app uses JWT token authentication. Tokens are stored in localStorage and automatically included in API requests.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | pakbudi@burjo.local | password123 |
| Admin | siti@burjo.local | password123 |
| Staff | rino@burjo.local | password123 |

## Technologies Used

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Axios**: HTTP client
- **Recharts**: Charts and graphs
- **date-fns**: Date manipulation

## License

MIT
