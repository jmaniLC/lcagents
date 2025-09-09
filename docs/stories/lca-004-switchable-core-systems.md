# Story: LCA-004 - Switchable Core Agent Systems Implementation

**Project ID**: LCA-004  
**Epic**: Phase 1B - Core Functionality  
**Story**: Implement Switchable Core Agent Systems Architecture  
**Priority**: High  
**Type**: Technical Story  

## Story Description

As a **LCAgents administrator**, I want the ability to switch between different core agent systems (BMAD-Core, Enterprise-Core, etc.) so that different teams can use the most appropriate agent framework for their specific needs while maintaining all customization capabilities.

## Business Context

Currently, LCAgents is tightly coupled to BMAD-Core as the single core agent system. However, organizations may need different core agent systems for various reasons:
- **Enterprise requirements**: Compliance-focused agents with built-in governance
- **Lightweight needs**: Minimal agent sets for simple projects  
- **Specialized domains**: Industry-specific agent frameworks
- **Vendor independence**: Ability to switch between different agent providers

The new switchable core systems architecture enables teams to choose the most appropriate core agent system while preserving all layered customization capabilities.

## Acceptance Criteria

### AC1: Switchable Core Directory Structure
- [ ] Core systems moved to subdirectories: `.lcagents/core/bmad-core/`, `.lcagents/core/enterprise-core/`, etc.
- [ ] Each core system maintains its own complete structure (agents/, tasks/, templates/, etc.)
- [ ] Each core system has its own `version.json` for independent version tracking
- [ ] Active core system configuration stored in `.lcagents/core/active-core.json`
- [ ] Core system isolation ensures no cross-contamination between systems

### AC2: Core System Configuration Management
- [ ] `active-core.json` tracks currently active core system
- [ ] Configuration includes available core systems with metadata (version, description, agent count)
- [ ] Switch history tracked with timestamps and reasons
- [ ] Core system registry for discovering and installing new systems
- [ ] Validation of core system compatibility before switching

### AC3: Core System Resolution Engine
- [ ] Resource resolution updated to use active core system path: `.lcagents/core/{active-core}/`
- [ ] Agent inheritance can specify core system: `inherits: "enterprise-core/pm"`
- [ ] Layer resolution precedence includes core system awareness
- [ ] Runtime cache updated when core system changes
- [ ] Backward compatibility maintained for existing agent references

### AC4: Core System Management Commands
- [ ] `@lcagents core list` - List available core systems with status
- [ ] `@lcagents core switch <name>` - Switch to different core system with validation
- [ ] `@lcagents core install <name>` - Install new core system from registry/source
- [ ] `@lcagents core status` - Show active core system information
- [ ] `@lcagents core validate-switch <name>` - Check compatibility before switching
- [ ] `@lcagents core upgrade <name>` - Upgrade specific core system

### AC5: Pod-Level Core System Preferences
- [ ] Pod configuration can specify preferred core system
- [ ] Pod configuration can specify fallback core system
- [ ] Per-agent core system preferences (e.g., use enterprise PM, BMAD dev)
- [ ] Auto-switch capability when preferred core becomes available
- [ ] Core system preference inheritance and override rules

### AC6: Installation and Migration Support
- [ ] Installation creates BMAD-Core in `.lcagents/core/bmad-core/` by default
- [ ] Migration tool for existing flat `.lcagents/core/` to `.lcagents/core/bmad-core/`
- [ ] Automatic detection and migration of existing installations
- [ ] Preservation of all customizations during migration
- [ ] Rollback capability if migration fails

### AC7: Multi-Core System Support
- [ ] Support for multiple core systems installed simultaneously
- [ ] Safe switching between core systems without data loss
- [ ] Core system versioning and upgrade paths
- [ ] Compatibility matrix between core systems and LCAgents versions
- [ ] Core system installation from various sources (registry, GitHub, local)

## Technical Implementation Details

### Core System Structure

```typescript
// Core system manager implementation
class CoreSystemManager {
  private readonly CORE_BASE_PATH = '.lcagents/core/';
  private readonly ACTIVE_CORE_CONFIG = '.lcagents/core/active-core.json';
  
  async switchCoreSystem(targetCore: string, reason?: string): Promise<void> {
    // 1. Validate target core system exists
    await this.validateCoreSystemExists(targetCore);
    
    // 2. Check compatibility with current customizations
    const compatibility = await this.checkSwitchCompatibility(targetCore);
    if (!compatibility.isCompatible) {
      throw new Error(`Cannot switch: ${compatibility.issues.join(', ')}`);
    }
    
    // 3. Backup current state
    await this.backupCurrentState();
    
    // 4. Update active core configuration
    await this.updateActiveCoreConfig(targetCore, reason);
    
    // 5. Rebuild runtime cache with new core
    await this.rebuildRuntimeCache();
    
    // 6. Validate all agents resolve correctly
    await this.validateAgentResolution();
  }
  
  async installCoreSystem(
    name: string, 
    source: CoreSystemSource
  ): Promise<void> {
    const targetPath = path.join(this.CORE_BASE_PATH, name);
    
    // Ensure target directory doesn't exist
    if (await fs.pathExists(targetPath)) {
      throw new Error(`Core system '${name}' already exists`);
    }
    
    // Install based on source type
    switch (source.type) {
      case 'registry':
        await this.installFromRegistry(name, source.version, targetPath);
        break;
      case 'github':
        await this.installFromGitHub(source.url, source.ref, targetPath);
        break;
      case 'local':
        await this.installFromLocal(source.path, targetPath);
        break;
    }
    
    // Validate installed core system structure
    await this.validateCoreSystemStructure(targetPath);
    
    // Register in active core configuration
    await this.registerCoreSystem(name, source);
  }
}

interface ActiveCoreConfig {
  activeCore: string;
  availableCores: CoreSystemInfo[];
  switchHistory: CoreSwitchEvent[];
  lastUpdated: string;
}

interface CoreSystemInfo {
  name: string;
  version: string;
  description: string;
  agentCount: number;
  installDate: string;
  source: CoreSystemSource;
}

interface CoreSystemSource {
  type: 'registry' | 'github' | 'local';
  url?: string;
  ref?: string;
  path?: string;
  version?: string;
}
```

### Directory Structure Migration

**Before (Current LCA-003)**:
```
.lcagents/core/
├── agents/
├── tasks/
├── templates/
└── version.json
```

**After (New LCA-004)**:
```
.lcagents/core/
├── bmad-core/           # Default BMAD-Core system
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── version.json
├── enterprise-core/     # Optional enterprise system
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── version.json
├── minimal-core/        # Optional minimal system
│   ├── agents/
│   ├── tasks/
│   └── version.json
└── active-core.json     # Active system configuration
```

### Resource Resolution Updates

```typescript
// Updated resource resolver for switchable cores
class LayeredResourceResolver {
  async resolveAgent(agentId: string): Promise<AgentDefinition> {
    // 1. Get active core system
    const activeCore = await this.getActiveCoreSystem();
    
    // 2. Check for pod-specific core preference
    const podPreference = await this.getPodCorePreference(agentId);
    const coreSystem = podPreference || activeCore;
    
    // 3. Start with core agent from specified system
    const coreAgent = await this.loadFromCoreSystem(coreSystem, agentId);
    
    // 4. Apply organization overrides
    const orgOverrides = await this.loadOverridesFromLayer('org', agentId);
    
    // 5. Apply pod custom overrides
    const customOverrides = await this.loadOverridesFromLayer('custom', agentId);
    
    // 6. Merge with precedence: custom > org > core
    return this.mergeAgentLayers(coreAgent, orgOverrides, customOverrides);
  }
  
  private async loadFromCoreSystem(
    coreSystem: string, 
    agentId: string
  ): Promise<AgentDefinition> {
    const agentPath = `.lcagents/core/${coreSystem}/agents/${agentId}.md`;
    return await this.loadAgentDefinition(agentPath);
  }
}
```

## Files to Modify

### Primary Changes
1. **`src/cli/commands/init.ts`** - Update installation to create core system subdirectories
2. **`src/core/CoreSystemManager.ts`** - New core system management and switching logic
3. **`src/core/LayerManager.ts`** - Update resource resolution for switchable cores
4. **`src/cli/commands/core.ts`** - New CLI commands for core system management
5. **`src/utils/migration.ts`** - Migration logic for existing installations

### Supporting Changes
1. **`src/core/ResourceResolver.ts`** - Update to use active core system paths
2. **`src/core/AgentResolver.ts`** - Support for core system-specific inheritance
3. **`src/cli/commands/status.ts`** - Show active core system information
4. **Package templates** - Update with multi-core examples

## Testing Requirements

### Unit Tests
- [ ] Test core system switching logic
- [ ] Test core system installation from various sources
- [ ] Test resource resolution with multiple core systems
- [ ] Test migration from flat to nested core structure
- [ ] Test pod-level core system preferences
- [ ] Test rollback scenarios

### Integration Tests
- [ ] Test full workflow with multiple core systems installed
- [ ] Test agent activation with different core systems
- [ ] Test switching between core systems mid-workflow
- [ ] Test compatibility validation between core systems
- [ ] Test upgrade scenarios with multiple core systems

### Migration Tests
- [ ] Test migration from existing LCA-003 installations
- [ ] Test preservation of customizations during migration
- [ ] Test rollback of failed migrations
- [ ] Test edge cases (corrupted cores, missing files)

## Definition of Done

- [ ] Multiple core systems can be installed simultaneously
- [ ] Core system switching works without data loss
- [ ] All existing workflows continue working with BMAD-Core
- [ ] New core systems can be installed from registry/GitHub/local sources
- [ ] Pod-level core system preferences work correctly
- [ ] Migration from existing installations is seamless
- [ ] All CLI commands for core system management work
- [ ] Documentation updated with multi-core examples
- [ ] Tests pass for all core system scenarios
- [ ] Code review completed
- [ ] Changes deployed and validated

## Dependencies

- **Prerequisite**: LCA-003 (Layered Architecture Installation) must be completed
- **Blocked by**: None
- **Blocks**: LCA-005 (Advanced Core System Features)

## Estimation

**Story Points**: 13  
**Estimated Hours**: 24-30 hours  

### Breakdown:
- Design core system switching architecture: 6 hours
- Implement core system management: 8 hours
- Update resource resolution logic: 6 hours
- Implement migration and CLI commands: 6 hours
- Testing and validation: 6-8 hours

## Risk Assessment

### High Risk
- **Migration Complexity**: Moving existing flat core structure to nested structure
- **Resource Resolution Performance**: Multiple core systems may impact lookup performance
- **Compatibility Matrix**: Managing compatibility between different core systems

### Medium Risk
- **CLI Complexity**: Multiple new commands increase user interface complexity
- **Configuration Management**: Active core configuration sync across pods

### Mitigation Strategies
- Comprehensive migration testing with rollback capability
- Performance benchmarking with multiple core systems
- Clear documentation and examples for each core system type
- Gradual rollout with extensive validation

## Notes

This story transforms LCAgents from a single-core system (BMAD-Core only) to a pluggable multi-core architecture. It enables organizations to:

1. **Choose appropriate agent frameworks** for different teams/domains
2. **Maintain vendor independence** by not being locked to BMAD-Core
3. **Support enterprise requirements** with compliance-focused core systems
4. **Enable gradual migration** between different agent frameworks
5. **Preserve all customizations** regardless of core system choice

The implementation maintains complete backward compatibility while opening up new possibilities for specialized agent frameworks tailored to specific organizational needs.
