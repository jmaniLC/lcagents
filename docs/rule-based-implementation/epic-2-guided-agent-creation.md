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
lcagents agent create                           # Guided wizard with rule-based validation using LCAgentsRuleEngine and AgentDefinition interface
lcagents agent validate <agent-name>           # Validate agent configuration through runtime rule engine via LayerManager
```

### Runtime CLI Execution Sequences

#### Agent Creation Flow (Rule-Validated Pipeline)
```bash
# Pre-creation validation with rule engine
lcagents agent create
  ├── Step 1: LCAgentsRuleEngine.validateOperation() → LayerManager.analyzeExistingAgents()
  ├── Step 2: LCAgentsRuleEngine.enforceLayerRules() → AgentLoader.loadAllAgents()
  ├── Step 3: RuntimeRuleEngine.validateNaming() → CoreSystemManager.getActiveCoreSystem()
  ├── Step 4: RuntimeRuleEngine.checkDependencies() → ResourceResolver.validateTemplates()
  ├── Step 5: LCAgentsRuleEngine.suggestAlternatives() → AgentLoader.suggestBaseAgents()
  └── Step 6: RuntimeRuleEngine.finalValidation() → LayerManager.createAgent()

# Post-creation verification with rule engine
lcagents agent validate <new-agent-name>
  ├── Internal: LCAgentsRuleEngine.validateOperation() → AgentLoader.loadAgent()
  ├── Internal: RuntimeRuleEngine.validateAllRules() → ResourceResolver.validateAllDependencies()
  └── Auto-suggest: Rule-based improvement suggestions from compiled rules
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

🔍 Checking availability...
❌ Agent name 'PM' already exists in CORE layer!

💡 Suggested alternatives:
  1) Create a specialized version (e.g., "Compliance PM") ✅
  2) Security PM (detected security focus in your project)
  3) Finance PM (detected financial domain context)
> 1

? What makes this PM different?
> Focuses on security compliance and regulatory requirements

🔍 Validating "Compliance PM"...
✅ Name is available across all layers
✅ Ready to create your agent!
```

### Technical Implementation Details
- **Rule Engine Integration**: All agent creation operations validated through `.lcagents/runtime/rules/engine/` with comprehensive rule execution
- **Agent Structure**: Generate new agents using AgentDefinition TypeScript interface with rule-based validation
- **YAML Generation**: Create agent files in .lcagents/custom/agents/ following BMAD-Core format with runtime rule validation
- **Layer Integration**: Place custom agents in .lcagents/custom/ layer via LayerManager with rule-based layer policy enforcement
- **Intelligent Conflict Resolution**: Use AgentLoader.validateAgent() with LayerManager and **LCAgentsRuleEngine** to detect conflicts and enforce naming rules across all layers
- **Base Agent Support**: Allow inheritance from core agents with rule-based compatibility validation via runtime rule engine
- **Resource Dependencies**: Auto-generate dependencies with rule-based dependency validation from `.lcagents/runtime/rules/compiled/`
- **Core System Compatibility**: Ensure compatibility via CoreSystemManager with rule-based core system validation
- **Smart Override Detection**: Use **hybrid rule engine** to intelligently suggest creation vs. override based on policy rules and layer analysis
- **Runtime Rule Validation**: All operations pass through `.lcagents/runtime/rules/engine/rule-engine.ts` for policy enforcement and conflict prevention

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
lcagents agent from-template <template>         # Create from pre-defined template with rule-based validation
lcagents agent clone <existing>                 # Clone and customize existing agent with rule-based conflict resolution
lcagents template validate <template-name>      # Validate template through runtime rule engine across layers
```

### Runtime CLI Execution Sequences

#### Template Validation and Instantiation Flow (Rule-Validated)
```bash
# Template availability and rule-based conflict analysis
lcagents template validate <template-name>
  ├── Internal: LCAgentsRuleEngine.validateOperation() → ResourceResolver.resolveTemplate()
  ├── Internal: RuntimeRuleEngine.enforceTemplateRules() → LayerManager.analyzeTemplateConflicts()
  └── Output: Rule-validated template availability and rule-based customization suggestions

# Template-based creation with rule-guided specialization
lcagents agent from-template <template>
  ├── Pre-req: RuntimeRuleEngine.validateTemplate() (automatic rule validation)
  ├── Internal: LCAgentsRuleEngine.suggestAlternatives() → AgentLoader.loadTemplate()
  ├── Internal: RuntimeRuleEngine.enforceNamingRules() → ResourceResolver.adaptTemplateDependencies()
  └── Post-create: LCAgentsRuleEngine.validateOperation() → Complete rule validation

# Agent cloning with rule-based enhancement detection
lcagents agent clone <existing>
  ├── Pre-analysis: RuntimeRuleEngine.analyzeCloneRules() → lcagents agent info <existing>
  ├── Internal: LCAgentsRuleEngine.enforceLayerRules() → AgentLoader.loadAgent()
  └── Post-clone: LCAgentsRuleEngine.validateOperation() → Complete rule validation
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

🔍 Checking availability...
⚠️  Agent 'Data Analyst' would conflict with template base name!

💡 Suggested alternatives:
  1) Marketing Data Analyst (context-aware suggestion) ✅
  2) Financial Data Analyst (domain-specific suggestion)
  3) Operations Data Analyst (department-specific suggestion)
> 1

🔍 Validating "Marketing Data Analyst"...
✅ Name is available across all layers
✅ Creating agent from template...
✅ "Marketing Data Analyst" created successfully!
```

### Technical Implementation Details
- **Rule Engine Integration**: All template operations validated through `.lcagents/runtime/rules/engine/` with policy enforcement
- **Template System**: Use ResourceResolver with **LCAgentsRuleEngine** validation to access templates from layered template system
- **Agent Cloning**: Leverage AgentLoader.loadAgent() with **runtime rule validation** to retrieve source agent, modify with rule compliance, and save to .lcagents/custom/agents/
- **Layer Placement**: Create new agents in .lcagents/custom/agents/ via LayerManager with **rule-based layer policy enforcement**
- **Template Instantiation**: Parse template YAML and merge with user customizations using **LCAgentsRuleEngine** for validation while respecting layer hierarchy and rules
- **Dependency Management**: Copy and adapt resource dependencies with **runtime rule validation** during cloning, resolving from .lcagents/{layer}/{resourceType}/
- **Validation Pipeline**: Use existing AgentLoader validation combined with **LCAgentsRuleEngine** and LayerManager for comprehensive rule-based validation before creating final agent
- **Intelligent Naming**: Generate contextually appropriate names using **rule-based suggestions** from compiled rules with layer-aware conflict detection and policy-compliant override suggestions
- **Policy Compliance**: All template operations validated against policies from .lcagents/org/policies/ and .lcagents/custom/policies/ via runtime rule engine

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
