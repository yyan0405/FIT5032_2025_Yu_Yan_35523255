const express = require('express');
const multer = require('multer');
const { sendEmail, sendEmailWithFiles, verifyEmailConfig } = require('../services/emailService');
const router = express.Router();

// 配置multer用于文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// 验证邮箱配置
router.get('/verify', async (req, res) => {
  try {
    const result = await verifyEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '验证邮箱配置时发生错误'
    });
  }
});

// 发送普通邮件
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    // 验证必填字段
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: '收件人和主题是必填字段'
      });
    }
    
    const emailData = {
      to,
      subject,
      text,
      html
    };
    
    const result = await sendEmail(emailData);
    
    if (result.success) {
      res.json({
        success: true,
        message: '邮件发送成功',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('发送邮件错误:', error);
    res.status(500).json({
      success: false,
      error: '发送邮件时发生错误'
    });
  }
});

// 发送带附件的邮件
router.post('/send-with-attachments', upload.array('attachments', 5), async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    const files = req.files;
    
    // 验证必填字段
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: '收件人和主题是必填字段'
      });
    }
    
    const emailData = {
      to,
      subject,
      text,
      html
    };
    
    const result = await sendEmailWithFiles(emailData, files);
    
    if (result.success) {
      res.json({
        success: true,
        message: '带附件的邮件发送成功',
        messageId: result.messageId,
        attachmentCount: files ? files.length : 0
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('发送带附件邮件错误:', error);
    res.status(500).json({
      success: false,
      error: '发送带附件邮件时发生错误'
    });
  }
});

// 批量发送邮件
router.post('/send-bulk', async (req, res) => {
  try {
    const { recipients, subject, text, html } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: '收件人列表不能为空'
      });
    }
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        error: '主题是必填字段'
      });
    }
    
    const results = [];
    
    // 逐个发送邮件
    for (const recipient of recipients) {
      const emailData = {
        to: recipient,
        subject,
        text,
        html
      };
      
      const result = await sendEmail(emailData);
      results.push({
        recipient,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    res.json({
      success: true,
      message: `批量邮件发送完成: ${successCount}成功, ${failureCount}失败`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount
      }
    });
    
  } catch (error) {
    console.error('批量发送邮件错误:', error);
    res.status(500).json({
      success: false,
      error: '批量发送邮件时发生错误'
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds limit (max 10MB)'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'File count exceeds limit (max 5 files)'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || '服务器内部错误'
  });
});

module.exports = router;