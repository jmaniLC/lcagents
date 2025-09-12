/**
 * LCAgents Workflow Resource Metadata
 * Defines schema and validation for multi-agent workflow definitions
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const WorkflowMetadata: ResourceMetadata = {
  id: 'lcagents-workflow',
  name: 'LCAgents Workflow Definition',
  version: '2.0.0',
  description: 'Multi-agent workflow that orchestrates sequences of agents and tasks for complex project execution',
  
  type: ResourceType.WORKFLOW,
  category: 'orchestration',
  tags: ['workflow', 'multi-agent', 'orchestration', 'sequence', 'project-management'],
  
  fileExtension: '.yaml',
  fileNaming: {
    pattern: '^[a-z-]+\\.yaml$',
    example: 'greenfield-fullstack.yaml',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with .yaml extension',
      'Should describe the project type and scope (e.g., greenfield-fullstack, brownfield-ui)'
    ]
  },
  directory: 'workflows',
  
  schema: [
    {
      name: 'workflow.id',
      type: FieldType.STRING,
      required: true,
      description: 'Unique workflow identifier',
      wizard: {
        question: 'What is the unique workflow ID?',
        helpText: 'Use a descriptive ID that matches the filename',
        inputType: InputType.TEXT,
        placeholder: 'e.g., greenfield-fullstack, brownfield-service'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Workflow ID is required', severity: 'error' },
        { type: ValidationType.PATTERN, value: '^[a-z-]+$', message: 'ID must be lowercase with hyphens only', severity: 'error' }
      ]
    },
    {
      name: 'workflow.name',
      type: FieldType.STRING,
      required: true,
      description: 'Human-readable workflow name',
      wizard: {
        question: 'What is the workflow name?',
        helpText: 'Clear name describing what this workflow accomplishes',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Greenfield Full-Stack Application Development'
      }
    },
    {
      name: 'workflow.description',
      type: FieldType.STRING,
      required: true,
      description: 'Detailed description of the workflow purpose and scope',
      wizard: {
        question: 'What does this workflow accomplish?',
        helpText: 'Provide a comprehensive description of the workflow\'s purpose and when to use it',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'workflow.type',
      type: FieldType.ENUM,
      required: true,
      description: 'Type of project or workflow',
      wizard: {
        question: 'What type of project is this workflow for?',
        inputType: InputType.SELECT,
        options: [
          'greenfield',
          'brownfield',
          'maintenance',
          'analysis',
          'documentation',
          'migration',
          'integration'
        ]
      }
    },
    {
      name: 'workflow.project_types',
      type: FieldType.ARRAY,
      required: true,
      description: 'Compatible project types for this workflow',
      wizard: {
        question: 'What project types is this workflow compatible with?',
        helpText: 'Select all applicable project types',
        inputType: InputType.MULTISELECT,
        options: [
          'web-app',
          'api-service',
          'mobile-app',
          'desktop-app',
          'saas',
          'enterprise-app',
          'prototype',
          'mvp',
          'library',
          'tool'
        ]
      }
    },
    {
      name: 'workflow.sequence',
      type: FieldType.ARRAY,
      required: true,
      description: 'Ordered sequence of agents and their deliverables',
      wizard: {
        question: 'What is the sequence of agents and deliverables?',
        helpText: 'Define the ordered steps, which agents are involved, and what they create',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'workflow.prerequisites',
      type: FieldType.ARRAY,
      required: false,
      description: 'Required conditions before starting this workflow',
      wizard: {
        question: 'What prerequisites are needed before starting? (Optional)',
        helpText: 'List required information, tools, or setup steps',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'workflow.parallel_tracks',
      type: FieldType.BOOLEAN,
      required: false,
      description: 'Whether some workflow steps can be executed in parallel',
      wizard: {
        question: 'Can some steps be executed in parallel?',
        helpText: 'Indicate if the workflow supports concurrent execution of certain steps',
        inputType: InputType.CHECKBOX
      },
      defaultValue: false
    },
    {
      name: 'workflow.estimated_duration',
      type: FieldType.STRING,
      required: false,
      description: 'Estimated time to complete the full workflow',
      wizard: {
        question: 'What is the estimated duration for this workflow? (Optional)',
        helpText: 'Provide time estimates for planning purposes',
        inputType: InputType.TEXT,
        placeholder: 'e.g., 2-3 days, 1-2 weeks, depends on project size'
      }
    },
    {
      name: 'workflow.complexity_level',
      type: FieldType.ENUM,
      required: true,
      description: 'Complexity level of this workflow',
      wizard: {
        question: 'What is the complexity level of this workflow?',
        inputType: InputType.SELECT,
        options: [
          'beginner',
          'intermediate', 
          'advanced',
          'expert'
        ]
      }
    },
    {
      name: 'workflow.success_criteria',
      type: FieldType.ARRAY,
      required: false,
      description: 'Criteria that define successful workflow completion',
      wizard: {
        question: 'What defines successful completion of this workflow? (Optional)',
        helpText: 'List the key deliverables and quality criteria',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'workflow.variations',
      type: FieldType.ARRAY,
      required: false,
      description: 'Alternative paths or variations of the workflow',
      wizard: {
        question: 'Are there alternative paths or variations? (Optional)',
        helpText: 'Describe optional steps or alternative sequences',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    }
  ],
  
  requiredFields: [
    'workflow.id', 'workflow.name', 'workflow.description', 'workflow.type',
    'workflow.project_types', 'workflow.sequence', 'workflow.complexity_level'
  ],
  
  usedBy: ['workflow orchestrator', 'project management', 'team leads', 'automation systems'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'workflow_info',
        title: 'Workflow Information',
        description: 'Basic workflow identification and purpose',
        fields: ['workflow.id', 'workflow.name', 'workflow.description'],
        order: 1
      },
      {
        id: 'classification',
        title: 'Workflow Classification',
        description: 'Type and complexity of the workflow',
        fields: ['workflow.type', 'workflow.project_types', 'workflow.complexity_level'],
        order: 2
      },
      {
        id: 'execution_plan',
        title: 'Execution Plan',
        description: 'How the workflow should be executed',
        fields: ['workflow.sequence', 'workflow.parallel_tracks', 'workflow.estimated_duration'],
        order: 3
      },
      {
        id: 'requirements_criteria',
        title: 'Requirements & Success Criteria',
        description: 'Prerequisites and success definition',
        fields: ['workflow.prerequisites', 'workflow.success_criteria'],
        order: 4
      },
      {
        id: 'variations',
        title: 'Workflow Variations',
        description: 'Alternative paths and options',
        fields: ['workflow.variations'],
        order: 5
      }
    ]
  },
  
  validation: {
    preValidation: [
      {
        type: ValidationType.CUSTOM,
        value: 'sequence_validation',
        message: 'Workflow sequence should reference valid agents and deliverables',
        severity: 'error'
      }
    ],
    crossReference: [
      {
        field: 'workflow.sequence.agent',
        referenceType: ResourceType.AGENT,
        required: true
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Greenfield Full-Stack Workflow',
      description: 'Complete workflow for building full-stack applications from concept to development',
      useCase: 'New web applications requiring comprehensive planning and architecture',
      content: 'greenfield-fullstack.yaml from .bmad-core/workflows/'
    },
    {
      name: 'Brownfield Service Workflow',
      description: 'Workflow for enhancing or modifying existing services',
      useCase: 'Adding features or improving existing backend services',
      content: 'brownfield-service.yaml from .bmad-core/workflows/'
    },
    {
      name: 'Brownfield UI Workflow',
      description: 'Workflow for updating or enhancing user interfaces',
      useCase: 'Improving existing frontend applications or adding new UI features',
      content: 'brownfield-ui.yaml from .bmad-core/workflows/'
    }
  ],
  
  bestPractices: [
    'Define clear agent sequences with specific deliverables',
    'Include notes about saving outputs to appropriate locations',
    'Specify dependencies between workflow steps clearly',
    'Provide guidance on when to use optional steps',
    'Include realistic time estimates for planning',
    'Define success criteria for each major deliverable',
    'Consider both linear and parallel execution paths',
    'Reference valid agents that exist in the system',
    'Include variation guidance for different project sizes',
    'Test workflows with real projects to validate effectiveness'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
