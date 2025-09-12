/**
 * LCAgents Task Resource Metadata
 * Defines schema and validation for task workflow definitions
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const TaskMetadata: ResourceMetadata = {
  id: 'lcagents-task',
  name: 'LCAgents Task Workflow',
  version: '2.0.0',
  description: 'Executable workflow that defines step-by-step processes for agents to complete specific tasks',
  
  type: ResourceType.TASK,
  category: 'workflow',
  tags: ['task', 'workflow', 'process', 'executable', 'agent-automation'],
  
  fileExtension: '.md',
  fileNaming: {
    pattern: '^[a-z-]+\\.md$',
    example: 'create-doc.md',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with .md extension',
      'Should describe the action (e.g., create-doc, review-story, qa-gate)'
    ]
  },
  directory: 'tasks',
  
  schema: [
    {
      name: 'title',
      type: FieldType.STRING,
      required: true,
      description: 'Clear, action-oriented task title',
      wizard: {
        question: 'What is the task title?',
        helpText: 'Use an action-oriented title that clearly describes what this task accomplishes',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Create Document from Template, Review User Story'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Task title is required', severity: 'error' },
        { type: ValidationType.MIN_LENGTH, value: 5, message: 'Title must be at least 5 characters', severity: 'error' }
      ]
    },
    {
      name: 'execution_notice',
      type: FieldType.MARKDOWN,
      required: true,
      description: 'Critical execution instructions for agents',
      wizard: {
        question: 'What critical execution instructions should agents follow?',
        helpText: 'Include important notices about how this task must be executed (e.g., no shortcuts, mandatory user interaction)',
        inputType: InputType.MARKDOWN_EDITOR
      }
    },
    {
      name: 'task_type',
      type: FieldType.ENUM,
      required: true,
      description: 'Type of task workflow',
      wizard: {
        question: 'What type of task is this?',
        inputType: InputType.SELECT,
        options: ['interactive', 'automated', 'validation', 'creation', 'analysis', 'review']
      }
    },
    {
      name: 'user_interaction_required',
      type: FieldType.BOOLEAN,
      required: true,
      description: 'Whether this task requires user interaction',
      wizard: {
        question: 'Does this task require user interaction?',
        helpText: 'Tasks with elicitation or user input requirements should be marked as interactive',
        inputType: InputType.CHECKBOX
      }
    },
    {
      name: 'prerequisites',
      type: FieldType.ARRAY,
      required: false,
      description: 'Required conditions or resources before starting',
      wizard: {
        question: 'What prerequisites are needed before starting this task? (Optional)',
        helpText: 'List required files, information, or conditions',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'inputs',
      type: FieldType.ARRAY,
      required: false,
      description: 'Required inputs and parameters',
      wizard: {
        question: 'What inputs does this task require? (Optional)',
        helpText: 'List parameters, templates, or data that must be provided',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'processing_steps',
      type: FieldType.MARKDOWN,
      required: true,
      description: 'Detailed step-by-step processing instructions',
      wizard: {
        question: 'What are the detailed processing steps?',
        helpText: 'Provide clear, sequential instructions that agents can follow',
        inputType: InputType.MARKDOWN_EDITOR
      }
    },
    {
      name: 'elicitation_format',
      type: FieldType.STRING,
      required: false,
      description: 'Required format for user elicitation (e.g., 1-9 numbered options)',
      wizard: {
        question: 'What elicitation format should be used for user interaction? (Optional)',
        helpText: 'Specify the exact format for presenting options to users',
        inputType: InputType.TEXT,
        placeholder: 'e.g., 1-9 numbered options, yes/no questions, free text'
      }
    },
    {
      name: 'validation_rules',
      type: FieldType.ARRAY,
      required: false,
      description: 'Rules for validating task completion',
      wizard: {
        question: 'What validation rules ensure proper task completion? (Optional)',
        helpText: 'Define criteria that must be met for successful completion',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'outputs',
      type: FieldType.ARRAY,
      required: true,
      description: 'Expected outputs and deliverables',
      wizard: {
        question: 'What outputs should this task produce?',
        helpText: 'List files, documents, or results that should be created',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'error_handling',
      type: FieldType.STRING,
      required: false,
      description: 'How to handle errors or exceptions',
      wizard: {
        question: 'How should errors or exceptions be handled? (Optional)',
        helpText: 'Define what to do when the task cannot be completed normally',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'dependencies',
      type: FieldType.OBJECT,
      required: false,
      description: 'External resources this task depends on',
      wizard: {
        question: 'What external resources does this task depend on? (Optional)',
        helpText: 'List templates, data files, or other tasks this task uses',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    }
  ],
  
  requiredFields: [
    'title', 'execution_notice', 'task_type', 'user_interaction_required', 
    'processing_steps', 'outputs'
  ],
  
  usedBy: ['all agents', 'workflow engines', 'automation systems'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'basic_info',
        title: 'Task Overview',
        description: 'Basic information about the task',
        fields: ['title', 'task_type', 'user_interaction_required'],
        order: 1
      },
      {
        id: 'execution_config',
        title: 'Execution Configuration',
        description: 'How this task should be executed',
        fields: ['execution_notice', 'elicitation_format'],
        order: 2
      },
      {
        id: 'requirements',
        title: 'Requirements & Inputs',
        description: 'What is needed to start this task',
        fields: ['prerequisites', 'inputs'],
        order: 3
      },
      {
        id: 'process',
        title: 'Process Definition',
        description: 'The actual workflow steps',
        fields: ['processing_steps'],
        order: 4
      },
      {
        id: 'validation_output',
        title: 'Validation & Outputs',
        description: 'Success criteria and expected results',
        fields: ['validation_rules', 'outputs'],
        order: 5
      },
      {
        id: 'exception_handling',
        title: 'Exception Handling',
        description: 'Error handling and dependencies',
        fields: ['error_handling', 'dependencies'],
        order: 6
      }
    ],
    conditional: [
      {
        condition: 'user_interaction_required === true',
        showFields: ['elicitation_format']
      }
    ]
  },
  
  validation: {
    preValidation: [
      {
        type: ValidationType.CUSTOM,
        value: 'execution_notice_validation',
        message: 'Tasks should include clear execution notices for agents',
        severity: 'warning'
      }
    ],
    crossReference: [
      {
        field: 'dependencies.templates',
        referenceType: ResourceType.TEMPLATE,
        required: false
      },
      {
        field: 'dependencies.data',
        referenceType: ResourceType.DATA,
        required: false
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Create Document Task',
      description: 'Interactive task for creating documents from YAML templates',
      useCase: 'Generating structured documents with user input',
      content: 'create-doc.md from .bmad-core/tasks/'
    },
    {
      name: 'Review Story Task',
      description: 'Validation task for reviewing user stories',
      useCase: 'Quality assurance and story validation',
      content: 'review-story.md from .bmad-core/tasks/'
    },
    {
      name: 'Advanced Elicitation Task',
      description: 'Interactive task for gathering detailed requirements',
      useCase: 'Collecting comprehensive user input and requirements',
      content: 'advanced-elicitation.md from .bmad-core/tasks/'
    }
  ],
  
  bestPractices: [
    'Include clear execution notices to prevent agent shortcuts',
    'Define specific elicitation formats for consistent user interaction',
    'Provide step-by-step instructions that can be followed precisely',
    'Include validation rules to ensure quality outcomes',
    'Handle error cases and provide fallback procedures',
    'Reference external dependencies explicitly',
    'Test task workflows with real agents for reliability',
    'Use imperative language for clear action items',
    'Include stopping points for user feedback when needed'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
