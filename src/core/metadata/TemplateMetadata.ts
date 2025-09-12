/**
 * LCAgents Template Resource Metadata
 * Defines schema and validation for template definitions
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const TemplateMetadata: ResourceMetadata = {
  id: 'lcagents-template',
  name: 'LCAgents Template Definition',
  version: '2.0.0',
  description: 'YAML-driven document template for structured content creation with interactive workflows',
  
  type: ResourceType.TEMPLATE,
  category: 'document-generation',
  tags: ['template', 'yaml', 'document', 'workflow', 'interactive'],
  
  fileExtension: '.yaml',
  fileNaming: {
    pattern: '^[a-z-]+-tmpl\\.yaml$',
    example: 'story-tmpl.yaml',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with "-tmpl.yaml"',
      'Should describe the document type (e.g., story, prd, architecture)'
    ]
  },
  directory: 'templates',
  
  schema: [
    {
      name: 'template.id',
      type: FieldType.STRING,
      required: true,
      description: 'Unique template identifier',
      wizard: {
        question: 'What is the unique template ID?',
        helpText: 'Use a descriptive ID that matches the filename',
        inputType: InputType.TEXT,
        placeholder: 'e.g., story-template-v2, prd-template'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Template ID is required', severity: 'error' },
        { type: ValidationType.PATTERN, value: '^[a-z-]+$', message: 'ID must be lowercase with hyphens only', severity: 'error' }
      ]
    },
    {
      name: 'template.name',
      type: FieldType.STRING,
      required: true,
      description: 'Human-readable template name',
      wizard: {
        question: 'What is the template name?',
        helpText: 'Clear name describing what this template creates',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Story Document, Product Requirements Document'
      }
    },
    {
      name: 'template.version',
      type: FieldType.STRING,
      required: true,
      description: 'Template version for compatibility tracking',
      wizard: {
        question: 'What is the template version?',
        helpText: 'Use semantic versioning (e.g., 2.0, 1.5.1)',
        inputType: InputType.TEXT,
        placeholder: 'e.g., 2.0, 1.5.1'
      }
    },
    {
      name: 'template.output.format',
      type: FieldType.ENUM,
      required: true,
      description: 'Output document format',
      wizard: {
        question: 'What format should the output document be?',
        inputType: InputType.SELECT,
        options: ['markdown', 'yaml', 'json', 'html', 'text']
      }
    },
    {
      name: 'template.output.filename',
      type: FieldType.STRING,
      required: true,
      description: 'Output filename pattern with variable substitution',
      wizard: {
        question: 'What should the output filename pattern be?',
        helpText: 'Use {{variable}} syntax for dynamic values',
        inputType: InputType.TEXT,
        placeholder: 'docs/stories/{{epic_num}}.{{story_num}}.{{story_title_short}}.md'
      }
    },
    {
      name: 'template.output.title',
      type: FieldType.STRING,
      required: true,
      description: 'Document title pattern with variable substitution',
      wizard: {
        question: 'What should the document title pattern be?',
        helpText: 'Use {{variable}} syntax for dynamic values',
        inputType: InputType.TEXT,
        placeholder: 'Story {{epic_num}}.{{story_num}}: {{story_title_short}}'
      }
    },
    {
      name: 'workflow.mode',
      type: FieldType.ENUM,
      required: true,
      description: 'Template execution mode',
      wizard: {
        question: 'How should this template be executed?',
        helpText: 'Interactive requires user input, guided provides assistance, expert is minimal prompts',
        inputType: InputType.SELECT,
        options: ['interactive', 'guided', 'expert', 'automated']
      }
    },
    {
      name: 'workflow.elicitation',
      type: FieldType.STRING,
      required: false,
      description: 'Elicitation method for user input',
      wizard: {
        question: 'What elicitation method should be used? (Optional)',
        helpText: 'Reference to elicitation method from data/elicitation-methods.md',
        inputType: InputType.SELECT,
        options: ['advanced-elicitation', 'simple-prompts', 'guided-questions']
      }
    },
    {
      name: 'agent_config.editable_sections',
      type: FieldType.ARRAY,
      required: false,
      description: 'Sections that can be edited after creation',
      wizard: {
        question: 'Which sections should be editable after creation? (Optional)',
        helpText: 'List section IDs that users can modify',
        inputType: InputType.MULTISELECT
      }
    },
    {
      name: 'sections',
      type: FieldType.ARRAY,
      required: true,
      description: 'Template sections defining structure and content',
      wizard: {
        question: 'What sections should this template include?',
        helpText: 'Define the structure and content sections for the document',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    }
  ],
  
  requiredFields: [
    'template.id', 'template.name', 'template.version', 
    'template.output.format', 'template.output.filename', 'template.output.title',
    'workflow.mode', 'sections'
  ],
  
  usedBy: ['create-doc task', 'document generation workflows', 'content creation agents'],
  dependencies: ['elicitation-methods.md'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'template_info',
        title: 'Template Information',
        description: 'Basic template identification and metadata',
        fields: ['template.id', 'template.name', 'template.version'],
        order: 1
      },
      {
        id: 'output_config',
        title: 'Output Configuration',
        description: 'How the generated document should be formatted and named',
        fields: ['template.output.format', 'template.output.filename', 'template.output.title'],
        order: 2
      },
      {
        id: 'workflow_config',
        title: 'Workflow Configuration',
        description: 'How users interact with this template',
        fields: ['workflow.mode', 'workflow.elicitation'],
        order: 3
      },
      {
        id: 'agent_config',
        title: 'Agent Configuration',
        description: 'How agents should handle this template',
        fields: ['agent_config.editable_sections'],
        order: 4
      },
      {
        id: 'content_structure',
        title: 'Content Structure',
        description: 'Define the sections and content structure',
        fields: ['sections'],
        order: 5
      }
    ]
  },
  
  validation: {
    preValidation: [
      {
        type: ValidationType.PATTERN,
        value: '\\{\\{[^}]+\\}\\}',
        message: 'Template should use {{variable}} syntax for dynamic content',
        severity: 'info'
      }
    ],
    crossReference: [
      {
        field: 'workflow.elicitation',
        referenceType: ResourceType.DATA,
        referenceField: 'elicitation-methods.md',
        required: false
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Story Template',
      description: 'Interactive template for creating user stories',
      useCase: 'Creating structured user stories with acceptance criteria',
      content: 'story-tmpl.yaml from .bmad-core/templates/'
    },
    {
      name: 'PRD Template',
      description: 'Product Requirements Document template',
      useCase: 'Creating comprehensive product requirement documents',
      content: 'prd-tmpl.yaml from .bmad-core/templates/'
    },
    {
      name: 'Architecture Template',
      description: 'Technical architecture documentation template',
      useCase: 'Documenting system architecture and technical decisions',
      content: 'architecture-tmpl.yaml from .bmad-core/templates/'
    }
  ],
  
  bestPractices: [
    'Use clear section IDs that match the content purpose',
    'Provide helpful instruction text for each section',
    'Include validation rules for required vs optional content',
    'Use meaningful variable names in {{}} syntax',
    'Structure sections in logical order for completion',
    'Include elicitation guidance for interactive sections',
    'Test templates with real users for usability',
    'Version templates when making breaking changes'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
