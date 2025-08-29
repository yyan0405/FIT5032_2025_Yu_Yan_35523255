# Cloudflare Pages Deployment Guide

## Prerequisites

1. A Cloudflare account
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Firebase project configured for production

## Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to your Git repository
2. Make sure the following files are in your project:
   - `_redirects` file in the `public` folder (already created)
   - `.env.production` with environment variable templates (already created)
   - Updated `vite.config.js` with production optimizations (already configured)

### Important: Project Structure Consideration

Your project structure looks like this:
```
Your-Repository/
├── Assessment/
│   ├── assess/          # ← Your Vue.js project is here
│   │   ├── package.json
│   │   ├── src/
│   │   └── ...
│   └── other files
└── ...
```

**Critical**: Since your Vue.js project is inside the `Assessment/assess` folder, you MUST set the root directory to `/Assessment/assess` in Cloudflare Pages configuration.

## Step 2: Create Cloudflare Pages Project

1. Log in to your Cloudflare dashboard
2. Go to "Pages" in the sidebar
3. Click "Create a project"
4. Choose "Connect to Git"
5. Select your Git provider and authorize Cloudflare
6. Choose your repository

## Step 3: Configure Build Settings

### Build Configuration:
- **Framework preset**: Vue
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/Assessment/assess` (IMPORTANT: This points to the Assessment/assess folder containing your Vue.js project)

### Environment Variables:
Add the following environment variables in Cloudflare Pages settings:

```
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_EMAIL_SERVICE_URL=your_production_email_service_url
```

## Step 4: Deploy

1. Click "Save and Deploy"
2. Cloudflare will automatically build and deploy your project
3. Once deployed, you'll get a URL like `https://your-project.pages.dev`

## Step 5: Configure Custom Domain (Optional)

1. In your Cloudflare Pages project, go to "Custom domains"
2. Add your custom domain
3. Update your DNS settings as instructed

## Step 6: Set up Firebase for Production

1. In your Firebase console, add your Cloudflare Pages domain to authorized domains:
   - Go to Authentication > Settings > Authorized domains
   - Add your `*.pages.dev` domain or custom domain

2. Update Firebase security rules if needed for production

## Automatic Deployments

Cloudflare Pages will automatically redeploy your site whenever you push changes to your connected Git repository.

## Troubleshooting

### Common Issues:

1. **Build fails with "package.json not found"**: 
   - Verify Root directory is set to `/Assessment/assess`
   - Check that your repository contains the `Assessment/assess` folder structure
   
2. **404 errors on page refresh**: Make sure the `_redirects` file is in the `public` folder

3. **Firebase connection issues**: Verify all environment variables are set correctly

4. **Build failures**: Check the build logs in Cloudflare Pages dashboard

5. **Wrong project structure deployed**:
   - Ensure Root directory is `/Assessment/assess`, not `/` or `/Assessment`
   - The build system should find `package.json` in the Assessment/assess folder

### Build Optimization:

The project is already configured with:
- Code splitting for better performance
- Terser minification
- Optimized chunk splitting for vendor libraries
- ES2015 target for broad browser compatibility

## Security Considerations

1. Never commit sensitive keys to your repository
2. Use environment variables for all configuration
3. Regularly update dependencies
4. Configure proper Firebase security rules

## Performance Optimization

The build configuration includes:
- Automatic code splitting
- Vendor chunk separation
- Firebase libraries in separate chunks
- Minification and compression

Your site should achieve excellent performance scores on Cloudflare's global CDN.