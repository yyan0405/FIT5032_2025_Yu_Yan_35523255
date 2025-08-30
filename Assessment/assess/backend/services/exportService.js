const { Parser } = require('json2csv');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Export Service for generating CSV and PDF files
 */
class ExportService {
  /**
   * Generate CSV from data array
   * @param {Array} data - Array of objects to export
   * @param {Array} fields - Fields to include in CSV (optional)
   * @returns {Promise<string>} CSV string
   */
  static async generateCSV(data, fields = null) {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data provided for CSV export');
      }

      // If no fields specified, use all keys from first object
      if (!fields && data.length > 0) {
        fields = Object.keys(data[0]);
      }

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);
      
      return csv;
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error(`CSV generation failed: ${error.message}`);
    }
  }

  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - HTML content to convert to PDF
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generatePDF(htmlContent, options = {}) {
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const defaultOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      };
      
      const pdfOptions = { ...defaultOptions, ...options };
      const pdfBuffer = await page.pdf(pdfOptions);
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML table from data array
   * @param {Array} data - Array of objects
   * @param {string} title - Table title
   * @param {Array} fields - Fields to include (optional)
   * @returns {string} HTML string
   */
  static generateHTMLTable(data, title = 'Data Export', fields = null) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .no-data { text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="no-data">No data available for export</p>
        </body>
        </html>
      `;
    }

    // If no fields specified, use all keys from first object
    if (!fields && data.length > 0) {
      fields = Object.keys(data[0]);
    }

    const headers = fields.map(field => 
      field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
    );

    const tableRows = data.map(row => {
      const cells = fields.map(field => {
        const value = row[field];
        return `<td>${value !== null && value !== undefined ? String(value) : ''}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #e8f4f8;
          }
          .export-info {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="export-info">
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Export data as CSV file
   * @param {Array} data - Data to export
   * @param {string} filename - Filename without extension
   * @param {Array} fields - Fields to include (optional)
   * @returns {Promise<Object>} Export result with CSV content
   */
  static async exportToCSV(data, filename = 'export', fields = null) {
    try {
      const csvContent = await this.generateCSV(data, fields);
      
      return {
        success: true,
        filename: `${filename}.csv`,
        content: csvContent,
        mimeType: 'text/csv',
        size: Buffer.byteLength(csvContent, 'utf8')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export data as PDF file
   * @param {Array} data - Data to export
   * @param {string} filename - Filename without extension
   * @param {string} title - PDF title
   * @param {Array} fields - Fields to include (optional)
   * @param {Object} pdfOptions - PDF generation options
   * @returns {Promise<Object>} Export result with PDF buffer
   */
  static async exportToPDF(data, filename = 'export', title = 'Data Export', fields = null, pdfOptions = {}) {
    try {
      const htmlContent = this.generateHTMLTable(data, title, fields);
      const pdfBuffer = await this.generatePDF(htmlContent, pdfOptions);
      
      return {
        success: true,
        filename: `${filename}.pdf`,
        content: pdfBuffer,
        mimeType: 'application/pdf',
        size: pdfBuffer.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ExportService;