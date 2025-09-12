/**
 * LCAgents Agent Team Resource Metadata
 * Defines schema and validation for agent team configurations
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const AgentTeamMetadata: ResourceMetadata = {
  id: 'lcagents-agent-team',
  name: 'LCAgents Agent Team Configuration',
  version: '2.0.0',
  description: 'Team configuration that defines groups of agents working together on related tasks',
  
  type: ResourceType.AGENT_TEAM,
  category: 'collaboration',
  tags: ['agent-team', 'configuration', 'project-type', 'collaboration'],
  
  fileExtension: '.yaml',
  fileNaming: {
    pattern: '^team-[a-z-]+\\.yaml$',
    example: 'team-fullstack.yaml',
    rules: [
      'Must start with "team-"',
      'Lowercase letters and hyphens only', 
      'Must end with .yaml extension',
      'Should describe the team purpose (e.g., team-fullstack, team-minimal, team-no-ui)'
    ]
  },
  directory: 'agent-teams',
  
  schema: [
    {
      name: 'team.id',
      type: FieldType.STRING,
      required: true,
      description: 'Unique team configuration identifier',
      wizard: {
        question: 'What is the unique team ID?',
        helpText: 'Use a descriptive ID that matches the filename (without team- prefix)',
        inputType: InputType.TEXT,
        placeholder: 'e.g., fullstack, minimal, no-ui'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Team ID is required', severity: 'error' },
        { type: ValidationType.PATTERN, value: '^[a-z-]+$', message: 'ID must be lowercase with hyphens only', severity: 'error' }
      ]
    },
    {
      name: 'team.name',
      type: FieldType.STRING,
      required: true,
      description: 'Human-readable team name',
      wizard: {
        question: 'What is the team name?',
        helpText: 'Clear name describing this team configuration',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Full-Stack Development Team, Minimal Project Team'
      }
    },
    {
      name: 'team.description',
      type: FieldType.STRING,
      required: true,
      description: 'Purpose and scope of this team configuration',
      wizard: {
        question: 'What is the purpose of this team configuration?',
        helpText: 'Explain what types of projects this team is designed for',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'team.project_types',
      type: FieldType.ARRAY,
      required: true,
      description: 'Project types this team configuration supports',
      wizard: {
        question: 'What project types does this team support?',
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
          'tool',
          'documentation',
          'analysis'
        ]
      }
    },
    {
      name: 'team.complexity_level',
      type: FieldType.ENUM,
      required: true,
      description: 'Complexity level this team handles',
      wizard: {
        question: 'What complexity level does this team handle?',
        inputType: InputType.SELECT,
        options: [
          'simple',
          'moderate',
          'complex',
          'enterprise'
        ]
      }
    },
    {
      name: 'team.agents',
      type: FieldType.ARRAY,
      required: true,
      description: 'List of agents included in this team',
      wizard: {
        question: 'Which agents are included in this team?',
        helpText: 'Select the agents that should be available in this team configuration',
        inputType: InputType.MULTISELECT,
        options: [
          'analyst',
          'architect',
          'bmad-master',
          'bmad-orchestrator',
          'dev',
          'pm',
          'po',
          'qa',
          'sm',
          'ux-expert'
        ]
      }
    },
    {
      name: 'team.primary_agents',
      type: FieldType.ARRAY,
      required: false,
      description: 'Agents that are typically used most in this team',
      wizard: {
        question: 'Which agents are primary for this team? (Optional)',
        helpText: 'Select the agents that are used most frequently in this configuration',
        inputType: InputType.MULTISELECT
      }
    },
    {
      name: 'team.optional_agents',
      type: FieldType.ARRAY,
      required: false,
      description: 'Agents that are available but not always needed',
      wizard: {
        question: 'Which agents are optional for this team? (Optional)',
        helpText: 'Select agents that might be used depending on project needs',
        inputType: InputType.MULTISELECT
      }
    },
    {
      name: 'team.recommended_workflow',
      type: FieldType.STRING,
      required: false,
      description: 'Suggested workflow for this team configuration',
      wizard: {
        question: 'What workflow is recommended for this team? (Optional)',
        helpText: 'Reference a workflow that works well with this team',
        inputType: InputType.SELECT
      }
    },
    {
      name: 'team.use_cases',
      type: FieldType.ARRAY,
      required: true,
      description: 'Specific use cases where this team excels',
      wizard: {
        question: 'What are the specific use cases for this team?',
        helpText: 'List scenarios where this team configuration is most effective',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'team.limitations',
      type: FieldType.ARRAY,
      required: false,
      description: 'Known limitations or constraints of this team',
      wizard: {
        question: 'What are the limitations of this team configuration? (Optional)',
        helpText: 'List any constraints or scenarios where this team might not be suitable',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'team.setup_time',
      type: FieldType.STRING,
      required: false,
      description: 'Estimated time to set up and onboard this team',
      wizard: {
        question: 'How long does it take to set up this team? (Optional)',
        helpText: 'Estimate for initial setup and configuration',
        inputType: InputType.TEXT,
        placeholder: 'e.g., 5 minutes, 15 minutes, 30 minutes'
      }
    }
  ],
  
  requiredFields: [
    'team.id', 'team.name', 'team.description', 'team.project_types', 
    'team.complexity_level', 'team.agents', 'team.use_cases'
  ],
  
  usedBy: ['setup init', 'project initialization', 'team configuration'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'team_info',
        title: 'Team Information',
        description: 'Basic team configuration details',
        fields: ['team.id', 'team.name', 'team.description'],
        order: 1
      },
      {
        id: 'project_scope',
        title: 'Project Scope',
        description: 'What projects this team handles',
        fields: ['team.project_types', 'team.complexity_level'],
        order: 2
      },
      {
        id: 'agent_composition',
        title: 'Agent Composition',
        description: 'Which agents are included and their roles',
        fields: ['team.agents', 'team.primary_agents', 'team.optional_agents'],
        order: 3
      },
      {
        id: 'usage_guidance',
        title: 'Usage Guidance',
        description: 'When and how to use this team',
        fields: ['team.use_cases', 'team.limitations', 'team.recommended_workflow'],
        order: 4
      },
      {
        id: 'operational',
        title: 'Operational Details',
        description: 'Setup and operational considerations',
        fields: ['team.setup_time'],
        order: 5
      }
    ]
  },
  
  validation: {
    crossReference: [
      {
        field: 'team.agents',
        referenceType: ResourceType.AGENT,
        required: true
      },
      {
        field: 'team.recommended_workflow',
        referenceType: ResourceType.WORKFLOW,
        required: false
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Full-Stack Team',
      description: 'Complete team for full-stack web application development',
      useCase: 'Building comprehensive web applications with frontend, backend, and database components',
      content: 'team-fullstack.yaml from .bmad-core/agent-teams/'
    },
    {
      name: 'Minimal Team',
      description: 'Lightweight team for simple projects and prototypes',
      useCase: 'Quick prototypes, simple tools, or minimal viable products',
      content: 'team-ide-minimal.yaml from .bmad-core/agent-teams/'
    },
    {
      name: 'No-UI Team',
      description: 'Backend-focused team for API and service development',
      useCase: 'Building APIs, microservices, or backend-only applications',
      content: 'team-no-ui.yaml from .bmad-core/agent-teams/'
    }
  ],
  
  bestPractices: [
    'Include agents that naturally work well together',
    'Consider the typical workflow and agent interaction patterns',
    'Define clear primary vs optional agent roles',
    'Match team complexity to project complexity',
    'Provide specific use cases rather than generic descriptions',
    'Include realistic setup time estimates',
    'Reference compatible workflows when available',
    'Consider team size and management overhead',
    'Test team configurations with real projects',
    'Document any known limitations or edge cases'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
