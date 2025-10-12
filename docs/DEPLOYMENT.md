# 🚀 EMS Deployment Guide

Comprehensive guide for deploying the Employee Management System to various environments including development, staging, and production.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- npm or yarn

### Local Development Environment

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd EMS
   ```

2. **Backend Setup**
   ```bash
   cd ems-backend
   npm install
   cp .env.example .env
   # Edit .env with local configuration
   npm run seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../ems-frontend
   npm install
   # Create .env file with REACT_APP_API_URL=http://localhost:5000/api
   npm start
   ```

4. **Access Points**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

## ☁️ Production Deployment

### Option 1: Railway (Recommended for simplicity)

#### Backend Deployment
1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy Backend**
   ```bash
   cd ems-backend
   railway login
   railway deploy
   ```

3. **Set Environment Variables**
   ```bash
   railway service
   # Set these variables in Railway dashboard:
   # NODE_ENV=production
   # MONGODB_URI=your-production-mongodb-uri
   # JWT_SECRET=your-secure-jwt-secret
   # FRONTEND_URL=https://your-frontend-domain.railway.app
   ```

#### Frontend Deployment
1. **Deploy Frontend**
   ```bash
   cd ../ems-frontend
   npm run build
   railway deploy --build
   ```

2. **Set Environment Variables**
   ```bash
   # REACT_APP_API_URL=https://your-backend-domain.railway.app/api
   # REACT_APP_ENVIRONMENT=production
   ```

### Option 2: Heroku

#### Backend Deployment
1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd ems-backend
   heroku create ems-backend
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secure-secret
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

#### Frontend Deployment
1. **Create Frontend App**
   ```bash
   cd ../ems-frontend
   heroku create ems-frontend
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static.git
   heroku config:set REACT_APP_API_URL=https://ems-backend.herokuapp.com/api
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

### Option 3: DigitalOcean Droplet

1. **Create Droplet**
   - Go to DigitalOcean and create a new droplet
   - Choose Ubuntu 20.04 LTS
   - Select appropriate size (2GB RAM minimum)

2. **Setup Server**
   ```bash
   # Connect to your droplet
   ssh root@your-droplet-ip

   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs

   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   apt-get update
   apt-get install -y mongodb-org
   systemctl start mongod
   systemctl enable mongod

   # Install Nginx
   apt install -y nginx

   # Clone your repository
   git clone <your-repo-url> /var/www/ems
   cd /var/www/ems
   ```

3. **Setup Backend**
   ```bash
   cd ems-backend
   npm install --production
   cp .env.example .env
   # Edit .env with production values
   npm run build
   npm start
   ```

4. **Setup Frontend**
   ```bash
   cd ../ems-frontend
   npm install
   npm run build
   cp -r build/* /var/www/html/
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 4: AWS Deployment

#### Using AWS EC2 + RDS + S3

1. **Setup EC2 Instance**
   - Launch EC2 instance with Ubuntu
   - Install Node.js, MongoDB, Nginx

2. **Setup RDS MongoDB**
   - Create MongoDB instance in RDS
   - Configure security groups

3. **Setup S3 for Frontend**
   ```bash
   # Build frontend
   cd ems-frontend
   npm run build

   # Upload to S3
   aws s3 sync build/ s3://your-bucket-name --delete

   # Enable static hosting
   # Configure CloudFront for CDN
   ```

4. **Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://rds-instance-endpoint:27017/ems
   JWT_SECRET=your-very-secure-secret-key
   FRONTEND_URL=https://your-cloudfront-domain.com
   ```

## ⚙️ Environment Configuration

### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ems

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=your-s3-bucket-name

# Logging
LOG_LEVEL=info
```

### Development Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=development-secret-key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

## 🗄️ Database Setup

### MongoDB Atlas (Cloud)

1. **Create Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

2. **Create Cluster**
   - Choose AWS, GCP, or Azure
   - Select region closest to your users
   - Choose M0 (Free) or paid tier

3. **Setup Database User**
   - Create database user with read/write permissions
   - Whitelist your IP addresses

4. **Get Connection String**
   ```javascript
   mongodb+srv://username:password@cluster.mongodb.net/ems
   ```

### Local MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt install mongodb

   # macOS
   brew install mongodb-community

   # Windows
   # Download from mongodb.com
   ```

2. **Start MongoDB**
   ```bash
   # Linux
   sudo systemctl start mongodb

   # macOS
   brew services start mongodb-community

   # Windows
   net start MongoDB
   ```

3. **Seed Database**
   ```bash
   cd ems-backend
   npm run seed
   ```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **Environment Variables**: Never commit secrets to version control
- [ ] **HTTPS Only**: Enforce HTTPS in production
- [ ] **Strong JWT Secret**: Use cryptographically secure random strings
- [ ] **Database Credentials**: Use strong, unique passwords
- [ ] **CORS Configuration**: Restrict origins to your domains only
- [ ] **Rate Limiting**: Enable and configure rate limiting
- [ ] **Input Validation**: Validate all user inputs
- [ ] **SQL Injection Protection**: Use parameterized queries (Mongoose handles this)
- [ ] **XSS Protection**: Sanitize user inputs
- [ ] **CSRF Protection**: Implement CSRF tokens for state-changing operations
- [ ] **Security Headers**: Use Helmet.js for security headers
- [ ] **File Upload Security**: Validate file types and sizes
- [ ] **Error Handling**: Don't expose stack traces in production

### SSL/TLS Configuration

1. **Get SSL Certificate**
   - Use Let's Encrypt (free)
   - Use AWS Certificate Manager
   - Purchase from certificate authorities

2. **Configure HTTPS**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Security configurations
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;
   }
   ```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Install Monitoring Tools**
   ```bash
   npm install winston morgan
   ```

2. **Configure Logging**
   ```javascript
   // logger.js
   const winston = require('winston');

   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' })
     ]
   });
   ```

### Server Monitoring

- **PM2**: Process management and monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Comprehensive monitoring platform
- **AWS CloudWatch**: AWS monitoring and logging

### Database Monitoring

- **MongoDB Atlas**: Built-in monitoring
- **MongoDB Cloud Manager**: Advanced monitoring
- **Custom Scripts**: Database health checks

## 💾 Backup & Recovery

### Database Backup

1. **Automated Backups**
   ```bash
   # Create backup script
   mongodump --uri="mongodb://localhost:27017/ems" --out=/backup/$(date +\%Y\%m\%d)

   # Schedule daily backups
   crontab -e
   # Add: 0 2 * * * mongodump --uri="mongodb://localhost:27017/ems" --out=/backup/$(date +\%Y\%m\%d)
   ```

2. **Cloud Storage Backup**
   ```bash
   # Upload to AWS S3
   aws s3 sync /backup/ s3://your-backup-bucket/ems-backups/
   ```

### Recovery Process

1. **Restore from Backup**
   ```bash
   mongorestore --uri="mongodb://localhost:27017/ems" /backup/20231207/
   ```

2. **Verify Restoration**
   ```bash
   # Check database
   mongo --eval "db.stats()"
   ```

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance**
   ```javascript
   // Remove old attendance records
   db.attendance.deleteMany({
     date: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
   })
   ```

3. **Log Rotation**
   ```bash
   # Rotate logs daily
   logrotate /etc/logrotate.d/ems
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process
   lsof -ti:5000 | xargs kill -9
   # Or on Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity
   - Review firewall settings

3. **Build Errors**
   ```bash
   # Clear npm cache
   npm cache clean --force

   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Memory Issues**
   ```bash
   # Increase Node memory
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

### Debug Mode

1. **Enable Debug Logging**
   ```env
   LOG_LEVEL=debug
   NODE_ENV=development
   ```

2. **Check Application Logs**
   ```bash
   # View logs
   tail -f logs/combined.log

   # View errors
   tail -f logs/error.log
   ```

3. **Database Debugging**
   ```bash
   # Enable MongoDB profiling
   db.setProfilingLevel(2)

   # View slow queries
   db.system.profile.find().sort({ millis: -1 }).limit(10)
   ```

## 📞 Support

### Getting Help

1. **Check Logs**: Review application and server logs
2. **API Documentation**: Visit `/api/docs` endpoint
3. **Environment Variables**: Verify all required variables are set
4. **Database Connection**: Test MongoDB connectivity
5. **Network Issues**: Check firewall and security group settings

### Emergency Contacts

- **Development Issues**: Check local setup and configuration
- **Production Issues**: Monitor server resources and logs
- **Database Issues**: Verify backups and connection strings
- **Security Issues**: Review access logs and security configurations

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev          # Start backend in development
npm start           # Start frontend

# Production
npm run build       # Build for production
npm start           # Start production server

# Database
npm run seed        # Seed database with demo data
mongodump          # Create database backup
mongorestore       # Restore from backup

# Monitoring
pm2 logs           # View PM2 logs
pm2 monit          # Monitor PM2 processes
```

---

**Happy deploying! 🚀**
