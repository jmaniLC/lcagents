# Story: LCA-003 - Layered Architecture Installation Implementation

**Project ID**: LCA-003  
**Epic**: Phase 1B - Core Functionality  
**Story**: Implement Layered Architecture During Installation  
**Priority**: High  
**Type**: Technical Story  

## Story Description

As a **LCAgents user**, I want the installation process to create the new three-layer architecture structure so that I can customize agents and resources at different levels (core, organization, and pod-specific) while maintaining safe upgrade paths.

## Business Context

Currently, the LCAgents installation copies all BMAD-Core content directly to a single `.lcagents/` directory, which prevents multi-pod customization and safe upgrades. The new layered architecture (defined in LCAgents Architecture Specification v1.1) requires a fundamental change to how resources are organized during installation.

## Acceptance Criteria

### AC1: Three-Layer Directory Structure Creation
- [ ] Installation creates `.lcagents/core/` directory containing immutable BMAD-Core baseline
- [ ] Installation creates `.lcagents/org/` directory for organization-wide standards (initially empty)
- [ ] Installation creates `.lcagents/custom/` directory for pod-specific customizations (initially empty)
- [ ] Installation creates `.lcagents/runtime/` directory for resolved resources and cache
- [ ] All existing `.lcagents/` root files are moved to appropriate layer directories

### AC2: Core Layer Population
- [ ] All BMAD-Core agent files copied to `.lcagents/core/agents/`
- [ ] All BMAD-Core task files copied to `.lcagents/core/tasks/`
- [ ] All BMAD-Core template files copied to `.lcagents/core/templates/`
- [ ] All BMAD-Core checklist files copied to `.lcagents/core/checklists/`
- [ ] All BMAD-Core data files copied to `.lcagents/core/data/`
- [ ] All BMAD-Core utility files copied to `.lcagents/core/utils/`
- [ ] All BMAD-Core workflow files copied to `.lcagents/core/workflows/`
- [ ] All BMAD-Core agent-team files copied to `.lcagents/core/agent-teams/`
- [ ] Core layer marked as read-only with version tracking in `.lcagents/core/version.json`

### AC3: Runtime Resource Resolution Setup
- [ ] Layer resolution engine implemented for intelligent agent merging across core/org/custom layers
- [ ] Active agent configurations resolved (not simple symlinks) to `.lcagents/agents/` with layer precedence
- [ ] Runtime merged agents cached in `.lcagents/runtime/merged-agents/` for performance
- [ ] Active templates resolved to `.lcagents/templates/` with layer-based inheritance
- [ ] Active tasks resolved to `.lcagents/tasks/` with layer-based inheritance
- [ ] All other resource types properly resolved to root-level directories with layer precedence
- [ ] Backward compatibility maintained through resolution links to merged resources
- [ ] Runtime cache directory created at `.lcagents/runtime/cache/`
- [ ] Runtime logs directory created at `.lcagents/runtime/logs/`
s
### AC4: Customization Layer Scaffolding
- [ ] `.lcagents/custom/config/pod-config.yaml` created with default configuration
- [ ] `.lcagents/custom/agents/overrides/` directory created for agent customizations
- [ ] `.lcagents/custom/agents/` directory created for new custom agents
- [ ] `.lcagents/custom/templates/` directory created for custom templates
- [ ] `.lcagents/custom/tasks/` directory created for custom workflows
- [ ] `.lcagents/org/agents/overrides/` directory created for organization-wide agent overrides
- [ ] Example override file created at `.lcagents/custom/agents/overrides/example-override.yaml`
- [ ] Example organization override template created at `.lcagents/org/agents/overrides/example-org-override.yaml`

### AC5: Version and Metadata Tracking
- [ ] `.lcagents/core/version.json` created with BMAD-Core version information
- [ ] `.lcagents/.metadata.json` created with installation metadata
- [ ] Installation tracks which LCAgents version created the structure
- [ ] Upgrade path information documented in metadata

### AC6: Backward Compatibility Maintenance
- [ ] All existing agent commands continue to work without modification
- [ ] All existing resource resolution paths continue to function
- [ ] Users can activate agents using same syntax (`@lcagents activate pm`)
- [ ] All document generation workflows continue working unchanged
- [ ] No breaking changes to existing workflows

## Technical Implementation Details

### Modified Installation Process

```typescript
// New installation workflow in src/cli/commands/init.ts
async function createLayeredArchitecture(lcagentsDir: string) {
  // 1. Create three-layer structure
  await createLayerDirectories(lcagentsDir);
  
  // 2. Populate core layer with BMAD-Core resources
  await populateCoreLayer(lcagentsDir);
  
  // 3. Set up runtime resolution system with layer merging
  await setupRuntimeResolution(lcagentsDir);
  
  // 4. Create customization scaffolding for both org and pod levels
  await createCustomizationScaffolding(lcagentsDir);
  
  // 5. Create version tracking and metadata
  await createVersionTracking(lcagentsDir);
  
  // 6. Initialize layer resolution engine
  await initializeLayerResolver(lcagentsDir);
}
```

### Directory Structure Change

**Before (Current)**:
```
.lcagents/
├── agents/
├── tasks/ 
├── templates/
├── checklists/
├── data/
├── utils/
├── workflows/
└── agent-teams/
```

**After (New Layered Architecture)**:
```
.lcagents/
├── core/               # Immutable BMAD-Core baseline
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   ├── checklists/
│   ├── data/
│   ├── utils/
│   ├── workflows/
│   ├── agent-teams/
│   └── version.json
├── org/                # Organization standards (empty initially)
│   ├── agents/         # Company-wide agent overrides
│   │   └── overrides/  # Organization-level agent customizations
│   ├── templates/      # Organization-standard templates
│   ├── policies/       # Company policies and compliance
│   └── config/         # Organization-wide configuration
├── custom/             # Pod customizations (scaffolded)
│   ├── config/
│   │   └── pod-config.yaml  # Pod-specific configuration
│   ├── agents/
│   │   ├── overrides/  # Pod-level agent customizations
│   │   └── custom-data-engineer.md  # Example custom agent
│   ├── templates/
│   └── tasks/
├── runtime/            # Resolved resources and cache
│   ├── merged-agents/
│   ├── cache/
│   └── logs/
├── agents/             # Resolved active agents (backward compatibility)
├── templates/          # Resolved active templates (backward compatibility)
├── tasks/              # Resolved active tasks (backward compatibility)
├── checklists/         # Resolved active checklists (backward compatibility)
├── data/               # Resolved active data (backward compatibility)
├── utils/              # Resolved active utils (backward compatibility)
├── workflows/          # Resolved active workflows (backward compatibility)
├── agent-teams/        # Resolved active agent-teams (backward compatibility)
├── docs/               # Generated documents (unchanged)
├── config/             # Active configuration (unchanged)
└── .metadata.json      # Installation metadata
```

## Files to Modify

### Primary Changes
1. **`src/cli/commands/init.ts`** - Complete rewrite of installation logic
2. **`scripts/copy-resources.js`** - Modify to support layered copying
3. **New file: `src/core/LayerManager.ts`** - Layer resolution and merging logic
4. **New file: `src/core/VersionManager.ts`** - Version tracking logic
5. **New file: `src/core/AgentResolver.ts`** - Agent override and merging engine

### Supporting Changes
1. **`src/cli/commands/upgrade.ts`** - Add layered upgrade support
2. **`src/utils/resource-resolver.ts`** - Layer-aware resource resolution
3. **`src/core/agent-merger.ts`** - Agent configuration merging logic
4. **Package templates** - Update example configurations for org and pod overrides

## Testing Requirements

### Unit Tests
- [ ] Test layered directory creation
- [ ] Test core layer population
- [ ] Test runtime resource resolution and layer merging
- [ ] Test agent override merging (org + pod overrides)
- [ ] Test backward compatibility paths
- [ ] Test version tracking creation

### Integration Tests
- [ ] Test full installation with layered architecture
- [ ] Test agent activation after layered installation with overrides
- [ ] Test document generation with layered resources
- [ ] Test layer precedence (custom > org > core)
- [ ] Test upgrade path from flat to layered structure

### Compatibility Tests
- [ ] Verify all existing workflows continue working
- [ ] Test agent command execution
- [ ] Test template resolution
- [ ] Test task workflow execution

## Definition of Done

- [ ] Installation creates complete three-layer architecture
- [ ] All existing workflows work without modification  
- [ ] New customization capabilities are available
- [ ] Version tracking enables safe upgrades
- [ ] Documentation updated to reflect new structure
- [ ] Tests pass for both new layered and backward compatibility features
- [ ] Code review completed
- [ ] Changes deployed and validated in test environment

## Dependencies

- **Prerequisite**: LCAgents Architecture Specification v1.1 (completed)
- **Blocked by**: None
- **Blocks**: LCA-004 (Agent Override System), LCA-005 (Custom Agent Framework)

## Estimation

**Story Points**: 8  
**Estimated Hours**: 16-20 hours  

### Breakdown:
- Design new installation logic: 4 hours
- Implement layered directory creation: 4 hours  
- Implement layer resolution and merging system: 6 hours
- Implement backward compatibility: 4 hours
- Testing and validation: 4-8 hours

## Risk Assessment

### High Risk
- **Backward Compatibility**: Ensuring existing workflows don't break
- **Layer Resolution Logic**: Complex agent merging and precedence rules
- **Performance**: Resource resolution overhead in layered structure

### Medium Risk  
- **Migration Path**: Users with existing installations may need migration support
- **Override Conflicts**: Managing conflicting customizations between layers

### Mitigation Strategies
- Comprehensive testing suite for backward compatibility
- Performance benchmarking for resource resolution
- Gradual rollout with rollback capability
- Clear migration documentation

## Notes

This story implements the foundation for the multi-pod customization system defined in the LCAgents Architecture Specification v1.1. Once completed, subsequent stories will implement agent override systems, custom agent frameworks, and safe upgrade mechanisms that rely on this layered foundation.

The implementation preserves complete backward compatibility while enabling the advanced customization features required for enterprise multi-pod deployments.
