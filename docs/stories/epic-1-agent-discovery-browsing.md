# Epic 1: Agent Discovery & Browsing

**Epic Owner:** Product Manager  
**Implementation Phase:** Phase 1 (4 weeks)  
**Priority:** High  
**Dependencies:** None (Foundation Epic)

## Epic Description
Enable users to discover, explore, and understand available agents in the LCAgents ecosystem through intuitive browsing and search capabilities.

## Epic Goals
- Provide comprehensive agent discovery interface
- Enable users to understand agent capabilities before selection
- Support both technical and non-technical users in agent exploration
- Reduce learning curve for new LCAgents users

---

## User Story 1.1: Browse Available Agents

**As a** team member new to LCAgents  
**I want to** explore available agents and understand their capabilities  
**So that** I can decide which agents are useful for my work  

### Acceptance Criteria
- [ ] Display all agents with icons, names, and one-line descriptions
- [ ] Show agent categories (Business, Technical, Compliance, etc.)
- [ ] Provide search functionality by keywords or capabilities
- [ ] Include usage examples for each agent
- [ ] Display which agents are core vs. custom
- [ ] Show agent compatibility with current core system

### CLI Commands Implemented
```bash
lcagents agent browse                           # Interactive agent browser using AgentLoader.loadAllAgents()
lcagents agent search <query>                   # Search agents by capability via ResourceResolver
lcagents agent templates                        # List available templates from layer-resolved template system
lcagents agent gaps-analysis                    # Find missing capabilities via LayerManager comparison
lcagents agent suggest                          # Smart recommendations using AgentLoader analysis
```

### Runtime CLI Execution Sequences

#### Discovery Flow (Context-Aware)
```bash
# 1. Initial discovery with layer analysis
lcagents agent browse
  ├── Internal: AgentLoader.loadAllAgents() → LayerManager.analyzeDistribution()
  ├── Internal: ResourceResolver.validateAllAgents() → CoreSystemManager.checkCompatibility()
  └── Output: Layer-aware agent list with conflict detection

# 2. Detailed information with dependency resolution
lcagents agent info <agent-name>
  ├── Internal: AgentLoader.loadAgent() → ResourceResolver.resolveDependencies()
  ├── Internal: LayerManager.resolveOverrides() → CoreSystemManager.validateCompatibility()
  └── Output: Complete agent profile with layer inheritance chain

# 3. Gap analysis with intelligent suggestions
lcagents agent gaps-analysis
  ├── Depends: agent browse (for current state)
  ├── Internal: CoreSystemManager.getAvailableCoreAgents() → AgentLoader.compareCapabilities()
  └── Triggers: lcagents agent suggest (if gaps found)
```

#### Search Flow (Dependency Chain)
```bash
# Context-aware search with validation pipeline
lcagents agent search "planning"
  ├── Internal: ResourceResolver.searchAgents() → LayerManager.resolveConflicts()
  ├── Internal: AgentLoader.validateSearchResults() → CoreSystemManager.filterCompatible()
  ├── Auto-trigger: lcagents agent info <top-match> (if single result)
  └── Auto-suggest: lcagents agent suggest (if no results)
```

### Interactive Browser Features
```
📋 Available Agents:
├── 👨‍💼 PM (Product Manager) [CORE] - Creates requirements, manages features
├── 👩‍💻 Dev (Developer) [CORE] - Writes code, implements features  
├── 🧪 QA (Quality Assurance) [CORE] - Tests features, finds bugs
├── 🏗️ Architect [CORE] - Designs system architecture
├── 📊 Data Engineer [CUSTOM] - Analyzes data, creates pipelines
└── 🔒 Security Engineer [ORG] - Security reviews, compliance

💡 Type 'lcagents agent info <name>' for detailed capabilities
🔍 Search: 'lcagents agent search "planning"'
```

### Technical Implementation Details
- **AgentLoader Integration**: Utilize existing `AgentLoader.loadAllAgents()` to retrieve all agents across layers (.lcagents/core/, .lcagents/org/, .lcagents/custom/)
- **Resource Resolution**: Leverage `ResourceResolver.listResources('agents')` for agent discovery across layered structure
- **Layer Awareness**: Display agents with their layer source (core, org, custom) using `LayerManager.resolveAgent()` from .lcagents/{layer}/
- **Core System Support**: Show compatibility with active core system via `CoreSystemManager.getActiveCoreSystem()` from .lcagents/core/.{coreSystem}/
- **Agent Metadata**: Parse agent YAML front-matter for icons, titles, whenToUse descriptions from layered agent files
- **Category Extraction**: Parse agent personas and commands to categorize by role/function across all layers
- **Intelligent Layer Resolution**: Show layer hierarchy and override relationships when agents exist in multiple layers

### Definition of Done
- [ ] Interactive browser displays all available agents with categorization
- [ ] Search functionality returns relevant results using agent metadata
- [ ] Agent compatibility status clearly indicated via core system validation
- [ ] Usage examples provided from agent command definitions
- [ ] Core vs. custom agents visually distinguished by layer source
- [ ] Integration with existing ResourceResolver and LayerManager

### Estimated Story Points: 8
### Sprint Assignment: Sprint 1-2

---

## User Story 1.2: Get Detailed Agent Information

**As a** user considering an agent  
**I want to** see detailed capabilities and examples  
**So that** I can understand if it meets my needs  

### Acceptance Criteria
- [ ] Show complete command list with descriptions
- [ ] Display sample workflows and outputs
- [ ] List dependencies and integration points
- [ ] Show agent personality and communication style
- [ ] Provide "try it" examples with safe commands

### CLI Commands Implemented
```bash
lcagents agent info <agent-name>                # Detailed agent information using AgentLoader.loadAgent()
lcagents agent resources <agent-name>           # List agent dependencies via ParsedAgent.definition.dependencies
```

### Technical Implementation Details
- **Agent Loading**: Use `AgentLoader.loadAgent(agentName)` to retrieve full ParsedAgent structure from .lcagents/{layer}/agents/
- **Dependency Resolution**: Display dependencies from agent.definition.dependencies (checklists, tasks, templates, etc.) resolved from .lcagents/{layer}/{resourceType}/
- **Command Parsing**: Show all commands from agent.definition.commands with descriptions and usage from layered agent definitions
- **Resource Validation**: Use ResourceResolver to verify all dependencies exist and are accessible across .lcagents/core/, .lcagents/org/, .lcagents/custom/
- **Layer Information**: Show which layer(s) the agent comes from via LayerManager resolution (.lcagents/core/.{coreSystem}/, .lcagents/org/, .lcagents/custom/)
- **Core System Context**: Display agent's compatibility with current active core system from .lcagents/core/.{coreSystem}/
- **Override Visualization**: Show when custom/org layers override core agents with clear inheritance paths

### Definition of Done
- [ ] Comprehensive agent information display using ParsedAgent structure
- [ ] Command list with detailed descriptions from YAML definition
- [ ] Sample workflows and outputs shown from task dependencies
- [ ] Dependencies and integration points listed from agent.dependencies
- [ ] Safe "try it" examples available from command usage fields
- [ ] Layer source and core system compatibility clearly displayed

### Estimated Story Points: 5
### Sprint Assignment: Sprint 2

---

## Epic Success Metrics
- **Time to Agent Discovery**: Average time for users to find suitable agent < 5 minutes
- **Agent Understanding Score**: User comprehension rating > 85%
- **Search Success Rate**: Users find relevant agents > 90% of searches
- **Template Usage**: Template browsing leads to creation > 60% of time

## Technical Implementation Notes
- Implement interactive CLI browser using AgentLoader for agent enumeration
- Create agent metadata extraction system using YAML front-matter parsing
- Build template preview system using ResourceResolver for template access
- Design agent compatibility checking using CoreSystemManager validation
- Leverage existing LayerManager for layer-aware agent discovery
- Integrate with current ResourceResolver patterns for dependency checking

## Dependencies
- Core wizard engine (for interactive browser)
- AgentLoader and ResourceResolver systems
- LayerManager for multi-layer agent resolution
- CoreSystemManager for compatibility checking
