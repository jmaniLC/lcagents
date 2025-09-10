import * as fs from 'fs-extra';
import * as path from 'path';
import { LayerManager } from './LayerManager';

export interface CopilotInstructionsConfig {
  projectPath: string;
  podInfo?: {
    name: string;
    id: string;
    owner: string;
  };
  techStack?: string[];
}

export class GitHubCopilotManager {
  private readonly projectPath: string;
  private readonly layerManager: LayerManager;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.layerManager = new LayerManager(projectPath);
  }

  /**
   * Update or create .github/copilot-instructions.md with LCAgents information
   */
  async updateCopilotInstructions(config: CopilotInstructionsConfig): Promise<void> {
    const githubDir = path.join(this.projectPath, '.github');
    const instructionsFile = path.join(githubDir, 'copilot-instructions.md');
    
    // Ensure .github directory exists
    await fs.ensureDir(githubDir);

    // Generate LCAgents section content
    const lcagentsSection = await this.generateLCAgentsSection(config);

    let existingContent = '';
    
    // Read existing file if it exists
    if (await fs.pathExists(instructionsFile)) {
      existingContent = await fs.readFile(instructionsFile, 'utf-8');
      
      // Remove any existing LCAgents section
      existingContent = this.removeLCAgentsSection(existingContent);
    }

    // Create new content with LCAgents section at the top
    const newContent = this.combineSections(lcagentsSection, existingContent);
    
    // Write the updated file
    await fs.writeFile(instructionsFile, newContent, 'utf-8');
  }

  /**
   * Remove LCAgents section from .github/copilot-instructions.md during uninstall
   */
  async removeCopilotInstructions(): Promise<void> {
    const instructionsFile = path.join(this.projectPath, '.github', 'copilot-instructions.md');
    
    if (!await fs.pathExists(instructionsFile)) {
      return; // File doesn't exist, nothing to do
    }

    const content = await fs.readFile(instructionsFile, 'utf-8');
    const updatedContent = this.removeLCAgentsSection(content);
    
    // If the file is now empty or only has whitespace, remove it
    if (updatedContent.trim().length === 0) {
      await fs.remove(instructionsFile);
      
      // Also remove .github directory if it's empty
      const githubDir = path.join(this.projectPath, '.github');
      const githubContents = await fs.readdir(githubDir);
      if (githubContents.length === 0) {
        await fs.remove(githubDir);
      }
    } else {
      // Write back the content without LCAgents section
      await fs.writeFile(instructionsFile, updatedContent, 'utf-8');
    }
  }

  /**
   * Generate the LCAgents section for copilot instructions
   */
  private async generateLCAgentsSection(config: CopilotInstructionsConfig): Promise<string> {
    // Get available agents from the layered system
    const availableAgents = await this.getAvailableAgents();
    
    const section = [
      '# GitHub Copilot Instructions',
      '',
      '## LCAgents Integration',
      '',
      'This project uses **LCAgents** (LendingClub Agents) for enhanced development workflows and specialized AI assistance.',
      '',
      '### Available LCAgents',
      '',
      ...availableAgents.map(agent => `- **@${agent.id}**: ${agent.description}`),
      '',
      '### Usage Patterns',
      '',
      '**Agent Activation:**',
      '```',
      '@lcagents activate <agent-name>',
      '```',
      '',
      '**Quick Commands:**',
      '```',
      '*help          # Show agent-specific commands',
      '*status        # Show current context and progress',
      '*context       # Display project context',
      '*exit          # Return to system mode',
      '```',
      '',
      '### Project Context',
      '',
      ...(config.podInfo ? [
        `**Pod Assignment:** ${config.podInfo.name} (${config.podInfo.id})`,
        `**Pod Owner:** ${config.podInfo.owner}`,
        ''
      ] : []),
      ...(config.techStack && config.techStack.length > 0 ? [
        `**Technology Stack:** ${config.techStack.join(', ')}`,
        ''
      ] : []),
      '### Agent-Specific Guidelines',
      '',
      '**When working with LCAgents:**',
      '- Use agent-specific commands prefixed with `*`',
      '- Leverage agent context for domain-specific assistance',
      '- Follow established workflows and templates',
      '- Maintain consistency with pod-specific standards',
      '',
      '**Integration with GitHub Copilot:**',
      '- LCAgents provide specialized personas and workflows',
      '- GitHub Copilot provides code completion and general assistance',
      '- Use both tools complementarily for optimal development experience',
      '',
      '---',
      ''
    ];

    return section.join('\n');
  }

  /**
   * Get available agents from the layered system
   */
  private async getAvailableAgents(): Promise<Array<{ id: string; description: string }>> {
    const agents: Array<{ id: string; description: string }> = [];
    
    try {
      // Get agents from runtime resolution
      const agentTypes = ['pm', 'dev', 'qa', 'em', 'architect', 'data-engineer', 'devops', 'designer', 'tester', 'analyst', 'security'];
      
      for (const agentType of agentTypes) {
        const agentPath = await this.layerManager.resolveResourcePath('agents', `${agentType}.md`);
        if (agentPath) {
          agents.push({
            id: agentType,
            description: this.getAgentDescription(agentType)
          });
        }
      }
      
      // If no agents found, provide defaults
      if (agents.length === 0) {
        return [
          { id: 'pm', description: 'Product Manager - Requirements, PRDs, and project planning' },
          { id: 'dev', description: 'Developer - Code implementation and technical guidance' },
          { id: 'qa', description: 'Quality Assurance - Testing strategies and quality validation' },
          { id: 'em', description: 'Engineering Manager - Team coordination and technical leadership' },
          { id: 'architect', description: 'System Architect - Design patterns and architecture decisions' }
        ];
      }
      
      return agents;
    } catch (error) {
      console.warn('Could not resolve agents, using defaults:', error);
      return [
        { id: 'pm', description: 'Product Manager - Requirements, PRDs, and project planning' },
        { id: 'dev', description: 'Developer - Code implementation and technical guidance' },
        { id: 'qa', description: 'Quality Assurance - Testing strategies and quality validation' }
      ];
    }
  }

  /**
   * Get description for a specific agent type
   */
  private getAgentDescription(agentType: string): string {
    const descriptions: Record<string, string> = {
      'pm': 'Product Manager - Requirements, PRDs, and project planning',
      'dev': 'Developer - Code implementation and technical guidance',
      'qa': 'Quality Assurance - Testing strategies and quality validation',
      'em': 'Engineering Manager - Team coordination and technical leadership',
      'architect': 'System Architect - Design patterns and architecture decisions',
      'data-engineer': 'Data Engineer - Data pipelines and analytics workflows',
      'devops': 'DevOps Engineer - Deployment, infrastructure, and CI/CD',
      'designer': 'UX/UI Designer - User experience and interface design',
      'tester': 'Test Engineer - Test automation and quality validation',
      'analyst': 'Business Analyst - Requirements analysis and process optimization',
      'security': 'Security Engineer - Security best practices and vulnerability assessment'
    };
    
    return descriptions[agentType] || `${agentType} - Specialized development assistant`;
  }

  /**
   * Remove existing LCAgents section from content
   */
  private removeLCAgentsSection(content: string): string {
    // Look for the GitHub Copilot Instructions header and everything after it if it's only LCAgents content
    // First, check if this is a file that only contains LCAgents content
    if (content.includes('# GitHub Copilot Instructions') && content.includes('## LCAgents Integration')) {
      // Check if there are any other sections after the LCAgents section
      const lcagentsStart = content.indexOf('## LCAgents Integration');
      if (lcagentsStart !== -1) {
        const afterLCAgents = content.substring(lcagentsStart);
        // Look for any other major sections (## headings that aren't part of LCAgents)
        const otherSectionMatch = afterLCAgents.match(/\n## (?!LCAgents)[^\n]+/);
        
        if (!otherSectionMatch) {
          // No other sections found, this is only LCAgents content
          return '';
        } else {
          // There are other sections, just remove the LCAgents part
          const endIndex = lcagentsStart + otherSectionMatch.index!;
          content = content.substring(0, lcagentsStart) + content.substring(endIndex);
        }
      }
    } else {
      // Look for LCAgents section markers in mixed content
      const startMarkers = [
        '## LCAgents Integration',
        '# LCAgents Integration', 
        '### LCAgents Integration'
      ];
      
      for (const marker of startMarkers) {
        const startIndex = content.indexOf(marker);
        if (startIndex !== -1) {
          // Find the end of the section (next ## heading or end of file)
          const afterMarker = content.substring(startIndex);
          const nextSectionMatch = afterMarker.match(/\n(?:#{1,3}\s+(?!LCAgents)[^\n]+|---)/);
          
          if (nextSectionMatch) {
            const endIndex = startIndex + nextSectionMatch.index!;
            content = content.substring(0, startIndex) + content.substring(endIndex);
          } else {
            // Remove from marker to end of file
            content = content.substring(0, startIndex);
          }
          break;
        }
      }
    }
    
    // Clean up extra whitespace
    content = content.replace(/\n{3,}/g, '\n\n').trim();
    
    return content;
  }

  /**
   * Combine LCAgents section with existing content
   */
  private combineSections(lcagentsSection: string, existingContent: string): string {
    if (existingContent.trim().length === 0) {
      return lcagentsSection;
    }
    
    // If existing content doesn't start with a heading, add one
    const trimmedExisting = existingContent.trim();
    if (!trimmedExisting.startsWith('#')) {
      return lcagentsSection + '\n## Additional Instructions\n\n' + trimmedExisting + '\n';
    }
    
    return lcagentsSection + '\n' + trimmedExisting + '\n';
  }
}
