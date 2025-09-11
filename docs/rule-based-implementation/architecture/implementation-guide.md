# LCAgents Architecture Implementation Guide

## Summary of Architectural Decisions

### ✅ Confirmed Architecture

Based on Node.js industry best practices and your requirements:

1. **`.lcagents/core/`** - Immutable external agent base (NO rules here)
2. **`.lcagents/org/policies/`** - Organization-level business policies  
3. **`.lcagents/custom/policies/`** - Pod-specific business policies
4. **`.lcagents/runtime/`** - All runtime components (rules engine, cache, logs, state)

### 🎯 Why This Structure

This follows proven patterns from the Node.js ecosystem:

- **Next.js**: `.next/` for runtime artifacts
- **Nuxt.js**: `.nuxt/` for build and runtime  
- **TypeScript**: `dist/` for compiled output
- **Webpack**: Build and runtime separation
- **cosmiconfig**: Layered configuration resolution

## Folder Structure Overview

```
.lcagents/
├── core/                           # 🔒 IMMUTABLE (external sources only)
│   ├── bmad-core/                  # External BMAD-Core system
│   ├── enterprise-core/            # Optional enterprise system
│   └── active-core.json            # Core system configuration
│
├── org/                            # 🏢 ORGANIZATION LAYER
│   ├── policies/                   # Business policies (declarative)
│   ├── rules/                      # Organization validation rules
│   ├── agents/                     # Company agent overrides
│   └── config/                     # Organization configuration
│
├── custom/                         # 👥 POD LAYER  
│   ├── policies/                   # Pod business policies
│   ├── rules/                      # Pod validation rules
│   ├── agents/                     # Pod agents and overrides
│   └── config/                     # Pod configuration
│
└── runtime/                        # ⚡ RUNTIME LAYER (Node.js best practice)
    ├── config/                     # Runtime configuration
    ├── rules/                      # Rule execution engine
    │   ├── engine/                 # Core rule processing
    │   ├── compiled/               # Compiled rule definitions
    │   ├── cache/                  # Rule execution cache
    │   └── logs/                   # Rule execution logs
    ├── cache/                      # Performance cache
    ├── state/                      # Runtime state management
    ├── logs/                       # Audit and logging
    └── temp/                       # Temporary files
```

## Key Architectural Principles

### 1. Immutable Core Principle
```typescript
// ❌ NEVER do this
const ruleDefinition = await fs.readFile('.lcagents/core/bmad-core/rules/naming.yaml');

// ✅ DO this instead  
const ruleDefinition = await fs.readFile('.lcagents/custom/rules/naming.yaml');
const orgRules = await fs.readFile('.lcagents/org/rules/naming.yaml');
```

### 2. Runtime Engine Pattern
```typescript
// Runtime engine manages all rule processing
class LCAgentsRuntimeEngine {
  // Compile rules from policies and rule definitions
  async compileRules(): Promise<CompiledRules> {
    const sources = [
      '.lcagents/custom/policies/',    // Pod policies → rules
      '.lcagents/custom/rules/',       // Pod rules
      '.lcagents/org/policies/',       // Org policies → rules  
      '.lcagents/org/rules/'           // Org rules
    ];
    
    return await this.ruleCompiler.compile(sources);
  }
}
```

### 3. Layered Resolution
```typescript
// Resolution priority: custom → org → core
async resolveResource(type: string, name: string): Promise<string> {
  // 1. Pod customizations (highest priority)
  if (await exists(`.lcagents/custom/${type}/${name}`)) {
    return `.lcagents/custom/${type}/${name}`;
  }
  
  // 2. Organization standards  
  if (await exists(`.lcagents/org/${type}/${name}`)) {
    return `.lcagents/org/${type}/${name}`;
  }
  
  // 3. Core baseline (lowest priority)
  return `.lcagents/core/{activeCore}/${type}/${name}`;
}
```

## Implementation Strategy

### Phase 1: Core Structure Setup
1. ✅ Establish immutable `.lcagents/core/` 
2. ✅ Create `.lcagents/runtime/` infrastructure
3. ✅ Implement basic rule engine in runtime
4. ✅ Setup policy → rule compilation

### Phase 2: Rule Engine Implementation  
1. ✅ Implement rule execution engine in `.lcagents/runtime/rules/engine/`
2. ✅ Create rule compilation from policies
3. ✅ Build caching system in `.lcagents/runtime/cache/`
4. ✅ Implement audit logging in `.lcagents/runtime/logs/`

### Phase 3: Integration and Testing
1. ✅ Integrate rule engine with existing agents
2. ✅ Implement performance caching
3. ✅ Add comprehensive audit trails
4. ✅ Create CLI commands for rule management

## Migration Path from Current State

### Current State Analysis
Based on the epic document, you currently have rule definitions like:
```yaml
# Current: .lcagents/core/.bmad-core/rules/naming-rules.yaml (❌ Wrong location)
```

### Migration Steps

1. **Move Rules Out of Core**
   ```bash
   # Move existing rules to proper locations
   mv .lcagents/core/*/rules/ .lcagents/runtime/rules/legacy/
   ```

2. **Establish Runtime Infrastructure**
   ```bash
   mkdir -p .lcagents/runtime/{config,rules/engine,cache,state,logs,temp}
   ```

3. **Create Policy Definitions**
   ```yaml
   # .lcagents/org/policies/naming-conventions.yaml
   policy:
     name: "Organization Naming Standards"
     enforcement: "strict"
   rules:
     agent_naming:
       pattern: "^[a-z-]+$"
   ```

4. **Implement Rule Compilation**
   ```typescript
   // .lcagents/runtime/rules/engine/policy-compiler.ts
   class PolicyCompiler {
     async compileToRules(policies: PolicyDefinition[]): Promise<CompiledRule[]> {
       // Convert declarative policies to executable rules
     }
   }
   ```

## Benefits of This Architecture

### 1. **Industry Alignment**
- Follows Node.js ecosystem patterns
- Familiar structure for developers
- Standard tooling integration

### 2. **Performance Optimization**
- Pre-compiled rules for fast execution
- Intelligent caching strategies
- Minimal runtime overhead

### 3. **Maintainability**  
- Clear separation of concerns
- Layer isolation and independence
- Easy testing and debugging

### 4. **Scalability**
- Pluggable rule engine architecture
- Distributed rule processing capability
- Efficient resource management

### 5. **Compliance**
- Comprehensive audit trails
- Policy enforcement mechanisms
- Governance and reporting tools

## CLI Commands for Rule Management

```bash
# Rule management commands
@lcagents rules validate                    # Validate all rule definitions
@lcagents rules compile                     # Compile policies to rules
@lcagents rules list [category]             # List rules by category
@lcagents rules test <rule-id>              # Test specific rule
@lcagents rules cache clear                 # Clear rule cache
@lcagents rules audit [project-id]          # Show rule audit trail

# Policy management commands  
@lcagents policies list                     # List all policies
@lcagents policies validate                 # Validate policy definitions
@lcagents policies apply <policy-id>        # Apply specific policy

# Runtime management commands
@lcagents runtime status                    # Show runtime status
@lcagents runtime config                    # Show runtime configuration
@lcagents runtime logs [type]               # View runtime logs
@lcagents runtime cache status              # Show cache statistics
```

## Next Steps

1. **Update Epic 8 Implementation** to reflect this architecture
2. **Implement Runtime Infrastructure** in `.lcagents/runtime/`  
3. **Create Policy Templates** for organization and pod layers
4. **Build Rule Compilation Engine** to convert policies to executable rules
5. **Integrate with Existing Agents** using the new rule engine
6. **Create CLI Commands** for rule and policy management

This architecture provides a solid foundation that follows Node.js best practices while supporting your hybrid rule engine requirements with proper separation of concerns.
