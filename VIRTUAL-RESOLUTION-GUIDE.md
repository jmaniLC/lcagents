# Virtual Resolution Layer - Team Guide

## What Changed and Why

### Before: Confusing Symbolic Links ❌
```
.lcagents/
├── agents/ -> .lcagents/core/bmad-core/agents/  # Symbolic link (confusing!)
├── core/bmad-core/agents/                       # Actual files
```
**Problems:**
- Files appeared to exist in two places
- Team members couldn't tell which was "real"
- Looked like duplication but wasn't
- Hard to understand layered architecture

### After: Virtual Resolution Layer ✅
```
.lcagents/
├── core/bmad-core/agents/     # Files exist here ONLY
├── custom/agents/             # Override files here
├── org/agents/                # Organization overrides
└── runtime/                   # Resolution cache
```
**Benefits:**
- Files exist in one clear location per layer
- No confusion about "duplicates"
- Explicit API for accessing resources
- Clear layer precedence: custom > org > core

## How to Access Resources

### Old Way (No Longer Works)
```bash
# ❌ This won't work anymore
cat .lcagents/agents/pm.md
ls .lcagents/agents/
```

### New Way: Use lcagents Commands
```bash
# ✅ Get resource location
lcagents resource get agents pm.md

# ✅ Read resource content
lcagents resource read agents pm.md

# ✅ List all resources
lcagents resource list agents

# ✅ Check if resource exists
lcagents resource exists agents pm.md
```

### New Way: Use LayerManager API
```typescript
import { LayerManager } from '@lendingclub/lcagents/core/LayerManager';

const layerManager = new LayerManager('.');

// Get physical file path
const path = await layerManager.getResourcePath('agents', 'pm.md');

// Read file content
const content = await layerManager.readResource('agents', 'pm.md');

// List all agents
const agents = await layerManager.listResources('agents');

// Check existence
const exists = await layerManager.resourceExists('agents', 'pm.md');
```

## Layer Precedence

Resources are resolved in this order (highest to lowest priority):

1. **Custom Layer** (`.lcagents/custom/`) - Pod-specific overrides
2. **Organization Layer** (`.lcagents/org/`) - Company-wide standards
3. **Core Layer** (`.lcagents/core/bmad-core/`) - Base system

### Example
```bash
# If these files exist:
# .lcagents/core/bmad-core/agents/pm.md    (base PM agent)
# .lcagents/custom/agents/pm.md            (custom override)

lcagents resource get agents pm.md
# Returns: .lcagents/custom/agents/pm.md (custom takes precedence)
```

## Common Workflows

### 1. Reading an Agent
```bash
# Get the agent that will actually be used (respects layer precedence)
lcagents resource read agents pm.md
```

### 2. Creating a Custom Override
```bash
# Copy base agent to custom layer for modification
cp .lcagents/core/bmad-core/agents/pm.md .lcagents/custom/agents/pm.md

# Edit the custom version
vim .lcagents/custom/agents/pm.md

# Verify it's now being used
lcagents resource get agents pm.md
# Should show: .lcagents/custom/agents/pm.md
```

### 3. Listing Available Resources
```bash
# See all agents across all layers
lcagents resource list agents

# See only custom layer agents
lcagents resource list agents --layer custom
```

### 4. Checking Resource Source
```bash
# Find out which layer provides a resource
lcagents resource get agents pm.md
# Output shows: Layer: custom (or org, or core)
```

## Migration Guide for Existing Tools

### If You Have Scripts That Access .lcagents/agents/
**Replace this:**
```bash
cat .lcagents/agents/pm.md
```

**With this:**
```bash
# Option 1: Use lcagents command
lcagents resource read agents pm.md

# Option 2: Get path first, then access
AGENT_PATH=$(lcagents resource get agents pm.md | grep "Path:" | cut -d' ' -f4)
cat "$AGENT_PATH"
```

### If You Have Node.js Tools
**Replace this:**
```javascript
const agentPath = path.join('.lcagents', 'agents', 'pm.md');
const content = fs.readFileSync(agentPath, 'utf-8');
```

**With this:**
```javascript
import { LayerManager } from '@lendingclub/lcagents/core/LayerManager';

const layerManager = new LayerManager('.');
const content = await layerManager.readResource('agents', 'pm.md');
// OR
const agentPath = await layerManager.getResourcePath('agents', 'pm.md');
const content = fs.readFileSync(agentPath, 'utf-8');
```

## Benefits for the Team

1. **Clear Architecture**: Files exist in one place per layer
2. **No Confusion**: No more "which file is real?"
3. **Explicit Access**: Must use proper API (better patterns)
4. **Layer Precedence**: Easy to override core agents
5. **Future-Proof**: Supports LCA-004 multi-core systems

## Directory Structure Reference

```
.lcagents/
├── core/
│   └── bmad-core/           # Core system files (read-only)
│       ├── agents/          # Base agents
│       ├── tasks/           # Base tasks
│       └── templates/       # Base templates
├── org/
│   ├── agents/              # Organization-wide agent overrides
│   └── templates/           # Organization templates
├── custom/
│   ├── agents/              # Pod-specific agent overrides
│   ├── tasks/               # Custom tasks
│   └── templates/           # Custom templates
├── runtime/
│   ├── resource-map.json    # Cached resolution mapping
│   └── cache/               # Runtime cache
└── config/
    └── core-config.yaml     # Active configuration
```

## Questions?

- **Q: Where are my agents?** A: In `.lcagents/core/bmad-core/agents/` (core) or `.lcagents/custom/agents/` (overrides)
- **Q: How do I override an agent?** A: Copy from core to custom layer, then edit
- **Q: Which agent is active?** A: Use `lcagents resource get agents <name>` to see the resolved path
- **Q: Can I still use old scripts?** A: Update them to use the new API for future compatibility

This change eliminates confusion and provides a cleaner, more maintainable architecture for the team!
