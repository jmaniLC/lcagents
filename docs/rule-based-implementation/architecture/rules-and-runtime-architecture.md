# LCAgents Rules and Runtime Architecture

## Rules and Policies Placement Strategy

Based on Node.js industry best practices and separation of concerns, here's the optimal folder structure for rules, policies, and runtime components:

### Recommended Folder Structure

```
.lcagents/
├── core/                           # Immutable external agent base (NO RULES HERE)
│   ├── bmad-core/                  # External core system
│   └── active-core.json            # Core system configuration
├── org/                            # Organization-level components
│   ├── agents/                     # Company-wide agent overrides
│   ├── templates/                  # Company templates
│   ├── policies/                   # 📋 COMPANY POLICIES (business rules)
│   │   ├── compliance-rules.yaml   # Regulatory compliance requirements
│   │   ├── security-policies.yaml  # Security and privacy policies
│   │   ├── naming-conventions.yaml # Organization naming standards
│   │   └── workflow-policies.yaml  # Company workflow requirements
│   ├── rules/                      # 🔧 ORGANIZATION VALIDATION RULES
│   │   ├── agent-creation-rules.yaml
│   │   ├── document-validation.yaml
│   │   └── compliance-checks.yaml
│   └── config/                     # Organization configuration
├── custom/                         # Pod-specific components
│   ├── agents/                     # Pod custom/override agents
│   ├── templates/                  # Pod-specific templates
│   ├── policies/                   # 📋 POD-SPECIFIC POLICIES
│   │   ├── team-standards.yaml     # Team-specific policies
│   │   └── project-requirements.yaml
│   ├── rules/                      # 🔧 POD VALIDATION RULES
│   │   ├── naming-rules.yaml       # Pod-specific naming rules
│   │   └── quality-gates.yaml     # Team quality requirements
│   └── config/                     # Pod configuration
├── runtime/                        # 🚀 RUNTIME COMPONENTS (Node.js best practice)
│   ├── config/                     # Runtime configuration
│   │   ├── active-config.json      # Current runtime settings
│   │   ├── environment.json        # Environment-specific config
│   │   └── feature-flags.json      # Runtime feature toggles
│   ├── rules/                      # 🎯 RUNTIME RULE ENGINE
│   │   ├── engine/                 # Rule execution engine
│   │   │   ├── rule-engine.ts      # Core rule processing
│   │   │   ├── rule-parser.ts      # YAML rule parser
│   │   │   ├── validation-engine.ts # Validation logic
│   │   │   └── rule-context.ts     # Execution context
│   │   ├── compiled/               # Compiled rule definitions
│   │   │   ├── merged-rules.json   # Merged rules from all layers
│   │   │   └── rule-index.json     # Rule lookup index
│   │   ├── cache/                  # Rule execution cache
│   │   └── logs/                   # Rule execution logs
│   ├── cache/                      # 💾 PERFORMANCE CACHE
│   │   ├── agents/                 # Merged agent definitions
│   │   ├── templates/              # Resolved templates
│   │   ├── resources/              # Resource resolution cache
│   │   └── metadata.json          # Cache metadata
│   ├── state/                      # 📊 RUNTIME STATE
│   │   ├── active-agents.json      # Currently active agents
│   │   ├── user-sessions.json      # User session data
│   │   └── workflow-state.json     # Current workflow status
│   ├── logs/                       # 📝 AUDIT AND LOGGING
│   │   ├── audit.log               # Comprehensive audit trail
│   │   ├── performance.log         # Performance metrics
│   │   ├── errors.log              # Error tracking
│   │   └── rule-execution.log      # Rule execution history
│   └── temp/                       # 🗑️ TEMPORARY FILES
│       ├── merges/                 # Temporary merge operations
│       └── validation/             # Temporary validation files
├── docs/                           # Generated documents (existing)
│   └── {PROJECT_ID}/               # Project-organized documents
└── agents/                         # Active resolved agents (symlinked)
```

## Why This Structure Follows Node.js Best Practices

### 1. `/runtime/` - Industry Standard Pattern

This follows Node.js ecosystem patterns seen in:
- **Next.js**: `.next/` folder for runtime artifacts
- **Nuxt.js**: `.nuxt/` folder for build and runtime
- **Gatsby**: `.cache/` and `public/` for runtime assets
- **Webpack**: `dist/` or `build/` for compiled output
- **TypeScript**: `dist/` for compiled JavaScript
- **Jest**: Coverage reports in dedicated folders

### 2. Separation of Concerns

```typescript
// Clear separation following Node.js principles:

// 1. POLICIES (Business Rules) - Declarative configuration
interface PolicyDefinition {
  name: string;
  description: string;
  category: 'compliance' | 'security' | 'workflow' | 'naming';
  rules: BusinessRule[];
  enforcement: 'strict' | 'warning' | 'advisory';
}

// 2. RULES (Validation Logic) - Executable validation
interface ValidationRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  severity: 'error' | 'warning' | 'suggestion';
}

// 3. RUNTIME (Execution Engine) - Processing infrastructure
interface RuntimeEngine {
  config: RuntimeConfig;
  ruleEngine: RuleExecutionEngine;
  cache: CacheManager;
  state: StateManager;
  logger: AuditLogger;
}
```

### 3. Configuration Hierarchy (Node.js Standard)

```typescript
// Configuration resolution follows Node.js patterns (similar to cosmiconfig):
const configResolution = [
  '.lcagents/runtime/config/environment.json',    // Environment-specific
  '.lcagents/custom/config/pod-config.yaml',      // Pod-specific  
  '.lcagents/org/config/org-config.yaml',         // Organization
  '.lcagents/core/bmad-core/config/default.yaml'  // Core defaults
];

// Rule resolution follows similar hierarchy:
const ruleResolution = [
  '.lcagents/custom/rules/',     // Pod rules (highest priority)
  '.lcagents/org/rules/',        // Organization rules
  '.lcagents/runtime/rules/'     // Runtime rule engine
];
```

## Rule Engine Architecture

### Runtime Rule Engine Implementation

```typescript
// Runtime rule engine following Node.js patterns
class LCAgentsRuleEngine {
  private readonly CONFIG_PATH = '.lcagents/runtime/config/';
  private readonly RULES_PATH = '.lcagents/runtime/rules/';
  private readonly CACHE_PATH = '.lcagents/runtime/cache/';
  
  async initialize(): Promise<void> {
    // 1. Load environment configuration
    await this.loadRuntimeConfig();
    
    // 2. Compile rules from all layers (custom → org → core policies)
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
  
  private async compilePoliciesAsRules(): Promise<CompiledRule[]> {
    // Convert declarative policies to executable rules
    const orgPolicies = await this.loadPolicies('.lcagents/org/policies/');
    const customPolicies = await this.loadPolicies('.lcagents/custom/policies/');
    
    return this.policyCompiler.compileToRules([...orgPolicies, ...customPolicies]);
  }
}
```

### Policy Definition Structure

```yaml
# .lcagents/org/policies/naming-conventions.yaml
policy:
  name: "Organization Naming Conventions"
  category: "naming"
  enforcement: "strict"
  
rules:
  agent_naming:
    pattern: "^[a-z-]+$"
    max_length: 50
    reserved_words: ["system", "core", "admin"]
    
  project_id_format:
    jira_pattern: "^[A-Z]{2,10}-\\d+$"
    ground_control_pattern: "^GC-\\d+$" 
    project_pattern: "^PROJ-\\d+$"
    
  document_naming:
    pattern: "^[a-z0-9-]+\\.(md|yaml|json)$"
    max_length: 100
    
validation:
  on_agent_creation: true
  on_document_creation: true
  on_project_creation: true
```

### Runtime Configuration

```json
// .lcagents/runtime/config/active-config.json
{
  "environment": "production",
  "ruleEngine": {
    "enabled": true,
    "strictMode": true,
    "cacheEnabled": true,
    "auditLevel": "full"
  },
  "performance": {
    "cacheTimeout": 300000,
    "maxCacheSize": "50MB",
    "enableMetrics": true
  },
  "logging": {
    "auditEnabled": true,
    "performanceLogging": true,
    "errorTracking": true,
    "retentionDays": 30
  },
  "features": {
    "hybridRuleEngine": true,
    "realTimeValidation": true,
    "policyEnforcement": true
  }
}
```

## Industry Best Practice Rationale

### 1. **Runtime Folder Pattern**
- **Webpack**: Uses `.cache/` for build artifacts
- **Next.js**: Uses `.next/` for runtime and build output  
- **Node.js**: Uses `node_modules/.cache/` for package caches
- **Jest**: Uses coverage folders for runtime reports

### 2. **Configuration Hierarchy**
- **cosmiconfig**: Searches multiple locations for config
- **dotenv**: Environment-specific configuration
- **config**: Layered configuration management
- **rc**: Runtime configuration patterns

### 3. **Logging and Audit**
- **Winston**: Structured logging with multiple transports
- **Bunyan**: JSON-based logging for Node.js
- **debug**: Debug logging patterns
- **morgan**: HTTP request logging middleware

### 4. **Cache Management**
- **node-cache**: In-memory caching
- **Redis**: External cache solutions
- **lru-cache**: Least Recently Used cache patterns
- **fs-extra**: File system caching utilities

### 5. **State Management**
- **Redux**: Predictable state containers
- **MobX**: Reactive state management
- **Vuex**: Centralized state for Vue applications
- **Recoil**: Experimental state management

## Benefits of This Architecture

### 1. **Clear Separation of Concerns**
- **Policies**: What should be enforced (business rules)
- **Rules**: How to validate and enforce (technical implementation)
- **Runtime**: Where execution happens (infrastructure)

### 2. **Performance Optimization**
- **Compiled Rules**: Pre-processed for fast execution
- **Intelligent Caching**: Reduce rule evaluation overhead
- **Lazy Loading**: Load rules only when needed

### 3. **Maintainability**
- **Layer Isolation**: Changes in one layer don't affect others
- **Version Control**: Each layer versioned independently
- **Testing**: Each component testable in isolation

### 4. **Scalability**
- **Pluggable Architecture**: Easy to add new rule types
- **Distributed Processing**: Rules can be evaluated in parallel
- **Resource Management**: Efficient memory and CPU usage

### 5. **Compliance and Audit**
- **Full Audit Trail**: Track all rule evaluations
- **Policy Enforcement**: Ensure organizational compliance
- **Reporting**: Generate compliance and performance reports

This architecture follows Node.js ecosystem best practices while providing a robust foundation for the hybrid rule engine implementation.
