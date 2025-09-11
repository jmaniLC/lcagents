# Epic 8: Hybrid Rule Engine Implementation & Migration

**TODO**

**Epic Owner:** Architect  
**Implementation Phase:** Phase 8 (6 weeks)  
**Priority:** High  
**Dependencies:** Epic 1-7 (All existing functionality must be preserved)

## Epic Description
Implement a domain-specific hybrid rule engine to manage complex business rules for agent and resource operations, migrating existing validation logic to declarative rule definitions while maintaining backward compatibility and improving maintainability.

## Epic Goals
- Implement embedded domain-specific rule engine for LCAgents
- Migrate existing business logic to declarative rule definitions
- Maintain 100% backward compatibility with existing functionality
- Improve maintainability through loose coupling of business rules
- Establish comprehensive testing framework for all rule scenarios
- Enable easy rule modification without code changes

---

## User Story 8.1: Rule Engine Core Infrastructure

**As a** developer maintaining LCAgents business logic  
**I want to** have a centralized rule engine that manages all validation and policy decisions  
**So that** business rules are maintainable, testable, and separate from implementation logic  

### Acceptance Criteria
- [ ] Rule engine core infrastructure with TypeScript interfaces
- [ ] YAML-based rule definition system
- [ ] Rule loading and parsing from .bmad-core/rules/ directory
- [ ] Rule execution engine with context-aware evaluation
- [ ] Validation result consolidation and reporting
- [ ] Integration interfaces for existing AgentLoader, LayerManager, ResourceResolver
- [ ] Comprehensive error handling and logging
- [ ] Performance benchmarks showing no degradation vs current implementation

### CLI Commands Implemented
```bash
lcagents rules validate                         # Validate all rule definitions for syntax and completeness
lcagents rules list [category]                  # List all rules by category with descriptions
lcagents rules test <rule-id> [context-file]    # Test specific rule with provided or sample context
lcagents rules reload                           # Reload rules from disk (development mode)
```

### Technical Implementation Details
```typescript
// Core Rule Engine Architecture
interface LCAgentsRuleEngine {
  validateOperation(operation: Operation): Promise<ValidationResult>;
  enforceLayerRules(operation: LayerOperation): Promise<EnforcementResult>;
  suggestAlternatives(conflict: ConflictContext): Promise<Alternative[]>;
  loadRules(rulePath: string): Promise<void>;
  reloadRules(): Promise<void>;
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  version: string;
  condition: RuleCondition;
  action: RuleAction;
  severity: 'error' | 'warning' | 'suggestion';
  enabled: boolean;
  metadata: RuleMetadata;
}

enum RuleCategory {
  NAMING = 'naming',
  LAYER_MANAGEMENT = 'layer_management',
  DEPENDENCY = 'dependency', 
  CREATION_POLICY = 'creation_policy',
  RESOURCE_VALIDATION = 'resource_validation',
  WORKFLOW_INTEGRITY = 'workflow_integrity'
}

interface RuleContext {
  operation: string;
  targetLayer: LayerType;
  existingAgents: ParsedAgent[];
  existingResources: ResourceMap;
  userInput: any;
  currentCore: CoreSystem;
  metadata: ContextMetadata;
}

interface ValidationResult {
  success: boolean;
  errors: RuleViolation[];
  warnings: RuleWarning[];
  suggestions: RuleSuggestion[];
  appliedRules: string[];
  executionTime: number;
}
```

### Architecture Design

**Core Principle**: `.lcagents/core` is immutable and contains NO rules. All rules and policies are managed in the appropriate layers following Node.js best practices.

#### Folder Structure for Rules and Policies
```
.lcagents/
├── core/                           # 🔒 IMMUTABLE (no rules here)
│   └── {core-system}/              # External agent systems only
├── org/                            # 🏢 ORGANIZATION LAYER
│   ├── policies/                   # Business policies (declarative)
│   └── rules/                      # Organization validation rules  
├── custom/                         # 👥 POD LAYER
│   ├── policies/                   # Pod business policies
│   └── rules/                      # Pod validation rules
└── runtime/                        # ⚡ RUNTIME LAYER (Node.js best practice)
    ├── config/                     # Runtime configuration
    ├── rules/                      # Rule execution engine
    │   ├── engine/                 # Core rule processing
    │   ├── compiled/               # Compiled rule definitions  
    │   ├── cache/                  # Rule execution cache
    │   └── logs/                   # Rule execution logs
    ├── cache/                      # Performance cache
    ├── state/                      # Runtime state
    ├── logs/                       # Audit trails
    └── temp/                       # Temporary files
```

### Rule Definition Structure
```yaml
# .lcagents/runtime/rules/engine/rule-schema.yaml
rule_schema:
  version: "1.0"
  rule:
    required: [id, name, category, condition, action]
    properties:
      id: {type: string, pattern: "^[a-z0-9-]+$"}
      name: {type: string, maxLength: 100}
      description: {type: string, maxLength: 500}
      category: {enum: [naming, layer_management, dependency, creation_policy, resource_validation, workflow_integrity]}
      version: {type: string, pattern: "^\\d+\\.\\d+\\.\\d+$"}
      condition: 
        type: object
        required: [expression]
        properties:
          expression: {type: string}
          parameters: {type: object}
      action:
        type: object
        required: [type, result]
        properties:
          type: {enum: [validate, suggest, enforce, transform]}
          result: {type: object}
      severity: {enum: [error, warning, suggestion]}
      enabled: {type: boolean, default: true}
      metadata:
        type: object
        properties:
          tags: {type: array, items: {type: string}}
          author: {type: string}
          created: {type: string, format: date-time}
          modified: {type: string, format: date-time}
```

### Definition of Done
- [ ] Rule engine core classes implemented in `.lcagents/runtime/rules/engine/`
- [ ] Policy → Rule compilation system in runtime layer
- [ ] Rule loading from `.lcagents/org/` and `.lcagents/custom/` layers
- [ ] Rule execution engine with context evaluation in runtime
- [ ] Integration points with existing AgentLoader, LayerManager, ResourceResolver
- [ ] CLI commands for rule management and testing
- [ ] Performance benchmarks showing <= 10ms overhead per operation
- [ ] 100% test coverage for rule engine core
- [ ] Documentation for rule definition format and engine usage
- [ ] Runtime caching system in `.lcagents/runtime/cache/`
- [ ] Audit logging in `.lcagents/runtime/logs/`

### Runtime Engine Implementation
```typescript
// .lcagents/runtime/rules/engine/rule-engine.ts
class LCAgentsRuleEngine {
  private readonly CONFIG_PATH = '.lcagents/runtime/config/';
  private readonly RULES_PATH = '.lcagents/runtime/rules/';
  private readonly CACHE_PATH = '.lcagents/runtime/cache/';
  
  async initialize(): Promise<void> {
    // 1. Load runtime configuration
    await this.loadRuntimeConfig();
    
    // 2. Compile rules from all layers (custom → org → policies)
    await this.compileRules();
    
    // 3. Build rule execution cache
    await this.buildRuleCache();
    
    // 4. Initialize audit logging
    await this.initializeLogging();
  }
  
  async compileRules(): Promise<void> {
    const compiledRules = {
      custom: await this.loadLayerRules('.lcagents/custom/rules/'),
      org: await this.loadLayerRules('.lcagents/org/rules/'),
      policies: await this.compilePoliciesAsRules()
    };
    
    // Merge with precedence: custom > org > policies
    const mergedRules = this.mergeRules(compiledRules);
    
    // Cache compiled rules for performance
    await this.cacheCompiledRules(mergedRules);
  }
}
```

### Estimated Story Points: 21
### Sprint Assignment: Sprint 1-3

---

## User Story 8.2: Naming & Uniqueness Rule Migration

**As a** user creating agents and resources  
**I want to** have consistent naming validation across all operations  
**So that** I get predictable behavior and helpful suggestions for naming conflicts  

### Acceptance Criteria
- [ ] All existing naming validation logic migrated to declarative rules
- [ ] Agent name uniqueness rules across all layers (core/org/custom)
- [ ] Resource name uniqueness within type and layer
- [ ] Command name uniqueness across all agents
- [ ] Template instantiation conflict detection
- [ ] Alternative name suggestion algorithms
- [ ] Specialized name generation for domain-specific agents
- [ ] Backward compatibility with all existing naming behavior

### Rule Definitions
```yaml
# .lcagents/custom/rules/naming-rules.yaml (Pod-specific rules)
version: "1.0"
rules:
  - id: "unique-agent-id-global"
    name: "Agent IDs must be globally unique across all layers"
    description: "Prevents agent ID conflicts between core, org, and custom layers"
    category: "naming"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_creation' && existsAgentId(context.agentId)"
      parameters:
        checkLayers: ["core", "org", "custom"]
    action:
      type: "validate"
      result:
        success: false
        error: "Agent ID '${context.agentId}' already exists in ${conflictLayer} layer"
        suggestions: "generateAlternativeIds(context.agentId, context.domain)"
    severity: "error"
    enabled: true
    metadata:
      tags: ["uniqueness", "agent-creation"]
      author: "architect"
      created: "2025-09-11T00:00:00Z"

  - id: "suggest-specialized-agent-names"
    name: "Suggest specialized names for domain-specific agents"
    description: "When creating agents similar to existing core agents, suggest specialization"
    category: "creation_policy"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_creation' && hasSimilarCoreAgent(context.capabilities)"
      parameters:
        similarityThreshold: 0.8
        coreAgentsOnly: true
    action:
      type: "suggest"
      result:
        suggestions: "generateSpecializedNames(context.baseAgent, context.domain, context.focus)"
        message: "Consider creating a specialized version instead of overriding core agent"
    severity: "suggestion"
    enabled: true

  - id: "unique-command-names"
    name: "Command names must be unique across all agents"
    description: "Prevents command conflicts that could cause ambiguous CLI behavior"
    category: "naming"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_creation' && hasConflictingCommands(context.commands)"
    action:
      type: "validate"
      result:
        success: false
        error: "Command '${conflictingCommand}' already exists in agent '${conflictingAgent}'"
        suggestions: "generateAlternativeCommandNames(context.commands)"
    severity: "error"
    enabled: true

  - id: "unique-resource-names"
    name: "Resource names must be unique within type and layer"
    description: "Ensures resource uniqueness for proper resolution"
    category: "naming"
    version: "1.0.0"
    condition:
      expression: "operation == 'resource_creation' && existsResource(context.resourceName, context.resourceType, context.layer)"
    action:
      type: "validate"
      result:
        success: false
        error: "Resource '${context.resourceName}' already exists in ${context.layer} layer"
        suggestions: "generateAlternativeResourceNames(context.resourceName, context.resourceType)"
    severity: "error"
    enabled: true
```

### Migration Test Coverage
```typescript
// Test all existing naming scenarios
describe('Naming Rules Migration', () => {
  describe('Agent Naming', () => {
    it('should prevent duplicate agent IDs across layers', async () => {
      // Test existing core agent ID conflict
      // Test existing org agent ID conflict  
      // Test existing custom agent ID conflict
    });
    
    it('should suggest specialized names for similar agents', async () => {
      // Test PM -> Security PM suggestion
      // Test Dev -> Frontend Dev suggestion
      // Test QA -> API QA suggestion
    });
    
    it('should maintain backward compatibility with existing agents', async () => {
      // Test all existing agents still load properly
      // Test all existing agent commands still work
    });
  });
  
  describe('Command Naming', () => {
    it('should detect command conflicts across agents', async () => {
      // Test command name conflicts between agents
      // Test command alias conflicts
    });
  });
  
  describe('Resource Naming', () => {
    it('should enforce resource uniqueness within type/layer', async () => {
      // Test checklist name conflicts
      // Test template name conflicts
      // Test task name conflicts
      // Test workflow name conflicts
    });
  });
});
```

### Definition of Done
- [ ] All naming validation migrated to rule definitions
- [ ] 100% test coverage for all existing naming scenarios
- [ ] Performance tests showing no regression
- [ ] Backward compatibility verified for all existing agents/resources
- [ ] Rule definitions validated against schema
- [ ] CLI commands for testing naming rules

### Estimated Story Points: 13
### Sprint Assignment: Sprint 3-4

---

## User Story 8.3: Layer Management Rule Migration

**As a** system administrator managing layer integrity  
**I want to** have enforceable rules for layer operations  
**So that** core systems remain protected while enabling safe customization  

### Acceptance Criteria
- [ ] Core layer protection rules (immutable, read-only access)
- [ ] Override hierarchy enforcement (custom → org → core)
- [ ] Safe modification rules preventing core system corruption
- [ ] Layer placement decision rules for new agents/resources
- [ ] Enhancement vs replacement decision logic
- [ ] Backup and rollback requirement enforcement
- [ ] Cross-layer dependency validation
- [ ] All existing layer behavior preserved exactly

### Rule Definitions
```yaml
# .lcagents/core/.bmad-core/rules/layer-rules.yaml
version: "1.0"
rules:
  - id: "protect-core-layer-immutable"
    name: "Core layer is immutable"
    description: "Prevents any modification operations on core layer files"
    category: "layer_management"
    version: "1.0.0"
    condition:
      expression: "context.targetLayer == 'core' && operation in ['create', 'update', 'delete']"
    action:
      type: "enforce"
      result:
        success: false
        error: "Cannot modify core layer directly. Core layer is read-only."
        suggestion: "Create override in custom layer instead"
        alternative_action: "createCustomOverride(context.targetPath)"
    severity: "error"
    enabled: true

  - id: "enforce-override-hierarchy"
    name: "Enforce layer override hierarchy"
    description: "Ensures proper layer resolution order: custom → org → core"
    category: "layer_management"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_resolution' && hasMultipleLayerVersions(context.agentId)"
    action:
      type: "enforce"
      result:
        resolution_order: ["custom", "org", "core"]
        selected_layer: "getHighestPriorityLayer(context.agentId)"
        message: "Using ${selected_layer} layer version of ${context.agentId}"
    severity: "suggestion"
    enabled: true

  - id: "suggest-layer-placement"
    name: "Suggest appropriate layer for new resources"
    description: "Recommends optimal layer based on resource scope and usage"
    category: "creation_policy"
    version: "1.0.0"
    condition:
      expression: "operation == 'resource_creation' && !context.explicitLayer"
    action:
      type: "suggest"
      result:
        suggested_layer: "determineBestLayer(context.resourceType, context.scope, context.usage)"
        reasoning: "explainLayerChoice(context.resourceType, context.scope)"
        alternatives: "listAlternativeLayers(context.resourceType)"
    severity: "suggestion"
    enabled: true

  - id: "require-backup-before-modification"
    name: "Require backup before modifying existing agents"
    description: "Ensures rollback capability for all modification operations"
    category: "layer_management"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_modification' && !hasRecentBackup(context.agentId)"
    action:
      type: "enforce"
      result:
        success: false
        error: "Backup required before modification"
        required_action: "createBackup(context.agentId)"
        auto_backup: true
    severity: "error"
    enabled: true

  - id: "validate-cross-layer-dependencies"
    name: "Validate dependencies across layers"
    description: "Ensures all dependencies are resolvable in layer hierarchy"
    category: "dependency"
    version: "1.0.0"
    condition:
      expression: "operation in ['agent_creation', 'resource_creation'] && hasDependencies(context)"
    action:
      type: "validate"
      result:
        validation: "validateAllDependencies(context.dependencies, context.targetLayer)"
        missing_dependencies: "findMissingDependencies(context.dependencies)"
        suggestions: "suggestDependencyResolution(missing_dependencies)"
    severity: "error"
    enabled: true
```

### Migration Test Coverage
```typescript
describe('Layer Management Rules Migration', () => {
  describe('Core Layer Protection', () => {
    it('should prevent direct core layer modifications', async () => {
      // Test prevention of core agent modification
      // Test prevention of core resource deletion
      // Test prevention of core file creation
    });
    
    it('should suggest custom layer alternatives', async () => {
      // Test override suggestion for core agent modification
      // Test custom layer placement for new resources
    });
  });
  
  describe('Override Hierarchy', () => {
    it('should resolve agents in correct layer order', async () => {
      // Test custom overrides org
      // Test org overrides core
      // Test proper fallback to lower layers
    });
    
    it('should maintain existing agent resolution behavior', async () => {
      // Test all existing multi-layer scenarios
      // Verify no change in agent loading behavior
    });
  });
  
  describe('Layer Placement', () => {
    it('should suggest appropriate layers for resources', async () => {
      // Test team-specific resource → org layer
      // Test pod-specific resource → custom layer
      // Test general resource → appropriate layer
    });
  });
  
  describe('Backup Requirements', () => {
    it('should enforce backup before modifications', async () => {
      // Test backup requirement for agent modification
      // Test auto-backup functionality
      // Test backup skip for recent backups
    });
  });
});
```

### Definition of Done
- [ ] All layer management logic migrated to rules
- [ ] 100% test coverage for layer scenarios
- [ ] Core layer protection verified
- [ ] Override hierarchy behavior unchanged
- [ ] Backup/rollback functionality preserved
- [ ] Cross-layer dependency validation working
- [ ] Performance benchmarks showing no regression

### Estimated Story Points: 18
### Sprint Assignment: Sprint 4-6

---

## User Story 8.4: Dependency & Creation Policy Rule Migration

**As a** user creating agents with complex dependencies  
**I want to** have intelligent validation and suggestions for dependencies  
**So that** my agents work correctly and I understand their requirements  

### Acceptance Criteria
- [ ] Dependency chain validation rules
- [ ] Resource reference existence validation
- [ ] Core system compatibility checking
- [ ] Cross-agent workflow dependency validation
- [ ] Creation vs enhancement decision rules
- [ ] Template inheritance and customization rules
- [ ] Circular dependency detection
- [ ] Missing dependency resolution suggestions

### Rule Definitions
```yaml
# .lcagents/core/.bmad-core/rules/dependency-rules.yaml
version: "1.0"
rules:
  - id: "validate-dependency-chain"
    name: "Validate complete dependency chain"
    description: "Ensures all dependencies in chain are resolvable and accessible"
    category: "dependency"
    version: "1.0.0"
    condition:
      expression: "operation in ['agent_creation', 'agent_modification'] && hasDependencies(context)"
    action:
      type: "validate"
      result:
        chain_valid: "validateDependencyChain(context.dependencies, context.targetLayer)"
        missing_deps: "findMissingDependencies(context.dependencies)"
        circular_deps: "detectCircularDependencies(context.agentId, context.dependencies)"
        suggestions: "suggestDependencyResolution(missing_deps)"
    severity: "error"
    enabled: true

  - id: "validate-resource-references"
    name: "Validate resource references exist"
    description: "Ensures all referenced resources (templates, checklists, etc.) exist"
    category: "resource_validation"
    version: "1.0.0"
    condition:
      expression: "hasResourceReferences(context)"
    action:
      type: "validate"
      result:
        references_valid: "validateAllResourceReferences(context.resourceRefs, context.targetLayer)"
        missing_resources: "findMissingResources(context.resourceRefs)"
        suggestions: "suggestResourceCreation(missing_resources)"
    severity: "error"
    enabled: true

  - id: "check-core-system-compatibility"
    name: "Validate core system compatibility"
    description: "Ensures agent/resource is compatible with active core system"
    category: "dependency"
    version: "1.0.0"
    condition:
      expression: "operation in ['agent_creation', 'resource_creation']"
    action:
      type: "validate"
      result:
        compatible: "checkCoreSystemCompatibility(context, getCurrentCoreSystem())"
        incompatibilities: "findIncompatibilities(context, getCurrentCoreSystem())"
        adaptations: "suggestCompatibilityAdaptations(incompatibilities)"
    severity: "warning"
    enabled: true

  - id: "detect-circular-dependencies"
    name: "Detect circular dependency chains"
    description: "Prevents infinite loops in agent/resource dependency chains"
    category: "dependency"
    version: "1.0.0"
    condition:
      expression: "hasDependencies(context)"
    action:
      type: "validate"
      result:
        has_circular: "detectCircularDependencies(context.agentId, context.dependencies)"
        circular_path: "getCircularPath(context.agentId, context.dependencies)"
        resolution: "suggestCircularResolution(circular_path)"
    severity: "error"
    enabled: true

# .lcagents/core/.bmad-core/rules/creation-policy-rules.yaml
version: "1.0"
rules:
  - id: "creation-vs-enhancement-decision"
    name: "Decide between creating new vs enhancing existing"
    description: "Intelligent decision on when to create new vs enhance existing agent"
    category: "creation_policy"
    version: "1.0.0"
    condition:
      expression: "operation == 'agent_creation' && hasSimilarAgent(context.capabilities)"
    action:
      type: "suggest"
      result:
        recommendation: "analyzeCreationVsEnhancement(context.capabilities, getSimilarAgents())"
        similar_agents: "findSimilarAgents(context.capabilities)"
        enhancement_option: "suggestEnhancement(similar_agents[0], context.capabilities)"
        creation_option: "suggestSpecialization(context.capabilities, context.domain)"
    severity: "suggestion"
    enabled: true

  - id: "template-inheritance-validation"
    name: "Validate template inheritance rules"
    description: "Ensures proper template inheritance and customization"
    category: "creation_policy"
    version: "1.0.0"
    condition:
      expression: "operation == 'template_instantiation'"
    action:
      type: "validate"
      result:
        inheritance_valid: "validateTemplateInheritance(context.template, context.customizations)"
        conflicts: "findInheritanceConflicts(context.template, context.customizations)"
        suggestions: "suggestInheritanceResolution(conflicts)"
    severity: "error"
    enabled: true
```

### Migration Test Coverage
```typescript
describe('Dependency & Creation Policy Rules Migration', () => {
  describe('Dependency Validation', () => {
    it('should validate complete dependency chains', async () => {
      // Test valid dependency chain
      // Test missing dependency detection
      // Test cross-layer dependency resolution
    });
    
    it('should detect circular dependencies', async () => {
      // Test direct circular dependency (A → B → A)
      // Test indirect circular dependency (A → B → C → A)
      // Test self-referential dependency
    });
    
    it('should validate resource references', async () => {
      // Test existing resource references
      // Test missing resource detection
      // Test cross-layer resource references
    });
  });
  
  describe('Creation Policy', () => {
    it('should suggest creation vs enhancement correctly', async () => {
      // Test similar agent enhancement suggestion
      // Test new agent creation recommendation
      // Test specialization vs generic creation
    });
    
    it('should validate template inheritance', async () => {
      // Test valid template inheritance
      // Test inheritance conflicts
      // Test customization validation
    });
  });
  
  describe('Core System Compatibility', () => {
    it('should check compatibility with active core system', async () => {
      // Test bmad-core compatibility
      // Test multiple core system compatibility
      // Test incompatibility detection and suggestions
    });
  });
});
```

### Definition of Done
- [ ] All dependency validation logic migrated
- [ ] Creation policy rules implemented
- [ ] Circular dependency detection working
- [ ] Resource reference validation complete
- [ ] Core system compatibility checks working
- [ ] 100% test coverage for all scenarios
- [ ] Performance benchmarks acceptable

### Estimated Story Points: 16
### Sprint Assignment: Sprint 5-6

---

## User Story 8.5: Comprehensive Testing & Validation Framework

**As a** developer maintaining the rule engine  
**I want to** have comprehensive testing for all rule scenarios  
**So that** I can ensure rules work correctly and catch regressions early  

### Acceptance Criteria
- [ ] Unit tests for every rule definition
- [ ] Integration tests for rule engine with all existing systems
- [ ] Performance benchmarks for rule execution
- [ ] Test data generators for complex scenarios
- [ ] Regression tests for all existing functionality
- [ ] Edge case testing for boundary conditions
- [ ] Load testing for concurrent rule execution
- [ ] Rule definition validation tests

### Test Framework Implementation
```typescript
// Rule Testing Framework
interface RuleTestFramework {
  testRule(ruleId: string, scenarios: TestScenario[]): Promise<TestResult[]>;
  testRuleCategory(category: RuleCategory): Promise<CategoryTestResult>;
  benchmarkRule(ruleId: string, iterations: number): Promise<BenchmarkResult>;
  generateTestData(ruleId: string): TestDataSet;
  validateRuleDefinition(ruleDef: BusinessRule): ValidationResult;
}

interface TestScenario {
  name: string;
  description: string;
  context: RuleContext;
  expectedResult: ExpectedResult;
  tags: string[];
}

interface RuleTestSuite {
  ruleId: string;
  scenarios: TestScenario[];
  benchmarks: BenchmarkScenario[];
  edgeCases: EdgeCaseScenario[];
}

// Test Data Generators
class TestDataGenerator {
  generateAgentCreationScenarios(): TestScenario[] {
    return [
      // Valid agent creation
      {
        name: 'valid-agent-creation',
        description: 'Creating new agent with unique name and valid dependencies',
        context: this.createValidAgentContext(),
        expectedResult: { success: true, errors: [], warnings: [], suggestions: [] }
      },
      // Duplicate agent name
      {
        name: 'duplicate-agent-name',
        description: 'Creating agent with existing name should fail',
        context: this.createDuplicateNameContext(),
        expectedResult: { 
          success: false, 
          errors: [{ ruleId: 'unique-agent-id-global', message: 'Agent ID already exists' }],
          suggestions: [{ type: 'alternative-names', values: ['specialized-pm', 'compliance-pm'] }]
        }
      },
      // Missing dependencies
      {
        name: 'missing-dependencies',
        description: 'Agent with missing resource dependencies should fail validation',
        context: this.createMissingDepsContext(),
        expectedResult: {
          success: false,
          errors: [{ ruleId: 'validate-dependency-chain', message: 'Missing dependencies found' }],
          suggestions: [{ type: 'create-missing-resources', values: ['missing-template', 'missing-checklist'] }]
        }
      }
    ];
  }
}
```

### Comprehensive Test Coverage
```typescript
// Complete test coverage for all existing functionality
describe('Rule Engine Comprehensive Testing', () => {
  describe('Migration Validation', () => {
    it('should preserve all existing Epic 1 functionality', async () => {
      // Test agent browse behavior unchanged
      // Test agent search behavior unchanged  
      // Test agent info behavior unchanged
      // Test template listing behavior unchanged
    });
    
    it('should preserve all existing Epic 2 functionality', async () => {
      // Test agent creation wizard behavior unchanged
      // Test template instantiation behavior unchanged
      // Test validation behavior unchanged
    });
    
    // Continue for Epic 3-7...
  });
  
  describe('Performance Benchmarks', () => {
    it('should execute naming rules within performance thresholds', async () => {
      const benchmark = await ruleEngine.benchmark('unique-agent-id-global', 1000);
      expect(benchmark.averageExecutionTime).toBeLessThan(5); // 5ms max
    });
    
    it('should handle concurrent rule execution', async () => {
      const concurrentOperations = Array(100).fill(null).map(() => 
        ruleEngine.validateOperation(createTestOperation())
      );
      const results = await Promise.all(concurrentOperations);
      expect(results.every(r => r.executionTime < 10)).toBe(true);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle malformed rule definitions gracefully', async () => {
      // Test invalid YAML syntax
      // Test missing required fields
      // Test invalid condition expressions
    });
    
    it('should handle extremely large contexts', async () => {
      // Test with 1000+ existing agents
      // Test with complex dependency chains
      // Test with large resource sets
    });
  });
  
  describe('Rule Definition Validation', () => {
    it('should validate all rule definition files', async () => {
      const ruleFiles = await loadAllRuleFiles();
      for (const file of ruleFiles) {
        const validation = await validateRuleFile(file);
        expect(validation.isValid).toBe(true);
      }
    });
  });
});
```

### Test Data Management
```yaml
# .lcagents/core/.bmad-core/rules/test-data/
test_scenarios:
  agent_creation:
    valid_cases:
      - name: "simple-agent"
        context:
          agentId: "test-agent"
          name: "Test Agent" 
          capabilities: ["basic-task"]
          dependencies: []
          targetLayer: "custom"
        expected:
          success: true
          
    invalid_cases:
      - name: "duplicate-core-agent"
        context:
          agentId: "pm"  # Conflicts with core PM agent
          name: "Product Manager"
          capabilities: ["product-management"]
          targetLayer: "custom"
        expected:
          success: false
          errors: ["unique-agent-id-global"]
          
  dependency_validation:
    circular_dependency:
      - name: "direct-circular"
        context:
          agentId: "agent-a"
          dependencies: ["agent-b"]
          existing_agents:
            - agentId: "agent-b"
              dependencies: ["agent-a"]
        expected:
          success: false
          errors: ["detect-circular-dependencies"]
```

### Performance Testing Framework
```typescript
// Performance testing and benchmarking
class RulePerformanceTester {
  async benchmarkAllRules(): Promise<BenchmarkReport> {
    const results = new Map<string, BenchmarkResult>();
    
    for (const rule of this.ruleEngine.getAllRules()) {
      const benchmark = await this.benchmarkRule(rule.id);
      results.set(rule.id, benchmark);
    }
    
    return {
      totalRules: results.size,
      averageExecutionTime: this.calculateAverage(results),
      slowestRules: this.findSlowestRules(results, 5),
      performanceThresholds: this.checkThresholds(results),
      recommendations: this.generatePerformanceRecommendations(results)
    };
  }
  
  async loadTest(concurrency: number, duration: number): Promise<LoadTestResult> {
    const startTime = Date.now();
    const operations: Promise<any>[] = [];
    
    while (Date.now() - startTime < duration) {
      for (let i = 0; i < concurrency; i++) {
        operations.push(this.executeRandomRule());
      }
      await Promise.all(operations);
      operations.length = 0;
    }
    
    return {
      totalOperations: operations.length,
      averageResponseTime: this.calculateAverageResponseTime(),
      errorsPerSecond: this.calculateErrorRate(),
      throughput: this.calculateThroughput()
    };
  }
}
```

### Definition of Done
- [ ] 100% test coverage for all rules
- [ ] Performance benchmarks for all rule executions
- [ ] Regression tests for all Epic 1-7 functionality
- [ ] Edge case testing framework implemented
- [ ] Load testing framework for concurrent operations
- [ ] Automated test data generation
- [ ] Rule definition validation tests
- [ ] Performance monitoring and alerting setup

### Estimated Story Points: 21
### Sprint Assignment: Sprint 6-8

---

## Epic Success Metrics

### Technical Metrics
- **Rule Coverage**: 100% of business logic migrated to rules
- **Performance**: <= 10ms overhead per operation vs current implementation
- **Test Coverage**: 100% test coverage for rule engine and all migrated logic
- **Backward Compatibility**: 100% preservation of existing functionality
- **Rule Execution**: Average rule execution time < 5ms

### Maintainability Metrics  
- **Rule Modification Time**: Business rule changes < 30 minutes vs current code changes
- **New Rule Addition**: New business rules addable without code deployment
- **Documentation Coverage**: All rules documented with examples and rationale
- **Developer Onboarding**: New developers can understand rule system in < 2 hours

### Quality Metrics
- **Bug Reduction**: 50% reduction in business logic bugs through declarative rules
- **Consistency**: 100% consistent validation behavior across all operations
- **Auditability**: Complete audit trail of rule executions and decisions

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Rule engine core infrastructure
- [ ] YAML rule loading system
- [ ] Basic rule execution engine
- [ ] Integration interfaces

### Phase 2: Migration (Weeks 3-4)
- [ ] Naming rules migration
- [ ] Layer management rules migration
- [ ] Comprehensive testing framework

### Phase 3: Advanced Rules (Weeks 4-5)  
- [ ] Dependency validation rules migration
- [ ] Creation policy rules migration
- [ ] Performance optimization

### Phase 4: Validation & Polish (Weeks 5-6)
- [ ] Comprehensive testing and validation
- [ ] Performance benchmarking
- [ ] Documentation and training materials
- [ ] Production readiness verification

## Risk Mitigation

### Risk: Performance Degradation
- **Mitigation**: Extensive benchmarking, lazy rule loading, rule caching
- **Fallback**: Rule engine disable flag for emergency rollback

### Risk: Migration Complexity  
- **Mitigation**: Incremental migration, feature flags, comprehensive testing
- **Fallback**: Gradual rollout with ability to disable rule engine per operation

### Risk: Rule Definition Errors
- **Mitigation**: Schema validation, rule testing framework, automated validation
- **Fallback**: Rule validation pipeline prevents bad rules from loading

### Risk: Learning Curve
- **Mitigation**: Comprehensive documentation, examples, developer training
- **Support**: Rule definition templates and guided rule creation tools

## Dependencies & Prerequisites
- Epic 1-7 must be fully implemented and stable
- Comprehensive test suite for existing functionality
- Performance baseline measurements for all operations
- Development environment with rule hot-reloading capability

## Post-Implementation Benefits
1. **Maintainability**: Business rules separate from implementation code
2. **Flexibility**: Rule modifications without code deployment
3. **Consistency**: Unified validation behavior across all operations  
4. **Auditability**: Complete rule execution logging and history
5. **Testability**: Independent testing of business logic
6. **Documentation**: Self-documenting business rules with examples
7. **Performance**: Optimized rule execution with caching and lazy loading
