# LCAgents Core Folder Architecture

## `.lcagents/core/` - Immutable External Agent Base

### Design Principles

1. **Immutable Base Layer**: `.lcagents/core/` contains read-only external core agents
2. **Switchable Core Systems**: Support for multiple external agent systems (bmad-core, enterprise-core, etc.)
3. **No Rules/Policies**: Core folder contains only pure agent definitions and resources
4. **External Source Management**: All content comes from external packages/repositories
5. **Version Controlled**: Each core system has independent version tracking

### Directory Structure

```
.lcagents/core/
├── active-core.json                 # Configuration for active core system
├── bmad-core/                       # Default BMAD-Core system (immutable)
│   ├── agents/                      # Core agent definitions (read-only)
│   │   ├── pm.md                    # Product Manager agent
│   │   ├── dev.md                   # Developer agent
│   │   ├── qa.md                    # QA Engineer agent
│   │   ├── em.md                    # Engineering Manager agent
│   │   └── architect.md             # Architect agent
│   ├── tasks/                       # Core workflow tasks (read-only)
│   │   ├── create-prd.md
│   │   ├── create-story.md
│   │   └── quality-gate.md
│   ├── templates/                   # Core document templates (read-only)
│   │   ├── prd-template.md
│   │   ├── story-template.md
│   │   └── test-plan-template.md
│   ├── checklists/                  # Core validation checklists (read-only)
│   │   ├── code-review-checklist.md
│   │   └── quality-checklist.md
│   ├── data/                        # Core knowledge base (read-only)
│   │   ├── coding-standards.md
│   │   └── best-practices.md
│   ├── workflows/                   # Core process definitions (read-only)
│   │   ├── sprint-workflow.md
│   │   └── release-workflow.md
│   ├── utils/                       # Core utility files (read-only)
│   │   └── common-utilities.md
│   └── version.json                 # BMAD-Core version tracking
├── enterprise-core/                 # Enterprise core system (optional)
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   ├── policies/                    # Enterprise-specific policies
│   ├── workflows/
│   └── version.json
└── minimal-core/                    # Minimal core system (optional)
    ├── agents/
    ├── tasks/
    ├── templates/
    └── version.json
```

### Core System Management

#### Active Core Configuration
```json
// .lcagents/core/active-core.json
{
  "activeCore": "bmad-core",
  "availableCores": [
    {
      "name": "bmad-core",
      "version": "4.45.0",
      "description": "Original BMAD-Core agent system",
      "path": "bmad-core/",
      "source": {
        "type": "npx",
        "command": "npx bmad-method install",
        "registry": "npm"
      }
    },
    {
      "name": "enterprise-core",
      "version": "1.2.0", 
      "description": "Enterprise-specific agent system",
      "path": "enterprise-core/",
      "source": {
        "type": "git",
        "url": "https://github.com/enterprise/agents.git",
        "branch": "main"
      }
    }
  ],
  "switchHistory": [
    {
      "from": "bmad-core",
      "to": "enterprise-core",
      "timestamp": "2025-09-09T10:30:00Z",
      "reason": "Switched to enterprise agents for compliance"
    }
  ]
}
```

### What Belongs in Core vs Other Folders

#### ✅ What BELONGS in `.lcagents/core/`
- **Pure agent definitions** (personas, base commands, core capabilities)
- **Base templates** (document structures, workflow templates)
- **Core tasks** (fundamental workflow steps)
- **Base checklists** (standard validation procedures)
- **Knowledge base** (general best practices, coding standards)
- **Core workflows** (standard processes)
- **Utilities** (shared helper functions and documentation)
- **Version tracking** (for safe upgrades)

#### ❌ What DOES NOT belong in `.lcagents/core/`
- **Business rules** (validation logic, naming conventions)
- **Runtime policies** (execution rules, constraints)
- **Dynamic configuration** (environment-specific settings)
- **Runtime state** (cache, logs, temporary files)
- **Custom overrides** (pod-specific modifications)
- **Organization policies** (company-specific requirements)
- **Declarative rules** (validation rules, business logic)

### Core System Switching

```typescript
// Core system management
class CoreSystemManager {
  async switchCoreSystem(newCore: string): Promise<void> {
    // 1. Validate new core system exists and is compatible
    await this.validateCoreSystem(newCore);
    
    // 2. Update active core configuration
    await this.updateActiveCoreConfig(newCore);
    
    // 3. Rebuild runtime cache with new core
    await this.rebuildRuntimeCache();
    
    // 4. Validate all customizations still work
    await this.validateCustomizations();
  }
  
  async installCoreSystem(coreName: string, source: CoreSystemSource): Promise<void> {
    const targetPath = `.lcagents/core/${coreName}/`;
    
    switch (source.type) {
      case 'npx':
        await this.installViaNpx(source.command, targetPath);
        break;
      case 'git':
        await this.installFromGit(source.url, targetPath);
        break;
      case 'registry':
        await this.installFromRegistry(coreName, targetPath);
        break;
    }
    
    await this.registerCoreSystem(coreName);
  }
}
```

### Immutability Enforcement

```typescript
class CoreImmutabilityGuard {
  async enforceReadOnly(operation: FileOperation): Promise<void> {
    if (operation.path.startsWith('.lcagents/core/') && operation.type === 'write') {
      throw new Error(
        'Core files are immutable. ' +
        'To customize agents, use .lcagents/custom/ or .lcagents/org/ folders.'
      );
    }
  }
  
  async validateCoreIntegrity(): Promise<ValidationResult> {
    // Verify core files haven't been modified
    // Check version consistency
    // Validate core system structure
  }
}
```
