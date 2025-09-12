# BMAD-Core Resource Metadata System

## Overview

The BMAD-Core Resource Metadata System provides comprehensive schema definitions, validation rules, and creation wizards for all resource types in the LCAgents framework. This system ensures consistency, reliability, and reduces maintenance overhead by providing structured metadata for:

- **Agents** - AI agent definitions with personas and commands
- **Checklists** - Quality assurance and validation checklists  
- **Templates** - YAML-driven document templates
- **Tasks** - Executable workflow definitions
- **Data** - Knowledge base and reference information
- **Workflows** - Multi-agent orchestration sequences
- **Utils** - Utility files and helper resources
- **Agent Teams** - Curated team configurations

## Architecture

```
src/core/
├── ResourceMetadata.ts           # Core interfaces and types
├── ResourceMetadataRegistry.ts   # Central registry and validation
├── MetadataGenerator.ts          # Installation-time metadata generation
└── metadata/
    ├── AgentMetadata.ts          # Agent schema definition
    ├── ChecklistMetadata.ts      # Checklist schema definition
    ├── TemplateMetadata.ts       # Template schema definition
    ├── TaskMetadata.ts           # Task schema definition
    ├── DataMetadata.ts           # Data schema definition
    ├── WorkflowMetadata.ts       # Workflow schema definition
    ├── UtilsMetadata.ts          # Utils schema definition
    └── AgentTeamMetadata.ts      # Agent team schema definition
```

## Key Features

### 1. **Schema-Driven Creation Wizards**
- Friendly, guided questions for resource creation
- Field validation and input type specification
- Conditional field display based on user selections
- Section-based organization for complex resources

### 2. **Comprehensive Validation**
- Required field enforcement
- Pattern matching and format validation
- Cross-reference validation between resources
- Custom validation rules per resource type

### 3. **Consistency Enforcement**
- Standardized naming conventions
- File structure requirements
- Field standardization across resource types
- Best practice recommendations

### 4. **IDE Integration Ready**
- TypeScript interfaces for editor support
- Field descriptions for tooltips and help
- Validation messages for error reporting
- Auto-completion support for field values

### 5. **Maintenance Optimization**
- Centralized schema definitions
- Automated metadata generation during installation
- Version tracking for schema evolution
- Resource analysis and usage statistics

## Usage

### Creation Wizards

```typescript
import { ResourceMetadataRegistry } from './core/ResourceMetadataRegistry';

// Get wizard configuration for a resource type
const wizardConfig = ResourceMetadataRegistry.getWizardConfig(ResourceType.AGENT);

// Use the wizard sections to guide user input
for (const section of wizardConfig.sections) {
  console.log(`\n${section.title}: ${section.description}`);
  for (const fieldName of section.fields) {
    const fieldSchema = ResourceMetadataRegistry.getFieldSchema(ResourceType.AGENT, fieldName);
    // Present field.wizard.question to user
    // Validate input using field.validation rules
  }
}
```

### Resource Validation

```typescript
import { ResourceMetadataRegistry } from './core/ResourceMetadataRegistry';

// Validate a resource against its schema
const validationResult = ResourceMetadataRegistry.validateResource(
  ResourceType.AGENT, 
  agentResource
);

if (!validationResult.valid) {
  console.error('Validation errors:', validationResult.errors);
  console.warn('Warnings:', validationResult.warnings);
}
```

### Field Schema Access

```typescript
import { ResourceMetadataRegistry } from './core/ResourceMetadataRegistry';

// Get schema for a specific field
const fieldSchema = ResourceMetadataRegistry.getFieldSchema(
  ResourceType.TEMPLATE, 
  'template.output.format'
);

console.log(fieldSchema.wizard.question); // Display to user
console.log(fieldSchema.validation);      // Apply validation rules
```

### Cross-Reference Discovery

```typescript
import { ResourceMetadataRegistry } from './core/ResourceMetadataRegistry';

// Find all resources that reference templates
const references = ResourceMetadataRegistry.getCrossReferences(ResourceType.TEMPLATE);
// Result: [{ sourceType: 'AGENT', sourceField: 'dependencies.templates', ... }]
```

## Metadata Generation

The metadata system automatically generates enhanced metadata during installation:

```bash
lcagents setup init
# Generates: .lcagents/metadata/
#   ├── agent-metadata.json
#   ├── checklist-metadata.json
#   ├── template-metadata.json
#   ├── task-metadata.json
#   ├── data-metadata.json
#   ├── workflow-metadata.json
#   ├── utils-metadata.json
#   ├── agent-team-metadata.json
#   └── index.json
```

Generated metadata includes:
- **Schema Definitions** - Field types, validation rules, wizard configurations
- **Resource Analysis** - Existing resource counts, patterns, and examples
- **Usage Statistics** - Field usage frequency and common patterns
- **Validation Rules** - Enhanced rules based on existing resource analysis
- **Field Examples** - Real examples extracted from existing resources

## Resource Type Schemas

### Agent Schema
- **Core Fields**: name, id, title, icon, whenToUse
- **Persona Definition**: role, style, identity, focus, core_principles
- **Capabilities**: commands, dependencies (data, tasks, templates)
- **Wizard Sections**: Basic Info → Purpose → Persona → Capabilities → Dependencies

### Template Schema
- **Template Info**: id, name, version
- **Output Config**: format, filename pattern, title pattern
- **Workflow Config**: execution mode, elicitation method
- **Content Structure**: sections with field definitions and validation

### Task Schema
- **Basic Info**: title, task type, user interaction requirements
- **Execution Config**: critical instructions, elicitation format
- **Process Definition**: step-by-step workflow instructions
- **Validation**: completion criteria and error handling

### Checklist Schema
- **Overview**: title, target audience, purpose
- **Usage Instructions**: how to use, LLM-specific guidance
- **Content**: organized sections of checklist items
- **Completion**: success criteria and escalation process

## Best Practices

### Schema Design
1. **Required vs Optional**: Mark fields as required only when absolutely necessary
2. **Validation Rules**: Use appropriate severity levels (error/warning/info)
3. **Wizard Questions**: Write clear, actionable questions with helpful context
4. **Field Dependencies**: Define relationships between fields clearly
5. **Cross-References**: Validate references to other resource types

### Creation Wizards
1. **Section Organization**: Group related fields into logical sections
2. **Progressive Disclosure**: Use conditional rules to show relevant fields
3. **User Guidance**: Provide help text and examples for complex fields
4. **Input Types**: Choose appropriate UI components for field types
5. **Validation Feedback**: Give immediate feedback on validation errors

### Maintenance
1. **Version Tracking**: Update schema versions when making breaking changes
2. **Backward Compatibility**: Maintain compatibility with existing resources
3. **Documentation**: Keep field descriptions current and helpful
4. **Testing**: Validate schemas with real resource creation workflows
5. **Analysis**: Review generated metadata for optimization opportunities

## Integration Points

### CLI Commands
- `lcagents agent create` - Uses AgentMetadata for guided creation
- `lcagents res create` - Uses appropriate metadata based on resource type
- `lcagents agent modify` - Uses metadata for validation during modification

### Internal Systems
- **AgentLoader** - Uses validation for agent loading
- **LayerManager** - Uses cross-references for dependency tracking
- **Creation Wizards** - Uses wizard configurations for user interaction

### External Tools
- **IDE Extensions** - Can consume metadata for autocomplete and validation
- **Documentation Generators** - Can use metadata for API documentation
- **Testing Frameworks** - Can use validation rules for automated testing

## Future Enhancements

1. **Dynamic Validation** - Runtime validation rule evaluation
2. **Custom Field Types** - Extensible field type system
3. **Metadata Versioning** - Schema migration and compatibility tracking
4. **AI-Assisted Creation** - Use metadata to train creation assistants
5. **Visual Wizards** - GUI-based creation tools using metadata definitions

---

*Generated during lcagents setup init - This metadata system ensures reliable, consistent resource creation and validation across the LCAgents framework.*
