/**
 * LCAgents Resource Type Metadata Schema
 * 
 * This file defines the structure and validation rules for all LCAgents resource types.
 * Used by LCAgents for:
 * - Creation wizards with friendly questions
 * - Validation during creation/modification
 * - Consistency enforcement across core/custom layers
 * - IDE assistance and error checking
 * 
 * Generated during: lcagents setup init
 * Updated during: Core system upgrades
 * Used by: Creation wizards, validation engine, IDE integration
 */

export interface ResourceMetadata {
  // Core identification
  id: string;                    // Required: Unique identifier for the resource type
  name: string;                  // Required: Human-readable name
  version: string;               // Required: Schema version for compatibility
  description: string;           // Required: Purpose and usage description
  
  // Classification
  type: ResourceType;            // Required: Primary resource classification
  category?: string;             // Optional: Sub-category within type
  tags?: string[];              // Optional: Searchable keywords
  
  // File system properties
  fileExtension: string;         // Required: File extension (.md, .yaml, etc.)
  fileNaming: FileNamingPattern; // Required: Naming convention rules
  directory: string;             // Required: Directory within .bmad-core/
  
  // Schema and validation
  schema: FieldSchema[];         // Required: Field definitions and validation
  requiredFields: string[];      // Required: List of mandatory fields
  
  // Workflow integration
  usedBy: string[];             // Required: Which agents/tasks use this resource
  dependencies?: string[];       // Optional: Other resources this depends on
  
  // Creation and modification
  wizard: WizardConfig;          // Required: Wizard configuration for creation
  validation: ValidationConfig; // Required: Validation rules and checks
  
  // Lifecycle
  immutable?: boolean;           // Optional: Whether core version is read-only
  customizable: boolean;         // Required: Can be customized in custom layer
  
  // Documentation
  examples?: Example[];          // Optional: Example implementations
  bestPractices?: string[];      // Optional: Recommended practices
  
  // Metadata
  createdDate: string;           // Required: When metadata was created
  lastUpdated: string;           // Required: Last modification date
  maintainer: string;            // Required: Team/person responsible
}

export enum ResourceType {
  AGENT = 'agent',
  CHECKLIST = 'checklist', 
  TEMPLATE = 'template',
  DATA = 'data',
  TASK = 'task',
  WORKFLOW = 'workflow',
  UTILS = 'utils',
  AGENT_TEAM = 'agent-team'
}

export interface FileNamingPattern {
  pattern: string;               // Required: Regex or pattern description
  example: string;               // Required: Example filename
  rules: string[];              // Required: Human-readable naming rules
}

export interface FieldSchema {
  name: string;                  // Required: Field identifier
  type: FieldType;              // Required: Data type
  required: boolean;             // Required: Whether field is mandatory
  description: string;           // Required: Purpose and usage
  
  // Validation
  validation?: ValidationRule[]; // Optional: Validation rules
  defaultValue?: any;           // Optional: Default value
  
  // UI generation
  wizard: FieldWizardConfig;     // Required: How to present in wizard
  
  // Relationships
  dependsOn?: string[];         // Optional: Fields this depends on
  affects?: string[];           // Optional: Fields affected by this
}

export enum FieldType {
  STRING = 'string',
  NUMBER = 'number', 
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  ENUM = 'enum',
  MARKDOWN = 'markdown',
  YAML = 'yaml',
  FILE_REFERENCE = 'file_reference'
}

export interface FieldWizardConfig {
  question: string;              // Required: Friendly question for user
  helpText?: string;            // Optional: Additional guidance
  inputType: InputType;         // Required: UI component type
  options?: any[];              // Optional: For select/checkbox types
  placeholder?: string;         // Optional: Input placeholder
  multiline?: boolean;          // Optional: For text inputs
}

export enum InputType {
  TEXT = 'text',
  TEXTAREA = 'textarea', 
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE_PICKER = 'file_picker',
  MARKDOWN_EDITOR = 'markdown_editor'
}

export interface ValidationRule {
  type: ValidationType;         // Required: Type of validation
  value?: any;                 // Optional: Validation parameter
  message: string;             // Required: Error message
  severity: 'error' | 'warning' | 'info'; // Required: Issue severity
}

export enum ValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  PATTERN = 'pattern',
  UNIQUE = 'unique',
  FILE_EXISTS = 'file_exists',
  VALID_REFERENCE = 'valid_reference',
  CUSTOM = 'custom'
}

export interface WizardConfig {
  mode: 'interactive' | 'guided' | 'expert'; // Required: Wizard complexity
  sections: WizardSection[];     // Required: Wizard flow sections
  skipable?: string[];          // Optional: Fields user can skip
  conditional?: ConditionalRule[]; // Optional: Conditional field display
}

export interface WizardSection {
  id: string;                   // Required: Section identifier
  title: string;                // Required: Section display name
  description?: string;         // Optional: Section purpose
  fields: string[];             // Required: Fields in this section
  order: number;                // Required: Display order
}

export interface ConditionalRule {
  condition: string;            // Required: Condition expression
  showFields?: string[];        // Optional: Fields to show if true
  hideFields?: string[];        // Optional: Fields to hide if true
}

export interface ValidationConfig {
  preValidation?: ValidationRule[]; // Optional: Before creation/modification
  postValidation?: ValidationRule[]; // Optional: After creation/modification
  crossReference?: CrossReferenceRule[]; // Optional: Inter-resource validation
}

export interface CrossReferenceRule {
  field: string;                // Required: Field to validate
  referenceType: ResourceType;  // Required: Referenced resource type
  referenceField?: string;      // Optional: Specific field in referenced resource
  required: boolean;            // Required: Whether reference must exist
}

export interface Example {
  name: string;                 // Required: Example name
  description: string;          // Required: What this example shows
  content: any;                // Required: Example content
  useCase: string;             // Required: When to use this example
}
