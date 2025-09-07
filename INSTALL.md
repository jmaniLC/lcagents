# LCAgents Installation Guide
## LendingClub Internal Agent System

### 🏢 **For LendingClub Engineering Teams Only**

LCAgents is an internal tool that provides AI-powered development agents integrated with GitHub Copilot and BMAD-Core workflows.

## 📦 **Quick Start (Recommended)**

### **Simple Command (Using Alias)**
```bash
# Initialize in your project (one simple command)
npx lcagents init

# Other commands
npx lcagents validate
npx lcagents info
```

> **Note**: `lcagents` is an alias that resolves to `git+https://github.com/jmaniLC/lcagents.git`

### **Setup Shell Alias (Optional)**
```bash
# Get the alias command
npx git+https://github.com/jmaniLC/lcagents.git alias

# Add to your ~/.bashrc or ~/.zshrc:
alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'

# Then use simplified commands
lcagents init
lcagents validate
```

## 📦 **Installation Methods**

### **Method 1: Direct NPX (Most Common)**
```bash
# Full command (if alias not working)
npx git+https://github.com/jmaniLC/lcagents.git init

# For projects that already have lcagents
npx git+https://github.com/jmaniLC/lcagents.git validate
```

### **Method 2: Global Installation**
```bash
# Install globally for repeated use
npm install -g git+https://github.com/jmaniLC/lcagents.git

# Use anywhere
cd your-project
lcagents init
```
```bash
# Add to project dependencies
npm install --save-dev git+https://github.com/jmaniLC/lcagents.git

# Use via npm scripts
npx lcagents init
```

## 🚀 **Quick Start**

### **Initialize LCAgents in Your Project**
```bash
cd your-project-directory
npx git+https://github.com/jmaniLC/lcagents.git init
```

**What this does:**
- ✅ Creates `.lcagents/` directory with all agent definitions
- ✅ Sets up GitHub integration and workflows
- ✅ Configures team roles and permissions
- ✅ Installs 11 AI agents ready for use

### **Verify Installation**
```bash
lcagents info
lcagents validate
```

## 🤖 **Available Agents**

After installation, these agents are available:

- **🎯 Product Manager (pm)**: Requirements, user stories, planning
- **👨‍💻 Developer (dev)**: Code implementation, architecture, debugging  
- **🔍 QA Engineer (qa)**: Testing, quality assurance, validation
- **🏗️ DevOps Engineer (devops)**: Infrastructure, deployment, monitoring
- **📊 Business Analyst (ba)**: Data analysis, requirements gathering
- **🎨 UI/UX Designer (ux)**: Interface design, user experience
- **📚 Technical Writer (tw)**: Documentation, guides, specifications
- **🔐 Security Engineer (sec)**: Security review, vulnerability assessment
- **⚡ Performance Engineer (perf)**: Optimization, load testing
- **📋 Scrum Master (sm)**: Process management, team coordination
- **🏛️ Architect (arch)**: System design, technical strategy

## 💼 **Team Usage**

### **Individual Developer**
```bash
# Activate specific agent for current task
@lcagents activate dev
# Agent assists with coding tasks in GitHub Copilot

@lcagents activate qa  
# Agent helps with testing and quality checks
```

### **Project Team**
```bash
# Configure team roles
lcagents config set-team "frontend-team" --members "john,jane,bob"
lcagents config set-roles --frontend-team "dev,ux,qa"

# Generate project documentation
lcagents docs --comprehensive --output docs/
```

## 🔧 **Commands Reference**

### **Core Commands**
```bash
lcagents init              # Initialize in current directory
lcagents validate          # Validate agent definitions  
lcagents docs             # Generate documentation
lcagents analyze          # System analysis and reports
lcagents info             # Show installation information
lcagents update           # Update to latest version
```

### **Configuration**
```bash
lcagents config show                    # Show current configuration
lcagents config set-team <name>         # Set team configuration
lcagents config enable-github           # Enable GitHub integration
lcagents config disable-github          # Disable GitHub integration
```

## 🆘 **Support & Help**

### **Documentation**
- 📚 **Confluence**: https://confluence.lendingclub.com/lcagents
- 📖 **Usage Guide**: Run `lcagents docs` for detailed usage

### **Support Channels**
- 💬 **Slack**: #engineering-tools channel
- 🎫 **Issues**: https://github.com/jmaniLC/lcagents/issues
- 📧 **Team**: engineering-tools@lendingclub.com

### **Troubleshooting**
```bash
# Common issues
lcagents validate          # Check for configuration problems
lcagents info             # Verify installation details

# Reset installation
rm -rf .lcagents/
lcagents init --force
```

## 🔒 **Security & Access**

- ✅ **Internal Only**: Only accessible to LendingClub employees
- ✅ **VPN Required**: Must be on LendingClub network
- ✅ **GitHub SSO**: Uses LendingClub GitHub authentication
- ✅ **Audit Trail**: All usage logged for compliance

## 📋 **Requirements**

- **Node.js**: 16.0.0 or higher
- **NPM**: 7.0.0 or higher  
- **Git**: Access to github.com
- **Network**: LendingClub VPN connection
- **Permissions**: Member of LendingClub Engineering organization

## 🔄 **Updates & Versioning**

```bash
# Check current version
lcagents --version

# Update to latest
lcagents update

# Or reinstall globally
npm install -g git+https://github.com/jmaniLC/lcagents.git
```

---

## 📞 **Need Help?**

**Slack**: #engineering-tools  
**Email**: engineering-tools@lendingclub.com  
**Wiki**: https://confluence.lendingclub.com/lcagents
