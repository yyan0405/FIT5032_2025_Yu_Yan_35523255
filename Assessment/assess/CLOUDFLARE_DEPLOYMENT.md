# Cloudflare Pages Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Health Charity Services application to Cloudflare Pages.

## Prerequisites
- GitHub repository with your project code
- Cloudflare account
- Firebase project configured

## Deployment Steps

### 1. Connect GitHub Repository
1. Log in to your Cloudflare dashboard
2. Go to Pages section
3. Click "Create a project"
4. Connect your GitHub account
5. Select the repository: `FIT5032_2025_Yu_Yan_35523255`

### 2. Configure Build Settings
- **Framework preset**: Vue
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `assess`

### 3. Environment Variables Configuration
In Cloudflare Pages dashboard, go to Settings > Environment variables and add:

```
VITE_FIREBASE_API_KEY=AIzaSyAcv1e-JHSWOGeIrzS6VIhTpMFrzlJ0ndQ
VITE_FIREBASE_AUTH_DOMAIN=fit5032-a3-83d8a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fit5032-a3-83d8a
VITE_FIREBASE_STORAGE_BUCKET=fit5032-a3-83d8a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=499392313564
VITE_FIREBASE_APP_ID=1:499392313564:web:87e65ebeb6ed9e99c81c19
VITE_EMAIL_SERVICE_URL=https://your-backend-service.herokuapp.com
```

### 4. Deploy
1. Click "Save and Deploy"
2. Wait for the build to complete
3. Your site will be available at `https://your-project.pages.dev`

## Troubleshooting

### Connection Reset Error (ERR_CONNECTION_RESET)
If you see a connection reset error when accessing the deployed site:

1. **Check Environment Variables**: Ensure all Firebase configuration variables are correctly set in Cloudflare Pages dashboard
2. **Verify Firebase Configuration**: Make sure your Firebase project allows the Cloudflare Pages domain
3. **Check Build Logs**: Review the deployment logs for any build errors
4. **Clear Cache**: Try accessing the site in incognito mode or clear browser cache

### Firebase Authentication Issues
1. Add your Cloudflare Pages domain to Firebase Authentication authorized domains:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your `*.pages.dev` domain

### Email Service Issues
1. Deploy your backend service to a hosting platform (Heroku, Railway, etc.)
2. Update `VITE_EMAIL_SERVICE_URL` with the actual backend URL
3. Ensure CORS is properly configured in your backend

## Post-Deployment Checklist
- [ ] Site loads without errors
- [ ] Firebase authentication works
- [ ] All pages are accessible
- [ ] Email functionality works (if backend is deployed)
- [ ] Responsive design works on mobile devices

## Custom Domain (Optional)
1. Go to Custom domains in Cloudflare Pages
2. Add your domain
3. Update DNS records as instructed
4. Add the custom domain to Firebase authorized domains

## Monitoring and Analytics
- Use Cloudflare Analytics to monitor site performance
- Set up Firebase Analytics for user behavior tracking
- Monitor error logs in Cloudflare dashboard

## Additional Notes

### Important Reminders
1. Always test your application locally before deploying
2. Keep your Firebase API keys secure
3. Regularly update dependencies for security
4. Make sure the root directory is set to `assess` in Cloudflare Pages
5. Verify all environment variables are configured in Cloudflare dashboard

### Quick Fix for Connection Reset Error
If you're experiencing connection reset errors:
1. Go to Cloudflare Pages dashboard
2. Navigate to Settings > Environment variables
3. Add all the Firebase configuration variables listed above
4. Redeploy the project
5. Add your Cloudflare Pages domain to Firebase authorized domains