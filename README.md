# LCAgents - LendingClub AI Development Agents
### Internal Engineering Tool for AI-Powered Development

> **🏢 LendingClub Internal Use Only**  
> This tool is designed specifically for LendingClub engineering teams.

## 🚀 Quick Start

### Simple Installation
```bash
# One command to get started
npx lcagents init
```

### What You Get
- **11 AI Agents**: PM, Dev, QA, DevOps, Architect, Security, UX, Data, ML, Docs, Support
- **GitHub Integration**: Seamless workflow automation
- **BMAD-Core Compatible**: Integrates with existing LC development processes
- **Team Templates**: Frontend, Backend, Full-Stack configurations

## 📦 Installation Options

### Option 1: Direct NPX (Recommended)
```bash
# Initialize in your project
npx lcagents init

# Validate setup
npx lcagents validate

# Get information
npx lcagents info
```

### Option 2: Shell Alias Setup
```bash
# Get alias instructions
npx git+https://github.com/jmaniLC/lcagents.git alias

# Add to ~/.bashrc or ~/.zshrc:
alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'

# Then use simplified commands
lcagents init
lcagents validate
```

### Option 3: Global Installation
```bash
# Install globally
npm install -g git+https://github.com/jmaniLC/lcagents.git

# Use anywhere
lcagents init
```

## 📚 Documentation

- **[Installation Guide](INSTALL.md)** - Complete installation instructions
- **[Usage Guide](USAGE.md)** - How to use LCAgents effectively  
- **[Team Guide](TEAM-GUIDE.md)** - Team rollout and management
- **[Distribution Guide](DISTRIBUTION-READY.md)** - Internal deployment info

## 🏢 LendingClub Integration

### Repository Configuration
All URLs and configurations are externalized in `config/repository.json`:
```json
{
  "repository": {
    "url": "https://github.com/jmaniLC/lcagents.git",
    "shortName": "lcagents"
  },
  "author": {
    "name": "Jayakrishnan Mani",
    "email": "jayakrishnan.mani@lendingclub.com"
  },
  "organization": "LendingClub"
}
```

### Team Support
- **Slack**: #engineering-tools channel
- **Confluence**: [LCAgents Documentation](https://confluence.lendingclub.com/lcagents)
- **Issues**: [GitHub Issues](https://github.com/jmaniLC/lcagents/issues)

## 🔧 Development

### Prerequisites
- Node.js 18+
- NPM 8+
- Git access to LendingClub repositories

### Local Development
```bash
# Clone repository
git clone https://github.com/jmaniLC/lcagents.git
cd lcagents

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## 📄 License

**UNLICENSED** - Internal LendingClub use only.

---

**Author**: Jayakrishnan Mani  
**Organization**: LendingClub Engineering  
**Version**: 1.0.0-alpha.1
