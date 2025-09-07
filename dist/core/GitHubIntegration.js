"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIntegration = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class GitHubIntegration {
    constructor(basePath, config) {
        this.basePath = basePath;
        this.config = config;
    }
    /**
     * Initialize GitHub integration for the project
     */
    async initialize() {
        try {
            const tasks = [];
            // Update .gitignore
            tasks.push(this.updateGitIgnore());
            // Create GitHub workflows if enabled
            if (this.config.github?.copilotFeatures) {
                tasks.push(this.createCopilotWorkflows());
            }
            // Create GitHub templates
            tasks.push(this.createGitHubTemplates());
            // Wait for all tasks to complete
            const results = await Promise.all(tasks);
            // Check if any task failed
            const failed = results.find(result => !result.success);
            if (failed) {
                return failed;
            }
            return {
                success: true,
                message: 'GitHub integration initialized successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error initializing GitHub integration: ${error}`
            };
        }
    }
    /**
     * Update or create .gitignore file with LCAgents-specific entries
     */
    async updateGitIgnore() {
        try {
            const gitignorePath = path.join(this.basePath, '.gitignore');
            const lcagentsEntries = [
                {
                    section: '# LCAgents - Agent System Files',
                    pattern: '',
                    comment: 'LCAgents generated and temporary files'
                },
                { pattern: '.lcagents/logs/', comment: 'Agent execution logs' },
                { pattern: '.lcagents/cache/', comment: 'Cached agent data' },
                { pattern: '.lcagents/temp/', comment: 'Temporary files' },
                { pattern: '.lcagents/.env', comment: 'Environment variables' },
                { pattern: '.lcagents/user-settings.yaml', comment: 'User-specific settings' },
                {
                    section: '# Node.js Dependencies',
                    pattern: '',
                    comment: 'Node.js and npm files'
                },
                { pattern: 'node_modules/', comment: 'Dependencies' },
                { pattern: 'npm-debug.log*', comment: 'npm debug logs' },
                { pattern: 'yarn-debug.log*', comment: 'Yarn debug logs' },
                { pattern: 'yarn-error.log*', comment: 'Yarn error logs' },
                { pattern: '.npm', comment: 'npm cache' },
                {
                    section: '# Build and Distribution',
                    pattern: '',
                    comment: 'Generated files and build artifacts'
                },
                { pattern: 'dist/', comment: 'Distribution files' },
                { pattern: 'build/', comment: 'Build output' },
                { pattern: '*.tsbuildinfo', comment: 'TypeScript build info' },
                {
                    section: '# IDE and Editor Files',
                    pattern: '',
                    comment: 'Editor and IDE specific files'
                },
                { pattern: '.vscode/settings.json', comment: 'VS Code user settings' },
                { pattern: '.idea/', comment: 'IntelliJ IDEA files' },
                { pattern: '*.swp', comment: 'Vim swap files' },
                { pattern: '*.swo', comment: 'Vim swap files' },
                { pattern: '*~', comment: 'Backup files' }
            ];
            let existingContent = '';
            if (await fs.pathExists(gitignorePath)) {
                existingContent = await fs.readFile(gitignorePath, 'utf-8');
            }
            // Check if LCAgents section already exists
            if (existingContent.includes('# LCAgents - Agent System Files')) {
                return {
                    success: true,
                    message: '.gitignore already contains LCAgents entries'
                };
            }
            // Add LCAgents entries
            const newEntries = lcagentsEntries
                .map(entry => {
                if (entry.section) {
                    return `\\n${entry.section}`;
                }
                return entry.comment ? `${entry.pattern}  # ${entry.comment}` : entry.pattern;
            })
                .filter(entry => entry.trim() !== '')
                .join('\\n');
            const updatedContent = existingContent.trim() + '\\n\\n' + newEntries + '\\n';
            await fs.writeFile(gitignorePath, updatedContent, 'utf-8');
            return {
                success: true,
                message: 'Updated .gitignore with LCAgents entries'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error updating .gitignore: ${error}`
            };
        }
    }
    /**
     * Create GitHub Copilot workflow files
     */
    async createCopilotWorkflows() {
        try {
            const workflowsDir = path.join(this.basePath, '.github', 'workflows');
            await fs.ensureDir(workflowsDir);
            // Create agent validation workflow
            const validationWorkflow = this.generateValidationWorkflow();
            await fs.writeFile(path.join(workflowsDir, 'lcagents-validation.yml'), validationWorkflow, 'utf-8');
            // Create auto-documentation workflow
            const docsWorkflow = this.generateDocsWorkflow();
            await fs.writeFile(path.join(workflowsDir, 'lcagents-docs.yml'), docsWorkflow, 'utf-8');
            return {
                success: true,
                message: 'Created GitHub Copilot workflows'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error creating Copilot workflows: ${error}`
            };
        }
    }
    /**
     * Create GitHub issue and PR templates
     */
    async createGitHubTemplates() {
        try {
            const templatesDir = path.join(this.basePath, '.github');
            await fs.ensureDir(templatesDir);
            // Create issue templates
            const issueTemplatesDir = path.join(templatesDir, 'ISSUE_TEMPLATE');
            await fs.ensureDir(issueTemplatesDir);
            // Agent request template
            const agentRequestTemplate = this.generateAgentRequestTemplate();
            await fs.writeFile(path.join(issueTemplatesDir, 'agent-request.md'), agentRequestTemplate, 'utf-8');
            // Bug report template
            const bugReportTemplate = this.generateBugReportTemplate();
            await fs.writeFile(path.join(issueTemplatesDir, 'bug-report.md'), bugReportTemplate, 'utf-8');
            // Create PR template
            const prTemplate = this.generatePRTemplate();
            await fs.writeFile(path.join(templatesDir, 'pull_request_template.md'), prTemplate, 'utf-8');
            return {
                success: true,
                message: 'Created GitHub templates'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error creating GitHub templates: ${error}`
            };
        }
    }
    /**
     * Generate validation workflow YAML
     */
    generateValidationWorkflow() {
        return `name: LCAgents Validation

on:
  push:
    branches: [ main, develop ]
    paths:
      - '.lcagents/**'
      - 'package.json'
      - 'tsconfig.json'
  pull_request:
    branches: [ main ]
    paths:
      - '.lcagents/**'
      - 'package.json'
      - 'tsconfig.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate agent definitions
      run: npx lcagents validate
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint code
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Generate agent documentation
      run: npx lcagents docs --output docs/agents.md
    
    - name: Commit updated documentation
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add docs/agents.md
        git diff --staged --quiet || git commit -m "Auto-update agent documentation [skip ci]"
        git push
`;
    }
    /**
     * Generate documentation workflow YAML
     */
    generateDocsWorkflow() {
        return `name: LCAgents Documentation

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  update-docs:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate comprehensive documentation
      run: |
        npx lcagents docs --comprehensive --output docs/
        npx lcagents analyze --report docs/analysis.md
    
    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        token: \${{ secrets.GITHUB_TOKEN }}
        commit-message: 'docs: update LCAgents documentation'
        title: 'Auto-update LCAgents Documentation'
        body: |
          This PR contains automatically generated documentation updates for the LCAgents system.
          
          ## Changes
          - Updated agent documentation
          - Generated system analysis report
          - Refreshed usage examples
          
          Generated by GitHub Actions on \${{ github.run_date }}
        branch: docs/auto-update
        delete-branch: true
`;
    }
    /**
     * Generate agent request issue template
     */
    generateAgentRequestTemplate() {
        return `---
name: Agent Request
about: Request a new agent or agent modification
title: '[AGENT] '
labels: ['agent-request', 'enhancement']
assignees: ''

---

## Agent Request

### Agent Information
- **Agent Name**: 
- **Agent Role**: 
- **Request Type**: [ ] New Agent [ ] Modify Existing [ ] Agent Team

### Description
<!-- Describe the agent's purpose and functionality -->

### Use Cases
<!-- Describe when and how this agent would be used -->
1. 
2. 
3. 

### Required Capabilities
<!-- List the specific capabilities this agent needs -->
- [ ] 
- [ ] 
- [ ] 

### Dependencies
<!-- List any dependencies this agent has -->
- **Tasks**: 
- **Templates**: 
- **Data Sources**: 
- **Other Agents**: 

### Success Criteria
<!-- How will we know this agent is working correctly? -->
- [ ] 
- [ ] 
- [ ] 

### Additional Context
<!-- Add any other context, mockups, or examples -->

`;
    }
    /**
     * Generate bug report issue template
     */
    generateBugReportTemplate() {
        return `---
name: Bug Report
about: Report a bug in the LCAgents system
title: '[BUG] '
labels: ['bug']
assignees: ''

---

## Bug Report

### Describe the Bug
<!-- A clear and concise description of what the bug is -->

### To Reproduce
Steps to reproduce the behavior:
1. 
2. 
3. 
4. 

### Expected Behavior
<!-- A clear and concise description of what you expected to happen -->

### Actual Behavior
<!-- A clear and concise description of what actually happened -->

### Environment
- **OS**: 
- **Node.js Version**: 
- **LCAgents Version**: 
- **Package Manager**: 

### Agent Information
- **Agent Name**: 
- **Command Used**: 
- **Configuration**: 

### Error Messages
<!-- If applicable, paste any error messages here -->
\`\`\`
<!-- Error message here -->
\`\`\`

### Additional Context
<!-- Add any other context about the problem here -->

### Possible Solution
<!-- If you have ideas on how to fix this, please share -->

`;
    }
    /**
     * Generate pull request template
     */
    generatePRTemplate() {
        return `## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🤖 Agent modification (new agent, agent update, or agent removal)
- [ ] 🔧 Configuration change

## Agent Changes
<!-- If this PR involves agent changes, fill out this section -->
- **Agent(s) Modified**: 
- **Commands Added/Modified**: 
- **Dependencies Changed**: 

## Testing
- [ ] Tests pass locally
- [ ] Agent validation passes
- [ ] Manual testing completed
- [ ] Documentation updated

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots
<!-- If applicable, add screenshots to help explain your changes -->

## Additional Notes
<!-- Any additional information that reviewers should know -->
`;
    }
    /**
     * Check if GitHub integration is enabled
     */
    isEnabled() {
        return this.config.github?.integration === true;
    }
    /**
     * Check if Copilot features are enabled
     */
    isCopilotEnabled() {
        return this.config.github?.copilotFeatures === true;
    }
    /**
     * Get repository information
     */
    getRepositoryInfo() {
        const result = {
            branch: this.config.github?.branch || 'main'
        };
        if (this.config.github?.organization) {
            result.organization = this.config.github.organization;
        }
        if (this.config.github?.repository) {
            result.repository = this.config.github.repository;
        }
        return result;
    }
}
exports.GitHubIntegration = GitHubIntegration;
//# sourceMappingURL=GitHubIntegration.js.map