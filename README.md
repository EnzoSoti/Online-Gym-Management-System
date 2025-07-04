# 🏋️‍♂️ Online Gym Management System - Fitworx Gym

A comprehensive web-based gym management system built with Node.js, Express, MySQL, and modern frontend technologies. This system provides both customer-facing features and administrative tools for managing gym operations.

## 📋 Table of Contents

- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Installation Guide](#-installation-guide)
- [Database Setup](#-database-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [User Guide](#-user-guide)
- [Admin Guide](#-admin-guide)
- [Troubleshooting](#-troubleshooting)
- [Technical Stack](#-technical-stack)

## ✨ Features

### Customer Features

- **User Registration & Authentication** - Secure login system with role-based access
- **Membership Management** - View and manage gym memberships
- **Class Booking** - Reserve spots in fitness classes
- **Equipment Reservation** - Book gym equipment in advance
- **Calendar Integration** - View scheduled activities and bookings
- **Payment Processing** - Secure payment handling for memberships and services
- **Profile Management** - Update personal information and preferences
- **Real-time Notifications** - Stay informed about bookings and announcements

### Administrative Features

- **Dashboard Analytics** - Comprehensive overview of gym operations
- **Member Management** - Add, edit, and manage member accounts
- **Class Management** - Create and schedule fitness classes
- **Equipment Management** - Track and manage gym equipment
- **Attendance Tracking** - Monitor member check-ins and attendance
- **Sales & Inventory** - Manage supplements and merchandise sales
- **Reports & Analytics** - Generate detailed reports on gym performance
- **User Role Management** - Assign different permission levels to staff
- **Announcement System** - Communicate with members through announcements

## 💻 System Requirements

### Minimum Requirements

- **Node.js** version 16.0 or higher
- **MySQL** version 8.0 or higher
- **npm** (Node Package Manager) version 8.0 or higher
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Recommended Requirements

- **Node.js** version 18.0 or higher
- **MySQL** version 8.0 or higher
- **8GB RAM** or more
- **2GB free disk space**

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Online Gym Management System"
```

### Step 2: Install Dependencies

#### Install Root Dependencies

```bash
npm install
```

#### Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 3: Database Setup

Follow the [Database Setup](#-database-setup) section below.

### Step 4: Environment Configuration

Follow the [Environment Configuration](#-environment-configuration) section below.

## 🗄️ Database Setup

### Step 1: Install MySQL

1. Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/)
2. During installation, set a root password (remember this for later)
3. Ensure MySQL service is running

### Step 2: Create Database

1. Open MySQL Command Line Client or MySQL Workbench
2. Run the following commands:

```sql
CREATE DATABASE fitworx_gym;
USE fitworx_gym;
```

### Step 3: Import Database Schema

1. Create the necessary tables (you'll need to provide the SQL schema file)
2. Import any initial data if available

## ⚙️ Environment Configuration

### Step 1: Create Environment Files

#### Backend Environment (.env)

Create a file named `.env` in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=fitworx_gym
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your_session_secret_key
```

### Step 2: Configure Email Settings

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for the application
3. Use the App Password in the `EMAIL_PASS` field

## 🏃‍♂️ Running the Application

### Step 1: Start the Backend Server

```bash
cd backend
npm start
```

For development with auto-restart:

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3000`

### Step 2: Access the Application

#### Customer Interface

Open your web browser and navigate to:

```
http://localhost:3000
```

#### Admin Interface

Navigate to:

```
http://localhost:3000/main/admin.html
```

## 👥 User Guide

### Getting Started as a Customer

#### 1. Registration

1. Visit the main page at `http://localhost:3000`
2. Click "Let's Go" to access the customer portal
3. Click "Register" to create a new account
4. Fill in your personal information
5. Choose a membership plan
6. Complete the registration process

#### 2. Login

1. Navigate to the login page
2. Enter your email and password
3. Click "Login" to access your account

#### 3. Dashboard Features

- **View Membership Status** - Check your current membership details
- **Book Classes** - Browse and reserve spots in fitness classes
- **Reserve Equipment** - Book gym equipment for specific time slots
- **View Calendar** - See your scheduled activities
- **Make Payments** - Process membership renewals and additional services

#### 4. Profile Management

- Update personal information
- Change password
- View booking history
- Manage preferences

### Customer Features in Detail

#### Class Booking

1. Navigate to the Classes section
2. Browse available classes by date and time
3. Click on a class to view details
4. Click "Book Now" to reserve your spot
5. Receive confirmation via email

#### Equipment Reservation

1. Go to Equipment section
2. Select the equipment you want to use
3. Choose your preferred time slot
4. Confirm your reservation
5. Check in at the gym using your booking reference

#### Payment Processing

1. Navigate to Payments section
2. Select the service you want to pay for
3. Choose your payment method
4. Complete the transaction
5. Receive payment confirmation

## 👨‍💼 Admin Guide

### Getting Started as an Administrator

#### 1. Admin Login

1. Navigate to `http://localhost:3000/main/admin.html`
2. Use your admin credentials to log in
3. Access the admin dashboard

#### 2. Dashboard Overview

The admin dashboard provides:

- **Real-time Statistics** - Member count, revenue, attendance
- **Quick Actions** - Add members, create classes, manage equipment
- **Recent Activity** - Latest bookings, payments, and system events
- **Performance Metrics** - Charts and graphs showing gym performance

#### 3. Member Management

1. **Add New Members**

   - Navigate to Members section
   - Click "Add New Member"
   - Fill in member details
   - Assign membership type
   - Save member information

2. **Edit Member Information**

   - Search for the member
   - Click "Edit" next to their name
   - Update information as needed
   - Save changes

3. **View Member Details**
   - Access member profile
   - View attendance history
   - Check payment records
   - Monitor membership status

#### 4. Class Management

1. **Create New Classes**

   - Go to Classes section
   - Click "Add New Class"
   - Set class name, instructor, time, and capacity
   - Save class details

2. **Schedule Classes**

   - Select class from list
   - Set recurring schedule
   - Assign instructor
   - Set maximum capacity

3. **Monitor Bookings**
   - View class attendance
   - Manage waitlists
   - Send notifications to members

#### 5. Equipment Management

1. **Add Equipment**

   - Navigate to Equipment section
   - Click "Add Equipment"
   - Enter equipment details
   - Set availability status

2. **Track Equipment**
   - Monitor equipment usage
   - Schedule maintenance
   - Update equipment status

#### 6. Sales & Inventory

1. **Manage Supplements**

   - Add new products
   - Update inventory levels
   - Set pricing
   - Track sales

2. **Generate Reports**
   - Sales reports
   - Inventory reports
   - Revenue analysis

#### 7. User Role Management

1. **Create Roles**

   - Define permission levels
   - Assign access rights
   - Set role hierarchy

2. **Manage Users**
   - Assign roles to staff
   - Control access permissions
   - Monitor user activity

#### 8. Announcements

1. **Create Announcements**
   - Write announcement content
   - Set target audience
   - Schedule delivery
   - Send notifications

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Problem**: "Database connection failed"
**Solution**:

- Verify MySQL is running
- Check database credentials in `.env` file
- Ensure database exists
- Test connection manually

#### 2. Port Already in Use

**Problem**: "Port 3000 is already in use"
**Solution**:

- Change port in `.env` file
- Kill process using port 3000
- Use different port number

#### 3. Email Notifications Not Working

**Problem**: Email notifications not being sent
**Solution**:

- Verify email credentials in `.env`
- Check Gmail App Password
- Ensure 2FA is enabled
- Test email configuration

#### 4. Frontend Not Loading

**Problem**: Pages not displaying correctly
**Solution**:

- Clear browser cache
- Check browser console for errors
- Verify all files are in correct locations
- Ensure backend server is running

#### 5. Login Issues

**Problem**: Cannot log in to admin panel
**Solution**:

- Verify admin credentials
- Check database for user records
- Ensure proper role assignments
- Clear browser session data

### Performance Optimization

#### 1. Database Optimization

- Create indexes on frequently queried columns
- Optimize database queries
- Regular database maintenance

#### 2. Application Performance

- Enable caching where appropriate
- Optimize image sizes
- Minimize HTTP requests
- Use CDN for static assets

## 🛠️ Technical Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Database management system
- **bcrypt** - Password hashing
- **nodemailer** - Email functionality
- **multer** - File upload handling
- **express-session** - Session management

### Frontend

- **HTML5** - Markup language
- **CSS3** - Styling
- **JavaScript (ES6+)** - Programming language
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **SweetAlert2** - Alert dialogs
- **FullCalendar** - Calendar component
- **Chart.js** - Data visualization

### Development Tools

- **npm** - Package manager
- **nodemon** - Development server with auto-restart
- **Git** - Version control

## 📞 Support

For technical support or questions:

1. Check the troubleshooting section above
2. Review the documentation
3. Contact the development team

## 📄 License

This project is developed for educational purposes as part of a thesis project.

---

**Note**: This system is designed for educational and demonstration purposes. For production use, additional security measures, testing, and optimization should be implemented.
