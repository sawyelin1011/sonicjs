/**
 * CF-CMS.js Modal Component
 * 
 * Flexible modal component with multiple sizes and variants
 */

import { ModalData } from '../../types'
import { renderButton } from '../forms/button.component'

export function renderModal(props: ModalData): string {
  const {
    id,
    title,
    content,
    size = 'md',
    closable = true,
    backdrop = true,
    keyboard = true,
    centered = true,
    scrollable = false,
    footer,
    header,
    onOpen,
    onClose,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    persistent = false,
    animation,
    zIndex
  } = props

  const modalId = id || `modal-${Date.now()}`

  // Build CSS classes
  const backdropClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'overflow-y-auto',
    'transition-opacity',
    'duration-300'
  ]

  if (backdrop) {
    backdropClasses.push('bg-gray-500', 'bg-opacity-75')
  } else {
    backdropClasses.push('bg-transparent')
  }

  const modalClasses = [
    'cf-cms-modal',
    'relative',
    'transform',
    'transition-all',
    'duration-300'
  ]

  // Size classes
  const sizeClasses = {
    sm: ['max-w-sm'],
    md: ['max-w-md'],
    lg: ['max-w-lg'],
    xl: ['max-w-xl'],
    full: ['max-w-7xl', 'mx-4']
  }

  // Variant classes
  const variantClasses = {
    default: ['bg-white', 'shadow-xl'],
    danger: ['bg-white', 'border-2', 'border-red-500', 'shadow-xl'],
    warning: ['bg-white', 'border-2', 'border-yellow-500', 'shadow-xl'],
    info: ['bg-white', 'border-2', 'border-blue-500', 'shadow-xl'],
    success: ['bg-white', 'border-2', 'border-green-500', 'shadow-xl']
  }

  const allModalClasses = [
    ...modalClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    'rounded-lg'
  ].filter(Boolean).join(' ')

  // Position classes
  const containerClasses = [
    'flex',
    'min-h-screen',
    centered ? 'items-center justify-center' : 'items-start justify-center pt-20'
  ].filter(Boolean).join(' ')

  return `
    <div id="${modalId}" class="hidden cf-cms-modal-wrapper">
      <div class="${backdropClasses.join(' ')}" onclick="${!persistent ? `closeModal('${modalId}')` : ''}">
        <div class="${containerClasses}">
          <div class="${allModalClasses} w-full ${scrollable ? 'max-h-screen overflow-y-auto' : ''}" style="${zIndex ? `z-index: ${zIndex}` : ''}">
            ${renderModalHeader(title, header, closable, modalId, variant)}
            
            <div class="cf-cms-modal-content px-6 py-4">
              ${content}
            </div>
            
            ${renderModalFooter(footer, onConfirm, onCancel, confirmText, cancelText, modalId, variant)}
          </div>
        </div>
      </div>
    </div>
    
    ${renderModalScripts(modalId, { onOpen, onClose, onConfirm, keyboard, persistent })}
  `
}

function renderModalHeader(
  title: string,
  header: any,
  closable: boolean,
  modalId: string,
  variant: string
): string {
  if (header) {
    return `<div class="cf-cms-modal-header">${header}</div>`
  }

  if (!title) {
    return ''
  }

  const headerClasses = [
    'cf-cms-modal-title',
    'px-6',
    'py-4',
    'border-b',
    'border-gray-200'
  ]

  // Add variant-specific header styling
  if (variant === 'danger') {
    headerClasses.push('bg-red-50', 'border-red-200')
  } else if (variant === 'warning') {
    headerClasses.push('bg-yellow-50', 'border-yellow-200')
  } else if (variant === 'info') {
    headerClasses.push('bg-blue-50', 'border-blue-200')
  } else if (variant === 'success') {
    headerClasses.push('bg-green-50', 'border-green-200')
  }

  return `
    <div class="${headerClasses.join(' ')}">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">${title}</h3>
        ${closable ? `
          <button
            type="button"
            onclick="closeModal('${modalId}')"
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
      </div>
    </div>
  `
}

function renderModalFooter(
  footer: any,
  onConfirm: string | undefined,
  onCancel: string | undefined,
  confirmText: string,
  cancelText: string,
  modalId: string,
  variant: string
): string {
  if (footer) {
    return `<div class="cf-cms-modal-footer px-6 py-4 border-t border-gray-200">${footer}</div>`
  }

  if (!onConfirm && !onCancel) {
    return ''
  }

  const footerClasses = [
    'cf-cms-modal-footer',
    'px-6',
    'py-4',
    'border-t',
    'border-gray-200',
    'flex',
    'justify-end',
    'space-x-3'
  ]

  return `
    <div class="${footerClasses.join(' ')}">
      ${onCancel ? renderButton({
        label: cancelText,
        variant: 'outline',
        onClick: `handleModalCancel('${modalId}')`
      }) : ''}
      
      ${onConfirm ? renderButton({
        label: confirmText,
        variant: variant === 'danger' ? 'danger' : 'primary',
        onClick: `handleModalConfirm('${modalId}')`
      }) : ''}
    </div>
  `
}

function renderModalScripts(modalId: string, options: any): string {
  const { onOpen, onClose, onConfirm, keyboard, persistent } = options

  return `
    <script>
      function openModal('${modalId}') {
        const modal = document.getElementById('${modalId}');
        if (modal) {
          modal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          
          // Focus management
          const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
          
          // Call onOpen callback
          ${onOpen ? `eval('${onOpen}()');` : ''}
        }
      }
      
      function closeModal('${modalId}') {
        const modal = document.getElementById('${modalId}');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
          
          // Call onClose callback
          ${onClose ? `eval('${onClose}()');` : ''}
        }
      }
      
      function handleModalConfirm('${modalId}') {
        ${onConfirm ? `
          const result = eval('${onConfirm}()');
          if (result !== false) {
            closeModal('${modalId}');
          }
        ` : `closeModal('${modalId}');`}
      }
      
      function handleModalCancel('${modalId}') {
        closeModal('${modalId}');
      }
      
      // Keyboard handling
      ${keyboard ? `
        document.addEventListener('keydown', function(event) {
          const modal = document.getElementById('${modalId}');
          if (modal && !modal.classList.contains('hidden')) {
            if (event.key === 'Escape' && !${persistent}) {
              closeModal('${modalId}');
            }
            
            // Tab trapping
            if (event.key === 'Tab') {
              const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];
              
              if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                  event.preventDefault();
                  lastElement.focus();
                }
              } else {
                if (document.activeElement === lastElement) {
                  event.preventDefault();
                  firstElement.focus();
                }
              }
            }
          }
        });
      ` : ''}
    </script>
  `
}

// Confirmation dialog component
export function renderConfirmationDialog(props: {
  id?: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning'
  onConfirm: string
  onCancel?: string
}): string {
  const {
    id,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel
  } = props

  const dialogId = id || `confirm-dialog-${Date.now()}`

  // Build icon based on variant
  let iconHtml = ''
  if (variant === 'danger') {
    iconHtml = `
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    `
  } else if (variant === 'warning') {
    iconHtml = `
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
        <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    `
  } else {
    iconHtml = `
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `
  }

  const content = `
    <div class="text-center">
      ${iconHtml}
      <p class="text-sm text-gray-600">${message}</p>
    </div>
  `

  return renderModal({
    id: dialogId,
    title,
    content,
    size: 'sm',
    closable: true,
    backdrop: true,
    keyboard: true,
    centered: true,
    confirmText,
    cancelText,
    variant,
    onConfirm,
    onCancel
  })
}

// Alert dialog component
export function renderAlertDialog(props: {
  id?: string
  title: string
  message: string
  buttonText?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  onClose?: string
}): string {
  const {
    id,
    title,
    message,
    buttonText = 'OK',
    variant = 'info',
    onClose
  } = props

  const alertId = id || `alert-dialog-${Date.now()}`

  // Build icon based on variant
  let iconHtml = ''
  let modalVariant = 'default'

  switch (variant) {
    case 'success':
      iconHtml = `
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      `
      modalVariant = 'success'
      break
    case 'error':
      iconHtml = `
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      `
      modalVariant = 'danger'
      break
    case 'warning':
      iconHtml = `
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      `
      modalVariant = 'warning'
      break
    default:
      iconHtml = `
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      `
      modalVariant = 'info'
  }

  const content = `
    <div class="text-center">
      ${iconHtml}
      <p class="text-sm text-gray-600">${message}</p>
    </div>
  `

  return renderModal({
    id: alertId,
    title,
    content,
    size: 'sm',
    closable: true,
    backdrop: true,
    keyboard: true,
    centered: true,
    confirmText: buttonText,
    variant: modalVariant,
    onConfirm: onClose,
    onCancel: onClose
  })
}

// Side drawer component
export function renderSideDrawer(props: {
  id?: string
  title?: string
  content: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'left' | 'right'
  closable?: boolean
  backdrop?: boolean
  onClose?: string
}): string {
  const {
    id,
    title,
    content,
    size = 'md',
    position = 'right',
    closable = true,
    backdrop = true,
    onClose
  } = props

  const drawerId = id || `drawer-${Date.now()}`

  // Build CSS classes
  const backdropClasses = [
    'fixed',
    'inset-0',
    'z-50',
    'transition-opacity',
    'duration-300'
  ]

  if (backdrop) {
    backdropClasses.push('bg-gray-500', 'bg-opacity-75')
  } else {
    backdropClasses.push('bg-transparent')
  }

  // Size classes
  const sizeClasses = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    xl: position === 'left' || position === 'right' ? 'w-[40rem]' : 'h-[40rem]'
  }

  // Position classes
  const drawerClasses = [
    'fixed',
    'top-0',
    'h-full',
    'bg-white',
    'shadow-xl',
    'transform',
    'transition-transform',
    'duration-300',
    'ease-in-out',
    'z-50'
  ]

  if (position === 'left') {
    drawerClasses.push('left-0', 'translate-x-full')
  } else {
    drawerClasses.push('right-0', 'translate-x-full')
  }

  return `
    <div id="${drawerId}" class="hidden cf-cms-drawer-wrapper">
      <div class="${backdropClasses.join(' ')}" onclick="${closable ? `closeDrawer('${drawerId}')` : ''}">
        <div class="${drawerClasses.join(' ')} ${sizeClasses[size]}" id="${drawerId}-panel">
          ${title ? `
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">${title}</h3>
              ${closable ? `
                <button
                  type="button"
                  onclick="closeDrawer('${drawerId}')"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ` : ''}
            </div>
          ` : ''}
          
          <div class="flex-1 overflow-y-auto">
            ${content}
          </div>
        </div>
      </div>
    </div>
    
    <script>
      function openDrawer('${drawerId}') {
        const drawer = document.getElementById('${drawerId}');
        const panel = document.getElementById('${drawerId}-panel');
        
        if (drawer && panel) {
          drawer.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          
          // Trigger animation
          setTimeout(() => {
            panel.classList.remove('translate-x-full');
          }, 10);
        }
      }
      
      function closeDrawer('${drawerId}') {
        const drawer = document.getElementById('${drawerId}');
        const panel = document.getElementById('${drawerId}-panel');
        
        if (drawer && panel) {
          panel.classList.add('translate-x-full');
          
          setTimeout(() => {
            drawer.classList.add('hidden');
            document.body.style.overflow = '';
            ${onClose ? `eval('${onClose}()');` : ''}
          }, 300);
        }
      }
      
      // Keyboard handling
      document.addEventListener('keydown', function(event) {
        const drawer = document.getElementById('${drawerId}');
        if (drawer && !drawer.classList.contains('hidden') && event.key === 'Escape') {
          closeDrawer('${drawerId}');
        }
      });
    </script>
  `
}