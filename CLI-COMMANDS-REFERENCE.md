# LCAgents CLI Commands - Sequential Execution Order

## 📋 Complete Command Reference

### **Phase 1: Initial Setup**

#### 1. **Project Information** (Optional)
```bash
lcagents info
```
- **Purpose**: Show LendingClub internal installation information
- **When**: Before installation to understand what you're installing
- **Output**: Package version, repository, documentation links, support channels

#### 2. **Installation**
```bash
# NPX Installation (Recommended)
npx git+https://github.com/jmaniLC/lcagents.git init

# With specific core system
npx git+https://github.com/jmaniLC/lcagents.git init --core-system bmad-core

# Force overwrite existing installation
npx git+https://github.com/jmaniLC/lcagents.git init --force

# Non-interactive mode
npx git+https://github.com/jmaniLC/lcagents.git init --no-interactive --core-system bmad-core
```
- **Purpose**: Initialize LCAgents in current directory
- **When**: First command to run in any new project
- **Creates**: `.lcagents/` directory structure with layered architecture

---

### **Phase 2: Core System Management**

#### 3. **List Available Core Systems**
```bash
lcagents core list

# Show only available systems (not installed)
lcagents core list --available
```
- **Purpose**: View all available core systems before installation or switching
- **When**: Before installing additional systems or switching
- **Shows**: bmad-core ✅, enterprise-core [NOT READY], minimal-core [DEV MODE]

#### 4. **Check Current Status**
```bash
# Quick status
lcagents core status

# Detailed status with configuration
lcagents core details
```
- **Purpose**: See active core system and configuration
- **When**: After installation or when troubleshooting
- **Shows**: Active system, runtime configuration, installed systems

#### 5. **Install Additional Core Systems** (Optional)
```bash
lcagents core install enterprise-core
lcagents core install minimal-core
```
- **Purpose**: Install additional core systems
- **When**: Need multiple core systems or want to test different options
- **Note**: Currently only bmad-core fully implemented

#### 6. **Validate Before Switching** (Optional)
```bash
lcagents core validate-switch enterprise-core
```
- **Purpose**: Check compatibility before switching core systems
- **When**: Before switching to ensure no conflicts

#### 7. **Switch Core Systems** (Optional)
```bash
lcagents core switch enterprise-core
lcagents core switch bmad-core
```
- **Purpose**: Change active core system
- **When**: Need different agent workflows or capabilities
- **Creates**: Backup of previous configuration

#### 8. **Upgrade Core Systems** (Optional)
```bash
lcagents core upgrade bmad-core
```
- **Purpose**: Update core system to latest version
- **When**: New versions available with bug fixes or features

---

### **Phase 3: Resource Access & Management**

#### 9. **List Available Resources**
```bash
# List all agents
lcagents resource list agents

# List all tasks
lcagents resource list tasks

# List all templates
lcagents resource list templates

# Filter by layer
lcagents resource list agents --layer custom
lcagents resource list tasks --layer core
```
- **Purpose**: Discover available resources in the system
- **When**: Exploring what agents/tasks/templates are available

#### 10. **Get Resource Information**
```bash
# Get physical path of a resource
lcagents resource get agents analyst.md
lcagents resource get tasks create-story.md
lcagents resource get templates prd-tmpl.yaml

# Check if resource exists
lcagents resource exists agents pm.md
lcagents resource exists tasks missing-task.md
```
- **Purpose**: Find where resources are physically located
- **When**: Need to reference or edit specific resources

#### 11. **Read Resource Content**
```bash
# Read agent definition
lcagents resource read agents analyst.md

# Read task workflow
lcagents resource read tasks create-story.md

# Read template content
lcagents resource read templates prd-tmpl.yaml
```
- **Purpose**: View content of resources without opening files
- **When**: Quick inspection or copying resource content

---

### **Phase 4: Development & Maintenance**

#### 12. **Validate Configuration** (Development)
```bash
lcagents validate
```
- **Purpose**: Validate agent definitions and configuration
- **When**: After making changes to ensure everything is correct
- **Status**: TODO - Implementation pending

#### 13. **Generate Documentation** (Development)
```bash
# Generate basic documentation
lcagents docs

# Comprehensive documentation to custom path
lcagents docs --output custom-docs/agents.md --comprehensive
```
- **Purpose**: Generate agent system documentation
- **When**: Need updated documentation for team reference
- **Status**: TODO - Implementation pending

#### 14. **System Analysis** (Development)
```bash
# Generate analysis report
lcagents analyze

# Custom report location
lcagents analyze --report reports/system-analysis.md
```
- **Purpose**: Analyze agent system and generate reports
- **When**: Performance analysis or system optimization
- **Status**: TODO - Implementation pending

#### 15. **Update System** (Maintenance)
```bash
lcagents update
```
- **Purpose**: Update to latest version from internal repository
- **When**: New versions available
- **Status**: Auto-update coming in Phase 1B

---

### **Phase 5: Cleanup**

#### 16. **Uninstall** (Final)
```bash
# Standalone uninstaller (Recommended - No prompts)
curl -fsSL https://raw.githubusercontent.com/jmaniLC/lcagents/main/uninstall.js | node -- --force

# NPX uninstaller (Prompts for package download)
npx git+https://github.com/jmaniLC/lcagents.git uninstall --force

# Keep configuration files
npx git+https://github.com/jmaniLC/lcagents.git uninstall --keep-config
```
- **Purpose**: Remove LCAgents from project
- **When**: No longer need LCAgents or switching to different system
- **Removes**: `.lcagents/` directory, GitHub workflows, issue templates

---

## 🔄 **Typical User Workflow**

### **New Project Setup:**
1. `lcagents info` (optional)
2. `npx git+https://github.com/jmaniLC/lcagents.git init`
3. `lcagents core status`
4. `lcagents resource list agents`

### **Daily Usage:**
1. `lcagents resource get agents analyst.md`
2. `lcagents resource read tasks create-story.md`
3. `lcagents core details` (when troubleshooting)

### **System Management:**
1. `lcagents core list`
2. `lcagents core validate-switch <name>`
3. `lcagents core switch <name>`
4. `lcagents core upgrade <name>`

### **Project Cleanup:**
1. `curl -fsSL https://raw.githubusercontent.com/jmaniLC/lcagents/main/uninstall.js | node -- --force`

---

## 📊 **Command Categories**

- **🔧 Setup**: `info`, `init`
- **💾 Core Management**: `core list`, `core status`, `core details`, `core install`, `core switch`, `core validate-switch`, `core upgrade`
- **📁 Resources**: `resource list`, `resource get`, `resource read`, `resource exists`
- **🛠️ Development**: `validate`, `docs`, `analyze`
- **🔄 Maintenance**: `update`
- **🗑️ Cleanup**: `uninstall`

Total: **16 unique commands** with various options and subcommands
