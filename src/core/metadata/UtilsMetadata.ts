/**
 * LCAgents Utils Resource Metadata
 * Defines schema and validation for utility files and helper resources
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const UtilsMetadata: ResourceMetadata = {
  id: 'lcagents-utils',
  name: 'LCAgents Utility Resource',
  version: '2.0.0',
  description: 'Utility files and helper resources that support agents, tasks, and workflows',
  
  type: ResourceType.UTILS,
  category: 'support',
  tags: ['utility', 'helper', 'support', 'documentation', 'guide'],
  
  fileExtension: '.md',
  fileNaming: {
    pattern: '^[a-z-]+\\.md$',
    example: 'workflow-management.md',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with .md extension',
      'Should describe the utility purpose (e.g., workflow-management, doc-template)'
    ]
  },
  directory: 'utils',
  
  schema: [
    {
      name: 'title',
      type: FieldType.STRING,
      required: true,
      description: 'Clear, descriptive title for the utility resource',
      wizard: {
        question: 'What is the title of this utility resource?',
        helpText: 'Use a clear title that describes the utility\'s purpose',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Workflow Management Guide, Documentation Template'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Utility title is required', severity: 'error' },
        { type: ValidationType.MIN_LENGTH, value: 3, message: 'Title must be at least 3 characters', severity: 'error' }
      ]
    },
    {
      name: 'utility_type',
      type: FieldType.ENUM,
      required: true,
      description: 'Type of utility resource',
      wizard: {
        question: 'What type of utility is this?',
        inputType: InputType.SELECT,
        options: [
          'template',
          'guide',
          'reference',
          'helper-script',
          'configuration',
          'documentation',
          'best-practices',
          'troubleshooting'
        ]
      }
    },
    {
      name: 'purpose',
      type: FieldType.STRING,
      required: true,
      description: 'What this utility resource accomplishes',
      wizard: {
        question: 'What is the purpose of this utility?',
        helpText: 'Explain how this utility helps agents, users, or processes',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'target_users',
      type: FieldType.ARRAY,
      required: true,
      description: 'Who should use this utility resource',
      wizard: {
        question: 'Who is the target audience for this utility?',
        helpText: 'Select all applicable users',
        inputType: InputType.MULTISELECT,
        options: [
          'all-agents',
          'specific-agents',
          'human-users',
          'developers',
          'administrators',
          'workflow-engines',
          'automation-systems'
        ]
      }
    },
    {
      name: 'usage_context',
      type: FieldType.STRING,
      required: true,
      description: 'When and how this utility should be used',
      wizard: {
        question: 'When and how should this utility be used?',
        helpText: 'Describe the specific scenarios or contexts where this utility is helpful',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'dependencies',
      type: FieldType.ARRAY,
      required: false,
      description: 'Other resources this utility depends on',
      wizard: {
        question: 'What other resources does this utility depend on? (Optional)',
        helpText: 'List any templates, data files, or other resources needed',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'integration_points',
      type: FieldType.ARRAY,
      required: false,
      description: 'How this utility integrates with other system components',
      wizard: {
        question: 'How does this utility integrate with other components? (Optional)',
        helpText: 'Describe integration with agents, tasks, workflows, or external systems',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'maintenance_notes',
      type: FieldType.STRING,
      required: false,
      description: 'Special considerations for maintaining this utility',
      wizard: {
        question: 'Any special maintenance considerations? (Optional)',
        helpText: 'Note any special requirements for keeping this utility current',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'examples',
      type: FieldType.ARRAY,
      required: false,
      description: 'Usage examples or sample implementations',
      wizard: {
        question: 'What examples should be included? (Optional)',
        helpText: 'Provide practical examples of how to use this utility',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'related_utilities',
      type: FieldType.ARRAY,
      required: false,
      description: 'Other utilities that complement or relate to this one',
      wizard: {
        question: 'What other utilities are related? (Optional)',
        helpText: 'List complementary or related utility resources',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'access_level',
      type: FieldType.ENUM,
      required: true,
      description: 'Who can access this utility',
      wizard: {
        question: 'What is the access level for this utility?',
        inputType: InputType.SELECT,
        options: [
          'public',
          'internal',
          'team-only',
          'admin-only'
        ]
      }
    }
  ],
  
  requiredFields: [
    'title', 'utility_type', 'purpose', 'target_users', 'usage_context', 'access_level'
  ],
  
  usedBy: ['agents', 'tasks', 'workflows', 'human users', 'automation systems'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'basic_info',
        title: 'Utility Overview',
        description: 'Basic information about the utility',
        fields: ['title', 'utility_type', 'purpose'],
        order: 1
      },
      {
        id: 'audience_access',
        title: 'Audience & Access',
        description: 'Who can use this utility and when',
        fields: ['target_users', 'usage_context', 'access_level'],
        order: 2
      },
      {
        id: 'integration',
        title: 'Integration & Dependencies',
        description: 'How this utility works with other components',
        fields: ['dependencies', 'integration_points'],
        order: 3
      },
      {
        id: 'documentation',
        title: 'Documentation & Maintenance',
        description: 'Examples and maintenance considerations',
        fields: ['examples', 'maintenance_notes', 'related_utilities'],
        order: 4
      }
    ]
  },
  
  validation: {
    preValidation: [
      {
        type: ValidationType.MIN_LENGTH,
        value: 50,
        message: 'Utility resources should contain substantial content',
        severity: 'warning'
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'BMAD Documentation Template',
      description: 'Standard template for creating BMAD-style documentation',
      useCase: 'Ensuring consistent documentation format across all resources',
      content: 'bmad-doc-template.md from .bmad-core/utils/'
    },
    {
      name: 'Workflow Management Guide',
      description: 'Guide for managing and executing multi-agent workflows',
      useCase: 'Helping users understand how to effectively use workflow orchestration',
      content: 'workflow-management.md from .bmad-core/utils/'
    }
  ],
  
  bestPractices: [
    'Provide clear, practical guidance for users',
    'Include concrete examples and use cases',
    'Keep utilities focused on specific problems or needs',
    'Document integration points with other system components',
    'Consider both human and automated consumers',
    'Include troubleshooting guidance where applicable',
    'Reference related utilities to help users find complementary resources',
    'Keep maintenance requirements realistic and achievable',
    'Use consistent formatting and structure across utility files',
    'Test utility guidance with real users to ensure effectiveness'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
