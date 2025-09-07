# LCAgents (LendingClub Agents) Architecture Specification

## Overview

LCAgents is a **role-based AI agent orchestration framework** that provides specialized personas for different team roles (PM, Developer, QA, Architect, etc.) with standardized workflows and templates. The system is designed to work with GitHub Copilot across all supported IDEs.

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- Git repository (existing or new)

### Installation

```bash
# Navigate to your project directory
cd your-project-directory

# Install LCAgents (one-time setup)
npx @lendingclub/lcagents init
```

This creates the following structure in your repository:
```
your-project/
├── .github/                 # GitHub configuration
│   └── copilot-instructions.md  # GitHub Copilot behavior instructions
├── .lcagents/               # Agent configurations and runtime resources
│   ├── docs/               # All LCAgents generated documents (PRDs, stories, etc.)
│   ├── agents/             # Agent markdown files (complete BMAD-Core agent set)
│   │   ├── pm.md           # Product Manager agent
│   │   ├── dev.md          # Developer agent
│   │   ├── qa.md           # QA Engineer agent
│   │   ├── architect.md    # Architect agent
│   │   ├── analyst.md      # Business Analyst agent
│   │   ├── em.md           # Engineering Manager agent
│   │   ├── po.md           # Product Owner agent
│   │   ├── sm.md           # Scrum Master agent
│   │   ├── ux-expert.md    # UX Expert agent
│   │   ├── bmad-master.md  # Universal agent
│   │   └── bmad-orchestrator.md # Orchestration agent
│   ├── agent-teams/        # Pre-configured agent team bundles
│   │   ├── team-all.yaml   # All agents bundle
│   │   ├── team-fullstack.yaml # Full-stack development team
│   │   ├── team-ide-minimal.yaml # Minimal IDE team
│   │   └── team-no-ui.yaml # Backend-focused team
│   ├── templates/          # All BMAD-Core compatible templates
│   │   ├── architecture-tmpl.yaml
│   │   ├── brownfield-architecture-tmpl.yaml
│   │   ├── brownfield-prd-tmpl.yaml
│   │   ├── competitor-analysis-tmpl.yaml
│   │   ├── front-end-architecture-tmpl.yaml
│   │   ├── front-end-spec-tmpl.yaml
│   │   ├── fullstack-architecture-tmpl.yaml
│   │   ├── market-research-tmpl.yaml
│   │   ├── prd-tmpl.yaml
│   │   ├── project-brief-tmpl.yaml
│   │   ├── qa-gate-tmpl.yaml
│   │   ├── story-tmpl.yaml
│   │   └── brainstorming-output-tmpl.yaml
│   ├── tasks/              # All executable task workflows
│   │   ├── advanced-elicitation.md
│   │   ├── apply-qa-fixes.md
│   │   ├── brownfield-create-epic.md
│   │   ├── brownfield-create-story.md
│   │   ├── correct-course.md
│   │   ├── create-brownfield-story.md
│   │   ├── create-deep-research-prompt.md
│   │   ├── create-doc.md
│   │   ├── create-next-story.md
│   │   ├── document-project.md
│   │   ├── execute-checklist.md
│   │   ├── facilitate-brainstorming-session.md
│   │   ├── generate-ai-frontend-prompt.md
│   │   ├── index-docs.md
│   │   ├── kb-mode-interaction.md
│   │   ├── nfr-assess.md
│   │   ├── qa-gate.md
│   │   ├── review-story.md
│   │   ├── risk-profile.md
│   │   ├── shard-doc.md
│   │   ├── test-design.md
│   │   ├── trace-requirements.md
│   │   └── validate-next-story.md
│   ├── checklists/         # Validation checklists
│   │   ├── architect-checklist.md
│   │   ├── change-checklist.md
│   │   ├── pm-checklist.md
│   │   ├── po-master-checklist.md
│   │   ├── story-dod-checklist.md
│   │   └── story-draft-checklist.md
│   ├── data/               # Agent context and knowledge base files
│   │   ├── bmad-kb.md      # Complete BMAD knowledge base
│   │   ├── brainstorming-techniques.md
│   │   ├── elicitation-methods.md
│   │   ├── technical-preferences.md
│   │   ├── test-levels-framework.md
│   │   └── test-priorities-matrix.md
│   ├── utils/              # Utility files and documentation
│   │   ├── bmad-doc-template.md
│   │   └── workflow-management.md
│   ├── workflows/          # Process definitions and workflow files
│   │   ├── brownfield-fullstack.yaml
│   │   ├── brownfield-service.yaml
│   │   ├── brownfield-ui.yaml
│   │   ├── greenfield-fullstack.yaml
│   │   ├── greenfield-service.yaml
│   │   └── greenfield-ui.yaml
│   └── config/             # Settings and standards
│       ├── team-roles.yaml # Role-based access configuration
│       └── core-config.yaml # Core project configuration
│   ├── workflows/          # Process definitions
│   └── config/             # Settings and standards
│       └── team-roles.yaml # Role-based access configuration
├── .lcagents-config.json   # Project configuration
├── README-lcagents.md      # Quick start guide
└── .gitignore              # Updated with LCAgents entries
```

**Important**: During installation, LCAgents automatically creates a `.github/copilot-instructions.md` file with standard GitHub Copilot behavior instructions. This file configures GitHub Copilot to work optimally with LCAgents workflows and should be committed to your repository.

**Note**: All LCAgents files are automatically added to `.gitignore` during installation since they are runtime/tooling files and should not be version controlled. All documents generated by LCAgents (PRDs, stories, reports, etc.) are strictly created under `.lcagents/docs/` directory. However, the `.github/copilot-instructions.md` file should be committed as it contains project-specific GitHub Copilot configuration.

### Uninstallation

```bash
# Remove LCAgents from your project
npx @lendingclub/lcagents uninstall

# Or manually remove the files and clean .gitignore
rm -rf .lcagents .lcagents-config.json README-lcagents.md
# Then manually remove LCAgents entries from .gitignore:
# .lcagents/
# .lcagents-config.json
# README-lcagents.md
```

**Note**: The automated uninstall command removes all LCAgents files and cleans up the `.gitignore` entries automatically.

### Basic Usage

```bash
# Activate an agent (within GitHub Copilot Chat)
@lcagents activate pm          # Product Manager
@lcagents activate dev         # Developer  
@lcagents activate qa          # QA Engineer
@lcagents activate em          # Engineering Manager

# Get help for current agent
@lcagents help

# Check status
@lcagents status
```

## Roles and Commands Summary

### Core Commands (Available to All Agents)
- `*help` - Show available commands for the current agent
- `*status` - Display current context, progress, and agent state
- `*exit` - Deactivate current agent and return to system mode
- `*context` - Show current project context and workflow state

### System Commands (Available at Top Level)
- `@lcagents init` - Install LCAgents in the current project directory
- `@lcagents uninstall` - Remove LCAgents from project and clean up files
- `@lcagents activate <agent>` - Switch to specific agent (pm, dev, qa, em, architect)
- `@lcagents status` - Show overall system status and active agent
- `@lcagents help [agent]` - Show help for specific agent or general help

### Role-Specific Commands

**Note**: For detailed role-specific commands, please refer to the individual agent configuration files in the `.lcagents/agents/` directory or activate the desired agent and type `*help` to list all available commands for that role.

#### Available Roles:
- **Product Manager (pm)** - PRD creation, feature prioritization, functional story backlog management
- **Developer (dev)** - Story implementation, code quality, technical story creation  
- **QA Engineer (qa)** - Test architecture, quality gates, test story creation
- **Engineering Manager (em)** - Team coordination, resource planning, cross-project oversight
- **Architect (architect)** - Technical analysis, POC development, spike stories

### Agent Activation Quick Reference

```bash
@lcagents activate pm          # Product Manager - for PRDs and functional stories
@lcagents activate dev         # Developer - for implementation and technical stories
@lcagents activate qa          # QA Engineer - for testing and quality assurance
@lcagents activate em          # Engineering Manager - for team coordination
@lcagents activate architect   # Architect - for spikes and technical analysis
```

### Command Usage Pattern

1. **Activate Agent**: `@lcagents activate <role>`
2. **Get Help**: `*help` (shows role-specific commands)
3. **Execute Commands**: `*<command-name>` (with project ID when creating documents)
4. **Check Status**: `*status` (view current progress)
5. **Switch Roles**: `@lcagents activate <different-role>`

**Note**: All document creation commands require a **Project ID** (Jira Issue ID like ABC-1234, Ground Control ID like GC-5678, or Project ID like PROJ-9999) and documents are created under `.lcagents/docs/{PROJECT_ID}/` directory structure.

## User Authentication and Role-Based Access Control (RBAC)

### User Role Determination

LCAgents implements GitHub-based authentication to determine user roles and grant appropriate access within the GitHub Copilot environment:

#### 1. User Identity Resolution
```typescript
interface UserIdentity {
  githubId: string;              // GitHub username
  email: string;                 // GitHub email
  name: string;                  // Display name from GitHub
  orgMembership: string[];       // GitHub organization memberships
  roles: UserRole[];             // Assigned LCAgents roles
}

enum UserRole {
  PRODUCT_MANAGER = "pm",
  DEVELOPER = "dev",
  QA_ENGINEER = "qa", 
  ENGINEERING_MANAGER = "em",
  ARCHITECT = "architect",
  ADMIN = "admin"
}
```

#### 2. GitHub Copilot Integration
```typescript
class GitHubAuthenticator {
  async resolveUser(): Promise<UserIdentity> {
    // Get current GitHub Copilot user
    const copilotUser = await copilotAPI.getCurrentUser();
    
    // Verify organization membership
    const orgMembership = await this.verifyOrgMembership(copilotUser.login);
    
    if (!orgMembership.includes('lendingclub')) {
      throw new Error('User is not a member of the LendingClub GitHub organization');
    }
    
    return {
      githubId: copilotUser.login,
      email: copilotUser.email,
      name: copilotUser.name,
      orgMembership: orgMembership,
      roles: await this.resolveUserRoles(copilotUser.login)
    };
  }
  
  private async verifyOrgMembership(githubId: string): Promise<string[]> {
    // Verify user is member of GitHub organization
    const response = await githubAPI.users.listPublicOrgsForUser({ username: githubId });
    return response.data.map(org => org.login);
  }
}
```

#### 3. Team Configuration with GitHub IDs
```yaml
# .lcagents/config/team-roles.yaml
team:
  name: "Your Team Name"
  github_org: "lendingclub"  # Required GitHub organization
  roles:
    product_managers:
      - "john-doe"           # GitHub username
      - "jane-smith"         # GitHub username
    developers:
      - "dev-user1" 
      - "dev-user2"
    qa_engineers:
      - "qa-engineer1"
      - "qa-engineer2"
    engineering_managers:
      - "eng-manager1"

# Organization-wide roles (optional)
organization:
  admins:
    - "org-admin"
  architects:
    - "tech-architect"
```

#### 4. Role Resolution Process
```typescript
class RoleResolver {
  async resolveUserRoles(githubId: string): Promise<UserRole[]> {
    const roles: UserRole[] = [];
    const teamConfig = await this.loadTeamConfig();
    
    // Check explicit role assignments
    if (teamConfig.roles.product_managers?.includes(githubId)) {
      roles.push(UserRole.PRODUCT_MANAGER);
    }
    
    if (teamConfig.roles.developers?.includes(githubId)) {
      roles.push(UserRole.DEVELOPER);
    }
    
    if (teamConfig.roles.qa_engineers?.includes(githubId)) {
      roles.push(UserRole.QA_ENGINEER);
    }
    
    if (teamConfig.roles.engineering_managers?.includes(githubId)) {
      roles.push(UserRole.ENGINEERING_MANAGER);
    }
    
    // Check organization-wide roles
    if (teamConfig.organization?.admins?.includes(githubId)) {
      roles.push(UserRole.ADMIN);
    }
    
    // Default fallback based on GitHub repository permissions
    if (roles.length === 0) {
      const repoPermissions = await this.getRepositoryPermissions(githubId);
      if (repoPermissions === 'write' || repoPermissions === 'admin') {
        roles.push(UserRole.DEVELOPER); // Default role for contributors
      }
    }
    
    return roles;
  }
}
```

### Access Control Implementation

#### 1. Agent Access Control
```typescript
class AgentAccessControl {
  async canActivateAgent(user: UserIdentity, agentId: string): Promise<boolean> {
    const userRoles = user.roles;
    const requiredRole = this.getRequiredRole(agentId);
    
    // Check direct role match
    if (userRoles.includes(requiredRole)) {
      return true;
    }
    
    // Check admin override
    if (userRoles.includes(UserRole.ADMIN)) {
      return true;
    }
    
    // Check cross-functional permissions
    return await this.checkCrossFunctionalAccess(user, agentId);
  }
  
  private async checkCrossFunctionalAccess(
    user: UserIdentity, 
    agentId: string
  ): Promise<boolean> {
    // Allow developers to use QA agent for testing
    if (agentId === 'qa' && user.roles.includes(UserRole.DEVELOPER)) {
      return true;
    }
    
    // Allow PMs to use EM agent
    if (agentId === 'em' && user.roles.includes(UserRole.PRODUCT_MANAGER)) {
      return true;
    }
    
    return false;
  }
}
```

#### 2. File Permission Control
```typescript
interface FilePermissionConfig {
  role: UserRole;
  permissions: {
    read: string[];      // File patterns user can read
    write: string[];     // File patterns user can write
    sections: {          // Specific sections within files
      [filePath: string]: {
        read: string[];
        write: string[];
      };
    };
  };
}

const ROLE_PERMISSIONS: FilePermissionConfig[] = [
  {
    role: UserRole.PRODUCT_MANAGER,
    permissions: {
      read: ['**/*.md', 'package.json', '.lcagents/**/*'],
      write: ['.lcagents/docs/**/*.md'],  // Only write to docs folder
      sections: {
        '.lcagents/docs/story.md': {
          read: ['*'],
          write: ['## Requirements', '## Acceptance Criteria', '## Business Value']
        }
      }
    }
  },
  {
    role: UserRole.DEVELOPER,
    permissions: {
      read: ['**/*'],
      write: ['src/**/*', 'tests/**/*', '*.js', '*.ts', '*.json', '.lcagents/docs/**/*.md'],
      sections: {
        '.lcagents/docs/story.md': {
          read: ['*'],
          write: ['## Tasks', '## Implementation Notes', '## Technical Details']
        }
      }
    }
  },
  {
    role: UserRole.QA_ENGINEER,
    permissions: {
      read: ['**/*'],
      write: ['tests/**/*', '.lcagents/docs/testing/**/*', '.lcagents/docs/quality-gates/**/*'],
      sections: {
        '.lcagents/docs/story.md': {
          read: ['*'],
          write: ['## Test Cases', '## Quality Gates', '## Bug Reports']
        }
      }
    }
  }
];
```

### Runtime Authorization

#### 1. Command Authorization
```typescript
class CommandAuthorizer {
  async authorizeCommand(
    user: UserIdentity, 
    agent: Agent, 
    command: string
  ): Promise<AuthorizationResult> {
    
    // 1. Check if user can access the agent
    const canAccessAgent = await this.accessControl.canActivateAgent(user, agent.id);
    if (!canAccessAgent) {
      return {
        allowed: false,
        reason: `User ${user.email} cannot access ${agent.name} agent`
      };
    }
    
    // 2. Check command-specific permissions
    const commandPermissions = await this.getCommandPermissions(command);
    const hasCommandAccess = await this.checkCommandAccess(user, commandPermissions);
    
    if (!hasCommandAccess) {
      return {
        allowed: false,
        reason: `Insufficient permissions for command: ${command}`
      };
    }
    
    return { allowed: true };
  }
}
```

#### 2. File Operation Authorization
```typescript
class FileAccessGuard {
  async checkFileAccess(
    user: UserIdentity, 
    operation: 'read' | 'write',
    filePath: string,
    section?: string
  ): Promise<boolean> {
    
    const userPermissions = this.getUserPermissions(user);
    
    // Check file-level permissions
    const hasFileAccess = this.matchesPattern(
      filePath, 
      userPermissions[operation]
    );
    
    if (!hasFileAccess) {
      return false;
    }
    
    // Check section-level permissions if specified
    if (section) {
      return this.checkSectionAccess(user, filePath, section, operation);
    }
    
    return true;
  }
}
```

### Setup and Configuration

#### 1. Initial Setup Commands
```bash
# Configure team roles (admin only)
npx @lendingclub/lcagents config team --file team-roles.yaml

# Verify current user permissions
@lcagents whoami
@lcagents permissions

# Test agent access
@lcagents test-access pm
@lcagents test-access dev
```

#### 2. GitHub Copilot Integration
```typescript
class GitHubCopilotIntegration {
  async initializeUserContext(): Promise<void> {
    // Get GitHub Copilot user context
    const copilotUser = await copilotAPI.getCurrentUser();
    
    // Verify organization membership
    const isOrgMember = await this.verifyOrgMembership(copilotUser.login, 'lendingclub');
    
    if (!isOrgMember) {
      throw new Error('Access denied: User is not a member of LendingClub GitHub organization');
    }
    
    // Resolve user roles from team configuration
    const userIdentity = await this.resolveUserIdentity(copilotUser.login);
    
    // Initialize LCAgents with user context
    await lcagents.initialize(userIdentity);
  }
}
```

#### 3. Example User Experience in GitHub Copilot Chat
```typescript
// When user types: @lcagents activate pm
class CopilotUserWorkflow {
  async activateAgent(agentId: string): Promise<void> {
    // 1. Get GitHub user from Copilot
    const copilotUser = await copilotAPI.getCurrentUser();
    console.log(`Identified GitHub user: ${copilotUser.name} (@${copilotUser.login})`);
    
    // 2. Verify organization membership
    const isOrgMember = await this.verifyOrgMembership(copilotUser.login);
    if (!isOrgMember) {
      console.log(`❌ Access denied: @${copilotUser.login} is not a member of LendingClub GitHub organization`);
      return;
    }
    
    // 3. Check role permissions
    const userRoles = await this.resolveUserRoles(copilotUser.login);
    const canAccess = await this.accessControl.canActivateAgent(userRoles, agentId);
    
    if (!canAccess) {
      console.log(`❌ Access denied: @${copilotUser.login} doesn't have permission to use the ${agentId} agent.`);
      console.log(`Your current roles: ${userRoles.join(', ')}`);
      console.log(`Contact your team admin to add your GitHub ID to the appropriate role in team-roles.yaml`);
      return;
    }
    
    // 4. Activate with user context
    console.log(`✅ Activating ${agentId} agent for @${copilotUser.login}`);
    await this.agentManager.activate(agentId, { githubId: copilotUser.login, roles: userRoles });
  }
}
```

This RBAC system ensures that:

1. **GitHub-Based Identity**: Automatically determines user from GitHub Copilot integration
2. **Organization Verification**: Ensures only LendingClub GitHub organization members can access
3. **Role-Based Access**: Grants access only to appropriate agents based on GitHub ID
4. **File Permissions**: Controls what files and sections users can modify
5. **Audit Trail**: Tracks all actions with GitHub user attribution
6. **Simple Configuration**: Team admins just add GitHub usernames to role lists

## Document Generation Policy

### Strict Directory Structure with Project Identification

**All LCAgents-generated documents MUST be created under `.lcagents/docs/` directory and organized by project identifier.**

#### Project-Based Document Organization

Documents are organized under specific project identifiers (Jira Issue ID, Ground Control ID, or Project ID):

```
.lcagents/docs/
├── ABC-1234/                   # Jira Issue ID (ABC is project key)
│   ├── prd/
│   │   └── feature-x-prd.md
│   ├── stories/
│   │   ├── story-001.md
│   │   └── story-002.md
│   ├── reports/
│   │   └── quality-gate-report.md
│   └── testing/
│       └── test-plan.md
├── GC-5678/                    # Ground Control ID
│   ├── prd/
│   │   └── discovery-prd.md
│   ├── architecture/
│   │   └── design-doc.md
│   └── reports/
│       └── analysis-report.md
├── PROJ-9999/                  # Project ID
│   ├── stories/
│   │   └── epic-001.md
│   ├── testing/
│   │   └── test-results.md
│   └── reports/
│       └── sprint-summary.md
└── templates/                  # Shared templates (not project-specific)
    ├── prd-template.md
    ├── story-template.md
    └── test-plan-template.md
```

#### Project Identifier Requirements

1. **Discovery Work**: Must use Ground Control ID (format: `GC-XXXX`)
2. **Execution Work**: Must use Jira Issue ID (format: `PROJECT_KEY-XXXX` where PROJECT_KEY is the Jira project identifier)
3. **General Projects**: Must use Project ID (format: `PROJ-XXXX` or team-defined format)
4. **No Documents Without ID**: No documents can be created without a valid project identifier

#### Implementation Rules with Project ID Enforcement
```typescript
class DocumentManager {
  private readonly DOCS_BASE_PATH = '.lcagents/docs/';
  
  async createDocument(
    agent: Agent,
    documentType: DocumentType,
    fileName: string,
    content: string,
    projectId?: string
  ): Promise<string> {
    // 1. Ensure project ID is provided
    if (!projectId) {
      throw new Error(
        'Project ID is required. Please provide:\n' +
        '- Jira Issue ID (e.g., ABC-1234, PROJ-567) for execution work\n' +
        '- Ground Control ID (e.g., GC-5678) for discovery work\n' +
        '- Project ID (e.g., PROJ-9999) for general projects'
      );
    }
    
    // 2. Validate project ID format
    const validatedProjectId = this.validateProjectId(projectId);
    
    // 3. Generate project-based path
    const docPath = this.getProjectDocumentPath(validatedProjectId, documentType, fileName);
    
    // 4. Validate path is within allowed directory
    if (!docPath.startsWith(this.DOCS_BASE_PATH)) {
      throw new Error('Documents can only be created under .lcagents/docs/ directory');
    }
    
    // 5. Ensure directory exists
    await this.ensureDirectoryExists(path.dirname(docPath));
    
    // 6. Create document
    await fs.writeFile(docPath, content);
    
    // 7. Log document creation with project tracking
    await this.auditLogger.logFileOperation(
      agent.user,
      agent,
      'create',
      docPath,
      undefined,
      { 
        after: content,
        projectId: validatedProjectId,
        documentType: documentType
      }
    );
    
    return docPath;
  }
  
  private validateProjectId(projectId: string): string {
    const patterns = [
      /^[A-Z]+[-]\d+$/i,          // Jira Issue ID (PROJECT_KEY-number)
      /^GC-\d+$/i,                // Ground Control ID  
      /^PROJ-\d+$/i,              // Project ID
      /^[A-Z]+-\d+$/i             // Generic ticket format
    ];
    
    const normalizedId = projectId.toUpperCase();
    
    if (!patterns.some(pattern => pattern.test(normalizedId))) {
      throw new Error(
        `Invalid project ID format: ${projectId}\n` +
        'Valid formats:\n' +
        '- ABC-1234 (for Jira issues - any project key)\n' +
        '- GC-5678 (for Ground Control discovery)\n' +
        '- PROJ-9999 (for general projects)\n' +
        '- TEAM-123 (custom team format)'
      );
    }
    
    return normalizedId;
  }
  
  private getProjectDocumentPath(
    projectId: string, 
    documentType: DocumentType, 
    fileName: string
  ): string {
    const typeMapping = {
      [DocumentType.PRD]: 'prd',
      [DocumentType.STORY]: 'stories',
      [DocumentType.REPORT]: 'reports',
      [DocumentType.TEST_PLAN]: 'testing',
      [DocumentType.QUALITY_GATE]: 'reports',
      [DocumentType.ARCHITECTURE]: 'architecture'
    };
    
    const subDir = typeMapping[documentType] || 'misc';
    return path.join(this.DOCS_BASE_PATH, projectId, subDir, fileName);
  }
  
  async promptForProjectId(agent: Agent): Promise<string> {
    const prompt = `
📋 **Project ID Required**

To create this document, please provide the project identifier:

1️⃣ **Jira Issue ID** (for execution work)
   Format: ABC-1234 (where ABC is your Jira project key)
   
2️⃣ **Ground Control ID** (for discovery work)  
   Format: GC-5678
   
3️⃣ **Project ID** (for general projects)
   Format: PROJ-9999

Please enter the project ID:`;
    
    const projectId = await agent.promptUser(prompt);
    return this.validateProjectId(projectId);
  }
  
  async findExistingProjectDocuments(projectId: string): Promise<string[]> {
    const projectPath = path.join(this.DOCS_BASE_PATH, projectId);
    
    if (!await fs.pathExists(projectPath)) {
      return [];
    }
    
    const files = await this.findFilesRecursively(projectPath, '.md');
    return files.map(file => path.relative(this.DOCS_BASE_PATH, file));
  }
}

enum DocumentType {
  PRD = 'prd',
  STORY = 'story',
  REPORT = 'report',
  TEST_PLAN = 'test_plan',
  QUALITY_GATE = 'quality_gate',
  ARCHITECTURE = 'architecture'
}

interface ProjectIdPromptResult {
  projectId: string;
  existingDocuments: string[];
  isNewProject: boolean;
}
```

#### Agent-Specific Document Creation with Project ID
```typescript
class ProductManagerAgent extends BaseAgent {
  async createPRD(title: string, requirements: string[], projectId?: string): Promise<string> {
    // Ensure project ID is provided
    if (!projectId) {
      projectId = await this.documentManager.promptForProjectId(this);
    }
    
    // Check for existing documents in this project
    const existingDocs = await this.documentManager.findExistingProjectDocuments(projectId);
    if (existingDocs.length > 0) {
      await this.showExistingDocuments(projectId, existingDocs);
    }
    
    const fileName = `${this.slugify(title)}-prd.md`;
    const content = await this.renderTemplate('prd-template.md', {
      title,
      requirements,
      author: this.user.name,
      date: new Date().toISOString(),
      projectId: projectId
    });
    
    // Document will be created at: .lcagents/docs/{projectId}/prd/feature-name-prd.md
    return await this.documentManager.createDocument(
      this,
      DocumentType.PRD,
      fileName,
      content,
      projectId
    );
  }
  
  async createUserStory(epic: string, story: string, projectId?: string): Promise<string> {
    // Ensure project ID is provided
    if (!projectId) {
      projectId = await this.documentManager.promptForProjectId(this);
    }
    
    const fileName = `${this.slugify(epic)}-${this.slugify(story)}.md`;
    const content = await this.renderTemplate('story-template.md', {
      epic,
      story,
      author: this.user.name,
      date: new Date().toISOString(),
      projectId: projectId
    });
    
    // Document will be created at: .lcagents/docs/{projectId}/stories/epic-story.md
    return await this.documentManager.createDocument(
      this,
      DocumentType.STORY,
      fileName,
      content,
      projectId
    );
  }
  
  private async showExistingDocuments(projectId: string, existingDocs: string[]): Promise<void> {
    const message = `
📁 **Found existing documents for ${projectId}:**

${existingDocs.map((doc, index) => `${index + 1}. ${doc}`).join('\n')}

Do you want to:
1️⃣ Create new document in this project
2️⃣ Update existing document
3️⃣ Cancel and specify different project ID

Please choose an option:`;
    
    await this.promptUser(message);
  }
}

class QAAgent extends BaseAgent {
  async createQualityGateReport(results: QualityCheckResult[], projectId?: string): Promise<string> {
    // Ensure project ID is provided
    if (!projectId) {
      projectId = await this.documentManager.promptForProjectId(this);
    }
    
    const fileName = `quality-gate-${Date.now()}.md`;
    const content = await this.renderTemplate('quality-gate-template.md', {
      results,
      timestamp: new Date().toISOString(),
      author: this.user.name,
      projectId: projectId
    });
    
    // Document will be created at: .lcagents/docs/{projectId}/reports/quality-gate-timestamp.md
    return await this.documentManager.createDocument(
      this,
      DocumentType.QUALITY_GATE,
      fileName,
      content,
      projectId
    );
  }
}

class DeveloperAgent extends BaseAgent {
  async createImplementationNotes(storyId: string, notes: string, projectId?: string): Promise<string> {
    // Ensure project ID is provided
    if (!projectId) {
      projectId = await this.documentManager.promptForProjectId(this);
    }
    
    const fileName = `${storyId}-implementation-notes.md`;
    const content = await this.renderTemplate('implementation-notes-template.md', {
      storyId,
      notes,
      author: this.user.name,
      date: new Date().toISOString(),
      projectId: projectId
    });
    
    // Document will be created at: .lcagents/docs/{projectId}/architecture/story-implementation-notes.md
    return await this.documentManager.createDocument(
      this,
      DocumentType.ARCHITECTURE,
      fileName,
      content,
      projectId
    );
  }
}
```

#### Validation and Enforcement with Project ID
```typescript
class FileAccessGuard {
  async checkFileAccess(
    user: UserIdentity, 
    operation: 'read' | 'write',
    filePath: string,
    section?: string
  ): Promise<boolean> {
    
    // For write operations, enforce project-based directory requirement
    if (operation === 'write' && filePath.startsWith('.lcagents/')) {
      if (!filePath.startsWith('.lcagents/docs/')) {
        throw new Error(
          'LCAgents documents can only be created under .lcagents/docs/ directory. ' +
          `Attempted path: ${filePath}`
        );
      }
      
      // Ensure project ID is present in the path
      const pathSegments = filePath.replace('.lcagents/docs/', '').split('/');
      if (pathSegments.length < 2) {
        throw new Error(
          'Documents must be organized under a project ID. ' +
          'Path should be: .lcagents/docs/{PROJECT_ID}/{type}/{filename}\n' +
          'Valid project ID formats: ABC-1234 (Jira), GC-5678 (Ground Control), PROJ-9999 (General)'
        );
      }
      
      const projectId = pathSegments[0];
      if (!this.isValidProjectId(projectId)) {
        throw new Error(
          `Invalid project ID in path: ${projectId}\n` +
          'Valid formats: ABC-1234 (Jira execution), GC-5678 (discovery), PROJ-9999 (general)'
        );
      }
    }
    
    const userPermissions = this.getUserPermissions(user);
    
    // Check file-level permissions
    const hasFileAccess = this.matchesPattern(
      filePath, 
      userPermissions[operation]
    );
    
    if (!hasFileAccess) {
      return false;
    }
    
    // Check section-level permissions if specified
    if (section) {
      return this.checkSectionAccess(user, filePath, section, operation);
    }
    
    return true;
  }
  
  private isValidProjectId(projectId: string): boolean {
    const patterns = [
      /^[A-Z]+[-]\d+$/i,          // Jira Issue ID (PROJECT_KEY-number)
      /^GC-\d+$/i,                // Ground Control ID  
      /^PROJ-\d+$/i,              // Project ID
      /^[A-Z]+-\d+$/i             // Generic ticket format
    ];
    
    return patterns.some(pattern => pattern.test(projectId));
  }
}

class ProjectManager {
  async listUserProjects(user: UserIdentity): Promise<ProjectInfo[]> {
    const docsPath = '.lcagents/docs/';
    const projects: ProjectInfo[] = [];
    
    if (!await fs.pathExists(docsPath)) {
      return projects;
    }
    
    const projectDirs = await fs.readdir(docsPath, { withFileTypes: true });
    
    for (const dir of projectDirs) {
      if (dir.isDirectory() && this.isValidProjectId(dir.name)) {
        const projectInfo = await this.getProjectInfo(dir.name);
        
        // Check if user has access to this project
        if (await this.hasProjectAccess(user, dir.name)) {
          projects.push(projectInfo);
        }
      }
    }
    
    return projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }
  
  private async getProjectInfo(projectId: string): Promise<ProjectInfo> {
    const projectPath = path.join('.lcagents/docs/', projectId);
    const stats = await fs.stat(projectPath);
    const documentCount = await this.countDocuments(projectPath);
    
    return {
      projectId,
      type: this.getProjectType(projectId),
      documentCount,
      lastModified: stats.mtime,
      path: projectPath
    };
  }
  
  private getProjectType(projectId: string): 'jira' | 'ground-control' | 'project' | 'custom' {
    if (projectId.startsWith('GC-')) return 'ground-control';
    if (projectId.startsWith('PROJ-')) return 'project';
    if (/^[A-Z]+-\d+$/i.test(projectId) && !projectId.startsWith('GC-') && !projectId.startsWith('PROJ-')) {
      return 'jira'; // Jira project key format
    }
    return 'custom';
  }
}

interface ProjectInfo {
  projectId: string;
  type: 'jira' | 'ground-control' | 'project' | 'custom';
  documentCount: number;
  lastModified: Date;
  path: string;
}
```

### Key Document Policy Rules

1. **Project ID Requirement**: All documents MUST be organized under a valid project identifier
   - **Jira Issue ID** (ABC-1234, PROJ-567, etc.) for execution work
   - **Ground Control ID** (GC-5678) for discovery work  
   - **Project ID** (PROJ-9999) for general projects
   - **Custom Format** (TEAM-123) for team-specific workflows

2. **No Documents Without ID**: System will prompt user for project ID if not provided

3. **Path Structure**: `.lcagents/docs/{PROJECT_ID}/{document_type}/{filename}`

4. **User Prompting**: When project ID is missing, agents will explicitly ask:
   ```
   📋 Project ID Required
   
   Please provide the project identifier for this document:
   1️⃣ Jira Issue ID (ABC-1234, PROJ-567) - for execution work
   2️⃣ Ground Control ID (GC-5678) - for discovery work  
   3️⃣ Project ID (PROJ-9999) - for general projects
   ```

5. **Existing Project Awareness**: System shows existing documents when working within a project

6. **Validation**: All project IDs are validated before document creation

7. **Audit Trail**: All document operations are logged with project ID attribution

8. **Clean Removal**: All project-organized documents are removed during uninstall

This policy ensures:
- **Project Organization**: All work is properly associated with specific projects/issues
- **Discovery vs Execution Separation**: Clear distinction between exploration and implementation work
- **Consistent Structure**: Easy to find and manage project-related documents
- **User Guidance**: System actively helps users organize their work properly
- **Traceability**: All documents can be traced back to specific work items
- **Collaboration**: Team members can easily find and contribute to project documentation

## Audit Trail and Logging

### Comprehensive Audit System with Project Tracking

LCAgents implements a comprehensive audit trail that tracks all user interactions, document operations, and agent activities with detailed project attribution.

#### Audit Event Structure
```typescript
interface AuditEvent {
  id: string;                    // Unique event identifier
  timestamp: Date;               // Event timestamp
  user: UserIdentity;            // GitHub user information
  agent: {                       // Agent context
    id: string;
    name: string;
    role: AgentRole;
  };
  action: AuditAction;           // Type of action performed
  projectId?: string;            // Project identifier (JIRA-1234, GC-5678, etc.)
  resource: {                    // Resource being acted upon
    type: ResourceType;
    path: string;
    metadata?: Record<string, any>;
  };
  changes?: {                    // For file operations
    before?: string;
    after?: string;
    sections?: string[];
  };
  outcome: 'success' | 'failure' | 'partial';
  error?: string;                // Error details if failed
  sessionId: string;             // Session identifier
  metadata: Record<string, any>; // Additional context
}

enum AuditAction {
  AGENT_ACTIVATE = 'agent_activate',
  AGENT_DEACTIVATE = 'agent_deactivate',
  COMMAND_EXECUTE = 'command_execute',
  FILE_CREATE = 'file_create',
  FILE_UPDATE = 'file_update',
  FILE_DELETE = 'file_delete',
  FILE_READ = 'file_read',
  PROJECT_CREATE = 'project_create',
  PROJECT_ACCESS = 'project_access',
  PERMISSION_CHECK = 'permission_check',
  USER_LOGIN = 'user_login',
  CONFIG_CHANGE = 'config_change'
}

enum ResourceType {
  DOCUMENT = 'document',
  AGENT = 'agent',
  PROJECT = 'project',
  CONFIG = 'config',
  TEMPLATE = 'template'
}
```

#### Audit Logger Implementation
```typescript
class AuditLogger {
  private readonly AUDIT_LOG_PATH = '.lcagents/logs/audit.log';
  
  async logFileOperation(
    user: UserIdentity,
    agent: Agent,
    action: 'create' | 'update' | 'delete' | 'read',
    filePath: string,
    before?: string,
    after?: { after: string; projectId?: string; documentType?: string }
  ): Promise<void> {
    
    // Extract project ID from file path or metadata
    const projectId = after?.projectId || this.extractProjectIdFromPath(filePath);
    
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      user: user,
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role
      },
      action: `file_${action}` as AuditAction,
      projectId: projectId,
      resource: {
        type: ResourceType.DOCUMENT,
        path: filePath,
        metadata: {
          documentType: after?.documentType,
          fileSize: after?.after?.length || before?.length || 0
        }
      },
      changes: action !== 'read' ? {
        before: before,
        after: after?.after
      } : undefined,
      outcome: 'success',
      sessionId: this.getCurrentSessionId(),
      metadata: {
        userAgent: 'GitHub Copilot',
        projectType: this.getProjectType(projectId),
        fileExtension: path.extname(filePath)
      }
    };
    
    await this.writeAuditEvent(auditEvent);
  }
  
  async logAgentActivity(
    user: UserIdentity,
    agent: Agent,
    action: string,
    projectId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      user: user,
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role
      },
      action: 'command_execute',
      projectId: projectId,
      resource: {
        type: ResourceType.AGENT,
        path: `agent:${agent.id}`,
        metadata: { command: action }
      },
      outcome: 'success',
      sessionId: this.getCurrentSessionId(),
      metadata: {
        ...metadata,
        userAgent: 'GitHub Copilot',
        projectType: this.getProjectType(projectId)
      }
    };
    
    await this.writeAuditEvent(auditEvent);
  }
  
  async logProjectAccess(
    user: UserIdentity,
    projectId: string,
    action: 'create' | 'access' | 'list',
    metadata?: Record<string, any>
  ): Promise<void> {
    
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      user: user,
      agent: { id: 'system', name: 'System', role: 'system' as AgentRole },
      action: `project_${action}` as AuditAction,
      projectId: projectId,
      resource: {
        type: ResourceType.PROJECT,
        path: `.lcagents/docs/${projectId}`,
        metadata: metadata
      },
      outcome: 'success',
      sessionId: this.getCurrentSessionId(),
      metadata: {
        userAgent: 'GitHub Copilot',
        projectType: this.getProjectType(projectId)
      }
    };
    
    await this.writeAuditEvent(auditEvent);
  }
  
  private extractProjectIdFromPath(filePath: string): string | undefined {
    const match = filePath.match(/\.lcagents\/docs\/([^\/]+)/);
    return match ? match[1] : undefined;
  }
  
  private getProjectType(projectId?: string): string {
    if (!projectId) return 'unknown';
    if (projectId.startsWith('GC-')) return 'ground-control';
    if (projectId.startsWith('PROJ-')) return 'project';
    if (/^[A-Z]+-\d+$/i.test(projectId) && !projectId.startsWith('GC-') && !projectId.startsWith('PROJ-')) {
      return 'jira'; // Jira project key format
    }
    return 'custom';
  }
  
  private async writeAuditEvent(event: AuditEvent): Promise<void> {
    const logEntry = JSON.stringify(event) + '\n';
    await fs.ensureDir(path.dirname(this.AUDIT_LOG_PATH));
    await fs.appendFile(this.AUDIT_LOG_PATH, logEntry);
  }
}
```

#### Audit Query and Reporting
```typescript
class AuditQuery {
  private readonly AUDIT_LOG_PATH = '.lcagents/logs/audit.log';
  
  async getProjectAuditTrail(projectId: string): Promise<AuditEvent[]> {
    const allEvents = await this.readAuditLog();
    return allEvents.filter(event => event.projectId === projectId);
  }
  
  async getUserActivity(githubId: string, timeRange?: TimeRange): Promise<AuditEvent[]> {
    const allEvents = await this.readAuditLog();
    return allEvents.filter(event => {
      const userMatch = event.user.githubId === githubId;
      if (!timeRange) return userMatch;
      
      return userMatch && 
             event.timestamp >= timeRange.start && 
             event.timestamp <= timeRange.end;
    });
  }
  
  async getProjectActivity(timeRange?: TimeRange): Promise<ProjectActivityReport[]> {
    const allEvents = await this.readAuditLog();
    const projectEvents = allEvents.filter(event => event.projectId);
    
    const projectGroups = this.groupBy(projectEvents, 'projectId');
    
    return Object.entries(projectGroups).map(([projectId, events]) => {
      const filteredEvents = timeRange 
        ? events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
        : events;
        
      return {
        projectId,
        projectType: this.getProjectType(projectId),
        totalEvents: filteredEvents.length,
        documentsCreated: filteredEvents.filter(e => e.action === 'file_create').length,
        documentsUpdated: filteredEvents.filter(e => e.action === 'file_update').length,
        uniqueUsers: [...new Set(filteredEvents.map(e => e.user.githubId))],
        lastActivity: Math.max(...filteredEvents.map(e => e.timestamp.getTime())),
        agents: [...new Set(filteredEvents.map(e => e.agent.id))]
      };
    });
  }
  
  async generateComplianceReport(): Promise<ComplianceReport> {
    const allEvents = await this.readAuditLog();
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentEvents = allEvents.filter(e => e.timestamp >= last30Days);
    
    return {
      reportDate: new Date(),
      totalEvents: allEvents.length,
      recentEvents: recentEvents.length,
      uniqueUsers: [...new Set(allEvents.map(e => e.user.githubId))].length,
      projectsAccessed: [...new Set(allEvents.map(e => e.projectId).filter(Boolean))].length,
      failedOperations: allEvents.filter(e => e.outcome === 'failure').length,
      agentUsage: this.groupBy(recentEvents, 'agent.id')
    };
  }
  
  private async readAuditLog(): Promise<AuditEvent[]> {
    if (!await fs.pathExists(this.AUDIT_LOG_PATH)) {
      return [];
    }
    
    const logContent = await fs.readFile(this.AUDIT_LOG_PATH, 'utf8');
    const lines = logContent.trim().split('\n').filter(line => line.length > 0);
    
    return lines.map(line => {
      try {
        const event = JSON.parse(line);
        event.timestamp = new Date(event.timestamp);
        return event as AuditEvent;
      } catch (error) {
        console.warn('Invalid audit log entry:', line);
        return null;
      }
    }).filter(Boolean) as AuditEvent[];
  }
}

interface ProjectActivityReport {
  projectId: string;
  projectType: string;
  totalEvents: number;
  documentsCreated: number;
  documentsUpdated: number;
  uniqueUsers: string[];
  lastActivity: number;
  agents: string[];
}

interface ComplianceReport {
  reportDate: Date;
  totalEvents: number;
  recentEvents: number;
  uniqueUsers: number;
  projectsAccessed: number;
  failedOperations: number;
  agentUsage: Record<string, AuditEvent[]>;
}
```

#### Audit CLI Commands
```bash
# View project audit trail
@lcagents audit project ABC-1234

# View user activity
@lcagents audit user @username --last 7d

# Generate compliance report
@lcagents audit report --compliance

# Export audit data
@lcagents audit export --project ABC-1234 --format json

# Real-time audit monitoring
@lcagents audit monitor --follow
```

### Key Audit Features

1. **Project Attribution**: Every action is linked to a specific project ID
2. **User Tracking**: All actions are attributed to GitHub users
3. **Agent Context**: Track which agent performed each action
4. **Change Tracking**: Before/after content for document modifications
5. **Compliance Reporting**: Generate reports for governance and compliance
6. **Real-time Monitoring**: Live monitoring of system activity
7. **Data Export**: Export audit data for external analysis
8. **Performance Metrics**: Track system usage and performance

This comprehensive audit system ensures full traceability of all LCAgents activities while maintaining strong connections between actions and project work items.

## Core Design Philosophy

The LCAgents system provides a standardized approach to engineering practices through AI-powered role-based agents that integrate seamlessly with GitHub Copilot, ensuring consistency across teams and projects.

## Key Architectural Components

### 1. Agent Persona System
```yaml
# Each agent has a standardized structure:
agent:
  name: "Role Name"
  id: "role-id" 
  title: "Display Title"
  icon: "emoji"
  whenToUse: "Clear guidance on when to use this agent"

persona:
  role: "Specific role definition"
  style: "Communication style"
  identity: "Core identity and focus"
  core_principles: ["List of operating principles"]
```

### 2. Command Structure
- **Copilot prefix commands**: All commands use `@lcagents` prefix (e.g., `@lcagents activate pm`, `@lcagents *create-prd`)
- **Standardized command set** across agents with role-specific variations
- **Numbered selection lists** for user choices
- **GitHub Copilot native**: Commands work within the Copilot Chat interface

### 3. File Organization Pattern
```
lcagents/
├── agents/           # Agent persona definitions
├── checklists/       # Quality gates and validation checklists  
├── data/            # Knowledge base and reference data
├── tasks/           # Executable workflow scripts
├── templates/       # Document templates (YAML-based)
├── workflows/       # End-to-end process definitions
└── utils/           # Shared utilities and GitHub Copilot adapters
```

### 4. Key Agent Roles

**Note**: For detailed commands and capabilities, refer to individual agent configuration files in `.lcagents/agents/` directory or activate the agent and type `*help`.

#### Product Manager (pm)
- **Focus**: PRD creation, feature prioritization, stakeholder communication, functional story backlog
- **Templates**: Brownfield PRD template, Standard PRD template, Functional story template
- **Output**: Product requirements documents, functional user stories, feature backlogs (created in `.lcagents/docs/{PROJECT_ID}/`)
- **Story Creation**: Creates functional stories based on business requirements and user needs
- **Project Organization**: Requires project ID for all document creation

#### Developer (dev) 
- **Focus**: Story implementation, code quality, testing, technical story creation
- **Workflow**: Sequential task execution with validation gates
- **File Permissions**: Only updates specific story sections (Tasks, Dev Agent Record, File List)
- **Story Creation**: Creates technical stories, implementation subtasks, and spike stories during development
- **Integration**: Works with GitHub Copilot in any supported IDE

#### QA Engineer (qa)
- **Focus**: Test architecture, quality gates, risk assessment, test story creation  
- **Output**: Quality gate decisions (PASS/CONCERNS/FAIL/WAIVED)
- **Story Creation**: Creates test stories, test automation tasks, and quality assurance subtasks
- **Validation**: Automated quality checks and manual review processes

#### Engineering Manager (em)
- **Focus**: Team coordination, resource planning, cross-project oversight, performance management, story creation
- **Scope**: Can view all team projects, coordinate resource allocation, track team metrics
- **Story Creation**: Creates stories for coordination, planning, and any team requirements
- **Coordination**: Oversees cross-team workflows and ensures delivery alignment

#### Architect (architect)
- **Focus**: Technical analysis, POC development, spike stories, system design
- **Templates**: Spike story template, POC template, Technical analysis template
- **Story Creation**: Creates spike stories for research, POC stories for prototyping, and technical analysis stories
- **Output**: Technical designs, architecture decisions, research findings (created in `.lcagents/docs/{PROJECT_ID}/`)

## Workflow Patterns

### 1. Story Development Lifecycle
```mermaid
graph TD
    A[PM Creates PRD] --> B[PM Creates Functional Stories]
    A --> C[Architect Creates Spike/POC Stories]
    B --> D[Dev Creates Tech Stories & Subtasks]
    C --> D
    D --> E[QA Creates Test Stories]
    E --> F[Dev Implements Stories]
    F --> G[QA Reviews & Gates]
    G --> H[EM Tracks Progress]
    H --> I[Story Complete]
```

### 2. Agent Activation Pattern
```yaml
activation-instructions:
  - STEP 1: Read complete persona definition
  - STEP 2: Adopt persona 
  - STEP 3: Load core-config.yaml
  - STEP 4: Greet user and run *help
  - HALT: Wait for user commands
```

### 3. Task Execution Model
- **Sequential execution** with validation checkpoints
- **Elicitation patterns** for user input when required
- **File permission controls** (agents can only modify designated sections)
- **Status tracking** through standardized story sections
- **GitHub Copilot integration** for seamless IDE workflow

### 4. Distributed Story Creation Model

LCAgents supports a distributed story creation approach where different roles create stories based on their expertise and context:

#### Story Types by Role

**Product Manager (PM)**
- **Functional Stories**: Business-focused user stories derived from requirements
- **Feature Epics**: High-level feature descriptions and acceptance criteria
- **Backlog Items**: Prioritized list of functional requirements

**Architect**
- **Spike Stories**: Research and investigation tasks for technical unknowns
- **POC Stories**: Proof-of-concept development for evaluating solutions
- **Technical Analysis Stories**: Requirement analysis and system design tasks

**Developer (Dev)**
- **Technical Stories**: Implementation-focused stories broken down from functional requirements
- **Subtasks**: Granular development tasks identified during implementation
- **Refactoring Stories**: Code improvement and technical debt reduction tasks

**QA Engineer**
- **Test Stories**: Test case development and automation tasks
- **Quality Gate Stories**: Quality assurance and validation requirements
- **Bug Investigation Stories**: Issue analysis and resolution tasks

**Engineering Manager (EM)**
- **Coordination Stories**: Cross-team dependency and integration tasks
- **Resource Planning Stories**: Capacity and timeline planning activities
- **Process Improvement Stories**: Team efficiency and workflow optimization
- **Ad-hoc Stories**: Any type of story as needed for project requirements and team coordination

#### Story Creation Triggers

1. **Requirements-Driven**: PM creates functional stories from business requirements
1. **Requirements-Driven**: PM creates functional stories from business requirements
2. **Implementation-Driven**: Dev creates technical stories and subtasks during development
3. **Research-Driven**: Architect creates spike/POC stories for unknowns
4. **Quality-Driven**: QA creates test stories for coverage and validation
5. **Management-Driven**: EM creates coordination, planning, and any other stories as needed for team success

This model ensures that story creation happens organically as team members identify work within their domain expertise, with Engineering Managers having the flexibility to create any type of story as requirements dictate.

## GitHub Copilot Integration

### Supported Platform
- **GitHub Copilot**: Native integration with all GitHub Copilot supported IDEs (IntelliJ, Neovim, VS Code, etc.)
- **Organization Verification**: Automatic verification of LendingClub GitHub organization membership
- **User Authentication**: Seamless user identification through GitHub Copilot API

### GitHub Copilot Adapter Pattern
```typescript
interface GitHubCopilotAdapter {
  initialize(): Promise<void>;
  getCurrentUser(): Promise<GitHubUser>;
  sendCommand(agent: Agent, command: string): Promise<Response>;
  handleFileOperations(permissions: FilePermissions): Promise<void>;
  verifyOrgMembership(githubId: string, org: string): Promise<boolean>;
}
```

## Implementation Architecture

### Package Structure

LCAgents is distributed as an NPM package that can be installed via npx, providing GitHub Copilot Chat integration.

#### NPM Package Layout
```
@lendingclub/lcagents/
├── bin/
│   └── lcagents.js              # CLI entry point for installation
├── lib/
│   ├── agents/                 # Core agent implementations
│   ├── adapters/               # GitHub Copilot adapter
│   ├── commands/               # Copilot Chat command implementations
│   ├── templates/              # Default templates
│   └── utils/                  # Shared utilities
├── copilot/
│   ├── extension/              # GitHub Copilot extension integration
│   ├── chat/                   # Chat interface components
│   └── commands/               # Copilot-specific commands
├── templates/
│   ├── init/                   # Installation templates
│   ├── agents/                 # Agent persona templates
│   └── workflows/              # Workflow templates
├── package.json
└── README.md
```

#### GitHub Copilot Chat Interface
```typescript
// GitHub Copilot Chat commands
@lcagents init                   // Install LCAgents in current project
@lcagents uninstall             // Remove LCAgents from project
@lcagents activate <agent>      // Switch to specific agent (pm, dev, qa, em, architect)
@lcagents status                // Show current status
@lcagents help [agent]          // Show help for agent

// Agent commands (when agent is active)
@lcagents *help                 // Show available commands for active agent
@lcagents *status               // Show current context and progress
```

### Core Features

#### 1. Basic Agent Framework
```typescript
interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  commands: Command[];
  permissions: FilePermissions;
  workflow: WorkflowStep[];
  llmAdapter: LLMAdapter;
}

enum AgentRole {
  PRODUCT_MANAGER = "pm",
  DEVELOPER = "dev", 
  QA_ENGINEER = "qa",
  ENGINEERING_MANAGER = "em",
  ARCHITECT = "architect"
}

interface CLIContext {
  activeAgent: Agent | null;
  projectConfig: ProjectConfig;
  currentWorkflow: WorkflowStep[];
  copilotInterface: GitHubCopilotAdapter;
  githubUser: GitHubUser;
}
```

#### 2. Installation and Runtime Architecture

**Installation Process**
```typescript
class LCAgentsInstaller {
  async init(options: InitOptions): Promise<void> {
    // 1. Detect project structure
    const projectType = await this.detectProjectType();
    
    // 2. Create .lcagents directory structure
    await this.createDirectoryStructure();
    
    // 3. Setup GitHub Copilot instructions
    await this.setupGitHubCopilotInstructions();
    
    // 4. Copy default templates and configurations
    await this.installDefaults(projectType);
    
    // 5. Generate project-specific configuration
    await this.generateConfig(options);
    
    // 6. Update .gitignore with LCAgents entries
    await this.updateGitIgnore();
  }
  
  async uninstall(): Promise<void> {
    // 1. Remove LCAgents files
    await this.removeLCAgentsFiles();
    
    // 2. Clean .gitignore entries
    await this.cleanGitIgnore();
    
    // 3. Optionally remove GitHub Copilot instructions (user confirmation required)
    await this.cleanupGitHubCopilotInstructions();
  }
  
  private async setupGitHubCopilotInstructions(): Promise<void> {
    const githubDir = '.github';
    const copilotInstructionsPath = path.join(githubDir, 'copilot-instructions.md');
    
    // Ensure .github directory exists
    await fs.ensureDir(githubDir);
    
    // Create copilot-instructions.md if it doesn't exist
    if (!await fs.pathExists(copilotInstructionsPath)) {
      const instructions = await this.generateCopilotInstructions();
      await fs.writeFile(copilotInstructionsPath, instructions);
      console.log('✅ Created .github/copilot-instructions.md with LCAgents-optimized GitHub Copilot behavior');
    } else {
      console.log('ℹ️  .github/copilot-instructions.md already exists - keeping existing configuration');
    }
  }
  
  private async generateCopilotInstructions(): Promise<string> {
    return `# GitHub Copilot Instructions for LCAgents

## LCAgents Integration

This project uses LCAgents (LendingClub Agents) - a role-based AI agent orchestration framework for standardized engineering workflows.

## Agent Activation Commands

\`\`\`bash
@lcagents activate pm          # Product Manager
@lcagents activate dev         # Developer
@lcagents activate qa          # QA Engineer  
@lcagents activate em          # Engineering Manager
@lcagents activate architect   # Architect
\`\`\`

## Behavioral Guidelines

### Document Creation
- All LCAgents documents MUST be created under \`.lcagents/docs/{PROJECT_ID}/\` structure
- Require Project ID (ABC-1234, GC-5678, PROJ-9999) for all document creation
- Follow project-based organization and document templates

### Code Quality
- Follow established coding standards and best practices
- Implement comprehensive testing strategies
- Maintain clear documentation and code comments
- Use meaningful variable and function names

### Workflow Integration
- Respect role-based permissions and agent boundaries
- Follow sequential workflow patterns (PM → Dev → QA → EM)
- Use standardized templates for consistency
- Maintain audit trails for all changes

### Communication Style
- Use numbered lists for user choices
- Provide clear, actionable feedback
- Follow agent persona guidelines when activated
- Maintain professional and helpful tone

## Reference
Standard guidelines for AI-assisted development workflows and engineering best practices.

## Commands Reference
Activate any agent and type \`*help\` to see available commands, or refer to \`.lcagents/agents/\` configuration files.
`;
  }
  
  private async updateGitIgnore(): Promise<void> {
    const gitignoreEntries = [
      '# LCAgents - Runtime/tooling files (not version controlled)',
      '.lcagents/',
      '.lcagents-config.json',
      'README-lcagents.md'
    ];
    await this.appendToGitIgnore(gitignoreEntries);
  }
  
  private async cleanupGitHubCopilotInstructions(): Promise<void> {
    const copilotInstructionsPath = '.github/copilot-instructions.md';
    if (await fs.pathExists(copilotInstructionsPath)) {
      // Check if it's LCAgents-generated by looking for our header
      const content = await fs.readFile(copilotInstructionsPath, 'utf8');
      if (content.includes('# GitHub Copilot Instructions for LCAgents')) {
        const shouldRemove = await this.promptUser(
          'Remove .github/copilot-instructions.md? (created by LCAgents) [y/N]:'
        );
        if (shouldRemove.toLowerCase() === 'y') {
          await fs.remove(copilotInstructionsPath);
          console.log('✅ Removed .github/copilot-instructions.md');
        }
      }
    }
  }
}
```

**Runtime Architecture**
```typescript
class LCAgentsRuntime {
  private activeAgent: Agent | null = null;
  private context: CLIContext;
  
  async activateAgent(agentId: string): Promise<void> {
    const agent = await this.loadAgent(agentId);
    this.activeAgent = agent;
    await agent.initialize(this.context);
  }
  
  async executeCommand(command: string): Promise<CommandResult> {
    if (!this.activeAgent) {
      throw new Error('No agent activated. Use: lcagents activate <agent-id>');
    }
    
    return await this.activeAgent.executeCommand(command, this.context);
  }
}
```

#### 2. Essential Agents

**Note**: For detailed commands and capabilities, refer to individual agent configuration files in `.lcagents/agents/` directory or activate the agent and type `*help`.

**Product Manager Agent**
- Functional story creation and business requirements definition
- Feature prioritization and roadmap planning
- Stakeholder communication templates
- Templates: Functional story template, acceptance criteria template, feature backlog template

**Developer Agent** 
- Technical story and subtask creation based on implementation experience
- Code implementation guidance and best practices
- Code review assistance and automated checks
- Testing workflow enforcement
- Templates: Technical story template, implementation checklist, code quality checklist

**QA Engineer Agent**
- Test story creation and automation task definition
- Test strategy development and execution planning
- Quality gate enforcement and compliance checks
- Risk assessment and mitigation strategies
- Templates: Test story template, test plan template, bug report template

**Engineering Manager Agent**
- Coordination and process story creation based on team needs
- Resource planning and capacity management
- Cross-project coordination and team oversight
- Performance tracking and team metrics
- Templates: Coordination story template, process improvement template, resource planning template, capacity template, team status template

**Architect Agent**
- Spike and POC story creation for research and prototyping
- Technical analysis and requirement assessment
- System design and architecture decisions
- Templates: Spike story template, POC template, technical analysis template

#### 3. Command Structure

**Note**: For detailed role-specific commands, refer to individual agent configuration files in `.lcagents/agents/` directory or activate the desired agent and type `*help`.

```typescript
// Core commands available to all agents
const CORE_COMMANDS = {
  HELP: "*help",
  STATUS: "*status", 
  EXIT: "*exit",
  CONTEXT: "*context"
};

// Role-specific commands are defined in individual agent configuration files:
// - PM commands: .lcagents/agents/ (pm agent configuration)
// - Developer commands: .lcagents/agents/ (dev agent configuration)  
// - QA commands: .lcagents/agents/ (qa agent configuration)
// - EM commands: .lcagents/agents/ (em agent configuration)
// - Architect commands: .lcagents/agents/ (architect agent configuration)
```

#### 4. Standardized Templates
YAML-based templates for:
- **Functional stories and epics** (PM-created business requirements)
- **Technical stories and subtasks** (Dev-created implementation tasks)
- **Spike and POC stories** (Architect-created research and prototyping)
- **Test stories and automation tasks** (QA-created testing requirements)
- **Implementation checklists and coding standards**
- **Quality gates and testing protocols**
- **Code review checklists and security guidelines**
- **Resource planning and capacity templates** (EM-specific)
- **Documentation standards**

#### 5. Installed Project Structure

After installation, your project will have:

```
your-project/
├── .lcagents/                   # LCAgents core directory
│   ├── docs/                    # All generated documents (PRDs, stories, reports)
│   │   ├── prd/                 # Product Requirements Documents
│   │   ├── stories/             # User stories and epics
│   │   ├── reports/             # Quality reports and analytics
│   │   └── templates/           # Generated document templates
│   ├── agents/                  # Agent configurations
│   ├── templates/               # Document templates  
│   ├── workflows/               # Process definitions
│   └── config/                  # Settings and standards
├── .lcagents-config.json        # Project configuration
└── README-lcagents.md           # Quick start guide
```

## Key Implementation Principles

1. **Role-Based Permissions**: Each agent can only modify specific sections of shared documents
2. **Standardized Communication**: Use numbered lists for choices, consistent command structure
3. **Quality Gates**: Built-in checkpoints prevent progression without validation
4. **Template-Driven**: All outputs follow organizational templates and standards
5. **Audit Trail**: Track all changes with agent attribution and timestamps
6. **Sequential Workflows**: Enforce proper handoffs between roles
7. **GitHub Copilot Native**: Work seamlessly within GitHub Copilot Chat interface
8. **Extensible Architecture**: Easy to add new agents, commands, and integrations

## Minimal Viable Product (MVP) Features

### Phase 1: Core Foundation
1. **Three core agents** (Product, Dev, QA)
2. **Basic story workflow** (Create → Implement → Validate)
3. **Template system** for consistency
4. **Permission controls** for role separation
5. **Status tracking** for work progression

### Phase 2: Enhanced Functionality
1. **Scrum Master agent** for process facilitation
2. **Cross-agent communication** and handoffs
3. **Advanced quality gates** with automated checks
4. **Integration with project management tools**
5. **Reporting and analytics** capabilities

### Phase 3: Advanced Features
1. **Custom agent creation** and configuration
2. **Advanced workflow orchestration**
3. **Machine learning** for process optimization
4. **Enterprise integrations** (JIRA, Azure DevOps, etc.)
5. **Multi-team coordination** capabilities

## Benefits and Use Cases

### For Development Teams
- **Standardized Processes**: Consistent approach across all team members
- **Quality Assurance**: Built-in gates prevent common errors and oversights
- **Knowledge Transfer**: Embedded best practices and organizational standards
- **Efficiency**: Automated workflows reduce manual overhead

### For Organizations
- **Scalability**: Easy onboarding of new team members
- **Compliance**: Enforced adherence to organizational standards
- **Visibility**: Clear audit trails and progress tracking
- **GitHub Integration**: Leverages existing GitHub organization structure and permissions

### Integration Scenarios
- **IDE Integration**: Seamless workflow within any GitHub Copilot supported development environment
- **GitHub Copilot Chat**: Natural language interface for agent interactions across all IDEs
- **Repository Management**: Automatic setup and configuration within GitHub repositories
- **Documentation**: Automatic generation of project documentation and reports

## BMAD-Core Resource Replication Strategy

### Complete Agent System Replication
LCAgents Phase 1 implements a complete replication of the proven BMAD-Core agent system, ensuring all existing workflows, templates, and tasks are available in target project repositories. This provides immediate value by leveraging battle-tested agent capabilities.

### Resource Categories to Replicate

#### 1. Agent Definitions
**Source**: `.bmad-core/agents/` → **Target**: `.lcagents/agents/`
- `pm.md` - Complete Product Manager agent with full YAML configuration
- `dev.md` - Complete Developer agent with full YAML configuration  
- `qa.md` - Complete QA Engineer agent with full YAML configuration
- Each agent file contains complete persona, commands, and dependencies

#### 2. Task Workflows
**Source**: `.bmad-core/tasks/` → **Target**: `.lcagents/tasks/`
Critical tasks for MVP functionality:
- `create-doc.md` - Document generation workflow (PM)
- `shard-doc.md` - Document sharding for development (PM)
- `brownfield-create-epic.md` - Epic creation for existing projects (PM)
- `brownfield-create-story.md` - Story creation for existing projects (PM)
- `correct-course.md` - Course correction workflow (PM)
- `develop-story.md` - Core development workflow (Dev)
- `apply-qa-fixes.md` - QA fix application (Dev)
- `execute-checklist.md` - Checklist execution system (All agents)
- `review-story.md` - Story review workflow (QA)
- `qa-gate.md` - Quality gate decision workflow (QA)
- `nfr-assess.md` - Non-functional requirement assessment (QA)
- `risk-profile.md` - Risk assessment workflow (QA)
- `test-design.md` - Test design workflow (QA)
- `trace-requirements.md` - Requirements tracing (QA)

#### 3. Document Templates
**Source**: `.bmad-core/templates/` → **Target**: `.lcagents/templates/`
Essential templates for MVP:
- `prd-tmpl.yaml` - Standard Product Requirements Document
- `brownfield-prd-tmpl.yaml` - PRD for existing systems
- `story-tmpl.yaml` - User story template
- `qa-gate-tmpl.yaml` - Quality gate decision template
- Additional templates as needed by task workflows

#### 4. Validation Checklists
**Source**: `.bmad-core/checklists/` → **Target**: `.lcagents/checklists/`
- `pm-checklist.md` - Product Manager validation checklist
- `story-dod-checklist.md` - Story Definition of Done checklist
- `change-checklist.md` - Change management checklist

#### 5. Agent Context Data
**Source**: `.bmad-core/data/` → **Target**: `.lcagents/data/`
- `technical-preferences.md` - Technical standards and preferences

### Runtime Resource Resolution
Agents must be able to dynamically load their dependencies from the `.lcagents/` structure:
- **File Resolution**: `.lcagents/{type}/{name}` mapping system
- **Lazy Loading**: Resources loaded only when commands are executed
- **Error Handling**: Clear messages when dependencies are missing
- **Template Processing**: YAML template rendering with user input

### Compatibility Requirements
- **Command Syntax**: Identical to BMAD-Core (`*help`, `*create-prd`, etc.)
- **Agent Personas**: Exact replication of agent personalities and behaviors
- **Workflow Logic**: Task execution follows identical patterns
- **Template Output**: Generated documents match BMAD-Core format and structure

### Technical Implementation Requirements

#### 1. Agent Loading System
```typescript
interface AgentLoader {
  loadAgent(agentId: string): Promise<AgentDefinition>;
  parseAgentYAML(content: string): AgentDefinition;
  validateAgentDependencies(agent: AgentDefinition): boolean;
}
```

#### 2. Resource Resolution Engine
```typescript
interface ResourceResolver {
  resolveTask(taskName: string): Promise<string>;
  resolveTemplate(templateName: string): Promise<string>;
  resolveChecklist(checklistName: string): Promise<string>;
  resolveData(dataName: string): Promise<string>;
  resolveUtil(utilName: string): Promise<string>;
  resolveWorkflow(workflowName: string): Promise<string>;
  resolveAgentTeam(teamName: string): Promise<string>;
  // Maps .bmad-core/{type}/{name} → .lcagents/{type}/{name}
  // Supports: tasks, templates, checklists, data, utils, workflows, agent-teams
}
```

#### 3. Template Processing System
```typescript
interface TemplateProcessor {
  renderYAMLTemplate(template: string, context: any): Promise<string>;
  promptUserForInput(template: YAMLTemplate): Promise<any>;
  validateTemplateSchema(template: any): boolean;
}
```

#### 4. Command Execution Engine
```typescript
interface CommandExecutor {
  executeCommand(agent: AgentDefinition, command: string, args?: any[]): Promise<CommandResult>;
  loadTaskWorkflow(taskName: string): Promise<TaskWorkflow>;
  executeTaskSteps(workflow: TaskWorkflow, context: any): Promise<any>;
}
```

#### 5. File Operation System
```typescript
interface FileOperations {
  createDocument(path: string, content: string, projectId: string): Promise<void>;
  updateDocument(path: string, content: string, section?: string): Promise<void>;
  ensureProjectStructure(projectId: string): Promise<void>;
  validateProjectId(projectId: string): boolean;
}
```

### Complete Resource Mapping for Seamless Operation

#### Directory Structure Mapping
**Source → Target mappings for complete BMAD-Core compatibility**:

```
.bmad-core/                    → .lcagents/
├── agents/                    → agents/
│   ├── pm.md                 → pm.md
│   ├── dev.md                → dev.md  
│   ├── qa.md                 → qa.md
│   ├── architect.md          → architect.md
│   ├── analyst.md            → analyst.md
│   ├── em.md                 → em.md
│   ├── po.md                 → po.md
│   ├── sm.md                 → sm.md
│   ├── ux-expert.md          → ux-expert.md
│   ├── bmad-master.md        → bmad-master.md
│   └── bmad-orchestrator.md  → bmad-orchestrator.md
├── agent-teams/               → agent-teams/
│   ├── team-all.yaml         → team-all.yaml
│   ├── team-fullstack.yaml   → team-fullstack.yaml
│   ├── team-ide-minimal.yaml → team-ide-minimal.yaml
│   └── team-no-ui.yaml       → team-no-ui.yaml
├── tasks/ (24 files)          → tasks/
├── templates/ (13 files)      → templates/
├── checklists/ (6 files)      → checklists/
├── data/ (6 files)            → data/
├── utils/ (2 files)           → utils/
├── workflows/ (6 files)       → workflows/
└── core-config.yaml           → config/core-config.yaml
```

#### Resource Resolution Implementation
**File path resolution must support BMAD-Core patterns**:
- **Agent Dependencies**: `bmad-core/{type}/{name}` → `.lcagents/{type}/{name}`
- **Template Resolution**: Templates must be accessible from any agent
- **Task Execution**: All task files must resolve correctly for workflow execution
- **Data Access**: Knowledge base and preference files accessible across agents
- **Utility Functions**: Workflow management and documentation utilities available
- **Team Configurations**: Agent team bundles must load correctly for orchestration

#### Critical Files for Phase 1 Operation
**Must-have files for basic functionality**:

**Core Agent Files** (3 essential):
- `agents/pm.md`, `agents/dev.md`, `agents/qa.md`

**Essential Tasks** (12 core workflows):
- `create-doc.md`, `shard-doc.md`, `develop-story.md`, `review-story.md`
- `brownfield-create-epic.md`, `brownfield-create-story.md`
- `execute-checklist.md`, `apply-qa-fixes.md`
- `qa-gate.md`, `nfr-assess.md`, `risk-profile.md`, `test-design.md`

**Essential Templates** (5 core templates):
- `prd-tmpl.yaml`, `brownfield-prd-tmpl.yaml`, `story-tmpl.yaml`, `qa-gate-tmpl.yaml`

**Essential Data** (2 core files):
- `technical-preferences.md`, `bmad-kb.md`

**Essential Checklists** (3 validation files):
- `pm-checklist.md`, `story-dod-checklist.md`, `change-checklist.md`

#### Runtime Validation Requirements
**System must validate at startup**:
1. All agent dependency files exist and are readable
2. Template files are valid YAML with required sections
3. Task files contain executable workflow instructions
4. Configuration files are properly formatted
5. Directory structure matches expected pattern
6. File permissions allow read/write operations

## Implementation Roadmap

### Phased Development Approach

LCAgents implementation follows a phased approach to ensure rapid delivery of core value while building toward a comprehensive organizational tool.

### MVP (Phase 1) - Core Foundation
**Goal: Basic working system with essential roles**

#### 1. NPX Installation System
- `npx @lendingclub/lcagents init` command
- Basic project structure creation (`.lcagents/` directories)
- `.gitignore` management (add/remove entries)
- Simple uninstall functionality

#### 2. GitHub Copilot Integration Core
- `.github/copilot-instructions.md` auto-generation
- Basic GitHub user identity resolution via Copilot
- Agent activation system (`@lcagents activate <role>`)
- Core commands (`*help`, `*status`, `*exit`)

#### 3. Essential Agents (3 roles) - BMAD-Core Compatible System
**Product Manager (pm)** - Replicates BMAD-Core PM agent functionality:
- Commands: `*help`, `*correct-course`, `*create-brownfield-epic`, `*create-brownfield-prd`, `*create-brownfield-story`, `*create-epic`, `*create-prd`, `*create-story`, `*doc-out`, `*shard-prd`, `*yolo`, `*exit`
- Dependencies:
  - Checklists: `change-checklist.md`, `pm-checklist.md`
  - Data: `technical-preferences.md`
  - Tasks: `brownfield-create-epic.md`, `brownfield-create-story.md`, `correct-course.md`, `create-deep-research-prompt.md`, `create-doc.md`, `execute-checklist.md`, `shard-doc.md`
  - Templates: `brownfield-prd-tmpl.yaml`, `prd-tmpl.yaml`, `story-tmpl.yaml`

**Developer (dev)** - Replicates BMAD-Core Dev agent functionality:
- Commands: `*help`, `*develop-story`, `*explain`, `*review-qa`, `*run-tests`, `*exit`
- Dependencies:
  - Checklists: `story-dod-checklist.md`
  - Tasks: `apply-qa-fixes.md`, `execute-checklist.md`, `validate-next-story.md`

**QA Engineer (qa)** - Replicates BMAD-Core QA agent functionality:
- Commands: `*help`, `*gate`, `*nfr-assess`, `*review`, `*risk-profile`, `*test-design`, `*trace`, `*exit`
- Dependencies:
  - Data: `technical-preferences.md`
  - Tasks: `nfr-assess.md`, `qa-gate.md`, `review-story.md`, `risk-profile.md`, `test-design.md`, `trace-requirements.md`
  - Templates: `qa-gate-tmpl.yaml`

#### 4. Complete Dependency System
**Runtime Resource Resolution**: All agent dependencies must be included and accessible in target project repositories:
- All task files (.md) that agents reference
- All template files (.yaml) for document generation  
- All checklist files (.md) for validation workflows
- All data files (.md) for agent context and knowledge base
- All utility files (.md) for workflow management and documentation
- All workflow files (.yaml) for process definitions
- Agent team configurations (.yaml) for bundle management
- Core configuration system compatible with BMAD-Core structure

**Resource Distribution**: LCAgents installation creates complete `.lcagents/` directory structure containing:
```
.lcagents/
├── agents/           # Complete BMAD-Core agent set (11 agents)
├── agent-teams/      # Pre-configured team bundles (4 team configurations)
├── tasks/           # All task workflow files (24 task files)
├── templates/       # All template files (13 template files)
├── checklists/      # All checklist files (6 checklist files)
├── data/           # Agent context and knowledge base files (6 data files)
├── utils/          # Utility files and documentation (2 utility files)
├── workflows/      # Process definition files (6 workflow files)
└── config/         # Configuration files (team-roles.yaml, core-config.yaml)
```

**Critical Dependencies for Agent Operations**:
- **Universal Access**: `bmad-kb.md`, `technical-preferences.md`, `workflow-management.md`
- **Document Generation**: All template files must be accessible to all agents
- **Task Execution**: All task files must be resolvable via `.lcagents/{type}/{name}` pattern
- **Team Management**: Agent team configurations enable multi-agent workflows
- **Validation**: All checklist files must be available for quality control

#### 5. Basic RBAC
- Simple `team-roles.yaml` configuration
- GitHub username-based role assignment
- Basic permission validation (who can use which agent)

#### 6. Document Generation System
- Project ID validation (ABC-1234, GC-5678, PROJ-9999 formats)
- `.lcagents/docs/{PROJECT_ID}/` structure enforcement
- Full BMAD-Core template system (PRD, stories, gates, etc.)
- User prompting for missing project IDs
- Runtime template resolution from `.lcagents/templates/` directory

### Phase 2 - Enhanced Functionality
**Goal: Complete BMAD-Core agent coverage and improved workflows**

#### 6. Additional BMAD-Core Agents
**Engineering Manager (em)** - Full replication of BMAD-Core EM agent:
- Commands: All BMAD-Core EM commands
- Dependencies: Complete EM resource set from BMAD-Core

**Architect (architect)** - Full replication of BMAD-Core Architect agent:
- Commands: All BMAD-Core Architect commands  
- Dependencies: Complete Architect resource set from BMAD-Core

**Scrum Master (sm)** - Full replication of BMAD-Core SM agent:
- Commands: All BMAD-Core SM commands
- Dependencies: Complete SM resource set from BMAD-Core

**Additional Specialist Agents**:
- **Business Analyst (analyst)** - Market research and requirements
- **Product Owner (po)** - Backlog management and story validation
- **UX Expert (ux-expert)** - UI/UX design and prototyping

#### 7. Complete BMAD-Core Resource Set
**All Tasks**: Complete replication of `.bmad-core/tasks/` directory
**All Templates**: Complete replication of `.bmad-core/templates/` directory  
**All Checklists**: Complete replication of `.bmad-core/checklists/` directory
**All Data Files**: Complete replication of `.bmad-core/data/` directory
**All Workflows**: Complete replication of `.bmad-core/workflows/` directory

#### 8. Meta Agents (BMAD-Core Compatible)
- **BMad Master (bmad-master)** - Universal task executor
- **BMad Orchestrator (bmad-orchestrator)** - Multi-agent coordination
- Complete replication of meta-agent capabilities and dependencies

#### 9. Enhanced Templates and Workflows
- All BMAD-Core templates fully operational
- Complete workflow orchestration system
- Agent team configurations (team-all, team-fullstack, etc.)

#### 10. Basic Audit Trail
- Simple audit logging to `.lcagents/logs/audit.log`
- User action tracking (who did what, when)
- File operation logging (read/write/create)

### Phase 3 - Advanced Features
**Goal: Production-ready with comprehensive capabilities**

#### 10. Comprehensive RBAC
- GitHub organization membership verification
- Cross-functional role permissions
- Permission denial logging and alerts

#### 11. Advanced Audit System
- Detailed audit events with project attribution
- Audit log rotation and cleanup
- Basic audit queries (`@lcagents audit logs --user john-doe`)

#### 12. Workflow Orchestration
- Sequential workflow steps between agents
- Handoff validation between roles
- Workflow state tracking

#### 13. Project Management Features
- Project listing and discovery
- Existing document awareness
- Project-based work organization

### Phase 4 - Enterprise Features
**Goal: Scale and organizational integration**

#### 14. Advanced Analytics
- Usage reporting and metrics
- Team productivity insights
- Compliance reporting

#### 15. Configuration Management
- Team-specific configuration templates
- Organizational standards enforcement
- Custom agent behaviors

#### 16. Integration Enhancements
- Git hooks integration
- IDE-specific optimizations
- Advanced GitHub integration

### Implementation Priority Rationale

#### MVP Focus (Phase 1)
- **Installation System**: Essential for user onboarding
- **GitHub Copilot Core**: Primary interface - must work seamlessly
- **3 Essential Agents**: PM, Dev, QA cover 80% of daily workflows
- **Basic RBAC**: Security requirement - prevent unauthorized access
- **Document Generation**: Core value proposition

#### Phase 2 Additions
- **Complete Role Coverage**: EM and Architect complete the team
- **Brownfield Support**: Critical for real-world adoption
- **Enhanced Templates**: Quality and consistency improvements

#### Phase 3 Maturity
- **Advanced RBAC**: Enterprise security requirements
- **Comprehensive Audit**: Compliance and accountability
- **Workflow Orchestration**: Process standardization

#### Phase 4 Scale
- **Analytics**: Organizational insights and improvement
- **Enterprise Integration**: Large-scale deployment support

### Success Metrics

#### MVP Success Criteria
- Teams can install and use basic agents with BMAD-Core compatibility
- All BMAD-Core agent commands work identically in LCAgents
- Documents are generated with proper organization and match BMAD-Core formats
- Role-based access works correctly
- GitHub Copilot integration is seamless
- All critical task workflows execute successfully (create-doc, develop-story, review-story, etc.)
- Template resolution and rendering works for all MVP templates
- Agent dependency loading works correctly at runtime

#### Phase 1 Technical Validation
- **Agent Command Compatibility**: All replicated commands function identically to BMAD-Core
- **Complete Resource Resolution**: Agents can load from all resource types:
  - Tasks (24 files) from `.lcagents/tasks/`
  - Templates (13 files) from `.lcagents/templates/`
  - Checklists (6 files) from `.lcagents/checklists/`
  - Data files (6 files) from `.lcagents/data/`
  - Utilities (2 files) from `.lcagents/utils/`
  - Workflows (6 files) from `.lcagents/workflows/`
  - Agent teams (4 files) from `.lcagents/agent-teams/`
- **Template Processing**: YAML templates render correctly with user input
- **Multi-Directory Support**: Resource resolution works across all BMAD-Core directory types
- **Agent Team Loading**: Team configurations load and provide multi-agent capabilities
- **Knowledge Base Access**: `bmad-kb.md` and other data files accessible to all agents
- **Utility Integration**: Workflow management and documentation utilities functional
- **Workflow Execution**: Complex workflows like story development and QA gates complete successfully
- **File Operations**: Document creation, modification, and organization works as specified
- **Error Handling**: Clear error messages when dependencies are missing or malformed

#### Full Product Success Criteria
- 90%+ team adoption across organization
- Standardized workflows across all teams
- Measurable improvement in documentation quality
- Reduced onboarding time for new team members
- Compliance with organizational standards and audit requirements

## Troubleshooting and Support

### Common Installation Issues

#### Permission Errors
```bash
# If you encounter permission issues during installation
sudo npm install -g @lendingclub/lcagents
# Or use npx without global installation
npx @lendingclub/lcagents init
```

#### Configuration Issues
```bash
# Reset configuration to defaults
lcagents config --reset

# Validate current configuration
lcagents config --validate

# View current configuration
lcagents config --show
```

#### Agent Activation Problems
```bash
# Check agent status
lcagents status --verbose

# Reload agent definitions
lcagents reload-agents

# Clear cache and restart
lcagents cache --clear
lcagents restart
```

### Diagnostic Commands

```bash
# System information
lcagents --version
lcagents doctor              # Run system diagnostics

# Debug mode
lcagents --debug activate pm
lcagents --debug *create-prd

# Export logs for support
lcagents logs --export support-logs.zip
```

### Customization Support

#### Custom Agent Creation
```bash
# Create custom agent from template
lcagents create-agent --name "custom-role" --template base-agent.yaml

# Validate custom agent
lcagents validate-agent custom-role.yaml
```

#### Template Customization
```bash
# Override default templates
lcagents customize template story-template.yaml

# Create organization-specific templates
lcagents create-template --type story --org-specific
```

### Enterprise Features

#### Multi-Repository Management
```bash
# Initialize LCAgents across multiple repositories
lcagents init --batch --repos repo1,repo2,repo3

# Sync configurations across repositories
lcagents sync --config team-config.json --target all-repos
```

#### Reporting and Analytics
```bash
# Generate team productivity reports
lcagents report --type team-velocity --period monthly

# Export metrics for analysis
lcagents metrics --export --format json

# Integration with project management tools
lcagents integrate --tool jira --config jira-config.json
```

This architecture provides a robust foundation for standardizing engineering practices while maintaining flexibility for team-specific adaptations across GitHub Copilot supported IDEs.
