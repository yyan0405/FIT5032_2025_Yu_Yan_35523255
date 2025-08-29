# Quick Deployment to Cloudflare Pages

## 🚀 Quick Start Guide

### ⚠️ 重要：项目结构说明

您的项目结构：
```
您的仓库/
├── Assessment/
│   ├── assess/          # ← Vue.js项目在这里
│   │   ├── package.json
│   │   ├── src/
│   │   └── ...
│   └── 其他文件
└── ...
```

**关键配置**：必须设置 Root directory 为 `/Assessment/assess`

### 1. Push to Git Repository
```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main
```

### 2. Cloudflare Pages Setup

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create New Project**
   - Click "Create a project" → "Connect to Git"
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Choose your repository

3. **Build Settings**
   ```
   Framework preset: Vue
   Build command: npm run build
   Build output directory: dist
   Root directory: /Assessment/assess
   ```
   
   ⚠️ **重要提示**: 由于您的项目在 `Assessment/assess` 文件夹内，必须设置 Root directory 为 `/Assessment/assess`

### 3. Environment Variables

Add these in Cloudflare Pages → Settings → Environment variables:

**Production Variables:**
```
VITE_FIREBASE_API_KEY=AIzaSyAcv1e-JHSWOGeIrzS6VIhTpMFrzlJ0ndQ
VITE_FIREBASE_AUTH_DOMAIN=fit5032-a3-83d8a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fit5032-a3-83d8a
VITE_FIREBASE_STORAGE_BUCKET=fit5032-a3-83d8a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=499392313564
VITE_FIREBASE_APP_ID=1:499392313564:web:87e65ebeb6ed9e99c81c19
```

### 4. Firebase Configuration

1. **Add Authorized Domain**
   - Go to Firebase Console → Authentication → Settings
   - Add your Cloudflare Pages domain to "Authorized domains"
   - Format: `your-project-name.pages.dev`

### 5. Deploy

- Click "Save and Deploy"
- Wait for build to complete (usually 2-3 minutes)
- Your site will be available at `https://your-project-name.pages.dev`

## ✅ What's Already Configured

- ✅ SPA routing with `_redirects` file
- ✅ Production build optimization
- ✅ Environment variable support
- ✅ Firebase configuration
- ✅ Code splitting and minification
- ✅ Terser compression

## 🔧 Troubleshooting

**Build Fails with "package.json not found"?**
- ✅ 确认 Root directory 设置为 `/Assessment/assess`
- ✅ 检查仓库中包含 `Assessment/assess` 文件夹结构
- ✅ 确保不是设置为 `/` 或 `/Assessment`

**Build Fails (Other Reasons)?**
- Check build logs in Cloudflare Pages dashboard
- Ensure all dependencies are in `package.json`

**404 on Page Refresh?**
- Verify `_redirects` file exists in `public/` folder

**Firebase Errors?**
- Check environment variables are set correctly
- Verify domain is added to Firebase authorized domains

**部署了错误的项目结构?**
- 确保 Root directory 是 `/Assessment/assess`，不是根目录
- 构建系统应该在 Assessment/assess 文件夹中找到 `package.json`

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Add custom domain in Cloudflare Pages
   - Update DNS settings

2. **Performance Monitoring**
   - Use Cloudflare Analytics
   - Monitor Core Web Vitals

3. **Security**
   - Review Firebase security rules
   - Enable Cloudflare security features

Your Vue.js application is now ready for production deployment on Cloudflare Pages! 🎉