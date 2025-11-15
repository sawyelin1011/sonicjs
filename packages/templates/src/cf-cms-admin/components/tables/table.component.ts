/**
 * CF-CMS.js Table Component
 * 
 * Advanced table component with sorting, filtering, pagination, and actions
 */

import { TableComponent, TableColumn, TableAction, TableDataRow } from '../../types'
import { renderButton } from '../forms/button.component'

export function renderTable(props: TableComponent): string {
  const {
    id,
    title,
    description,
    columns,
    data,
    actions = [],
    selection,
    pagination,
    sorting,
    filtering,
    search,
    loading = false,
    empty,
    responsive = true,
    variant = 'default',
    sticky,
    expandable,
    className = ''
  } = props

  const tableId = id || `table-${Date.now()}`

  // Build CSS classes
  const containerClasses = [
    'cf-cms-table-container',
    'relative',
    className
  ].filter(Boolean).join(' ')

  const tableClasses = [
    'cf-cms-table',
    'min-w-full',
    'divide-y',
    'divide-gray-200'
  ]

  // Add variant classes
  if (variant === 'bordered') {
    tableClasses.push('border', 'border-gray-200')
  } else if (variant === 'striped') {
    tableClasses.push('divide-y', 'divide-gray-200')
  } else if (variant === 'compact') {
    tableClasses.push('text-sm')
  }

  const allTableClasses = tableClasses.filter(Boolean).join(' ')

  // Build header
  const headerHtml = title || description ? `
    <div class="cf-cms-table-header px-6 py-4 border-b border-gray-200">
      ${title ? `<h3 class="text-lg font-medium text-gray-900">${title}</h3>` : ''}
      ${description ? `<p class="text-sm text-gray-600 mt-1">${description}</p>` : ''}
    </div>
  ` : ''

  // Build toolbar
  const toolbarHtml = renderTableToolbar({
    search,
    filtering,
    selection,
    actions,
    tableId
  })

  // Build table header
  const tableHeaderHtml = renderTableHeader(columns, sorting, selection, sticky)

  // Build table body
  const tableBodyHtml = loading ? renderTableLoading() : 
    data.length === 0 ? renderTableEmpty(empty) :
    renderTableBody(columns, data, actions, selection, expandable, variant)

  // Build pagination
  const paginationHtml = pagination ? renderTablePagination(pagination, tableId) : ''

  return `
    <div class="${containerClasses}" id="${tableId}">
      ${headerHtml}
      ${toolbarHtml}
      
      <div class="overflow-x-auto ${responsive ? 'lg:overflow-x-visible' : ''}">
        <table class="${allTableClasses}">
          ${tableHeaderHtml}
          ${tableBodyHtml}
        </table>
      </div>
      
      ${paginationHtml}
      
      ${renderTableScripts(tableId, { sorting, selection, expandable })}
    </div>
  `
}

function renderTableToolbar(props: {
  search?: any
  filtering?: any
  selection?: any
  actions?: TableAction[]
  tableId: string
}): string {
  const { search, filtering, selection, actions, tableId } = props

  if (!search && !filtering && !selection && (!actions || actions.length === 0)) {
    return ''
  }

  return `
    <div class="cf-cms-table-toolbar px-6 py-3 border-b border-gray-200 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        ${search ? renderTableSearch(search, tableId) : ''}
        ${filtering ? renderTableFilters(filtering, tableId) : ''}
      </div>
      
      <div class="flex items-center space-x-3">
        ${selection && selection.enabled ? renderTableSelectionActions(selection, tableId) : ''}
        ${actions && actions.length > 0 ? renderTableActions(actions, tableId) : ''}
      </div>
    </div>
  `
}

function renderTableSearch(search: any, tableId: string): string {
  return `
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        placeholder="${search.placeholder || 'Search...'}"
        value="${search.value || ''}"
        onkeyup="handleTableSearch('${tableId}', this.value, ${search.debounce || 300})"
      />
    </div>
  `
}

function renderTableFilters(filtering: any, tableId: string): string {
  return `
    <button
      type="button"
      onclick="toggleTableFilters('${tableId}')"
      class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm leading-5 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Filters
      ${Object.keys(filtering.activeFilters || {}).length > 0 ? `
        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          ${Object.keys(filtering.activeFilters).length}
        </span>
      ` : ''}
    </button>
  `
}

function renderTableSelectionActions(selection: any, tableId: string): string {
  if (!selection.selectedItems || selection.selectedItems.length === 0) {
    return ''
  }

  const bulkActions = selection.bulkActions || []

  return `
    <div class="flex items-center space-x-2">
      <span class="text-sm text-gray-700">
        ${selection.selectedItems.length} selected
      </span>
      ${bulkActions.map(action => renderButton({
        ...action,
        size: 'sm'
      })).join('')}
    </div>
  `
}

function renderTableActions(actions: TableAction[], tableId: string): string {
  const primaryActions = actions.filter(a => !a.condition)
  const conditionalActions = actions.filter(a => a.condition)

  return `
    <div class="flex items-center space-x-2">
      ${primaryActions.map(action => renderButton({
        ...action,
        size: 'sm'
      })).join('')}
      
      ${conditionalActions.length > 0 ? `
        <div class="relative">
          <button
            type="button"
            onclick="toggleTableActionMenu('${tableId}')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm leading-5 font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <div id="${tableId}-action-menu" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div class="py-1">
              ${conditionalActions.map(action => `
                <button
                  type="button"
                  onclick="handleTableAction('${tableId}', '${action.key}', this)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  ${action.icon ? `<svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">${getIconSvg(action.icon)}</svg>` : ''}
                  ${action.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `
}

function renderTableHeader(
  columns: TableColumn[],
  sorting?: any,
  selection?: any,
  sticky?: any
): string {
  const headerClasses = [
    'bg-gray-50',
    sticky?.header ? 'sticky top-0 z-10' : ''
  ].filter(Boolean).join(' ')

  return `
    <thead class="${headerClasses}">
      <tr>
        ${selection?.enabled ? `
          <th scope="col" class="px-6 py-3 text-left">
            <input
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              onchange="toggleTableSelection('${selection.tableId}', 'all', this.checked)"
            />
          </th>
        ` : ''}
        
        ${columns.map(column => {
          const columnClasses = [
            'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
            column.align === 'center' ? 'text-center' : '',
            column.align === 'right' ? 'text-right' : '',
            column.sortable && sorting?.enabled ? 'cursor-pointer hover:bg-gray-100' : '',
            column.sticky || sticky?.columns?.includes(column.key) ? 'sticky bg-gray-50' : ''
          ].filter(Boolean).join(' ')

          const sortIcon = sorting?.enabled && column.sortable ? `
            <span class="ml-1">
              ${sorting.column === column.key ? 
                (sorting.direction === 'asc' ? 
                  '<svg class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>' :
                  '<svg class="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>'
                ) :
                '<svg class="w-4 h-4 inline text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>'
              }
            </span>
          ` : ''

          const stickyStyle = (column.sticky || sticky?.columns?.includes(column.key)) ? 
            `left: ${getColumnLeftPosition(columns, column.key)}px;` : ''

          return `
            <th
              scope="col"
              class="${columnClasses}"
              ${column.sortable && sorting?.enabled ? `onclick="handleTableSort('${sorting.tableId}', '${column.key}')"` : ''}
              ${stickyStyle ? `style="${stickyStyle}"` : ''}
            >
              <div class="flex items-center ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}">
                ${column.label}
                ${sortIcon}
              </div>
            </th>
          `
        }).join('')}
        
        ${actions && actions.length > 0 ? `
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        ` : ''}
      </tr>
    </thead>
  `
}

function renderTableBody(
  columns: TableColumn[],
  data: TableDataRow[],
  actions: TableAction[],
  selection?: any,
  expandable?: any,
  variant?: string
): string {
  const bodyClasses = [
    'bg-white',
    variant === 'striped' ? 'divide-y divide-gray-200' : ''
  ].filter(Boolean).join(' ')

  return `
    <tbody class="${bodyClasses}">
      ${data.map((row, index) => renderTableRow(columns, row, actions, selection, expandable, index, variant)).join('')}
    </tbody>
  `
}

function renderTableRow(
  columns: TableColumn[],
  row: TableDataRow,
  actions: TableAction[],
  selection?: any,
  expandable?: any,
  index: number,
  variant?: string
): string {
  const rowClasses = [
    row.className || '',
    row.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
    row.selected ? 'bg-blue-50' : '',
    variant === 'striped' && index % 2 === 1 ? 'bg-gray-50' : ''
  ].filter(Boolean).join(' ')

  return `
    <tr class="${rowClasses}" data-row-id="${row.id}">
      ${selection?.enabled ? `
        <td class="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            ${row.selected ? 'checked' : ''}
            onchange="toggleTableSelection('${selection.tableId}', '${row.id}', this.checked)"
          />
        </td>
      ` : ''}
      
      ${columns.map(column => renderTableCell(column, row)).join('')}
      
      ${actions && actions.length > 0 ? `
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          ${renderRowActions(actions, row)}
        </td>
      ` : ''}
    </tr>
    
    ${expandable?.enabled && row.expanded ? `
      <tr class="bg-gray-50">
        <td colspan="${columns.length + (selection?.enabled ? 1 : 0) + (actions?.length ? 1 : 0)} class="px-6 py-4">
          ${expandable.render ? expandable.render(row) : `<div class="text-sm text-gray-600">Expanded content for ${row.id}</div>`}
        </td>
      </tr>
    ` : ''}
  `
}

function renderTableCell(column: TableColumn, row: TableDataRow): string {
  const value = row.data[column.key]
  const cellClasses = [
    'px-6 py-4 whitespace-nowrap text-sm',
    column.align === 'center' ? 'text-center' : '',
    column.align === 'right' ? 'text-right' : '',
    column.className || ''
  ].filter(Boolean).join(' ')

  let cellContent = ''

  switch (column.type) {
    case 'image':
      cellContent = `<img src="${value}" alt="${column.key}" class="h-10 w-10 rounded-full object-cover" />`
      break
    case 'badge':
      cellContent = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${value}</span>`
      break
    case 'boolean':
      cellContent = value ? 
        '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>' :
        '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No</span>'
      break
    case 'date':
      cellContent = value ? new Date(value).toLocaleDateString() : '-'
      break
    case 'number':
      cellContent = value ? Number(value).toLocaleString() : '-'
      break
    case 'custom':
      cellContent = column.render ? column.render(value, row) : value
      break
    default:
      cellContent = column.format ? column.format(value, row) : (value || '-')
  }

  return `
    <td class="${cellClasses}">
      ${cellContent}
    </td>
  `
}

function renderRowActions(actions: TableAction[], row: TableDataRow): string {
  const visibleActions = actions.filter(action => 
    !action.condition || action.condition(row)
  )

  if (visibleActions.length === 0) {
    return ''
  }

  if (visibleActions.length === 1) {
    const action = visibleActions[0]
    return renderButton({
      ...action,
      size: 'sm',
      onClick: action.onClick ? `handleTableRowAction('${action.key}', '${row.id}')` : undefined
    })
  }

  return `
    <div class="relative">
      <button
        type="button"
        onclick="toggleTableRowActions('${row.id}')"
        class="text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      <div id="row-actions-${row.id}" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div class="py-1">
          ${visibleActions.map(action => `
            <button
              type="button"
              onclick="handleTableRowAction('${action.key}', '${row.id}')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              ${action.icon ? `<svg class="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">${getIconSvg(action.icon)}</svg>` : ''}
              ${action.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

function renderTableLoading(): string {
  return `
    <tbody>
      <tr>
        <td colspan="100%" class="px-6 py-12 text-center">
          <div class="flex justify-center items-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
  `
}

function renderTableEmpty(emptyMessage?: string): string {
  return `
    <tbody>
      <tr>
        <td colspan="100%" class="px-6 py-12 text-center">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No data</h3>
            <p class="mt-1 text-sm text-gray-500">${emptyMessage || 'No data available to display'}</p>
          </div>
        </td>
      </tr>
    </tbody>
  `
}

function renderTablePagination(pagination: any, tableId: string): string {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    showFirst = true,
    showLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showItemsPerPage = true,
    showTotalItems = true,
    maxVisiblePages = 5
  } = pagination

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return `
    <div class="cf-cms-table-pagination px-6 py-3 border-t border-gray-200 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        ${showTotalItems ? `
          <span class="text-sm text-gray-700">
            Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${totalItems}</span> results
          </span>
        ` : ''}
        
        ${showItemsPerPage ? `
          <select
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            onchange="handleTableItemsPerPageChange('${tableId}', this.value)"
          >
            <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
            <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25</option>
            <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
          </select>
        ` : ''}
      </div>
      
      ${showPageNumbers ? `
        <div class="flex items-center space-x-1">
          ${showFirst ? `
            <button
              type="button"
              onclick="handleTablePageChange('${tableId}', 1)"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              ${currentPage === 1 ? 'disabled' : ''}
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          ` : ''}
          
          ${showPrevNext ? `
            <button
              type="button"
              onclick="handleTablePageChange('${tableId}', ${currentPage - 1})"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              ${currentPage === 1 ? 'disabled' : ''}
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ` : ''}
          
          ${generatePageNumbers(currentPage, totalPages, maxVisiblePages).map(pageNum => {
            if (pageNum === '...') {
              return `
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              `
            }
            
            return `
              <button
                type="button"
                onclick="handleTablePageChange('${tableId}', ${pageNum})"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pageNum === currentPage 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }"
              >
                ${pageNum}
              </button>
            `
          }).join('')}
          
          ${showPrevNext ? `
            <button
              type="button"
              onclick="handleTablePageChange('${tableId}', ${currentPage + 1})"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              ${currentPage === totalPages ? 'disabled' : ''}
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ` : ''}
          
          ${showLast ? `
            <button
              type="button"
              onclick="handleTablePageChange('${tableId}', ${totalPages})"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              ${currentPage === totalPages ? 'disabled' : ''}
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `
}

function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number): (number | string)[] {
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    const halfVisible = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
  }
  
  return pages
}

function getColumnLeftPosition(columns: TableColumn[], currentKey: string): number {
  let position = 0
  for (const column of columns) {
    if (column.key === currentKey) {
      break
    }
    if (column.sticky) {
      position += column.width ? parseInt(column.width) : 150
    }
  }
  return position
}

function getIconSvg(iconName: string): string {
  // Import from button component or define here
  return ''
}

function renderTableScripts(tableId: string, options: any): string {
  return `
    <script>
      window['table_${tableId}'] = ${JSON.stringify(options)};
      
      function handleTableSort(tableId, column) {
        const table = window['table_' + tableId];
        if (table.sorting) {
          const currentDirection = table.sorting.column === column ? table.sorting.direction : null;
          const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
          
          // Update sorting state
          table.sorting.column = column;
          table.sorting.direction = newDirection;
          
          // Reload table data
          if (table.sorting.onSort) {
            eval(table.sorting.onSort + '(column, newDirection)');
          }
        }
      }
      
      function handleTableSearch(tableId, value, debounce) {
        clearTimeout(window['tableSearchTimeout_' + tableId]);
        
        window['tableSearchTimeout_' + tableId] = setTimeout(() => {
          const table = window['table_' + tableId];
          if (table.search && table.search.onSearch) {
            eval(table.search.onSearch + '(value)');
          }
        }, debounce);
      }
      
      function handleTablePageChange(tableId, page) {
        const table = window['table_' + tableId];
        if (table.pagination && table.pagination.onPageChange) {
          eval(table.pagination.onPageChange + '(page)');
        }
      }
      
      function handleTableItemsPerPageChange(tableId, itemsPerPage) {
        const table = window['table_' + tableId];
        if (table.pagination && table.pagination.onItemsPerPageChange) {
          eval(table.pagination.onItemsPerPageChange + '(itemsPerPage)');
        }
      }
      
      function toggleTableSelection(tableId, itemId, selected) {
        const table = window['table_' + tableId];
        if (table.selection && table.selection.onSelect) {
          eval(table.selection.onSelect + '(itemId, selected)');
        }
      }
      
      function handleTableRowAction(actionKey, rowId) {
        // Hide the action menu
        const menu = document.getElementById('row-actions-' + rowId);
        if (menu) {
          menu.classList.add('hidden');
        }
        
        // Handle the action
        console.log('Action:', actionKey, 'Row:', rowId);
      }
      
      function toggleTableRowActions(rowId) {
        const menu = document.getElementById('row-actions-' + rowId);
        if (menu) {
          menu.classList.toggle('hidden');
        }
      }
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', function(event) {
        if (!event.target.closest('.relative')) {
          document.querySelectorAll('[id^="row-actions-"]').forEach(menu => {
            menu.classList.add('hidden');
          });
        }
      });
    </script>
  `
}