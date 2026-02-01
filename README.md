# Ndong World Wide

A full-stack tire and wheel drum e-commerce platform with admin dashboard.

## Architecture

- **Client**: React + TypeScript + Vite (Main website)
- **Admin Dashboard**: React + TypeScript + Vite (Admin panel)
- **Server**: Node.js + Express + TypeScript (REST API)
- **Database**: MongoDB (Atlas)

## Project Structure

```text
Ndong-World-Wide/
├── client/                 # Main website (React)
├── admin-client/           # Admin dashboard (React)
├── server/                 # Express API server
├── nginx/                  # Nginx configuration (for self-hosted)
├── docs/                   # Documentation
│   ├── VERCEL_DEPLOYMENT.md
│   ├── DEPLOYMENT.md       # Self-hosted deployment
│   └── RENDER_DEPLOYMENT.md
└── vercel.json             # Vercel configuration
```

## Features

### Client Website

- Product catalog (tires and wheel drums)
- Product search and filtering
- Responsive design
- SEO-friendly

### Admin Dashboard

- Secure authentication (JWT)
- Product management (CRUD operations)
- Inventory tracking
- Admin user management

### API Server

- RESTful API
- JWT authentication
- Rate limiting
- MongoDB integration
- Comprehensive error handling

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (Atlas account or local instance)
- Git

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/Fon2christian/Ndong-World-Wide.git
cd Ndong-World-Wide
```

1. **Install dependencies**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install admin dependencies
cd ../admin-client
npm install
```

1. **Configure environment variables**

```bash
# In server directory
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

1. **Start development servers**

```bash
# Terminal 1: Start API server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Terminal 3: Start admin
cd admin-client
npm run dev
```

1. **Access the applications**

- Client: <http://localhost:5173>
- Admin: <http://localhost:5175>
- API: <http://localhost:5002>

### Create Admin Account

```bash
cd server
npm run create-admin
```

Follow the prompts to create your first admin user.

## Deployment

### Option 1: Vercel (Recommended)

Easiest and fastest deployment with automatic HTTPS and global CDN.

📖 **[Complete Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)**

**Quick Deploy:**
1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables
4. Deploy!

### Option 2: Self-Hosted (Docker)

Full control with nginx reverse proxy and SSL certificates.

📖 **[Self-Hosted Deployment Guide](docs/DEPLOYMENT.md)**

### Option 3: Render

Alternative cloud platform with similar features to Vercel.

📖 **[Render Deployment Guide](docs/RENDER_DEPLOYMENT.md)**

## Environment Variables

### Server (.env)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-long-random-secret-at-least-32-characters
NODE_ENV=production
PORT=5002
```

### Client

API URL is automatically configured based on environment:
- Development: `http://localhost:5002`
- Production: `/api` (same domain)

## Technology Stack

### Frontend

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Zod**: Runtime type validation

### Backend

- **Node.js**: Runtime
- **Express 5**: Web framework
- **TypeScript**: Type safety
- **MongoDB**: Database
- **Mongoose**: ODM
- **JWT**: Authentication
- **bcrypt**: Password hashing

### DevOps

- **Docker**: Containerization (for self-hosted)
- **nginx**: Reverse proxy (for self-hosted)
- **Vercel**: Serverless deployment
- **GitHub Actions**: CI/CD

## API Documentation

### Public Endpoints

```http
GET  /api/tires           # List all tires
GET  /api/tires/:id       # Get tire details
GET  /api/wheeldrums      # List all wheel drums
GET  /api/wheeldrums/:id  # Get wheel drum details
GET  /api/health          # Health check
```

### Admin Endpoints (Requires Authentication)

```http
POST /api/admin/register  # Register first admin
POST /api/admin/login     # Login
GET  /api/admin/me        # Get current admin

# Tire Management
POST   /api/admin/tires      # Create tire
PUT    /api/admin/tires/:id  # Update tire
DELETE /api/admin/tires/:id  # Delete tire

# Wheel Drum Management
POST   /api/admin/wheeldrums      # Create wheel drum
PUT    /api/admin/wheeldrums/:id  # Update wheel drum
DELETE /api/admin/wheeldrums/:id  # Delete wheel drum
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Security

- **Authentication**: JWT tokens with 7-day expiration
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API endpoint protection
- **HTTPS**: Automatic SSL (Vercel) or Let's Encrypt (self-hosted)
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Input Validation**: Zod schema validation
- **CORS**: Configured for same-origin

## Performance

- **CDN**: Global edge network (Vercel)
- **Compression**: Automatic gzip/brotli
- **Caching**: Optimized cache headers
  - HTML: no-cache
  - Static assets: 1-year immutable
- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: Route-based code splitting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review [ADMIN_SETUP.md](server/ADMIN_SETUP.md) for admin account help
- Contact the development team

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Express](https://expressjs.com)
- Deployed on [Vercel](https://vercel.com)
- Database by [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
