const express = require('express');
const ExportService = require('../services/exportService');
const router = express.Router();

/**
 * Sample data generator for demonstration
 * In a real application, this would come from your database
 */
const generateSampleData = () => {
  return [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      department: 'Engineering',
      joinDate: '2023-01-15',
      salary: 75000
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 28,
      department: 'Marketing',
      joinDate: '2023-03-20',
      salary: 65000
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      age: 35,
      department: 'Sales',
      joinDate: '2022-11-10',
      salary: 70000
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      age: 32,
      department: 'HR',
      joinDate: '2023-02-05',
      salary: 60000
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      age: 29,
      department: 'Engineering',
      joinDate: '2023-04-12',
      salary: 80000
    }
  ];
};

/**
 * Export data as CSV
 * POST /api/export/csv
 * Body: {
 *   data?: Array,
 *   filename?: string,
 *   fields?: Array
 * }
 */
router.post('/csv', async (req, res) => {
  try {
    const { data, filename = 'export', fields } = req.body;
    
    // Use provided data or generate sample data
    const exportData = data && Array.isArray(data) && data.length > 0 
      ? data 
      : generateSampleData();
    
    const result = await ExportService.exportToCSV(exportData, filename, fields);
    
    if (result.success) {
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      res.send(result.content);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV file'
    });
  }
});

/**
 * Export data as PDF
 * POST /api/export/pdf
 * Body: {
 *   data?: Array,
 *   filename?: string,
 *   title?: string,
 *   fields?: Array,
 *   options?: Object
 * }
 */
router.post('/pdf', async (req, res) => {
  try {
    const { 
      data, 
      filename = 'export', 
      title = 'Data Export Report', 
      fields, 
      options = {} 
    } = req.body;
    
    // Use provided data or generate sample data
    const exportData = data && Array.isArray(data) && data.length > 0 
      ? data 
      : generateSampleData();
    
    const result = await ExportService.exportToPDF(exportData, filename, title, fields, options);
    
    if (result.success) {
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      res.send(result.content);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF file'
    });
  }
});

/**
 * Get sample data for testing
 * GET /api/export/sample-data
 */
router.get('/sample-data', (req, res) => {
  try {
    const sampleData = generateSampleData();
    res.json({
      success: true,
      data: sampleData,
      count: sampleData.length
    });
  } catch (error) {
    console.error('Sample data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sample data'
    });
  }
});

/**
 * Export sample data as CSV (for quick testing)
 * GET /api/export/sample-csv
 */
router.get('/sample-csv', async (req, res) => {
  try {
    const sampleData = generateSampleData();
    const result = await ExportService.exportToCSV(sampleData, 'sample-data');
    
    if (result.success) {
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      res.send(result.content);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Sample CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export sample CSV'
    });
  }
});

/**
 * Export sample data as PDF (for quick testing)
 * GET /api/export/sample-pdf
 */
router.get('/sample-pdf', async (req, res) => {
  try {
    const sampleData = generateSampleData();
    const result = await ExportService.exportToPDF(
      sampleData, 
      'sample-data', 
      'Sample Data Report'
    );
    
    if (result.success) {
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.size);
      
      res.send(result.content);
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Sample PDF export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export sample PDF'
    });
  }
});

/**
 * Health check for export service
 * GET /api/export/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Export service is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      csv: 'POST /api/export/csv',
      pdf: 'POST /api/export/pdf',
      sampleData: 'GET /api/export/sample-data',
      sampleCsv: 'GET /api/export/sample-csv',
      samplePdf: 'GET /api/export/sample-pdf'
    }
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Export route error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Export service error'
  });
});

module.exports = router;