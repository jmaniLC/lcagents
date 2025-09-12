/**
 * LCAgents Checklist Resource Metadata
 * Defines schema and validation for checklist definitions
 */

import { ResourceMetadata, ResourceType, FieldType, InputType, ValidationType } from '../ResourceMetadata';

export const ChecklistMetadata: ResourceMetadata = {
  id: 'lcagents-checklist',
  name: 'LCAgents Checklist Definition',
  version: '2.0.0',
  description: 'Quality assurance checklist for validating work completion and standards compliance',
  
  type: ResourceType.CHECKLIST,
  category: 'quality-assurance',
  tags: ['checklist', 'qa', 'validation', 'quality', 'standards'],
  
  fileExtension: '.md',
  fileNaming: {
    pattern: '^[a-z-]+-checklist\\.md$',
    example: 'story-dod-checklist.md',
    rules: [
      'Lowercase letters and hyphens only',
      'Must end with "-checklist.md"',
      'Should describe the purpose (e.g., story-dod, architect, pm)'
    ]
  },
  directory: 'checklists',
  
  schema: [
    {
      name: 'title',
      type: FieldType.STRING,
      required: true,
      description: 'Clear, descriptive checklist title',
      wizard: {
        question: 'What is the checklist title?',
        helpText: 'Use a clear, descriptive title that explains the checklist purpose',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Story Definition of Done (DoD) Checklist'
      },
      validation: [
        { type: ValidationType.REQUIRED, message: 'Checklist title is required', severity: 'error' },
        { type: ValidationType.MIN_LENGTH, value: 5, message: 'Title must be at least 5 characters', severity: 'error' }
      ]
    },
    {
      name: 'target_audience',
      type: FieldType.STRING,
      required: true,
      description: 'Who this checklist is intended for',
      wizard: {
        question: 'Who is this checklist for?',
        helpText: 'Specify the role or agent that should use this checklist',
        inputType: InputType.TEXT,
        placeholder: 'e.g., Developer Agent, Project Manager, QA Engineer'
      }
    },
    {
      name: 'purpose',
      type: FieldType.STRING,
      required: true,
      description: 'What this checklist validates or ensures',
      wizard: {
        question: 'What is the purpose of this checklist?',
        helpText: 'Explain what completion of this checklist validates or ensures',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'instructions',
      type: FieldType.MARKDOWN,
      required: true,
      description: 'Instructions for how to use the checklist',
      wizard: {
        question: 'How should someone use this checklist?',
        helpText: 'Provide clear instructions for completing the checklist items',
        inputType: InputType.MARKDOWN_EDITOR
      }
    },
    {
      name: 'llm_instructions',
      type: FieldType.MARKDOWN,
      required: false,
      description: 'Special instructions for LLM/AI agents using this checklist',
      wizard: {
        question: 'Any special instructions for AI agents? (Optional)',
        helpText: 'Instructions specifically for LLM agents on how to process this checklist',
        inputType: InputType.MARKDOWN_EDITOR
      }
    },
    {
      name: 'checklist_sections',
      type: FieldType.ARRAY,
      required: true,
      description: 'Organized sections of checklist items',
      wizard: {
        question: 'What are the main sections of your checklist?',
        helpText: 'Organize checklist items into logical groups (e.g., Requirements, Testing, Documentation)',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'completion_criteria',
      type: FieldType.STRING,
      required: true,
      description: 'What constitutes successful completion',
      wizard: {
        question: 'How do you know the checklist is successfully completed?',
        helpText: 'Define what successful completion looks like',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    },
    {
      name: 'escalation_process',
      type: FieldType.STRING,
      required: false,
      description: 'What to do when checklist items cannot be completed',
      wizard: {
        question: 'What should happen if checklist items cannot be completed? (Optional)',
        helpText: 'Define escalation or exception handling process',
        inputType: InputType.TEXTAREA,
        multiline: true
      }
    }
  ],
  
  requiredFields: [
    'title', 'target_audience', 'purpose', 'instructions', 'checklist_sections', 'completion_criteria'
  ],
  
  usedBy: ['execute-checklist task', 'qa agents', 'development workflow'],
  
  wizard: {
    mode: 'guided',
    sections: [
      {
        id: 'basic_info',
        title: 'Checklist Overview',
        description: 'Basic information about the checklist',
        fields: ['title', 'target_audience', 'purpose'],
        order: 1
      },
      {
        id: 'usage',
        title: 'Usage Instructions',
        description: 'How to use this checklist',
        fields: ['instructions', 'llm_instructions'],
        order: 2
      },
      {
        id: 'content',
        title: 'Checklist Content',
        description: 'The actual checklist items and organization',
        fields: ['checklist_sections'],
        order: 3
      },
      {
        id: 'completion',
        title: 'Completion & Escalation',
        description: 'Success criteria and exception handling',
        fields: ['completion_criteria', 'escalation_process'],
        order: 4
      }
    ]
  },
  
  validation: {
    preValidation: [
      { 
        type: ValidationType.PATTERN, 
        value: '\\[\\s*\\].*', 
        message: 'Checklist should contain checkbox items [ ]',
        severity: 'warning'
      }
    ]
  },
  
  customizable: true,
  immutable: true,
  
  examples: [
    {
      name: 'Story Definition of Done Checklist',
      description: 'Quality checklist for story completion validation',
      useCase: 'Ensuring stories meet all criteria before marking complete',
      content: 'story-dod-checklist.md from .bmad-core/checklists/'
    },
    {
      name: 'Architect Checklist',
      description: 'Technical review checklist for architecture decisions',
      useCase: 'Validating architecture designs and technical decisions',
      content: 'architect-checklist.md from .bmad-core/checklists/'
    }
  ],
  
  bestPractices: [
    'Use clear, actionable checkbox items that can be verified',
    'Group related items into logical sections',
    'Include specific criteria rather than vague requirements',
    'Provide context and rationale for complex items',
    'Include escalation process for blocked items',
    'Keep checklists focused and not overly long',
    'Use consistent formatting for checkbox items'
  ],
  
  createdDate: '2025-09-12',
  lastUpdated: '2025-09-12',
  maintainer: 'LendingClub Engineering Tools & Automation'
};
