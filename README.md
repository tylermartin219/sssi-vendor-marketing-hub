# SS&Si Vendor Marketing Hub

A production-ready vendor marketing portal built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Home Page** - Hero section with promotions carousel and featured tiles
- **Promotions** - Browse and view detailed promotion pages
- **Swag Shop** - Browse products, add to quote, and submit quote requests
- **Product of the Month** - Calendar view with application system
- **Brand Assets** - Download library for logos, guidelines, and templates
- **Resources** - Categorized links and files
- **Admin Panel** - Full CRUD for managing all content types
- **Authentication** - NextAuth with credentials provider

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   ```
   
   Generate a secure secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database**:
   ```bash
   npx prisma db seed
   ```

   This will create:
   - Admin user: `admin@sssi.com` / `admin123`
   - Vendor user: `vendor@example.com` / `vendor123`
   - Sample promotions, products, POTM months, assets, and resources

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── assets/            # Brand assets page
│   ├── potm/              # Product of the Month pages
│   ├── promotions/        # Promotions pages
│   ├── resources/         # Resources page
│   ├── swag/              # Swag shop pages
│   └── quote/             # Quote management
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── nav.tsx           # Navigation component
│   └── promotion-carousel.tsx
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/               # Prisma files
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Database Management

### Reset Database

To reset the database and re-seed:

```bash
npx prisma migrate reset
```

### View Database

Use Prisma Studio to view and edit data:

```bash
npx prisma studio
```

## Authentication

The app uses NextAuth.js with a credentials provider. Users can log in with:

- **Admin**: `admin@sssi.com` / `admin123`
- **Vendor**: `vendor@example.com` / `vendor123`

### Creating New Users

You can create new users via Prisma Studio or by adding them to the seed script.

To create a user programmatically:

```typescript
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const password = await bcrypt.hash("password123", 10);
await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "User Name",
    password,
    role: "vendor", // or "admin"
    company: "Company Name",
  },
});
```

## Admin Access

Admin users can access the admin panel at `/admin` to:

- Manage promotions
- Manage products
- Manage POTM months
- Manage assets
- Manage resources
- View all quote requests

## Deployment

### Environment Variables

Make sure to set these environment variables in your production environment:

- `DATABASE_URL` - Your production database URL
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - A secure random string

### Database Migration

Before deploying, run migrations:

```bash
npx prisma migrate deploy
```

### Build

Build the application:

```bash
npm run build
```

## Notes

- The app uses SQLite by default for development. For production, consider using PostgreSQL or MySQL.
- Image URLs in seed data use placeholder services. Replace with actual image URLs in production.
- The middleware protects routes - most pages require authentication except the home page.
- Admin routes require the `admin` role.

## License

This project is proprietary software for SS&Si.

