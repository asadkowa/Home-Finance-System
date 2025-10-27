# Home Finance System - Ubuntu 24.04 LTS Cloud Deployment

Complete guide for deploying the Home Finance System on Ubuntu 24.04 LTS cloud server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Install Dependencies](#install-dependencies)
4. [Application Setup](#application-setup)
5. [Nginx Configuration](#nginx-configuration)
6. [Process Management](#process-management)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Firewall Configuration](#firewall-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- Ubuntu 24.04 LTS server (via AWS, DigitalOcean, Linode, etc.)
- Root/sudo access
- Domain name pointing to server IP (optional but recommended)
- SSH access to the server

---

## Server Setup

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

### 2. Create Application User

```bash
# Create user
sudo adduser homefinance
sudo usermod -aG sudo homefinance

# Switch to the new user
su - homefinance
```

### 3. Configure SSH (Optional but Recommended)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

---

## Install Dependencies

### 1. Install Node.js 18.x

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

### 3. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Git

```bash
sudo apt install -y git
```

---

## Application Setup

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/asadkowa/Home-Finance-System.git
cd Home-Finance-System
```

### 2. Setup Backend

```bash
cd home-finance-app/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
```

Add the following content to `.env`:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/home-finance
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-32-character-string
```

**Important:** Change `JWT_SECRET` to a random 32+ character string!

```bash
# Save and exit (Ctrl+X, then Y, then Enter)
```

### 3. Setup Frontend

```bash
cd ~/Home-Finance-System/home-finance-app/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 4. Test Backend

```bash
cd ~/Home-Finance-System/home-finance-app/backend

# Start with PM2
pm2 start server.js --name home-finance-api

# Check status
pm2 status

# View logs
pm2 logs home-finance-api

# Stop if needed
# pm2 stop home-finance-api
```

### 5. Configure PM2 to Auto-Start

```bash
# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup systemd

# Follow the instructions provided
# It will print a command like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u homefinance --hp /home/homefinance
```

---

## Nginx Configuration

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/home-finance
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /home/homefinance/Home-Finance-System/home-finance-app/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Replace `your-domain.com` with your actual domain name.**

### 2. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/home-finance /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Update Frontend API URL

```bash
cd ~/Home-Finance-System/home-finance-app/frontend

# Edit the API configuration
nano src/config/api.js
```

Update the API URL:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-domain.com/api';
```

Rebuild frontend:

```bash
npm run build
```

---

## SSL/TLS Setup

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 3. Auto-Renewal

Certbot automatically sets up auto-renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Firewall Configuration

### 1. Configure UFW Firewall

```bash
# Allow SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. MongoDB Security (Important!)

By default, MongoDB only listens on localhost. If you need remote access:

```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf
```

Change:
```yaml
# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1  # Only localhost for security
```

---

## Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# View running processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart home-finance-api

# Stop application
pm2 stop home-finance-api
```

### 2. System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check system load
uptime

# View running processes
top
```

### 3. Log Files

```bash
# Application logs (PM2)
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 4. Backup Script

Create a backup script:

```bash
nano ~/backup.sh
```

Add:

```bash
#!/bin/bash

BACKUP_DIR="/home/homefinance/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/Home-Finance-System

# Keep only last 7 days of backups
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
chmod +x ~/backup.sh
```

Add to crontab (daily at 2 AM):

```bash
crontab -e

# Add this line:
0 2 * * * /home/homefinance/backup.sh >> /var/log/backup.log 2>&1
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs home-finance-api

# Check if MongoDB is running
sudo systemctl status mongod

# Restart services
pm2 restart home-finance-api
sudo systemctl restart mongod
```

### Nginx Not Serving Correctly

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Port Already in Use

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>
```

---

## Security Checklist

- [x] SSH key-based authentication enabled
- [x] Firewall configured (UFW)
- [x] MongoDB bind to localhost only
- [x] Strong JWT secret configured
- [x] SSL/TLS certificate installed
- [x] Automatic security updates enabled
- [x] Regular backups configured
- [x] PM2 auto-restart configured

---

## Quick Reference Commands

```bash
# Start services
pm2 start home-finance-api
sudo systemctl start nginx
sudo systemctl start mongod

# Stop services
pm2 stop home-finance-api
sudo systemctl stop nginx
sudo systemctl stop mongod

# Restart services
pm2 restart home-finance-api
sudo systemctl restart nginx
sudo systemctl restart mongod

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Check status
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod
```

---

## Next Steps

1. Access your application at `https://your-domain.com`
2. Create a user account
3. Test all features
4. Monitor logs for errors
5. Setup automated backups
6. Configure monitoring alerts

---

## Support

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Application logs: `pm2 logs home-finance-api`
- MongoDB logs: `sudo journalctl -u mongod`

---

**Your Home Finance System is now deployed on Ubuntu 24.04 LTS!** 🎉
