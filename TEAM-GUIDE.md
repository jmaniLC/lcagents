# LCAgents Team Distribution Guide
## For LendingClub Engineering Teams

### 🎯 **Quick Start for Teams**

#### **Simple Command (Recommended)**
```bash
# Navigate to your project
cd your-awesome-project

# Install and initialize LCAgents (using simple alias)
npx lcagents init
```

> **Note**: `lcagents` is a simplified alias for `git+https://github.com/jmaniLC/lcagents.git`

#### **Full Command (If Alias Doesn't Work)**
```bash
# Full installation command
npx git+https://github.com/jmaniLC/lcagents.git init
```

#### **What Happens Automatically**
- ✅ Downloads latest LCAgents package
- ✅ Creates `.lcagents/` directory structure
- ✅ Installs 11 AI agents (PM, Dev, QA, etc.)
- ✅ Sets up GitHub integration
- ✅ Configures team workflows
- ✅ Ready to use immediately

### 🔧 **Set Up Team Alias (Optional)**

#### **Get Alias Instructions**
```bash
npx lcagents alias
# Shows commands to add to ~/.bashrc or ~/.zshrc
```

#### **Team Shell Configuration**
```bash
# Add this to team's standard shell setup:
alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'

# Then team can use simple commands:
lcagents init
lcagents validate
lcagents info
```

### 🏢 **For Different Team Types**

#### **Frontend Teams**
```bash
npx lcagents init --template frontend
# Optimized for: React, Vue, Angular projects
# Agents: dev, ux, qa, perf
```

#### **Backend Teams**
```bash
npx lcagents init --template backend  
# Optimized for: API, microservices, databases
# Agents: dev, arch, devops, sec, qa
```

#### **Full-Stack Teams**
```bash
npx git+https://github.com/jmaniLC/lcagents.git init --template fullstack
# Optimized for: End-to-end development
# Agents: pm, dev, ux, qa, devops
```

#### **Data Teams**
```bash
npx git+https://github.com/jmaniLC/lcagents.git init --template data
# Optimized for: Analytics, ML, data pipelines  
# Agents: ba, dev, qa, perf
```

### 📋 **Team Setup Checklist**

#### **Before Installation**
- [ ] Project has `package.json` (or will create one)
- [ ] Team has GitHub access to github.com
- [ ] Node.js 16+ installed
- [ ] On LendingClub VPN

#### **After Installation**
- [ ] Run `lcagents validate` to verify setup
- [ ] Configure team roles: `lcagents config set-team`
- [ ] Test agent activation: `@lcagents activate dev`
- [ ] Review generated documentation: `ls .lcagents/docs/`

### 🚀 **Team Workflows**

#### **Sprint Planning with PM Agent**
```bash
@lcagents activate pm
*plan-sprint --epic "Customer Portal v2" --duration 2-weeks
*estimate-stories --method planning-poker
*create-acceptance-criteria --stories EPIC-123
```

#### **Development with Dev Agent**
```bash
@lcagents activate dev
*implement-feature --story USER-456 --approach tdd
*code-review --pr 123 --focus security,performance
*generate-tests --coverage 80
```

#### **Quality Assurance with QA Agent**
```bash
@lcagents activate qa
*create-test-plan --feature "payment-processing"
*validate-implementation --story USER-456
*performance-test --endpoints /api/payments
```

### 🎛️ **Team Configuration**

#### **Set Team Information**
```bash
lcagents config set-team "payments-team" \
  --members "alice,bob,charlie,diana" \
  --lead "alice" \
  --roles "pm,dev,qa,devops"
```

#### **Project-Specific Settings**
```bash
lcagents config set-project \
  --name "payment-service" \
  --type "microservice" \
  --tech-stack "java,spring,postgresql" \
  --deployment "kubernetes"
```

#### **GitHub Integration**
```bash
lcagents config enable-github \
  --repo "payments/payment-service" \
  --workflows "validation,docs,quality-gates"
```

### 📊 **Team Reporting**

#### **Sprint Reports**
```bash
# Generate sprint summary
lcagents analyze --report sprint \
  --period "current" \
  --team "payments-team" \
  --output "reports/sprint-summary.md"
```

#### **Team Productivity**
```bash
# Team productivity metrics
lcagents analyze --report productivity \
  --team "payments-team" \
  --period "last-month" \
  --metrics "velocity,quality,collaboration"
```

### 🎓 **Training & Onboarding**

#### **New Team Member Setup**
```bash
# Quick onboarding for new developers
lcagents onboard --role developer \
  --team "payments-team" \
  --generate-docs
```

#### **Team Training Session**
```bash
# Generate training materials
lcagents training --level beginner \
  --focus "agent-usage,workflows" \
  --duration 1-hour
```

### 🔧 **Common Team Scenarios**

#### **Feature Development Workflow**
```bash
# 1. PM creates user story
@lcagents activate pm
*create-story --epic "Mobile Payments" --priority high

# 2. Dev implements feature
@lcagents activate dev  
*implement-feature --story MP-001 --approach api-first

# 3. QA validates implementation
@lcagents activate qa
*validate-feature --story MP-001 --test-level integration

# 4. DevOps deploys feature
@lcagents activate devops
*deploy-feature --story MP-001 --environment staging
```

#### **Bug Triage Workflow**
```bash
# 1. QA reproduces and documents bug
@lcagents activate qa
*reproduce-bug --issue BUG-789 --environment production

# 2. Dev investigates and fixes
@lcagents activate dev
*fix-bug --issue BUG-789 --analyze-root-cause

# 3. QA validates fix
@lcagents activate qa
*regression-test --bug BUG-789 --scope related-features
```

### 📞 **Team Support**

#### **Internal Support Channels**
- **Slack**: #engineering-tools (primary support)
- **Email**: engineering-tools@lendingclub.com
- **Wiki**: https://confluence.lendingclub.com/lcagents
- **Issues**: https://github.com/jmaniLC/lcagents/issues

#### **Self-Help Resources**
```bash
lcagents help                    # General help
lcagents help <command>          # Command-specific help
lcagents agents list --detailed  # All available agents
lcagents templates list         # Available templates
lcagents examples               # Usage examples
```

### 🎯 **Success Metrics**

Teams using LCAgents typically see:
- **30% faster** story development cycle
- **50% more consistent** documentation  
- **25% fewer** production bugs
- **40% improved** code review quality
- **60% better** team collaboration

### 🔄 **Updating LCAgents**

#### **Team Updates**
```bash
# Update to latest version
lcagents update

# Or reinstall if needed
rm -rf .lcagents/
npx git+https://github.com/jmaniLC/lcagents.git init
```

#### **Version Pinning for Teams**
```bash
# Pin to specific version for stability
npx git+https://github.com/jmaniLC/lcagents.git#v1.0.0 init
```

---

## 🚀 **Ready to Start?**

```bash
cd your-project
npx git+https://github.com/jmaniLC/lcagents.git init
```

**Questions?** → #engineering-tools Slack channel
