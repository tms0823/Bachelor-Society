# Bachelor Society

**CSE470 Project**

A comprehensive web application for roommate and housing matching, built with Node.js, Express, and MySQL.

## Prerequisites

- Node.js (version 14 or higher)
- MySQL or MariaDB database server
- Git version control system

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/tms0823/Bachelor-Society.git
cd bachelor-society
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file by copying the example:
```bash
cp .env.example .env
```

Configure the following environment variables in `.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bachelor_society

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_key
```

### 4. Database Setup
Initialize the database automatically:
```bash
npm run setup
```

This command creates the database, tables, and sets up the application for use.

### 5. Start the Application
For production:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

Access the application at `http://localhost:3000` and create your first user account.

## Features

- **User Authentication and Authorization** (JWT-based)
- **Housing Listings Management** with image upload capabilities
- **Roommate Matching System** with detailed user profiles
- **Activity Buddy Finder** for social connections
- **Real-time Messaging** between users
- **Administrative Dashboard** for content moderation
- **Responsive Web Design** using Tailwind CSS

## Available Commands

### Development Commands
```bash
npm run dev          # Start development server with auto-restart
npm start            # Start production server
npm test             # Execute test suite
```

### Database Commands
```bash
npm run setup        # Complete database initialization
npm run db:backup    # Create database backup
npm run db:restore   # Restore database from backup
```

## Project Structure

```
bachelor-society/
├── controllers/      # API route handlers
├── models/          # Database models and schemas
├── views/           # EJS template files
├── routes/          # Express routing configuration
├── public/          # Static assets (CSS, JS, images)
├── scripts/         # Database and utility scripts
├── sql/            # Database schema and seed data
├── utils/           # Helper functions and utilities
├── config/          # Application configuration
├── middlewares/     # Express middleware functions
└── __tests__/       # Test suite files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/me` - Get current user profile (authenticated)
- `PUT /api/users/me` - Update user profile (authenticated)

### Housing
- `GET /api/housing` - List housing listings
- `POST /api/housing` - Create housing listing (authenticated)
- `GET /api/housing/:id` - Get housing details
- `PUT /api/housing/:id` - Update housing listing (authenticated, owner only)
- `DELETE /api/housing/:id` - Delete housing listing (authenticated, owner only)

### Roommates
- `GET /api/roommates` - List roommate requests
- `POST /api/roommates` - Create roommate request (authenticated)
- `GET /api/roommates/:id` - Get roommate request details
- `PUT /api/roommates/:id` - Update roommate request (authenticated, owner only)
- `DELETE /api/roommates/:id` - Delete roommate request (authenticated, owner only)
- `POST /api/roommates/:id/contact` - Contact roommate owner (authenticated)

### Buddies
- `GET /api/buddies` - List activity buddy requests
- `POST /api/buddies` - Create buddy request (authenticated)
- `GET /api/buddies/:id` - Get buddy request details
- `PUT /api/buddies/:id` - Update buddy request (authenticated, owner only)
- `DELETE /api/buddies/:id` - Delete buddy request (authenticated, owner only)

### Administrative (Admin role required)
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/housing` - Housing content moderation
- `DELETE /api/admin/housing/:id` - Delete housing listing
- `GET /api/admin/roommates` - Roommate content moderation
- `DELETE /api/admin/roommates/:id` - Delete roommate request
- `GET /api/admin/buddies` - Buddy content moderation
- `DELETE /api/admin/buddies/:id` - Delete buddy request

## Troubleshooting

### Database Connection Issues
- Verify MySQL/MariaDB service is running
- Confirm database credentials in `.env` file are correct
- Ensure database user has proper permissions

### Port Conflicts
- Default port is 3000; modify `PORT` in `.env` if needed
- Check for other applications using the same port

### File Upload Permissions
- Ensure write permissions on the `uploads/` directory
- Check file system permissions for the application user

### Testing
- Execute test suite: `npm test`
- Ensure all prerequisites are installed before testing

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **Authentication**: JSON Web Tokens (JWT)
- **Frontend**: EJS templating, Tailwind CSS
- **File Storage**: Local storage
- **Testing**: Jest, Supertest

## Contributing

1. Fork the repository
2. Create a feature branch from `main`
3. Implement changes with comprehensive testing
4. Commit changes with descriptive messages
5. Push to your feature branch
6. Submit a pull request for review

## License

This project is developed as part of CSE470 coursework.
