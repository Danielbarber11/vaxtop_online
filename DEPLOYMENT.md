# Vaxtop Online - Deployment Guide

## Overview
This document provides step-by-step instructions for deploying the Vaxtop Online application to production.

## Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (for deployment)
- Google OAuth credentials
- Gemini API key

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Danielbarber11/vaxtop_online.git
cd vaxtop_online
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_KEY=your_gemini_api_key
VITE_ENV=development
```

5. Start development server:
```bash
npm run dev
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - http://localhost:5173 (development)
   - https://yourdomain.com (production)
6. Copy Client ID to `.env.local`

## Getting Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create new API key
4. Copy to `.env.local`

## Data Persistence

The application uses localStorage for data persistence. User data includes:
- User profile information
- Product links and metadata
- User preferences and settings

Data is automatically saved and loaded from localStorage.

## Production Deployment on Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add the following variables:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID
   - `VITE_API_KEY`: Your Gemini API Key
   - `VITE_ENV`: production
   - `VITE_ENABLE_GOOGLE_AUTH`: true
   - `VITE_ENABLE_DATA_PERSISTENCE`: true

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your site will be live at `your-project.vercel.app`

## Custom Domain Setup

1. In Vercel Settings > Domains
2. Add your custom domain
3. Update DNS records according to Vercel instructions
4. Update Google OAuth redirect URIs with your new domain

## Features Deployed

✅ User authentication with localStorage
✅ Google OAuth login integration
✅ Product link management with persistence
✅ Data backup and export functionality
✅ Responsive design for all devices
✅ Hebrew language support
✅ Accessibility features

## Monitoring and Maintenance

### Check Deployment Status
- View Vercel dashboard for build and deployment status
- Check browser console for any errors

### Data Backup
Users can export their data via the profile settings.

### Performance Optimization
- The application is optimized with Vite for fast builds
- Production build is automatically minified
- Static assets are cached by Vercel's CDN

## Troubleshooting

### Build Failures
- Check Node.js version (must be 18+)
- Verify all environment variables are set
- Check for syntax errors in code

### Google OAuth Issues
- Verify redirect URIs match deployed domain
- Check Client ID is correct
- Ensure Google+ API is enabled

### Data Not Persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check for localStorage quota errors in console

## Future Enhancements

- Backend database integration (Firebase/MongoDB)
- Cloud storage for user data
- Advanced analytics
- Multi-language support beyond Hebrew
- Mobile app versions

## Support

For issues or questions, please open a GitHub issue.
