const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vue development server address
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file service
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route configuration
const emailRoutes = require('./routes/email');
const exportRoutes = require('./routes/export');
app.use('/api/email', emailRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health Charity Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Health Charity Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      email: {
        send: 'POST /api/email/send',
        sendWithAttachments: 'POST /api/email/send-with-attachments',
        sendBulk: 'POST /api/email/send-bulk',
        verify: 'GET /api/email/verify'
      }
    }
  });
});

// 404处理
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Health Charity Backend Server is running!`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`📧 Email API: http://localhost:${PORT}/api/email`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n📝 Available Email Endpoints:`);
  console.log(`   POST /api/email/send - Send regular email`);
  console.log(`   POST /api/email/send-with-attachments - Send email with attachments`);
  console.log(`   POST /api/email/send-bulk - Send bulk emails`);
  console.log(`   GET  /api/email/verify - Verify email configuration`);
  console.log(`\n⚠️  Please ensure NetEase email configuration in .env file:`);
  console.log(`   EMAIL_USER=your_netease_email@163.com`);
  console.log(`   EMAIL_PASS=your_authorization_code`);
});

module.exports = app;