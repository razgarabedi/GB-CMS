# GB-CMS Deployment Guide

## Overview

This guide covers deploying GB-CMS to various environments, from development to production. It includes configuration options, environment setup, and best practices for different deployment scenarios.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **Memory**: 4GB RAM
- **Storage**: 10GB free space
- **Network**: Stable internet connection

#### Recommended Requirements
- **Node.js**: 20.0 or higher
- **Memory**: 8GB RAM or more
- **Storage**: 20GB free space
- **Network**: High-speed internet connection
- **CPU**: Multi-core processor

### Required Software

#### Development
- **Git**: Version control
- **VS Code**: Recommended IDE
- **Docker**: Containerization (optional)

#### Production
- **Node.js**: Runtime environment
- **PM2**: Process manager (recommended)
- **Nginx**: Reverse proxy (recommended)
- **SSL Certificate**: HTTPS support

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Development (.env.local)
```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=GB-CMS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_PLUGINS=true

# External Services
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key

# Database (if using external database)
DATABASE_URL=postgresql://user:password@localhost:5432/gbcms
```

#### Production (.env.production)
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=GB-CMS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_PLUGINS=true

# External Services
NEXT_PUBLIC_WEATHER_API_KEY=your_production_weather_api_key
NEXT_PUBLIC_NEWS_API_KEY=your_production_news_api_key

# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/gbcms

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Next.js Configuration

Configure Next.js for different environments:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Image optimization
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Performance
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
  
  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

## Development Deployment

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/gb-cms.git
   cd gb-cms/server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   ```
   http://localhost:3000
   ```

### Development with Docker

1. **Create Dockerfile**
   ```dockerfile
   # Dockerfile.dev
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["npm", "run", "dev"]
   ```

2. **Create Docker Compose**
   ```yaml
   # docker-compose.dev.yml
   version: '3.8'
   
   services:
     gb-cms:
       build:
         context: .
         dockerfile: Dockerfile.dev
       ports:
         - "3000:3000"
       volumes:
         - .:/app
         - /app/node_modules
       environment:
         - NODE_ENV=development
       env_file:
         - .env.local
   ```

3. **Run with Docker**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

## Production Deployment

### Manual Deployment

1. **Prepare Production Build**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Install Production Dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Set Up Process Manager**
   ```bash
   npm install -g pm2
   ```

4. **Create PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'gb-cms',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/gb-cms',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       log_file: '/var/log/gb-cms/combined.log',
       out_file: '/var/log/gb-cms/out.log',
       error_file: '/var/log/gb-cms/error.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       max_memory_restart: '1G',
       node_args: '--max_old_space_size=1024'
     }]
   };
   ```

5. **Start Application**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

### Nginx Configuration

Configure Nginx as reverse proxy:

```nginx
# /etc/nginx/sites-available/gb-cms
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static Files
    location /_next/static/ {
        alias /path/to/gb-cms/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main Application
    location / {
        proxy_pass http://localhost:3000;
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

## Docker Deployment

### Production Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  gb-cms:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - gb-cms
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

## Cloud Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL
   vercel env add NEXT_PUBLIC_API_URL
   # Add other environment variables
   ```

### AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
   - Connect your GitHub repository to AWS Amplify
   - Configure build settings

2. **Build Settings**
   ```yaml
   # amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

#### Using AWS ECS

1. **Create ECS Task Definition**
   ```json
   {
     "family": "gb-cms",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "gb-cms",
         "image": "your-account.dkr.ecr.region.amazonaws.com/gb-cms:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/gb-cms",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Create Cloud Run Service**
   ```bash
   gcloud run deploy gb-cms \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Configure Environment Variables**
   ```bash
   gcloud run services update gb-cms \
     --set-env-vars NODE_ENV=production \
     --set-env-vars NEXT_PUBLIC_APP_URL=https://your-service-url
   ```

## Performance Optimization

### Build Optimization

1. **Enable SWC Minification**
   ```javascript
   // next.config.js
   module.exports = {
     swcMinify: true,
   };
   ```

2. **Optimize Images**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/webp', 'image/avif'],
       minimumCacheTTL: 60,
     },
   };
   ```

3. **Bundle Analysis**
   ```bash
   npm install -g @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

### Runtime Optimization

1. **Enable Compression**
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
   };
   ```

2. **Configure Caching**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/_next/static/(.*)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ];
     },
   };
   ```

### Database Optimization

1. **Connection Pooling**
   ```javascript
   // database.js
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Query Optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_templates_category ON templates(category);
   CREATE INDEX idx_templates_created_at ON templates(created_at);
   CREATE INDEX idx_widgets_layout_id ON widgets(layout_id);
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
   ```javascript
   // pages/api/health.js
   export default function handler(req, res) {
     res.status(200).json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       memory: process.memoryUsage(),
     });
   }
   ```

2. **Performance Monitoring**
   ```javascript
   // lib/monitoring.js
   const { createClient } = require('@vercel/analytics');
   
   export function trackPerformance(metric) {
     console.log('Performance metric:', metric);
     // Send to monitoring service
   }
   ```

### Logging Configuration

1. **Winston Logger**
   ```javascript
   // lib/logger.js
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   module.exports = logger;
   ```

2. **PM2 Logging**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'gb-cms',
       script: 'npm',
       args: 'start',
       log_file: '/var/log/gb-cms/combined.log',
       out_file: '/var/log/gb-cms/out.log',
       error_file: '/var/log/gb-cms/error.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
     }]
   };
   ```

## Security Considerations

### Security Headers

1. **Helmet.js Configuration**
   ```javascript
   // lib/security.js
   const helmet = require('helmet');
   
   const securityMiddleware = helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true,
     },
   });
   
   module.exports = securityMiddleware;
   ```

2. **Rate Limiting**
   ```javascript
   // lib/rateLimit.js
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again later.',
   });
   
   module.exports = limiter;
   ```

### Data Protection

1. **Environment Variables**
   ```bash
   # Never commit sensitive data
   echo ".env.local" >> .gitignore
   echo ".env.production" >> .gitignore
   ```

2. **Database Security**
   ```sql
   -- Use least privilege principle
   CREATE USER gb_cms_user WITH PASSWORD 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gb_cms_user;
   ```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
npm run build
```

#### Memory Issues
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js

# Monitor memory usage
pm2 monit
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Debugging

1. **Enable Debug Logging**
   ```bash
   DEBUG=* npm run dev
   ```

2. **PM2 Logs**
   ```bash
   pm2 logs gb-cms
   pm2 logs gb-cms --lines 100
   ```

3. **Docker Logs**
   ```bash
   docker logs gb-cms
   docker logs gb-cms --follow
   ```

### Performance Issues

1. **Bundle Analysis**
   ```bash
   npm run analyze
   ```

2. **Database Query Analysis**
   ```sql
   -- Enable query logging
   SET log_statement = 'all';
   SET log_duration = on;
   ```

3. **Memory Profiling**
   ```bash
   # Generate heap dump
   node --inspect server.js
   # Open Chrome DevTools and go to chrome://inspect
   ```

---

*This deployment guide provides comprehensive information for deploying GB-CMS in various environments. For additional help, see the troubleshooting section or contact the development team.*
