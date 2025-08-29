<template>
  <div class="data-table">
    <!-- Table title and action area -->
    <div class="table-header">
      <h2 v-if="title" class="table-title">{{ title }}</h2>
      <div class="table-actions">
        <!-- Global search -->
        <div class="search-box">
          <input
            v-model="globalSearch"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <!-- Page size selection -->
        <div class="page-size-selector">
          <label>Show:</label>
          <select v-model="pageSize" @change="currentPage = 1">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>

    <!-- Column search area -->
    <div v-if="showColumnSearch" class="column-search">
      <div class="column-search-header">
        <h3>Search by Column</h3>
        <button @click="clearColumnSearch" class="clear-btn">Clear All</button>
      </div>
      <div class="column-search-grid">
        <div
          v-for="column in searchableColumns"
          :key="column.key"
          class="column-search-item"
        >
          <label>{{ column.title }}:</label>
          <input
            v-model="columnSearches[column.key]"
            type="text"
            :placeholder="`Search ${column.title}`"
            class="column-search-input"
          />
        </div>
      </div>
    </div>

    <!-- Table body -->
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{
                'sortable': column.sortable !== false,
                'sorted': sortColumn === column.key,
                'asc': sortColumn === column.key && sortDirection === 'asc',
                'desc': sortColumn === column.key && sortDirection === 'desc'
              }"
              @click="handleSort(column)"
            >
              <div class="th-content">
                <span>{{ column.title }}</span>
                <span v-if="column.sortable !== false" class="sort-indicator">
                  <span class="sort-arrow sort-asc" :class="{ active: sortColumn === column.key && sortDirection === 'asc' }">▲</span>
                  <span class="sort-arrow sort-desc" :class="{ active: sortColumn === column.key && sortDirection === 'desc' }">▼</span>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="columns.length" class="loading-cell">
              <div class="loading-spinner"></div>
              <span>Loading...</span>
            </td>
          </tr>
          <tr v-else-if="paginatedData.length === 0" class="no-data-row">
            <td :colspan="columns.length" class="no-data-cell">
              <div class="no-data-content">
                <span class="no-data-icon">📄</span>
                <span>{{ noDataText }}</span>
              </div>
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            class="data-row"
            :class="{ 'even': index % 2 === 0, 'odd': index % 2 === 1 }"
            @click="handleRowClick(row, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.className"
            >
              <slot
                :name="`column-${column.key}`"
                :row="row"
                :value="getColumnValue(row, column.key)"
                :index="index"
              >
                {{ formatColumnValue(row, column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination controls -->
    <div v-if="!loading && filteredData.length > 0" class="pagination">
      <div class="pagination-info">
        Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }} of {{ filteredData.length }} entries
      </div>
      <div class="pagination-controls">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="First page"
        >
          ⏮
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Previous page"
        >
          ◀
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="{
              'pagination-btn': true,
              'active': page === currentPage,
              'ellipsis': page === '...'
            }"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Next page"
        >
          ▶
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Last page"
        >
          ⏭
        </button>
      </div>
      
      <!-- Jump to specific page -->
      <div class="page-jumper">
        <span>Go to</span>
        <input
          v-model.number="jumpPage"
          type="number"
          :min="1"
          :max="totalPages"
          class="jump-input"
          @keyup.enter="goToPage(jumpPage)"
        />
        <span>page</span>
        <button @click="goToPage(jumpPage)" class="jump-btn">Go</button>
      </div>
    </div>

    <!-- Table toolbar -->
    <div class="table-toolbar">
      <button
          @click="toggleColumnSearch"
          class="toolbar-btn"
          :class="{ active: showColumnSearch }"
        >
          {{ showColumnSearch ? 'Hide Column Search' : 'Show Column Search' }}
        </button>
      <button @click="exportData" class="toolbar-btn">Export Data</button>
      <button @click="refreshData" class="toolbar-btn">Refresh</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'DataTable',
  props: {
    // Table data
    data: {
      type: Array,
      default: () => []
    },
    // Column configuration
    columns: {
      type: Array,
      required: true
    },
    // Table title
    title: {
      type: String,
      default: ''
    },
    // Search placeholder
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    // Text displayed when no data
    noDataText: {
      type: String,
      default: 'No data available'
    },
    // Loading state
    loading: {
      type: Boolean,
      default: false
    },
    // Row key field
    rowKey: {
      type: String,
      default: 'id'
    },
    // Default page size
    defaultPageSize: {
      type: Number,
      default: 10
    },
    // Default sort column
    defaultSortColumn: {
      type: String,
      default: ''
    },
    // Default sort direction
    defaultSortDirection: {
      type: String,
      default: 'asc',
      validator: value => ['asc', 'desc'].includes(value)
    }
  },
  emits: ['row-click', 'sort-change', 'search-change', 'page-change', 'refresh'],
  setup(props, { emit }) {
    // Reactive data
    const globalSearch = ref('')
    const columnSearches = ref({})
    const sortColumn = ref(props.defaultSortColumn)
    const sortDirection = ref(props.defaultSortDirection)
    const currentPage = ref(1)
    const pageSize = ref(props.defaultPageSize)
    const showColumnSearch = ref(false)
    const jumpPage = ref(1)

    // Searchable columns
    const searchableColumns = computed(() => {
      return props.columns.filter(column => column.searchable !== false)
    })

    // Filtered data
    const filteredData = computed(() => {
      let result = [...props.data]

      // Global search
      if (globalSearch.value.trim()) {
        const searchTerm = globalSearch.value.toLowerCase().trim()
        result = result.filter(row => {
          return props.columns.some(column => {
            const value = getColumnValue(row, column.key)
            return String(value).toLowerCase().includes(searchTerm)
          })
        })
      }

      // Column search
      Object.keys(columnSearches.value).forEach(key => {
        const searchTerm = columnSearches.value[key]
        if (searchTerm && searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim()
          result = result.filter(row => {
            const value = getColumnValue(row, key)
            return String(value).toLowerCase().includes(term)
          })
        }
      })

      return result
    })

    // Sorted data
    const sortedData = computed(() => {
      if (!sortColumn.value) return filteredData.value

      return [...filteredData.value].sort((a, b) => {
        const aValue = getColumnValue(a, sortColumn.value)
        const bValue = getColumnValue(b, sortColumn.value)
        
        let result = 0
        if (aValue < bValue) result = -1
        else if (aValue > bValue) result = 1
        
        return sortDirection.value === 'desc' ? -result : result
      })
    })

    // Total pages
    const totalPages = computed(() => {
      return Math.ceil(filteredData.value.length / pageSize.value)
    })

    // Paginated data
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedData.value.slice(start, end)
    })

    // Visible page numbers
    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        
        if (current > 4) {
          pages.push('...')
        }
        
        const start = Math.max(2, current - 2)
        const end = Math.min(total - 1, current + 2)
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (current < total - 3) {
          pages.push('...')
        }
        
        pages.push(total)
      }
      
      return pages
    })

    // Methods
    const getColumnValue = (row, key) => {
      return key.split('.').reduce((obj, k) => obj?.[k], row) ?? ''
    }

    const formatColumnValue = (row, column) => {
      const value = getColumnValue(row, column.key)
      
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value, row)
      }
      
      return value
    }

    const getRowKey = (row, index) => {
      return getColumnValue(row, props.rowKey) || index
    }

    const handleSort = (column) => {
      if (column.sortable === false) return
      
      if (sortColumn.value === column.key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column.key
        sortDirection.value = 'asc'
      }
      
      emit('sort-change', {
        column: column.key,
        direction: sortDirection.value
      })
    }

    const handleRowClick = (row, index) => {
      emit('row-click', { row, index })
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        jumpPage.value = page
        emit('page-change', {
          page,
          pageSize: pageSize.value
        })
      }
    }

    const toggleColumnSearch = () => {
      showColumnSearch.value = !showColumnSearch.value
    }

    const clearColumnSearch = () => {
      columnSearches.value = {}
    }

    const exportData = () => {
      // Simple CSV export
      const headers = props.columns.map(col => col.title).join(',')
      const rows = filteredData.value.map(row => {
        return props.columns.map(col => {
          const value = getColumnValue(row, col.key)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      })
      
      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${props.title || 'data'}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    const refreshData = () => {
      emit('refresh')
    }

    // Watch search changes
    watch([globalSearch, columnSearches], () => {
      currentPage.value = 1
      emit('search-change', {
        global: globalSearch.value,
        columns: columnSearches.value
      })
    }, { deep: true })

    // Watch page size changes
    watch(pageSize, () => {
      currentPage.value = 1
    })

    // Initialize column search object
    onMounted(() => {
      searchableColumns.value.forEach(column => {
        columnSearches.value[column.key] = ''
      })
    })

    return {
      globalSearch,
      columnSearches,
      sortColumn,
      sortDirection,
      currentPage,
      pageSize,
      showColumnSearch,
      jumpPage,
      searchableColumns,
      filteredData,
      sortedData,
      totalPages,
      paginatedData,
      visiblePages,
      getColumnValue,
      formatColumnValue,
      getRowKey,
      handleSort,
      handleRowClick,
      goToPage,
      toggleColumnSearch,
      clearColumnSearch,
      exportData,
      refreshData
    }
  }
}
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Table header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.table-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 35px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.search-icon {
  position: absolute;
  right: 10px;
  color: #666;
  pointer-events: none;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.page-size-selector select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

/* Column search area */
.column-search {
  padding: 20px;
  background: #f1f3f4;
  border-bottom: 1px solid #e9ecef;
}

.column-search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.column-search-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.clear-btn {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.clear-btn:hover {
  background: #5a6268;
}

.column-search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.column-search-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.column-search-item label {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
}

.column-search-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.3s ease;
}

.column-search-input:focus {
  border-color: #42b983;
}

/* Table container */
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  user-select: none;
}

.table th.sortable {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.table th.sortable:hover {
  background: #e9ecef;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sort-indicator {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sort-arrow {
  font-size: 8px;
  color: #ccc;
  transition: color 0.3s ease;
}

.sort-arrow.active {
  color: #42b983;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.data-row {
  transition: background-color 0.2s ease;
}

.data-row:hover {
  background: #f8f9fa;
}

.data-row.even {
  background: #fdfdfd;
}

.loading-row,
.no-data-row {
  background: #f8f9fa;
}

.loading-cell,
.no-data-cell {
  text-align: center;
  padding: 40px 12px;
  color: #6c757d;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.5;
}

/* Pagination controls */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-numbers {
  display: flex;
  gap: 2px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  min-width: 40px;
  text-align: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-btn.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

.pagination-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
}

.page-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.jump-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  outline: none;
}

.jump-btn {
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.jump-btn:hover {
  background: #369870;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.toolbar-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.toolbar-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-btn.active {
  background: #42b983;
  border-color: #42b983;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .column-search-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .table-toolbar {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .table {
    font-size: 12px;
  }
  
  .table th,
  .table td {
    padding: 8px 6px;
  }
  
  .pagination-btn {
    padding: 6px 8px;
    min-width: 32px;
    font-size: 12px;
  }
}
</style>