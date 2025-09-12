/**
 * LCAgents Agent Resource Metadata
 * Defines schema and validation for agent definitions
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const AgentMetadata: ResourceMetadata = {
  id: 'lcagents-agent',
  name: 'LCAgents Agent Definition',
  version: '2.0.0',
  description: 'Intelligent AI agent with persona, commands, and dependencies for specific domain expertise',
  
  type: ResourceType.AGENT,
  category: 'core',
  tags: ['ai-agent', 'persona', 'commands', 'automation'],
  
  fileExtension: '.md',
  fileNaming: {
    pattern: '^[a-z-]+\\.md$',
    example: 'analyst.md',
    rules: [
      'Lowercase letters only',
      'Hyphens allowed for multi-word names',
      'Must end with .md extension',
      'Should match agent.id field'
    ]
  },
  directory: 'agents',
  
  schema: [
    {
      name: 'agent.name',
      type: FieldType.STRING,
      required: true,
      description: 'Human-readable agent name (e.g., "Mary")',
      wizard: {
        question: 'What is the agent\'s human name?',
        helpText: 'Choose a friendly, memorable name that represents the agent\'s personality',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Mary, John, Sarah'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Agent name is required', severity: 'error' },
        { type: ValidationType.MIN_LENGTH, value: 2, message: 'Name must be at least 2 characters', severity: 'error' }
      ]
    },
    {
      name: 'agent.id',
      type: FieldType.STRING,
      required: true,
      description: 'Unique identifier for the agent (lowercase, hyphen-separated)',
      wizard: {
        question: 'What is the agent\'s unique identifier?',
        helpText: 'This should match the filename and be used in commands. Use lowercase and hyphens.',
        inputType: InputType.TEXT,
        placeholder: 'e.g., analyst, project-manager, qa-lead'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Agent ID is required', severity: 'error' },
        { type: ValidationType.PATTERN, value: '^[a-z-]+$', message: 'ID must be lowercase with hyphens only', severity: 'error' },
        { type: ValidationType.UNIQUE, message: 'Agent ID must be unique across all agents', severity: 'error' }
      ]
    },
    {
      name: 'agent.title',
      type: FieldType.STRING,
      required: true,
      description: 'Professional title or role description',
      wizard: {
        question: 'What is the agent\'s professional title?',
        helpText: 'This appears in help text and describes the agent\'s expertise',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Business Analyst, Senior Developer, UX Designer'
      }
    },
    {
      name: 'agent.icon',
      type: FieldType.STRING,
      required: true,
      description: 'Emoji icon representing the agent',
      wizard: {
        question: 'Choose an emoji icon for the agent',
        helpText: 'Select an emoji that represents the agent\'s role or personality',
        inputType: InputType.TEXT,
        placeholder: 'e.g., 📊, 💻, 🎨, 🔧'
      }
    },
    {
      name: 'agent.whenToUse',
      type: FieldType.STRING,
      required: true,
      description: 'Clear guidance on when to use this agent',
      wizard: {
        question: 'When should users choose this agent?',
        helpText: 'Describe the specific scenarios, tasks, or problems this agent solves',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'agent.customization',
      type: FieldType.STRING,
      required: false,
      description: 'Custom instructions that override base behavior',
      wizard: {
        question: 'Any custom behavior modifications? (Optional)',
        helpText: 'These instructions take precedence over default persona behavior',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'persona.role',
      type: FieldType.STRING,
      required: true,
      description: 'Core professional role and identity',
      wizard: {
        question: 'How should the agent describe their professional role?',
        inputType: InputType.TEXT
      }
    },
    {
      name: 'persona.style',
      type: FieldType.STRING,
      required: true,
      description: 'Communication style and approach',
      wizard: {
        question: 'What communication style should the agent have?',
        helpText: 'e.g., Analytical, creative, direct, collaborative',
        inputType: InputType.TEXT
      }
    },
    {
      name: 'persona.identity',
      type: FieldType.STRING,
      required: true,
      description: 'Detailed professional identity and specialization',
      wizard: {
        question: 'How should the agent describe their expertise and specialization?',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'persona.focus',
      type: FieldType.STRING,
      required: true,
      description: 'Primary areas of focus and responsibility',
      wizard: {
        question: 'What are the agent\'s main areas of focus?',
        inputType: InputType.TEXT
      }
    },
    {
      name: 'persona.core_principles',
      type: FieldType.ARRAY,
      required: true,
      description: 'List of core principles guiding agent behavior',
      wizard: {
        question: 'What core principles guide this agent\'s work?',
        helpText: 'Add principles that define how the agent approaches problems and interacts',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'commands',
      type: FieldType.ARRAY,
      required: true,
      description: 'Available commands with descriptions and task mappings',
      wizard: {
        question: 'What commands should this agent support?',
        helpText: 'Define the specific actions users can request from this agent',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'dependencies.data',
      type: FieldType.ARRAY,
      required: false,
      description: 'Data files the agent needs access to',
      wizard: {
        question: 'What data files does this agent need? (Optional)',
        helpText: 'Reference files from .bmad-core/data/',
        inputType: InputType.MULTISELECT
      }
    },
    {
      name: 'dependencies.tasks',
      type: FieldType.ARRAY,
      required: false,
      description: 'Task workflows the agent can execute',
      wizard: {
        question: 'What tasks can this agent perform? (Optional)',
        helpText: 'Task files from .bmad-core/tasks/',
        inputType: InputType.MULTISELECT
      }
    },
    {
      name: 'dependencies.templates',
      type: FieldType.ARRAY,
      required: false,
      description: 'Templates the agent can use for document creation',
      wizard: {
        question: 'What templates does this agent use? (Optional)',
        helpText: 'Template files from .bmad-core/templates/',
        inputType: InputType.MULTISELECT
      }
    }
  ],
  
  requiredFields: [
    'agent.name', 'agent.id', 'agent.title', 'agent.icon', 'agent.whenToUse',
    'persona.role', 'persona.style', 'persona.identity', 'persona.focus',
    'persona.core_principles', 'commands'
  ],
  
  usedBy: ['AgentLoader', 'agent command', 'setup init'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'basic_info',
        title: 'Basic Agent Information',
        description: 'Core identification and purpose',
        fields: ['agent.name', 'agent.id', 'agent.title', 'agent.icon'],
        order: 1
      },
      {
        id: 'purpose',
        title: 'Agent Purpose & Usage',
        description: 'When and how to use this agent',
        fields: ['agent.whenToUse', 'agent.customization'],
        order: 2
      },
      {
        id: 'persona',
        title: 'Persona Definition',
        description: 'Agent personality and behavior',
        fields: ['persona.role', 'persona.style', 'persona.identity', 'persona.focus', 'persona.core_principles'],
        order: 3
      },
      {
        id: 'capabilities',
        title: 'Commands & Capabilities',
        description: 'What the agent can do',
        fields: ['commands'],
        order: 4
      },
      {
        id: 'dependencies',
        title: 'Resource Dependencies',
        description: 'Files and resources the agent needs',
        fields: ['dependencies.data', 'dependencies.tasks', 'dependencies.templates'],
        order: 5
      }
    ]
  },
  
  validation: {
    crossReference: [
      {
        field: 'dependencies.data',
        referenceType: ResourceType.DATA,
        required: false
      },
      {
        field: 'dependencies.tasks', 
        referenceType: ResourceType.TASK,
        required: false
      },
      {
        field: 'dependencies.templates',
        referenceType: ResourceType.TEMPLATE,
        required: false
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Business Analyst Agent',
      description: 'Complete example of a business analyst agent',
      useCase: 'Market research, competitive analysis, project briefs',
      content: 'analyst.md from .bmad-core/agents/'
    }
  ],
  
  bestPractices: [
    'Use clear, professional names that match the agent\'s expertise',
    'Commands should start with action verbs and be intuitive',
    'Include comprehensive persona details for consistent behavior',
    'Ensure dependencies reference existing resources',
    'Test commands with real users for usability'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12', 
  maintainer: 'LendingClub Engineering Tools & Automation'
};
