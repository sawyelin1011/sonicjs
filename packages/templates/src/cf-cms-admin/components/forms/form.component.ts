/**
 * CF-CMS.js Form Component
 * 
 * Comprehensive form component with validation and multiple field types
 */

import { FormData, FormField, ValidationRule } from '../../types'
import { renderInput, renderTextarea, renderSelect, renderCheckbox, renderRadioGroup } from './input.component'
import { renderButton } from './button.component'
import { validationEngine, ValidationResult } from '../../utils/validators'

export function renderForm(props: FormData): string {
  const {
    id,
    title,
    description,
    fields,
    action,
    method = 'POST',
    enctype,
    className = '',
    submitText = 'Submit',
    cancelText = 'Cancel',
    showReset = false,
    multipart = false,
    validation = 'client',
    onSubmit,
    onSuccess,
    onError
  } = props

  const formId = id || `form-${Date.now()}`

  // Build CSS classes
  const formClasses = [
    'cf-cms-form',
    'space-y-6',
    className
  ].filter(Boolean).join(' ')

  // Build form attributes
  const formAttributes = [
    `id="${formId}"`,
    `action="${action}"`,
    `method="${method}"`,
    multipart ? 'enctype="multipart/form-data"' : enctype ? `enctype="${enctype}"` : '',
    `novalidate`,
    onSubmit ? `onsubmit="return handleFormSubmit(event, '${formId}')"` : ''
  ].filter(Boolean).join(' ')

  // Build form header
  const headerHtml = title || description ? `
    <div class="cf-cms-form-header">
      ${title ? `<h2 class="text-lg font-medium text-gray-900 mb-2">${title}</h2>` : ''}
      ${description ? `<p class="text-sm text-gray-600">${description}</p>` : ''}
    </div>
  ` : ''

  // Build form fields
  const fieldsHtml = fields.map(field => renderFormField(field)).join('')

  // Build form actions
  const actionsHtml = `
    <div class="cf-cms-form-actions flex justify-end space-x-3 pt-6 border-t border-gray-200">
      ${cancelText ? renderButton({
        label: cancelText,
        variant: 'outline',
        type: 'button',
        onClick: `handleFormCancel('${formId}')`
      }) : ''}
      ${showReset ? renderButton({
        label: 'Reset',
        variant: 'ghost',
        type: 'reset'
      }) : ''}
      ${renderButton({
        label: submitText,
        variant: 'primary',
        type: 'submit',
        loading: false
      })}
    </div>
  `

  // Build validation script
  const validationScript = validation === 'client' ? buildValidationScript(formId, fields, {
    onSubmit,
    onSuccess,
    onError
  }) : ''

  return `
    <form class="${formClasses}" ${formAttributes}>
      ${headerHtml}
      <div class="cf-cms-form-fields">
        ${fieldsHtml}
      </div>
      ${actionsHtml}
    </form>
    ${validationScript}
  `
}

export function renderFormField(field: FormField): string {
  const {
    name,
    type,
    label,
    placeholder,
    value,
    required = false,
    disabled = false,
    readonly = false,
    error,
    helper,
    validation = [],
    className = '',
    options = [],
    customComponent,
    customProps = {}
  } = field

  // Handle custom components
  if (type === 'custom' && customComponent) {
    return renderCustomField(field)
  }

  // Handle different field types
  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
    case 'tel':
    case 'url':
    case 'search':
    case 'date':
    case 'time':
    case 'datetime-local':
    case 'color':
    case 'range':
      return renderInput({
        id: field.id,
        name,
        type: type as any,
        label,
        placeholder,
        value,
        required,
        disabled,
        readonly,
        error,
        helper,
        maxLength: validation.find(v => v.type === 'maxLength')?.value as number,
        minLength: validation.find(v => v.type === 'minLength')?.value as number,
        pattern: validation.find(v => v.type === 'pattern')?.value as string,
        className
      })

    case 'textarea':
    case 'rich-text':
    case 'markdown':
      return renderTextarea({
        id: field.id,
        name,
        label,
        placeholder,
        value,
        required,
        disabled,
        readonly,
        error,
        helper,
        rows: customProps.rows || 4,
        maxLength: validation.find(v => v.type === 'maxLength')?.value as number,
        resizable: customProps.resizable !== false,
        className
      })

    case 'select':
      return renderSelect({
        id: field.id,
        name,
        label,
        placeholder,
        value,
        options,
        required,
        disabled,
        error,
        helper,
        multiple: customProps.multiple || false,
        searchable: customProps.searchable || false,
        className
      })

    case 'checkbox':
      return renderCheckbox({
        id: field.id,
        name,
        label,
        checked: Boolean(value),
        disabled,
        error,
        helper,
        required,
        className
      })

    case 'radio':
      return renderRadioGroup({
        id: field.id,
        name,
        label,
        options,
        value,
        required,
        disabled,
        error,
        helper,
        inline: customProps.inline || false,
        className
      })

    case 'file':
    case 'image':
      return renderFileField(field)

    case 'hidden':
      return `<input type="hidden" name="${name}" value="${value || ''}" />`

    case 'display':
      return renderDisplayField(field)

    default:
      return `<div class="text-red-500">Unknown field type: ${type}</div>`
  }
}

function renderCustomField(field: FormField): string {
  const { customComponent, customProps = {}, className = '' } = field
  
  // This would integrate with a component registry system
  // For now, return a placeholder
  return `
    <div class="cf-cms-custom-field ${className}">
      <div class="text-gray-500 italic">Custom component: ${customComponent}</div>
    </div>
  `
}

function renderFileField(field: FormField): string {
  const {
    id,
    name,
    label,
    required = false,
    disabled = false,
    error,
    helper,
    className = '',
    customProps = {}
  } = field

  const fieldId = id || name
  const accept = customProps.accept || '*/*'
  const multiple = customProps.multiple || false

  return `
    <div class="cf-cms-field ${error ? 'cf-cms-field-error' : ''} ${className}">
      ${label ? `
        <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">
          ${label}
          ${required ? '<span class="text-red-500 ml-1">*</span>' : ''}
        </label>
      ` : ''}
      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
        <div class="space-y-1 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="flex text-sm text-gray-600">
            <label for="${fieldId}" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Upload a file</span>
              <input id="${fieldId}" name="${name}" type="file" class="sr-only" accept="${accept}" ${multiple ? 'multiple' : ''} ${disabled ? 'disabled' : ''} />
            </label>
            <p class="pl-1">or drag and drop</p>
          </div>
          <p class="text-xs text-gray-500">${customProps.helpText || 'PNG, JPG, GIF up to 10MB'}</p>
        </div>
      </div>
      ${error ? `<p class="mt-1 text-sm text-red-600">${error}</p>` : ''}
      ${helper ? `<p class="mt-1 text-sm text-gray-500">${helper}</p>` : ''}
    </div>
  `
}

function renderDisplayField(field: FormField): string {
  const { name, label, value, className = '', customProps = {} } = field

  const displayValue = customProps.format 
    ? customProps.format(value)
    : value

  return `
    <div class="cf-cms-field ${className}">
      ${label ? `
        <label class="block text-sm font-medium text-gray-700 mb-1">
          ${label}
        </label>
      ` : ''}
      <div class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
        ${displayValue || '-'}
      </div>
    </div>
  `
}

function buildValidationScript(
  formId: string,
  fields: FormField[],
  options: {
    onSubmit?: string
    onSuccess?: string
    onError?: string
  }
): string {
  // Build validation schema
  const validationSchema: Record<string, ValidationRule[]> = {}
  
  fields.forEach(field => {
    if (field.validation && field.validation.length > 0) {
      validationSchema[field.name] = field.validation
    }
  })

  const schemaJson = JSON.stringify(validationSchema).replace(/"/g, "'")
  const optionsJson = JSON.stringify(options).replace(/"/g, "'")

  return `
    <script>
      window['formValidation_${formId}'] = {
        schema: ${schemaJson},
        options: ${optionsJson},
        validating: false
      };

      function handleFormSubmit(event, formId) {
        event.preventDefault();
        
        const form = document.getElementById(formId);
        const validation = window['formValidation_' + formId];
        
        if (validation.validating) return;
        validation.validating = true;
        
        // Clear previous errors
        form.querySelectorAll('.cf-cms-field-error').forEach(field => {
          field.classList.remove('cf-cms-field-error');
        });
        form.querySelectorAll('.text-red-600').forEach(error => {
          error.remove();
        });
        
        // Build form data
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        // Validate
        const result = validateForm(data, validation.schema);
        
        if (!result.valid) {
          // Show errors
          result.errors.forEach(error => {
            const field = form.querySelector('[name="' + error.field + '"]');
            if (field) {
              const container = field.closest('.cf-cms-field');
              if (container) {
                container.classList.add('cf-cms-field-error');
                const errorDiv = document.createElement('p');
                errorDiv.className = 'mt-1 text-sm text-red-600';
                errorDiv.textContent = error.message;
                container.appendChild(errorDiv);
              }
            }
          });
          
          // Call error callback
          if (validation.options.onError) {
            eval(validation.options.onError + '(result.errors)');
          }
          
          validation.validating = false;
          return false;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.classList.add('opacity-50');
          const originalText = submitButton.textContent;
          submitButton.innerHTML = '<span class="inline-flex items-center">' +
            '<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">' +
              '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
              '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
            '</svg>' +
            'Submitting...' +
          '</span>';
        }
        
        // Call submit callback
        if (validation.options.onSubmit) {
          const submitResult = eval(validation.options.onSubmit + '(data)');
          if (submitResult === false) {
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50');
            submitButton.textContent = originalText;
            validation.validating = false;
            return false;
          }
        }
        
        // Submit form
        form.submit();
        validation.validating = false;
      }
      
      function handleFormCancel(formId) {
        const form = document.getElementById(formId);
        form.reset();
        
        // Clear all errors
        form.querySelectorAll('.cf-cms-field-error').forEach(field => {
          field.classList.remove('cf-cms-field-error');
        });
        form.querySelectorAll('.text-red-600').forEach(error => {
          error.remove();
        });
      }
      
      function validateForm(data, schema) {
        const errors = [];
        
        for (const [fieldName, rules] of Object.entries(schema)) {
          const value = data[fieldName];
          
          for (const rule of rules) {
            let isValid = true;
            let errorMessage = rule.message;
            
            switch (rule.type) {
              case 'required':
                isValid = value !== null && value !== undefined && value !== '';
                break;
              case 'email':
                isValid = !value || /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
                break;
              case 'minLength':
                isValid = !value || value.length >= rule.value;
                break;
              case 'maxLength':
                isValid = !value || value.length <= rule.value;
                break;
              case 'pattern':
                isValid = !value || new RegExp(rule.value).test(value);
                break;
              case 'min':
                isValid = !value || Number(value) >= rule.value;
                break;
              case 'max':
                isValid = !value || Number(value) <= rule.value;
                break;
            }
            
            if (!isValid) {
              errors.push({
                field: fieldName,
                message: errorMessage,
                rule: rule.type,
                value: value
              });
              break; // Stop after first error for this field
            }
          }
        }
        
        return {
          valid: errors.length === 0,
          errors: errors,
          data: data
        };
      }
    </script>
  `
}

// Multi-step form component
export function renderMultiStepForm(props: {
  id?: string
  title?: string
  description?: string
  steps: Array<{
    id: string
    title: string
    description?: string
    fields: FormField[]
    validation?: ValidationRule[]
  }>
  currentStep?: number
  onStepChange?: string
  onComplete?: string
  className?: string
}): string {
  const {
    id,
    title,
    description,
    steps,
    currentStep = 0,
    onStepChange,
    onComplete,
    className = ''
  } = props

  const formId = id || `multi-step-form-${Date.now()}`

  // Build step indicators
  const stepIndicators = steps.map((step, index) => {
    const isActive = index === currentStep
    const isCompleted = index < currentStep
    
    return `
      <div class="flex items-center">
        <div class="flex items-center">
          <div class="flex items-center justify-center w-10 h-10 rounded-full ${
            isActive ? 'bg-blue-600 text-white' : 
            isCompleted ? 'bg-green-600 text-white' : 
            'bg-gray-300 text-gray-600'
          }">
            ${isCompleted ? 
              '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' :
              index + 1
            }
          </div>
          <span class="ml-3 text-sm font-medium ${
            isActive ? 'text-blue-600' : 
            isCompleted ? 'text-green-600' : 
            'text-gray-500'
          }">${step.title}</span>
        </div>
        ${index < steps.length - 1 ? `
          <div class="flex-1 h-px mx-4 ${
            index < currentStep ? 'bg-green-600' : 'bg-gray-300'
          }"></div>
        ` : ''}
      </div>
    `
  }).join('')

  // Build current step content
  const currentStepData = steps[currentStep]
  const stepContent = renderForm({
    id: `${formId}-step-${currentStep}`,
    fields: currentStepData.fields,
    action: '#',
    submitText: currentStep === steps.length - 1 ? 'Complete' : 'Next',
    showReset: false,
    className: 'mt-6',
    onSubmit: `handleMultiStepSubmit('${formId}', ${currentStep})`
  })

  // Build navigation buttons
  const navigationButtons = `
    <div class="flex justify-between mt-6">
      <button
        type="button"
        onclick="previousStep('${formId}')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentStep === 0 ? 'invisible' : ''}"
      >
        Previous
      </button>
      <button
        type="button"
        onclick="nextStep('${formId}')"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        ${currentStep === steps.length - 1 ? 'Complete' : 'Next'}
      </button>
    </div>
  `

  return `
    <div id="${formId}" class="cf-cms-multi-step-form ${className}">
      ${title || description ? `
        <div class="mb-8">
          ${title ? `<h2 class="text-2xl font-bold text-gray-900 mb-2">${title}</h2>` : ''}
          ${description ? `<p class="text-gray-600">${description}</p>` : ''}
        </div>
      ` : ''}
      
      <!-- Step Indicators -->
      <nav aria-label="Progress">
        <ol class="flex items-center justify-center">
          ${stepIndicators}
        </ol>
      </nav>
      
      <!-- Current Step -->
      <div class="mt-8">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">${currentStepData.title}</h3>
          ${currentStepData.description ? `<p class="text-sm text-gray-600 mt-1">${currentStepData.description}</p>` : ''}
        </div>
        
        ${stepContent}
        ${navigationButtons}
      </div>
      
      <script>
        window['multiStepForm_${formId}'] = {
          currentStep: ${currentStep},
          steps: ${JSON.stringify(steps.map(s => ({ id: s.id, title: s.title })))},
          onStepChange: ${onStepChange || 'null'},
          onComplete: ${onComplete || 'null'}
        };
        
        function nextStep(formId) {
          const form = window['multiStepForm_' + formId];
          const stepForm = document.getElementById(formId + '-step-' + form.currentStep);
          
          // Validate current step
          const formData = new FormData(stepForm);
          const data = {};
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
          
          // Simple validation - in real implementation, use proper validation
          const requiredFields = stepForm.querySelectorAll('[required]');
          let isValid = true;
          
          requiredFields.forEach(field => {
            if (!field.value.trim()) {
              isValid = false;
              field.classList.add('border-red-500');
            } else {
              field.classList.remove('border-red-500');
            }
          });
          
          if (!isValid) {
            return;
          }
          
          if (form.currentStep < form.steps.length - 1) {
            form.currentStep++;
            updateMultiStepForm(formId);
          } else {
            // Complete form
            if (form.onComplete) {
              eval(form.onComplete + '(data)');
            }
          }
        }
        
        function previousStep(formId) {
          const form = window['multiStepForm_' + formId];
          if (form.currentStep > 0) {
            form.currentStep--;
            updateMultiStepForm(formId);
          }
        }
        
        function updateMultiStepForm(formId) {
          const form = window['multiStepForm_' + formId];
          
          // Update step indicators
          const steps = document.querySelectorAll('#' + formId + ' ol > div');
          steps.forEach((stepEl, index) => {
            const isActive = index === form.currentStep;
            const isCompleted = index < form.currentStep;
            
            const circle = stepEl.querySelector('.rounded-full');
            const text = stepEl.querySelector('span');
            const line = stepEl.querySelector('.flex-1');
            
            // Update circle
            circle.className = 'flex items-center justify-center w-10 h-10 rounded-full ' + (
              isActive ? 'bg-blue-600 text-white' : 
              isCompleted ? 'bg-green-600 text-white' : 
              'bg-gray-300 text-gray-600'
            );
            
            // Update text
            text.className = 'ml-3 text-sm font-medium ' + (
              isActive ? 'text-blue-600' : 
              isCompleted ? 'text-green-600' : 
              'text-gray-500'
            );
            
            // Update line
            if (line) {
              line.className = 'flex-1 h-px mx-4 ' + (
                index < form.currentStep ? 'bg-green-600' : 'bg-gray-300'
              );
            }
          });
          
          // Reload the form with new step
          location.reload(); // In real implementation, this would update the DOM
        }
        
        function handleMultiStepSubmit(formId, stepIndex) {
          // Prevent default form submission
          return false;
        }
      </script>
    </div>
  `
}