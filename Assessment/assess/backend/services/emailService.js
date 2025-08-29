const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 网易邮箱SMTP配置
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.163.com',
    port: 465,
    secure: true, // 使用SSL
    auth: {
      user: process.env.EMAIL_USER || 'your_netease_email@163.com', // 网易邮箱地址
      pass: process.env.EMAIL_PASS || 'your_authorization_code' // 网易邮箱授权码
    }
  });
};

// 发送邮件函数
const sendEmail = async (emailData) => {
  try {
    const { to, subject, text, html, attachments } = emailData;
    
    // 验证必填字段
    if (!to || !subject) {
      throw new Error('收件人和主题是必填字段');
    }
    
    const transporter = createTransporter();
    
    // 邮件选项
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your_netease_email@163.com',
      to: Array.isArray(to) ? to.join(',') : to,
      subject: subject,
      text: text || '',
      html: html || text || ''
    };
    
    // 处理附件
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => {
        if (attachment.path) {
          // File path attachment
          return {
            filename: attachment.filename || path.basename(attachment.path),
            path: attachment.path
          };
        } else if (attachment.content) {
          // Content attachment
          return {
            filename: attachment.filename || 'attachment',
            content: attachment.content,
            encoding: attachment.encoding || 'base64'
          };
        }
        return attachment;
      });
    }
    
    // 发送邮件
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error('邮件发送失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 验证邮箱配置
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: '邮箱配置验证成功' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email with attachments (specifically for file uploads)
const sendEmailWithFiles = async (emailData, files) => {
  try {
    const attachments = [];
    
    // Process uploaded files
    if (files && files.length > 0) {
      files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        });
      });
    }
    
    // 合并附件
    const finalEmailData = {
      ...emailData,
      attachments: [...(emailData.attachments || []), ...attachments]
    };
    
    return await sendEmail(finalEmailData);
    
  } catch (error) {
    console.error('发送带附件邮件失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEmail,
  sendEmailWithFiles,
  verifyEmailConfig
};