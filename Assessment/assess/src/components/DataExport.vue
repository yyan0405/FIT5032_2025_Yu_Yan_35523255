<template>
  <div class="data-export">
    <div class="export-header">
      <h3>{{ title }}</h3>
      <p v-if="description" class="export-description">{{ description }}</p>
    </div>

    <div class="export-options">
      <div class="export-format">
        <label>Export Format:</label>
        <div class="format-buttons">
          <button 
            :class="['format-btn', { active: selectedFormat === 'csv' }]"
            @click="selectedFormat = 'csv'"
          >
            <i class="fas fa-file-csv"></i>
            CSV
          </button>
          <button 
            :class="['format-btn', { active: selectedFormat === 'pdf' }]"
            @click="selectedFormat = 'pdf'"
          >
            <i class="fas fa-file-pdf"></i>
            PDF
          </button>
        </div>
      </div>

      <div class="export-filename">
        <label for="filename">Filename:</label>
        <input 
          id="filename"
          v-model="filename"
          type="text"
          placeholder="Enter filename (without extension)"
          class="filename-input"
        />
      </div>

      <div v-if="selectedFormat === 'pdf'" class="pdf-options">
        <div class="pdf-title">
          <label for="pdfTitle">Report Title:</label>
          <input 
            id="pdfTitle"
            v-model="pdfTitle"
            type="text"
            placeholder="Enter report title"
            class="title-input"
          />
        </div>
      </div>

      <div v-if="showFieldSelection && availableFields.length > 0" class="field-selection">
        <label>Select Fields to Export:</label>
        <div class="fields-grid">
          <label 
            v-for="field in availableFields" 
            :key="field.key"
            class="field-checkbox"
          >
            <input 
              v-model="selectedFields"
              :value="field.key"
              type="checkbox"
            />
            <span>{{ field.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="export-actions">
      <button 
        :disabled="isExporting || !canExport"
        :class="['export-btn', selectedFormat]"
        @click="handleExport"
      >
        <i v-if="isExporting" class="fas fa-spinner fa-spin"></i>
        <i v-else :class="selectedFormat === 'csv' ? 'fas fa-download' : 'fas fa-file-pdf'"></i>
        {{ isExporting ? 'Exporting...' : `Export ${selectedFormat.toUpperCase()}` }}
      </button>
      
      <button 
        v-if="showSampleData"
        :disabled="isExporting"
        class="sample-btn"
        @click="exportSampleData"
      >
        <i class="fas fa-eye"></i>
        Export Sample Data
      </button>
    </div>

    <div v-if="exportStatus" :class="['export-status', exportStatus.type]">
      <i :class="exportStatus.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ exportStatus.message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DataExport',
  props: {
    title: {
      type: String,
      default: 'Data Export'
    },
    description: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    availableFields: {
      type: Array,
      default: () => []
    },
    showFieldSelection: {
      type: Boolean,
      default: true
    },
    showSampleData: {
      type: Boolean,
      default: true
    },
    defaultFilename: {
      type: String,
      default: 'export'
    },
    apiBaseUrl: {
      type: String,
      default: 'http://localhost:3001/api/export'
    }
  },
  data() {
    return {
      selectedFormat: 'csv',
      filename: this.defaultFilename,
      pdfTitle: 'Data Export Report',
      selectedFields: [],
      isExporting: false,
      exportStatus: null
    }
  },
  computed: {
    canExport() {
      return this.filename.trim().length > 0
    },
    exportData() {
      if (!this.data || this.data.length === 0) {
        return []
      }
      
      if (this.selectedFields.length === 0) {
        return this.data
      }
      
      return this.data.map(item => {
        const filteredItem = {}
        this.selectedFields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            filteredItem[field] = item[field]
          }
        })
        return filteredItem
      })
    }
  },
  watch: {
    availableFields: {
      immediate: true,
      handler(newFields) {
        if (newFields && newFields.length > 0) {
          this.selectedFields = newFields.map(field => field.key)
        }
      }
    },
    defaultFilename: {
      immediate: true,
      handler(newFilename) {
        this.filename = newFilename
      }
    }
  },
  methods: {
    async handleExport() {
      if (!this.canExport) return
      
      this.isExporting = true
      this.exportStatus = null
      
      try {
        const endpoint = `${this.apiBaseUrl}/${this.selectedFormat}`
        const payload = {
          data: this.exportData,
          filename: this.filename
        }
        
        if (this.selectedFormat === 'pdf') {
          payload.title = this.pdfTitle
        }
        
        if (this.selectedFields.length > 0) {
          payload.fields = this.selectedFields
        }
        
        const response = await axios.post(endpoint, payload, {
          responseType: 'blob'
        })
        
        this.downloadFile(response.data, `${this.filename}.${this.selectedFormat}`)
        
        this.exportStatus = {
          type: 'success',
          message: `${this.selectedFormat.toUpperCase()} file exported successfully!`
        }
        
        this.$emit('export-success', {
          format: this.selectedFormat,
          filename: this.filename,
          recordCount: this.exportData.length
        })
        
      } catch (error) {
        console.error('Export error:', error)
        this.exportStatus = {
          type: 'error',
          message: error.response?.data?.error || `Failed to export ${this.selectedFormat.toUpperCase()} file`
        }
        
        this.$emit('export-error', {
          format: this.selectedFormat,
          error: error.message
        })
      } finally {
        this.isExporting = false
        
        // Clear status after 5 seconds
        setTimeout(() => {
          this.exportStatus = null
        }, 5000)
      }
    },
    
    async exportSampleData() {
      this.isExporting = true
      this.exportStatus = null
      
      try {
        const endpoint = `${this.apiBaseUrl}/sample-${this.selectedFormat}`
        
        const response = await axios.get(endpoint, {
          responseType: 'blob'
        })
        
        this.downloadFile(response.data, `sample-data.${this.selectedFormat}`)
        
        this.exportStatus = {
          type: 'success',
          message: `Sample ${this.selectedFormat.toUpperCase()} file exported successfully!`
        }
        
      } catch (error) {
        console.error('Sample export error:', error)
        this.exportStatus = {
          type: 'error',
          message: `Failed to export sample ${this.selectedFormat.toUpperCase()} file`
        }
      } finally {
        this.isExporting = false
        
        setTimeout(() => {
          this.exportStatus = null
        }, 5000)
      }
    },
    
    downloadFile(blob, filename) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    
    resetForm() {
      this.selectedFormat = 'csv'
      this.filename = this.defaultFilename
      this.pdfTitle = 'Data Export Report'
      this.selectedFields = this.availableFields.map(field => field.key)
      this.exportStatus = null
    }
  }
}
</script>

<style scoped>
.data-export {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.export-header {
  margin-bottom: 24px;
}

.export-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5rem;
}

.export-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.export-options {
  margin-bottom: 24px;
}

.export-format {
  margin-bottom: 16px;
}

.export-format label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.format-buttons {
  display: flex;
  gap: 8px;
}

.format-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.format-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.format-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.export-filename,
.pdf-title {
  margin-bottom: 16px;
}

.export-filename label,
.pdf-title label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.filename-input,
.title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.filename-input:focus,
.title-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.field-selection {
  margin-bottom: 16px;
}

.field-selection label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f8f9fa;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.field-checkbox:hover {
  background: #e9ecef;
}

.field-checkbox input[type="checkbox"] {
  margin: 0;
}

.export-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.export-btn.csv {
  background: #28a745;
  color: white;
}

.export-btn.csv:hover:not(:disabled) {
  background: #218838;
}

.export-btn.pdf {
  background: #dc3545;
  color: white;
}

.export-btn.pdf:hover:not(:disabled) {
  background: #c82333;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sample-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.sample-btn:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.sample-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.export-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.export-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .data-export {
    padding: 16px;
  }
  
  .format-buttons {
    flex-direction: column;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .fields-grid {
    grid-template-columns: 1fr;
  }
}
</style>