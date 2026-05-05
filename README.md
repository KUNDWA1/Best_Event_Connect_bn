# EventKonnect Limited BN

EventKonnect is a professional event management platform designed to connect event planners, vendors, and guests. It provides a robust API for managing events, bookings, vendors, guests, feedback, and more, with real-time features and modern integrations.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (admin, event planner, vendor)
- Event creation, management, and categorization
- Vendor onboarding and service packages
- Guest management with QR code invitations
- Booking system for event services
- Real-time chat and voice call support (Socket.io)
- Feedback and rating system for vendors
- Cloudinary integration for media uploads
- Swagger API documentation

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **File Uploads:** Cloudinary
- **API Docs:** Swagger (OpenAPI 3.0)

## Getting Started

1. **Clone the repository:**
   ```git clone https://github.com/KUNDWA1/Best_Event_Connect_bn.git
   cd Best_Event_Connect_bn
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values (see below).
4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

- `DATABASE_URL` (PostgreSQL connection string)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (for Nodemailer)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PORT` (optional, defaults to 5000)
- `RENDER_EXTERNAL_URL` (for deployed API docs)

## Database Schema

The project uses Prisma ORM. See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema, including:

- User, Vendor, Event, Booking, Guest, Feedback, ChatRoom, Message, ServiceCategory, EventCategory, EventService, VendorServicePackage

## Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Compile TypeScript
- `npm start` — Run compiled server
- `npx prisma migrate deploy` — Apply database migrations
- `npx prisma generate` — Generate Prisma client

## API Documentation

Interactive API docs are available via Swagger:

- Local: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- Production: `/api-docs` on your deployed server

## Test Credentials

Use these seeded accounts to test different roles:

- **Admin**
  - Email: `divinekundwa@gmail.com`
  - Password: `12345678`
- **Event Planner**
  - Email: `mutuyimana11@gmail.com`
  - Password: `12345678`
- **Vendor**
  - Email: `divine@example.com`
  - Password: `12345678`

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
