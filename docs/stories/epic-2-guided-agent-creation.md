# Epic 2: Guided Agent Creation

**Epic Owner:** Product Manager  
**Implementation Phase:** Phase 1 (4 weeks)  
**Priority:** High  
**Dependencies:** Epic 1 (Agent Discovery)

## Epic Description
Provide guided, wizard-based agent creation that enables non-technical users to build custom agents through natural language interaction and smart recommendations.

## Epic Goals
- Democratize agent creation for non-technical users
- Reduce agent creation time from hours to minutes
- Ensure created agents follow best practices and conventions
- Provide template-based quick setup options

---

## User Story 2.1: Create Agent Through Wizard

**As a** non-technical user  
**I want to** create a custom agent through guided questions  
**So that** I can have an agent tailored to my specific role  

### Acceptance Criteria
- [ ] Multi-step wizard with progress indication and conflict detection
- [ ] Smart defaults based on role/industry patterns
- [ ] Natural language input for responsibilities and tasks
- [ ] Automatic icon and personality suggestions
- [ ] Base agent recommendation based on requirements
- [ ] Real-time validation with helpful error messages and uniqueness checking
- [ ] Preview generated agent before creation
- [ ] Rollback option if creation fails
- [ ] Layer-aware name conflict prevention across core/org/custom layers

### CLI Commands Implemented
```bash
lcagents agent create                           # Guided wizard with uniqueness validation using AgentDefinition interface
lcagents agent validate <agent-name>           # Validate agent configuration and check conflicts via LayerManager
```

### Runtime CLI Execution Sequences

#### Agent Creation Flow (Full Validation Pipeline)
```bash
# Pre-creation validation and preparation
lcagents agent create
  ├── Step 1: LayerManager.analyzeExistingAgents() → AgentLoader.loadAllAgents()
  ├── Step 2: CoreSystemManager.getActiveCoreSystem() → ResourceResolver.validateTemplates()
  ├── Step 3: AgentLoader.suggestBaseAgents() → LayerManager.checkConflicts()
  ├── Step 4: ResourceResolver.validateDependencies() → LayerManager.suggestPlacement()
  ├── Step 5: AgentLoader.previewAgent() → CoreSystemManager.validateCompatibility()
  └── Step 6: LayerManager.createAgent() → AgentLoader.validateAgent()

# Post-creation verification pipeline
lcagents agent validate <new-agent-name>
  ├── Internal: AgentLoader.loadAgent() → ResourceResolver.validateAllDependencies()
  ├── Internal: LayerManager.checkLayerIntegrity() → CoreSystemManager.validateCompatibility()
  ├── Auto-trigger: lcagents agent info <agent-name> (if validation passes)
  └── Auto-suggest: lcagents agent modify <agent-name> (if issues found)
```

#### Template-Based Creation Flow
```bash
# Template instantiation with conflict resolution
lcagents agent from-template <template>
  ├── Pre-check: ResourceResolver.resolveTemplate() → LayerManager.analyzeConflicts()
  ├── Internal: AgentLoader.loadTemplate() → LayerManager.suggestSpecialization()
  ├── Internal: CoreSystemManager.validateTemplateCompatibility() → ResourceResolver.adaptDependencies()
  └── Post-create: lcagents agent validate <new-agent> (automatic)
```

### Uniqueness Validation Flow
```
🚀 Agent Creation Wizard

Step 1/6: Basic Information
? What should your agent be called? (e.g., "Data Scientist"): PM

❌ Agent name 'PM' already exists in CORE layer!

💡 What would you like to do?
  1) Create a specialized version (e.g., "Compliance PM") ✅
  2) Modify the existing PM agent
  3) Override the existing PM agent (advanced)
> 1

? What makes this PM different?
> Focuses on security compliance and regulatory requirements

✅ Great! Creating "Security PM" - checking for conflicts...
✅ Name available across all layers (core, org, custom)
```

### Technical Implementation Details
- **Agent Structure**: Generate new agents using AgentDefinition TypeScript interface
- **YAML Generation**: Create agent files in .lcagents/custom/agents/ following BMAD-Core format from .lcagents/core/.bmad-core/
- **Layer Integration**: Place custom agents in .lcagents/custom/ layer via LayerManager
- **Intelligent Conflict Resolution**: Use AgentLoader.validateAgent() with LayerManager to detect conflicts across .lcagents/core/, .lcagents/org/, .lcagents/custom/
- **Base Agent Support**: Allow inheritance from core agents using existing structures from .lcagents/core/.{coreSystem}/agents/
- **Resource Dependencies**: Auto-generate dependencies arrays for tasks, templates, checklists from layered resource structure
- **Core System Compatibility**: Ensure compatibility with active core system via CoreSystemManager from .lcagents/core/.{coreSystem}/
- **Smart Override Detection**: Intelligently suggest when to create new vs. override existing agents based on layer analysis

### Definition of Done
- [ ] Multi-step wizard with progress tracking using AgentDefinition interface
- [ ] Natural language processing for requirements into YAML structure
- [ ] Smart defaults and suggestions system based on existing agent patterns
- [ ] Agent preview before creation using AgentLoader parsing
- [ ] Rollback capability implemented via file system operations
- [ ] Error handling with helpful messages using AgentValidationResult
- [ ] Integration with LayerManager for proper file placement

### Estimated Story Points: 13
### Sprint Assignment: Sprint 2-3

---

## User Story 2.2: Agent Template System

**As a** user with common needs  
**I want to** create agents from pre-built templates  
**So that** I can quickly set up proven agent configurations  

### Acceptance Criteria
- [ ] Curated template library by role/industry
- [ ] Template preview with capabilities overview
- [ ] One-click agent creation from template
- [ ] Template customization options during creation
- [ ] Community template sharing capability
- [ ] Template versioning and updates

### CLI Commands Implemented
```bash
lcagents agent from-template <template>         # Create from pre-defined template with uniqueness checking
lcagents agent clone <existing>                 # Clone and customize existing agent with conflict resolution
lcagents template validate <template-name>      # Validate template availability across layers
```

### Runtime CLI Execution Sequences

#### Template Validation and Instantiation Flow
```bash
# Template availability and conflict analysis
lcagents template validate <template-name>
  ├── Internal: ResourceResolver.resolveTemplate() → LayerManager.analyzeTemplateConflicts()
  ├── Internal: CoreSystemManager.validateTemplateCompatibility() → AgentLoader.analyzeBaseDependencies()
  └── Output: Template availability status and suggested customizations

# Template-based creation with intelligent specialization
lcagents agent from-template <template>
  ├── Pre-req: template validate <template> (automatic if not run)
  ├── Internal: AgentLoader.loadTemplate() → LayerManager.suggestSpecialization()
  ├── Internal: ResourceResolver.adaptTemplateDependencies() → CoreSystemManager.ensureCompatibility()
  ├── Wizard: Context-aware customization prompts
  ├── Internal: AgentLoader.generateFromTemplate() → LayerManager.placeInCustomLayer()
  └── Post-create: lcagents agent validate <new-agent> (automatic)

# Agent cloning with enhancement detection
lcagents agent clone <existing>
  ├── Pre-analysis: lcagents agent info <existing> (for dependency map)
  ├── Internal: AgentLoader.loadAgent() → LayerManager.analyzeEnhancementOpportunities()
  ├── Internal: ResourceResolver.cloneDependencies() → CoreSystemManager.adaptToCurrentSystem()
  ├── Wizard: Enhancement vs. specialization prompts
  └── Post-clone: lcagents agent validate <cloned-agent> (automatic)
```

### Template Conflict Resolution
```
📦 Template Selection:

Available Templates:
├── 🏢 Business Analyst [CORE] - Requirements gathering, process analysis
├── 📊 Data Scientist [CORE] - ML models, data analysis, insights  
├── 🔒 Security Engineer [ORG] - Security reviews, vulnerability assessment
└── 📊 Custom Data Analyst [CUSTOM] - Company-specific data workflows

? Which template would you like to use?
> Custom Data Analyst

? Agent name for this instance:
> Data Analyst

⚠️  Agent 'Data Analyst' would conflict with template base name!

💡 Suggested names:
  1) Marketing Data Analyst ✅
  2) Sales Data Analyst
  3) Financial Data Analyst
> 1

✅ Creating "Marketing Data Analyst" from Custom Data Analyst template...
✅ No conflicts found across all layers
```

### Technical Implementation Details
- **Template System**: Use ResourceResolver to access templates from layered template system (.lcagents/core/.{coreSystem}/templates/, .lcagents/org/templates/, .lcagents/custom/templates/)
- **Agent Cloning**: Leverage AgentLoader.loadAgent() to retrieve source agent from appropriate layer, modify, and save to .lcagents/custom/agents/
- **Layer Placement**: Create new agents in .lcagents/custom/agents/ via LayerManager with intelligent override detection
- **Template Instantiation**: Parse template YAML and merge with user customizations while respecting layer hierarchy
- **Dependency Management**: Copy and adapt resource dependencies during cloning, resolving from .lcagents/{layer}/{resourceType}/
- **Validation Pipeline**: Use existing AgentLoader validation combined with LayerManager layer-aware resolution before creating final agent
- **Intelligent Naming**: Generate contextually appropriate names with layer-aware conflict detection and override suggestions

### Definition of Done
- [ ] Template library with categorization using ResourceResolver.listResources('templates')
- [ ] Template preview system using ResourceResolver.resolveTemplate()
- [ ] One-click creation from templates with AgentDefinition generation
- [ ] Template customization interface during creation
- [ ] Version management for templates using LayerManager
- [ ] Agent cloning functionality via AgentLoader integration

### Estimated Story Points: 8
### Sprint Assignment: Sprint 3-4

---

## Epic Success Metrics
- **Time to First Agent**: New users create first agent < 10 minutes
- **Wizard Completion Rate**: Users complete creation wizard > 85%
- **Template Usage Rate**: Template-based creation > 60% of new agents
- **User Satisfaction**: Post-creation survey rating > 4.5/5

## Technical Implementation Notes
- Implement multi-step wizard engine with AgentDefinition interface branching logic
- Create natural language processing for user requirements into YAML structure
- Build template instantiation system using ResourceResolver patterns
- Design agent preview and validation system using AgentLoader
- Integrate with LayerManager for proper file placement in custom layer
- Leverage existing ResourceResolver for template and resource management

## Dependencies
- Wizard engine framework compatible with AgentDefinition interface
- LayerManager for file placement and layer management
- AgentLoader for validation and preview functionality
- ResourceResolver for template and dependency management
