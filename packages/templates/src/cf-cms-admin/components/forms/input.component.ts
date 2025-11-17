/**
 * CF-CMS.js Input Component
 * 
 * Reusable input component with validation and multiple types
 */

import { InputProps } from '../../types'

export function renderInput(props: InputProps): string {
  const {
    id,
    name,
    type = 'text',
    label,
    placeholder,
    value = '',
    required = false,
    disabled = false,
    readonly = false,
    error,
    helper,
    maxLength,
    minLength,
    pattern,
    autoComplete,
    className = '',
    style = {},
    dataAttributes = {},
    ariaLabel,
    testId
  } = props

  const fieldId = id || name

  // Build CSS classes
  const inputClasses = [
    'cf-cms-input',
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'text-sm',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'transition-colors',
    'duration-150'
  ]

  // Add state classes
  if (disabled) {
    inputClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed')
  } else if (readonly) {
    inputClasses.push('bg-gray-50', 'text-gray-700')
  } else {
    inputClasses.push('bg-white', 'text-gray-900')
  }

  // Add error classes
  if (error) {
    inputClasses.push('border-red-300', 'text-red-900', 'placeholder-red-300', 'focus:ring-red-500', 'focus:border-red-500')
  } else {
    inputClasses.push('border-gray-300')
  }

  const allInputClasses = [...inputClasses, className].filter(Boolean).join(' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ')

  // Build inline styles
  const inlineStyles = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // Build attributes
  const attributes = [
    fieldId ? `id="${fieldId}"` : '',
    `name="${name}"`,
    `type="${type}"`,
    `value="${value}"`,
    placeholder ? `placeholder="${placeholder}"` : '',
    required ? 'required' : '',
    disabled ? 'disabled' : '',
    readonly ? 'readonly' : '',
    maxLength ? `maxlength="${maxLength}"` : '',
    minLength ? `minlength="${minLength}"` : '',
    pattern ? `pattern="${pattern}"` : '',
    autoComplete ? `autocomplete="${autoComplete}"` : '',
    ariaLabel ? `aria-label="${ariaLabel}"` : '',
    testId ? `data-testid="${testId}"` : '',
    dataAttrs,
    inlineStyles ? `style="${inlineStyles}"` : ''
  ].filter(Boolean).join(' ')

  // Build label
  const labelHtml = label ? `
    <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">
      ${label}
      ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
    </label>
  ` : ''

  // Build helper text
  const helperHtml = helper ? `
    <p class="mt-1 text-sm text-gray-500">${helper}</p>
  ` : ''

  // Build error message
  const errorHtml = error ? `
    <p class="mt-1 text-sm text-red-600">${error}</p>
  ` : ''

  return `
    <div class="cf-cms-field ${error ? 'cf-cms-field-error' : ''}">
      ${labelHtml}
      <input class="${allInputClasses}" ${attributes} />
      ${errorHtml || helperHtml}
    </div>
  `
}

// Textarea component
export function renderTextarea(props: {
  id?: string
  name: string
  label?: string
  placeholder?: string
  value?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  rows?: number
  maxLength?: number
  resizable?: boolean
  className?: string
  style?: Record<string, string>
  dataAttributes?: Record<string, string>
  ariaLabel?: string
  testId?: string
}): string {
  const {
    id,
    name,
    label,
    placeholder,
    value = '',
    required = false,
    disabled = false,
    readonly = false,
    error,
    helper,
    rows = 4,
    maxLength,
    resizable = true,
    className = '',
    style = {},
    dataAttributes = {},
    ariaLabel,
    testId
  } = props

  const fieldId = id || name

  // Build CSS classes
  const textareaClasses = [
    'cf-cms-textarea',
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'text-sm',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'transition-colors',
    'duration-150'
  ]

  // Add resize class
  if (!resizable) {
    textareaClasses.push('resize-none')
  } else {
    textareaClasses.push('resize-y')
  }

  // Add state classes
  if (disabled) {
    textareaClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed')
  } else if (readonly) {
    textareaClasses.push('bg-gray-50', 'text-gray-700')
  } else {
    textareaClasses.push('bg-white', 'text-gray-900')
  }

  // Add error classes
  if (error) {
    textareaClasses.push('border-red-300', 'text-red-900', 'placeholder-red-300', 'focus:ring-red-500', 'focus:border-red-500')
  } else {
    textareaClasses.push('border-gray-300')
  }

  const allTextareaClasses = [...textareaClasses, className].filter(Boolean).join(' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ')

  // Build inline styles
  const inlineStyles = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // Build attributes
  const attributes = [
    fieldId ? `id="${fieldId}"` : '',
    `name="${name}"`,
    placeholder ? `placeholder="${placeholder}"` : '',
    `rows="${rows}"`,
    required ? 'required' : '',
    disabled ? 'disabled' : '',
    readonly ? 'readonly' : '',
    maxLength ? `maxlength="${maxLength}"` : '',
    ariaLabel ? `aria-label="${ariaLabel}"` : '',
    testId ? `data-testid="${testId}"` : '',
    dataAttrs,
    inlineStyles ? `style="${inlineStyles}"` : ''
  ].filter(Boolean).join(' ')

  // Build label
  const labelHtml = label ? `
    <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">
      ${label}
      ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
    </label>
  ` : ''

  // Build character counter
  const charCounterHtml = maxLength ? `
    <div class="mt-1 text-xs text-gray-500 text-right">
      ${value.length}/${maxLength} characters
    </div>
  ` : ''

  // Build helper text
  const helperHtml = helper ? `
    <p class="mt-1 text-sm text-gray-500">${helper}</p>
  ` : ''

  // Build error message
  const errorHtml = error ? `
    <p class="mt-1 text-sm text-red-600">${error}</p>
  ` : ''

  return `
    <div class="cf-cms-field ${error ? 'cf-cms-field-error' : ''}">
      ${labelHtml}
      <textarea class="${allTextareaClasses}" ${attributes}>${value}</textarea>
      ${charCounterHtml}
      ${errorHtml || helperHtml}
    </div>
  `
}

// Select component
export function renderSelect(props: {
  id?: string
  name: string
  label?: string
  placeholder?: string
  value?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  multiple?: boolean
  searchable?: boolean
  className?: string
  style?: Record<string, string>
  dataAttributes?: Record<string, string>
  ariaLabel?: string
  testId?: string
}): string {
  const {
    id,
    name,
    label,
    placeholder,
    value = '',
    options,
    required = false,
    disabled = false,
    error,
    helper,
    multiple = false,
    searchable = false,
    className = '',
    style = {},
    dataAttributes = {},
    ariaLabel,
    testId
  } = props

  const fieldId = id || name

  // Build CSS classes
  const selectClasses = [
    'cf-cms-select',
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'text-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'transition-colors',
    'duration-150'
  ]

  // Add state classes
  if (disabled) {
    selectClasses.push('bg-gray-50', 'text-gray-500', 'cursor-not-allowed')
  } else {
    selectClasses.push('bg-white', 'text-gray-900')
  }

  // Add error classes
  if (error) {
    selectClasses.push('border-red-300', 'text-red-900', 'focus:ring-red-500', 'focus:border-red-500')
  } else {
    selectClasses.push('border-gray-300')
  }

  const allSelectClasses = [...selectClasses, className].filter(Boolean).join(' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ')

  // Build inline styles
  const inlineStyles = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // Build attributes
  const attributes = [
    fieldId ? `id="${fieldId}"` : '',
    `name="${name}"`,
    required ? 'required' : '',
    disabled ? 'disabled' : '',
    multiple ? 'multiple' : '',
    ariaLabel ? `aria-label="${ariaLabel}"` : '',
    testId ? `data-testid="${testId}"` : '',
    dataAttrs,
    inlineStyles ? `style="${inlineStyles}"` : ''
  ].filter(Boolean).join(' ')

  // Build options
  const optionsHtml = options.map(option => `
    <option value="${option.value}" ${option.value === value ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}>
      ${option.label}
    </option>
  `).join('')

  // Add placeholder option if provided
  const placeholderHtml = placeholder ? `
    <option value="" ${!value ? 'selected' : ''} disabled>${placeholder}</option>
  ` : ''

  // Build label
  const labelHtml = label ? `
    <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">
      ${label}
      ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
    </label>
  ` : ''

  // Build helper text
  const helperHtml = helper ? `
    <p class="mt-1 text-sm text-gray-500">${helper}</p>
  ` : ''

  // Build error message
  const errorHtml = error ? `
    <p class="mt-1 text-sm text-red-600">${error}</p>
  ` : ''

  return `
    <div class="cf-cms-field ${error ? 'cf-cms-field-error' : ''}">
      ${labelHtml}
      <select class="${allSelectClasses}" ${attributes}>
        ${placeholderHtml}
        ${optionsHtml}
      </select>
      ${errorHtml || helperHtml}
    </div>
  `
}

// Checkbox component
export function renderCheckbox(props: {
  id?: string
  name: string
  label?: string
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  error?: string
  helper?: string
  required?: boolean
  className?: string
  style?: Record<string, string>
  dataAttributes?: Record<string, string>
  ariaLabel?: string
  testId?: string
}): string {
  const {
    id,
    name,
    label,
    checked = false,
    disabled = false,
    indeterminate = false,
    error,
    helper,
    required = false,
    className = '',
    style = {},
    dataAttributes = {},
    ariaLabel,
    testId
  } = props

  const fieldId = id || name

  // Build CSS classes
  const checkboxClasses = [
    'cf-cms-checkbox',
    'h-4',
    'w-4',
    'text-blue-600',
    'border-gray-300',
    'rounded',
    'focus:ring-blue-500',
    'focus:ring-2'
  ]

  if (disabled) {
    checkboxClasses.push('opacity-50', 'cursor-not-allowed')
  }

  const allCheckboxClasses = [...checkboxClasses, className].filter(Boolean).join(' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ')

  // Build inline styles
  const inlineStyles = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // Build attributes
  const attributes = [
    fieldId ? `id="${fieldId}"` : '',
    `name="${name}"`,
    `type="checkbox"`,
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    indeterminate ? 'indeterminate' : '',
    required ? 'required' : '',
    ariaLabel ? `aria-label="${ariaLabel}"` : '',
    testId ? `data-testid="${testId}"` : '',
    dataAttrs,
    inlineStyles ? `style="${inlineStyles}"` : ''
  ].filter(Boolean).join(' ')

  // Build helper text
  const helperHtml = helper ? `
    <p class="mt-1 text-sm text-gray-500">${helper}</p>
  ` : ''

  // Build error message
  const errorHtml = error ? `
    <p class="mt-1 text-sm text-red-600">${error}</p>
  ` : ''

  return `
    <div class="cf-cms-field ${error ? 'cf-cms-field-error' : ''}">
      <div class="flex items-start">
        <div class="flex items-center h-5">
          <input class="${allCheckboxClasses}" ${attributes} />
        </div>
        ${label ? `
          <div class="ml-3 text-sm">
            <label for="${fieldId}" class="font-medium text-gray-700">
              ${label}
              ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
            </label>
          </div>
        ` : ''}
      </div>
      ${errorHtml || helperHtml}
    </div>
  `
}

// Radio group component
export function renderRadioGroup(props: {
  id?: string
  name: string
  label?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  inline?: boolean
  className?: string
  style?: Record<string, string>
  dataAttributes?: Record<string, string>
  ariaLabel?: string
  testId?: string
}): string {
  const {
    id,
    name,
    label,
    options,
    value = '',
    required = false,
    disabled = false,
    error,
    helper,
    inline = false,
    className = '',
    style = {},
    dataAttributes = {},
    ariaLabel,
    testId
  } = props

  const groupId = id || name

  // Build CSS classes for container
  const containerClasses = [
    'cf-cms-radio-group',
    inline ? 'flex space-x-6' : 'space-y-3',
    className
  ].filter(Boolean).join(' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ')

  // Build inline styles
  const inlineStyles = Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // Build radio buttons
  const radiosHtml = options.map((option, index) => {
    const optionId = `${groupId}-${index}`
    const isChecked = option.value === value
    
    return `
      <div class="flex items-center">
        <input
          id="${optionId}"
          name="${name}"
          type="radio"
          value="${option.value}"
          ${isChecked ? 'checked' : ''}
          ${option.disabled || disabled ? 'disabled' : ''}
          class="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <label for="${optionId}" class="ml-3 block text-sm font-medium text-gray-700">
          ${option.label}
        </label>
      </div>
    `
  }).join('')

  // Build label
  const labelHtml = label ? `
    <legend class="text-sm font-medium text-gray-700 mb-3">
      ${label}
      ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
    </legend>
  ` : ''

  // Build helper text
  const helperHtml = helper ? `
    <p class="mt-1 text-sm text-gray-500">${helper}</p>
  ` : ''

  // Build error message
  const errorHtml = error ? `
    <p class="mt-1 text-sm text-red-600">${error}</p>
  ` : ''

  return `
    <fieldset class="cf-cms-field ${error ? 'cf-cms-field-error' : ''}" ${dataAttrs} ${inlineStyles ? `style="${inlineStyles}"` : ''}>
      ${labelHtml}
      <div class="${containerClasses}">
        ${radiosHtml}
      </div>
      ${errorHtml || helperHtml}
    </fieldset>
  `
}