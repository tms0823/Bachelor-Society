# Bachelor-Society
CSE470 Project

## 🚀 **Bachelor Society - Complete Setup Guide**

### **📋 Prerequisites**
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MySQL** or **MariaDB** database server - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
- **Git** for cloning the repository

### **⚡ Quick Start (3 minutes)**
```bash
# 1. Clone the repository
git clone https://github.com/tms0823/Bachelor-Society.git
cd bachelor-society

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials (see below)

# 4. Set up the database automatically
npm run setup

# 5. Start the application
npm start
```

Open `http://localhost:3000` and register your first account! 🎉

### **🔧 Environment Configuration**
Edit `.env` with your actual values:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bachelor_society

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### **🗄️ Database Setup**
**Automatic (Recommended):**
```bash
npm run setup  # Creates database, tables, and everything automatically
```

### **📱 Features**
- 👥 **User Registration & Authentication** (JWT-based)
- 🏠 **Housing Listings** with photo uploads
- 🤝 **Roommate Finding** with detailed profiles
- 🎯 **Activity Buddy System** for social connections
- 💬 **Messaging System** between users
- 👨‍💼 **Admin Dashboard** for moderation
- 📱 **Responsive Design** with Tailwind CSS

### **📦 Available Commands**
```bash
# Development
npm run dev          # Start with auto-restart (nodemon)
npm start            # Start production server
npm test             # Run tests

# Database
npm run setup        # Fresh setup (creates DB + tables)
npm run db:backup    # Backup current data
npm run db:restore   # Restore from backup
```

### **🔍 Troubleshooting**
- **Database Connection:** Ensure MySQL is running and credentials are correct
- **Port Issues:** Change PORT in .env if 3000 is in use
- **Permission Errors:** Check file upload directory permissions

### **📂 Project Structure**
```
bachelor-society/
├── controllers/     # API route handlers
├── models/         # Database models
├── views/          # EJS templates
├── routes/         # Express routes
├── public/         # Static files (CSS, JS, images)
├── scripts/        # Utility scripts
├── sql/           # Database schema and seed data
└── utils/         # Helper functions
```

### **🤝 Contributing**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit: `git commit -am 'Add new feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

**Happy coding! 🎯**
=======
# Bachelor-Society
CSE470 Project
>>>>>>> 642d8e9ab697c2f3121225f2c3ec1e1f2ccaf2a0
