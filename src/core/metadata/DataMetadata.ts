/**
 * LCAgents Data Resource Metadata
 * Defines schema and validation for data/knowledge resources
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const DataMetadata: ResourceMetadata = {
  id: 'lcagents-data',
  name: 'LCAgents Data Resource',
  version: '2.0.0',
  description: 'Knowledge base files containing reference information, frameworks, and data for agent use',
  
  type: ResourceType.DATA,
  category: 'knowledge-base',
  tags: ['data', 'knowledge', 'reference', 'information', 'framework'],
  
  fileExtension: '.md',
  fileNaming: {
    pattern: '^[a-z-]+\\.md$',
    example: 'bmad-kb.md',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with .md extension',
      'Should describe the content type (e.g., bmad-kb, test-framework, elicitation-methods)'
    ]
  },
  directory: 'data',
  
  schema: [
    {
      name: 'title',
      type: FieldType.STRING,
      required: true,
      description: 'Clear, descriptive title for the data resource',
      wizard: {
        question: 'What is the title of this data resource?',
        helpText: 'Use a clear title that describes the content and purpose',
        inputType: InputType.TEXT,
        placeholder: 'e.g., BMAD Knowledge Base, Test Priorities Matrix, Elicitation Methods'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Data resource title is required', severity: 'error' },
        { type: ValidationType.MIN_LENGTH, value: 3, message: 'Title must be at least 3 characters', severity: 'error' }
      ]
    },
    {
      name: 'data_type',
      type: FieldType.ENUM,
      required: true,
      description: 'Type of data content',
      wizard: {
        question: 'What type of data is this?',
        inputType: InputType.SELECT,
        options: [
          'knowledge-base',
          'framework',
          'methodology',
          'reference-list',
          'configuration',
          'standards',
          'guidelines',
          'lookup-table'
        ]
      }
    },
    {
      name: 'purpose',
      type: FieldType.STRING,
      required: true,
      description: 'What this data resource is used for',
      wizard: {
        question: 'What is the purpose of this data resource?',
        helpText: 'Explain how agents or users should use this information',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'target_audience',
      type: FieldType.ARRAY,
      required: true,
      description: 'Who should use this data resource',
      wizard: {
        question: 'Who is the target audience for this data?',
        helpText: 'List the agents, roles, or personas that should reference this data',
        inputType: InputType.MULTISELECT,
        options: [
          'all-agents',
          'analyst',
          'architect', 
          'developer',
          'pm',
          'po',
          'qa',
          'ux-expert',
          'human-users'
        ]
      }
    },
    {
      name: 'content_structure',
      type: FieldType.ENUM,
      required: true,
      description: 'How the content is organized',
      wizard: {
        question: 'How is the content structured?',
        inputType: InputType.SELECT,
        options: [
          'hierarchical',
          'list',
          'table',
          'narrative',
          'reference',
          'procedural',
          'mixed'
        ]
      }
    },
    {
      name: 'update_frequency',
      type: FieldType.ENUM,
      required: true,
      description: 'How often this data should be updated',
      wizard: {
        question: 'How often should this data be updated?',
        inputType: InputType.SELECT,
        options: [
          'static',
          'rarely',
          'quarterly',
          'monthly',
          'weekly',
          'as-needed'
        ]
      }
    },
    {
      name: 'source_authority',
      type: FieldType.STRING,
      required: false,
      description: 'Authoritative source or owner of this information',
      wizard: {
        question: 'What is the authoritative source for this data? (Optional)',
        helpText: 'Reference the team, document, or system that owns this information',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Engineering Standards Committee, Product Team, External Documentation'
      }
    },
    {
      name: 'validation_criteria',
      type: FieldType.STRING,
      required: false,
      description: 'How to validate the accuracy of this data',
      wizard: {
        question: 'How can the accuracy of this data be validated? (Optional)',
        helpText: 'Describe methods to verify the information is current and correct',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'related_resources',
      type: FieldType.ARRAY,
      required: false,
      description: 'Other resources that complement this data',
      wizard: {
        question: 'What other resources are related to this data? (Optional)',
        helpText: 'List templates, tasks, or other data files that work with this resource',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'access_level',
      type: FieldType.ENUM,
      required: true,
      description: 'Who can access this data',
      wizard: {
        question: 'What is the access level for this data?',
        inputType: InputType.SELECT,
        options: [
          'public',
          'internal',
          'team-only',
          'restricted'
        ]
      }
    },
    {
      name: 'format_requirements',
      type: FieldType.STRING,
      required: false,
      description: 'Specific formatting or structure requirements',
      wizard: {
        question: 'Are there specific formatting requirements? (Optional)',
        helpText: 'Describe any required structure, markup, or organization standards',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    }
  ],
  
  requiredFields: [
    'title', 'data_type', 'purpose', 'target_audience', 'content_structure', 
    'update_frequency', 'access_level'
  ],
  
  usedBy: ['all agents', 'tasks', 'templates', 'human users'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'basic_info',
        title: 'Data Resource Overview',
        description: 'Basic information about the data resource',
        fields: ['title', 'data_type', 'purpose'],
        order: 1
      },
      {
        id: 'audience_access',
        title: 'Audience & Access',
        description: 'Who can use this data and how',
        fields: ['target_audience', 'access_level'],
        order: 2
      },
      {
        id: 'structure_maintenance',
        title: 'Structure & Maintenance',
        description: 'How the data is organized and maintained',
        fields: ['content_structure', 'update_frequency', 'source_authority'],
        order: 3
      },
      {
        id: 'quality_relationships',
        title: 'Quality & Relationships',
        description: 'Validation and related resources',
        fields: ['validation_criteria', 'related_resources', 'format_requirements'],
        order: 4
      }
    ]
  },
  
  validation: {
    preValidation: [
      {
        type: ValidationType.MIN_LENGTH,
        value: 100,
        message: 'Data resources should contain substantial content',
        severity: 'warning'
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'BMAD Knowledge Base',
      description: 'Comprehensive knowledge base for BMAD methodology and practices',
      useCase: 'Reference information for all agents about BMAD principles and procedures',
      content: 'bmad-kb.md from .bmad-core/data/'
    },
    {
      name: 'Elicitation Methods',
      description: 'List of methods for gathering user requirements and feedback',
      useCase: 'Reference for interactive tasks that need to collect user input',
      content: 'elicitation-methods.md from .bmad-core/data/'
    },
    {
      name: 'Test Priorities Matrix',
      description: 'Framework for prioritizing testing efforts and coverage',
      useCase: 'Guidance for QA agents when planning test strategies',
      content: 'test-priorities-matrix.md from .bmad-core/data/'
    }
  ],
  
  bestPractices: [
    'Organize information in clear, logical sections',
    'Use consistent formatting for similar types of content',
    'Include examples and practical applications',
    'Reference authoritative sources for credibility',
    'Keep information current and accurate',
    'Use headings and structure for easy scanning',
    'Include context about when and how to use the information',
    'Cross-reference related resources where applicable',
    'Validate information accuracy regularly',
    'Consider accessibility for both human and AI consumers'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
