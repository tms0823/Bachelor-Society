# Bachelor Society

**Roommate & Housing Community Platform**

A modern web application connecting people for housing, roommates, and social activities. Built with Node.js, Express, MySQL, and Tailwind CSS.

## Quick Start (2 Minutes)

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- MySQL or MariaDB ([Download](https://dev.mysql.com/downloads/mysql/))

### One-Command Setup
```bash
git clone https://github.com/tms0823/Bachelor-Society.git
cd bachelor-society
npm run quick-start
```

App runs at http://localhost:3007

## Manual Setup (Alternative)

If `quick-start` doesn't work for your environment:

```bash
# 1. Clone and install
git clone https://github.com/tms0823/Bachelor-Society.git
cd bachelor-society
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 3. Setup database
npm run setup

# 4. Start app
npm start
```

## Features

- Housing Listings - Post and find rental properties
- Roommate Matching - Connect with compatible roommates
- Activity Buddies - Find people for social activities
- Messaging System - Direct communication between users
- Photo Uploads - Multiple images for listings
- Secure Authentication - JWT-based login system
- Responsive Design - Works on all devices

## Tech Stack

- Backend: Node.js, Express.js
- Database: MySQL/MariaDB
- Authentication: JSON Web Tokens (JWT)
- Frontend: EJS templates, Tailwind CSS
- File Storage: Local filesystem
- Testing: Jest, Supertest

## Project Structure

```
bachelor-society/
├── controllers/      # API route handlers
├── models/          # Database models
├── views/           # EJS templates
├── routes/          # Express routes
├── middlewares/     # Auth & validation
├── utils/           # Helper functions
├── scripts/         # Setup & utility scripts
├── sql/            # Database schema
└── uploads/         # User uploaded files
```

## Available Commands

```bash
npm start            # Start production server
npm run dev          # Start development server (auto-restart)
npm run setup        # Setup database only
npm run quick-start  # Full automated setup
npm test             # Run test suite
```

## Troubleshooting

### Database Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Create database manually if needed
mysql -u root -p
CREATE DATABASE bachelor_society;
exit;
```

### Port Conflicts
```bash
# Change port in .env
PORT=3008
```

### Permission Issues
```bash
# Fix uploads directory permissions
chmod 755 uploads/
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Core Features
- `GET/POST /api/housing` - Housing listings
- `GET/POST /api/roommates` - Roommate requests
- `GET/POST /api/buddies` - Activity requests
- `GET/POST /api/messages` - User messaging

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is developed as part of CSE470 coursework.
