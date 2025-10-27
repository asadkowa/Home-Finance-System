# Home Finance System - Deployment Guide

This guide covers deploying the Home Finance System to production.

## Table of Contents

1. [Web Application Deployment](#web-application-deployment)
2. [Mobile App Deployment](#mobile-app-deployment)
3. [Environment Setup](#environment-setup)
4. [Deployment Options](#deployment-options)

---

## Web Application Deployment

### Prerequisites

- Node.js 14+ installed
- MongoDB database (local or cloud)
- Server with Node.js runtime

### Backend Deployment

1. **Install Dependencies**
   ```bash
   cd home-finance-app/backend
   npm install --production
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/home-finance
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   ```

3. **Start Backend Server**
   ```bash
   npm start
   ```

   Or use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name home-finance-api
   pm2 save
   pm2 startup
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd home-finance-app/frontend
   npm install
   npm run build
   ```

2. **Deploy Build Folder**
   
   Option A: Using serve (quick testing)
   ```bash
   npm install -g serve
   serve -s build -l 3000
   ```
   
   Option B: Using Nginx
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/home-finance-app/frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Option C: Using Express (serve static files)
   ```javascript
   // In backend/server.js, add after route definitions:
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../frontend/build')));
   
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
   });
   ```

---

## Mobile App Deployment

### Build for Android

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure Project**
   ```bash
   cd HomeFinanceMobile
   eas build:configure
   ```

3. **Build Android APK/AAB**
   ```bash
   # For production APK
   eas build --platform android --profile production
   
   # For Play Store AAB
   eas build --platform android --profile production --type app-bundle
   ```

4. **Download and Install**
   - Download from EAS dashboard
   - Install on Android device
   - Or upload to Google Play Store

### Build for iOS

1. **Build iOS App**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Upload to App Store**
   - Download from EAS dashboard
   - Upload to App Store Connect
   - Submit for review

### Using Local Build (Advanced)

#### Android
```bash
cd HomeFinanceMobile
npx expo run:android --variant release
```

#### iOS
```bash
cd HomeFinanceMobile
npx expo run:ios --configuration Release
```

---

## Environment Setup

### Backend Environment Variables

Create `.env` in `home-finance-app/backend/`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/home-finance?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Optional - Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Variables

Create `.env.production` in `home-finance-app/frontend/`:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

Update `src/config/api.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com/api';
```

### Mobile App Environment Variables

Create `app.config.js` in `HomeFinanceMobile/`:

```javascript
export default {
  expo: {
    name: "Home Finance",
    slug: "home-finance-mobile",
    version: "1.0.0",
    extra: {
      API_URL: process.env.API_URL || "https://api.yourdomain.com/api",
    },
    // ... rest of config
  },
};
```

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel)**
1. Push code to GitHub
2. Import project in Vercel
3. Configure build: `npm run build` in `home-finance-app/frontend`
4. Deploy

**Backend (Railway/Render)**
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Option 2: Heroku

**Backend**
```bash
heroku create home-finance-api
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
```

**Frontend**
```bash
heroku create home-finance-frontend
heroku config:set REACT_APP_API_URL=https://home-finance-api.herokuapp.com/api
git push heroku main
```

### Option 3: AWS/Google Cloud/Azure

- Use EC2/Compute Engine for backend
- Use S3/Cloud Storage + CloudFront for frontend
- Use RDS/MongoDB Atlas for database
- Configure load balancer and CDN

### Option 4: Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: ./home-finance-app/backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/home-finance
    depends_on:
      - mongo
  
  frontend:
    build: ./home-finance-app/frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Security Checklist

- [ ] Use HTTPS for all connections
- [ ] Set strong JWT secret (32+ characters)
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable CORS restrictions
- [ ] Set secure cookie flags
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Backup database regularly

---

## Post-Deployment

### Testing

1. Test login/register
2. Test all CRUD operations
3. Test mobile app connectivity
4. Check API endpoints
5. Verify database operations

### Monitoring

- Use PM2 monitoring for backend
- Set up error tracking (Sentry)
- Monitor API response times
- Check database performance
- Set up uptime monitoring

---

## Support

For issues, please check:
- [API Documentation](./API_DOCUMENTATION.md)
- [README](./README.md)
- [Mobile App Guide](./MOBILE_APP_GUIDE.md)
