<template>
  <div class="email-sender">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Page Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Email Sender</h1>
          <p class="text-gray-600">Send regular emails or emails with attachments</p>
        </div>

        <!-- Email Sending Form -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <form @submit.prevent="sendEmail" class="space-y-6">
            <!-- Recipients -->
            <div>
              <label for="recipients" class="block text-sm font-medium text-gray-700 mb-2">
                Recipients *
              </label>
              <div class="space-y-2">
                <input
                  v-model="newRecipient"
                  @keyup.enter="addRecipient"
                  type="email"
                  placeholder="Enter email address and press Enter to add"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div v-if="recipients.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(recipient, index) in recipients"
                    :key="index"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {{ recipient }}
                    <button
                      @click="removeRecipient(index)"
                      type="button"
                      class="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Email Subject -->
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                v-model="emailData.subject"
                type="text"
                id="subject"
                required
                placeholder="Please enter email subject"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Email Content Type Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="contentType"
                    type="radio"
                    value="text"
                    class="mr-2"
                  />
                  Plain Text
                </label>
                <label class="flex items-center">
                  <input
                    v-model="contentType"
                    type="radio"
                    value="html"
                    class="mr-2"
                  />
                  HTML Format
                </label>
              </div>
            </div>

            <!-- Email Content -->
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                Email Content *
              </label>
              <textarea
                v-model="emailContent"
                id="content"
                required
                rows="8"
                :placeholder="contentType === 'html' ? 'Please enter HTML format email content' : 'Please enter plain text email content'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- File Attachments -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref="fileInput"
                  @change="handleFileSelect"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  class="hidden"
                />
                <div class="text-center">
                  <button
                    @click="$refs.fileInput.click()"
                    type="button"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Select Files
                  </button>
                  <p class="mt-2 text-sm text-gray-500">
                    Support images, PDF, Word, Excel, text files, max 10MB, up to 5 files
                  </p>
                </div>
                
                <!-- Selected Files List -->
                <div v-if="selectedFiles.length > 0" class="mt-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div class="space-y-2">
                    <div
                      v-for="(file, index) in selectedFiles"
                      :key="index"
                      class="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div class="flex items-center">
                        <span class="text-sm text-gray-700">{{ file.name }}</span>
                        <span class="ml-2 text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
                      </div>
                      <button
                        @click="removeFile(index)"
                        type="button"
                        class="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Send Button -->
            <div class="flex justify-end space-x-4">
              <button
                @click="resetForm"
                type="button"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                :disabled="sending || recipients.length === 0"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="sending" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
                <span v-else>Send Email</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Send History -->
        <div v-if="sendHistory.length > 0" class="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Send History</h2>
          <div class="space-y-3">
            <div
              v-for="(record, index) in sendHistory"
              :key="index"
              class="p-3 border rounded-lg"
              :class="record.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium" :class="record.success ? 'text-green-800' : 'text-red-800'">
                    {{ record.subject }}
                  </p>
                  <p class="text-sm text-gray-600">
                    Recipients: {{ record.recipients.join(', ') }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ record.timestamp }}
                  </p>
                </div>
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="record.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ record.success ? 'Success' : 'Failed' }}
                </span>
              </div>
              <p v-if="!record.success" class="text-sm text-red-600 mt-2">
                Error: {{ record.error }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'

export default {
  name: 'EmailSender',
  setup() {
    const recipients = ref([])
    const newRecipient = ref('')
    const emailData = reactive({
      subject: '',
    })
    const emailContent = ref('')
    const contentType = ref('text')
    const selectedFiles = ref([])
    const sending = ref(false)
    const sendHistory = ref([])

    // Add recipient
    const addRecipient = () => {
      const email = newRecipient.value.trim()
      if (!email) return
      
      if (!isValidEmail(email)) {
        alert('Please enter a valid email address')
        return
      }
      
      if (recipients.value.includes(email)) {
        alert('This email already exists')
        return
      }
      
      recipients.value.push(email)
      newRecipient.value = ''
    }

    // Remove recipient
    const removeRecipient = (index) => {
      recipients.value.splice(index, 1)
    }

    // Validate email format
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    // Handle file selection
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      
      // Check file count limit
      if (selectedFiles.value.length + files.length > 5) {
        alert('Maximum 5 files can be selected')
        return
      }
      
      // Check file size and type
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 10MB limit`)
          return
        }
        
        // Check file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain', 'text/csv'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} type not supported`)
          return
        }
      }
      
      selectedFiles.value.push(...files)
    }

    // Remove file
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }

    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Send email
    const sendEmail = async () => {
      if (recipients.value.length === 0) {
        alert('Please add at least one recipient')
        return
      }
      
      if (!emailData.subject.trim()) {
        alert('Please enter email subject')
        return
      }
      
      if (!emailContent.value.trim()) {
        alert('Please enter email content')
        return
      }

      sending.value = true
      
      try {
        const baseURL = 'http://localhost:3001'
        
        // Prepare email data
        const mailData = {
          subject: emailData.subject,
          [contentType.value]: emailContent.value
        }
        
        let results = []
        
        if (selectedFiles.value.length > 0) {
          // Send email with attachments
          for (const recipient of recipients.value) {
            const formData = new FormData()
            formData.append('to', recipient)
            formData.append('subject', emailData.subject)
            formData.append(contentType.value, emailContent.value)
            
            selectedFiles.value.forEach(file => {
              formData.append('attachments', file)
            })
            
            const response = await axios.post(`${baseURL}/api/email/send-with-attachments`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            
            results.push({
              recipient,
              success: response.data.success,
              messageId: response.data.messageId,
              error: response.data.error
            })
          }
        } else {
          // Send regular email
          for (const recipient of recipients.value) {
            const response = await axios.post(`${baseURL}/api/email/send`, {
              to: recipient,
              ...mailData
            })
            
            results.push({
              recipient,
              success: response.data.success,
              messageId: response.data.messageId,
              error: response.data.error
            })
          }
        }
        
        // Record sending history
        const successCount = results.filter(r => r.success).length
        const failureCount = results.length - successCount
        
        sendHistory.value.unshift({
          subject: emailData.subject,
          recipients: recipients.value.slice(),
          success: failureCount === 0,
          error: failureCount > 0 ? `Failed to send to ${failureCount} recipients` : null,
          timestamp: new Date().toLocaleString(),
          attachmentCount: selectedFiles.value.length
        })
        
        if (failureCount === 0) {
          alert(`Email sent successfully! Sent to ${successCount} recipients`)
          resetForm()
        } else {
          alert(`Some emails failed to send: ${successCount} successful, ${failureCount} failed`)
        }
        
      } catch (error) {
        console.error('Email sending error:', error)
        
        sendHistory.value.unshift({
          subject: emailData.subject,
          recipients: recipients.value.slice(),
          success: false,
          error: error.response?.data?.error || error.message || 'Send failed',
          timestamp: new Date().toLocaleString(),
          attachmentCount: selectedFiles.value.length
        })
        
        alert('Email sending failed: ' + (error.response?.data?.error || error.message))
      } finally {
        sending.value = false
      }
    }

    // Reset form
    const resetForm = () => {
      recipients.value = []
      newRecipient.value = ''
      emailData.subject = ''
      emailContent.value = ''
      contentType.value = 'text'
      selectedFiles.value = []
    }

    return {
      recipients,
      newRecipient,
      emailData,
      emailContent,
      contentType,
      selectedFiles,
      sending,
      sendHistory,
      addRecipient,
      removeRecipient,
      handleFileSelect,
      removeFile,
      formatFileSize,
      sendEmail,
      resetForm
    }
  }
}
</script>

<style scoped>
.email-sender {
  min-height: 100vh;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
}

/* Custom scrollbar */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>