# LCAgents Usage Guide
## LendingClub Internal Agent System

### 🎯 **Getting Started**

Once LCAgents is installed in your project, you can activate and use AI agents to assist with development tasks.

## 🤖 **Agent Activation & Usage**

### **Basic Agent Activation**
```bash
# Activate specific agent for current work
@lcagents activate dev       # Developer agent
@lcagents activate pm        # Product Manager agent  
@lcagents activate qa        # QA Engineer agent
```

### **Agent-Specific Workflows**

#### **🎯 Product Manager Agent**
```bash
@lcagents activate pm

# Available PM commands:
*create-story              # Create user story from requirements
*estimate-effort           # Estimate development effort  
*plan-sprint              # Plan sprint backlog
*review-requirements      # Review and validate requirements
*stakeholder-update       # Generate stakeholder update
```

#### **👨‍💻 Developer Agent**
```bash
@lcagents activate dev

# Available Dev commands:
*implement-feature        # Implement feature from story
*fix-bug                 # Debug and fix issues
*code-review             # Perform code review
*optimize-performance    # Optimize code performance
*write-tests             # Generate unit tests
*document-code           # Generate code documentation
```

#### **🔍 QA Engineer Agent**
```bash
@lcagents activate qa

# Available QA commands:
*create-test-plan        # Create comprehensive test plan
*generate-test-cases     # Generate test cases from requirements  
*validate-feature        # Validate feature implementation
*performance-test        # Create performance test scenarios
*security-review         # Security testing checklist
```

## 📊 **Project Workflows**

### **Feature Development Workflow**
```bash
# Step 1: Product Manager creates story
@lcagents activate pm
*create-story --epic "User Authentication" --priority high

# Step 2: Developer implements feature  
@lcagents activate dev
*implement-feature --story "AUTH-001" --approach tdd

# Step 3: QA validates implementation
@lcagents activate qa
*validate-feature --story "AUTH-001" --test-level integration
```

### **Bug Fix Workflow**
```bash
# Step 1: Developer investigates
@lcagents activate dev
*fix-bug --issue "BUG-123" --analyze-root-cause

# Step 2: QA validates fix
@lcagents activate qa  
*regression-test --bug "BUG-123" --test-scope related-features
```

## 🎛️ **Configuration Management**

### **Team Setup**
```bash
# Configure team members and roles
lcagents config set-team "backend-team" \
  --members "alice,bob,charlie" \
  --roles "dev,qa,devops"

# Set project-specific configuration
lcagents config set-project \
  --name "customer-portal" \
  --type "web-application" \
  --tech-stack "node,react,postgresql"
```

### **GitHub Integration**
```bash
# Enable GitHub Copilot integration
lcagents config enable-github --repo "customer-portal"

# Set up automated workflows  
lcagents config enable-workflows \
  --validation \
  --documentation \
  --quality-gates
```

## 📋 **Agent Templates & Checklists**

### **Available Templates**
```bash
# List all available templates
lcagents templates list

# Generate from template
lcagents templates generate \
  --type "user-story" \
  --template "epic-breakdown" \
  --output "stories/"
```

### **Quality Checklists**
```bash
# Run quality checklist
lcagents checklist run \
  --type "code-review" \
  --scope "src/auth/" 

# Custom checklist for project
lcagents checklist create \
  --name "security-review" \
  --items "auth,encryption,validation,logging"
```

## 🔧 **Advanced Usage**

### **Multi-Agent Coordination**
```bash
# Activate multiple agents for complex tasks
@lcagents activate pm,dev,qa

# Coordinate feature development
*coordinate-feature \
  --story "FEAT-456" \
  --agents "pm,dev,qa" \
  --workflow "agile-development"
```

### **Custom Agent Configuration**
```yaml
# .lcagents/config.yaml
agents:
  dev:
    preferences:
      code_style: "airbnb"
      test_framework: "jest"
      documentation: "jsdoc"
  qa:
    preferences:
      automation_tool: "playwright"
      coverage_threshold: 80
      performance_budget: "3s"
```

## 📊 **Reporting & Analytics**

### **Generate Reports**
```bash
# Team productivity report
lcagents analyze --report productivity \
  --period "last-sprint" \
  --output "reports/sprint-analysis.md"

# Code quality metrics
lcagents analyze --report quality \
  --scope "src/" \
  --format "dashboard"

# Agent usage statistics  
lcagents analyze --report usage \
  --team "backend-team" \
  --export "csv"
```

### **Documentation Generation**
```bash
# Generate comprehensive project docs
lcagents docs --comprehensive \
  --include "agents,workflows,templates" \
  --output "docs/lcagents/"

# API documentation from code
lcagents docs --api \
  --source "src/api/" \
  --format "openapi"
```

## 🚨 **Error Handling & Troubleshooting**

### **Common Issues**
```bash
# Agent not responding
lcagents validate --agent dev
lcagents restart --agent dev

# Configuration problems
lcagents config validate
lcagents config reset --confirm

# GitHub integration issues
lcagents github test-connection
lcagents github reauthorize
```

### **Debug Mode**
```bash
# Enable detailed logging
export LCAGENTS_DEBUG=true
@lcagents activate dev --verbose

# Check system status
lcagents status --detailed

# Validate installation
lcagents validate --full-check
```

## 🎯 **Best Practices**

### **Agent Selection**
- ✅ **Single Focus**: Activate one primary agent per task
- ✅ **Context Switching**: Deactivate when switching contexts  
- ✅ **Team Coordination**: Use multi-agent mode for complex features

### **Documentation**
- ✅ **Document Decisions**: Use `*document-decision` command
- ✅ **Update Templates**: Customize templates for your team
- ✅ **Share Knowledge**: Generate docs after major features

### **Quality Assurance**
- ✅ **Run Checklists**: Use built-in quality checklists
- ✅ **Validate Early**: Run validation after each agent task
- ✅ **Monitor Metrics**: Track agent usage and effectiveness

## 📚 **Learning Resources**

### **Training Materials**
- 🎥 **Video Tutorials**: https://confluence.lendingclub.com/lcagents/videos
- 📖 **Best Practices**: https://confluence.lendingclub.com/lcagents/practices  
- 🛠️ **Workshops**: #engineering-tools for scheduled sessions

### **Reference Guides**
```bash
# Built-in help
lcagents help                    # General help
lcagents help activate          # Command-specific help
lcagents agents list --detailed  # All available agents

# Template reference
lcagents templates --examples    # Template usage examples
lcagents checklists --preview    # Preview all checklists
```

## 🤝 **Team Collaboration**

### **Shared Configuration**
```bash
# Export team configuration
lcagents config export --team backend-team > team-config.yaml

# Import on other projects
lcagents config import team-config.yaml --apply
```

### **Knowledge Sharing**
```bash
# Share successful workflows
lcagents workflows export --successful --period "last-month"

# Create team-specific templates
lcagents templates create --from-example \
  --name "backend-story-template" \
  --share-with "backend-team"
```

---

## 📞 **Need Help?**

**Quick Help**: `lcagents help <command>`  
**Slack**: #engineering-tools  
**Documentation**: https://confluence.lendingclub.com/lcagents  
**Issues**: https://github.com/jmaniLC/lcagents/issues
