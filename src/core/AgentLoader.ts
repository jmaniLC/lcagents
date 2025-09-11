import * as path from 'path';
import * as yaml from 'yaml';
import { AgentDefinition, AgentCommand, ParsedAgent, AgentValidationResult } from '../types/AgentDefinition';
import { LayerManager } from './LayerManager';

export interface AgentLoadResult {
  success: boolean;
  agent?: ParsedAgent;
  error?: string;
}

export class AgentLoader {
  private layerManager: LayerManager;
  private loadedAgents: Map<string, ParsedAgent> = new Map();

  constructor(basePath: string) {
    this.layerManager = new LayerManager(basePath);
  }

  /**
   * Load a specific agent by name
   */
  async loadAgent(agentName: string): Promise<AgentLoadResult> {
    try {
      // Check if agent is already loaded
      const cachedAgent = this.loadedAgents.get(agentName);
      if (cachedAgent) {
        return {
          success: true,
          agent: cachedAgent
        };
      }

      // Resolve agent file - try both .yaml and .md extensions
      let agentContent: string | null = null;
      let agentPath: string | null = null;
      
      // Try .yaml extension first
      agentContent = await this.layerManager.readResource('agents', `${agentName}.yaml`);
      if (agentContent) {
        agentPath = await this.layerManager.getResourcePath('agents', `${agentName}.yaml`);
      } else {
        // Try .md extension
        agentContent = await this.layerManager.readResource('agents', `${agentName}.md`);
        if (agentContent) {
          agentPath = await this.layerManager.getResourcePath('agents', `${agentName}.md`);
        }
      }
      
      if (!agentContent || !agentPath) {
        return {
          success: false,
          error: `Agent not found: ${agentName} (tried .yaml and .md)`
        };
      }

      // Parse agent content (YAML or Markdown with YAML front-matter)
      const parseResult = agentPath.endsWith('.md') 
        ? this.parseAgentMarkdown(agentContent, agentName, agentPath)
        : this.parseAgentYaml(agentContent, agentName, agentPath);
      if (!parseResult.success) {
        return parseResult;
      }

      // Validate agent definition
      const validation = this.validateAgent(parseResult.agent!.definition);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Agent validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Cache the loaded agent
      this.loadedAgents.set(agentName, parseResult.agent!);

      return {
        success: true,
        agent: parseResult.agent!
      };
    } catch (error) {
      return {
        success: false,
        error: `Error loading agent ${agentName}: ${error}`
      };
    }
  }

  /**
   * Load all available agents
   */
  async loadAllAgents(): Promise<{ loaded: ParsedAgent[]; errors: string[] }> {
    const loaded: ParsedAgent[] = [];
    const errors: string[] = [];

    try {
      const agentResources = await this.layerManager.listResources('agents');
      
      for (const resource of agentResources) {
        const fileName = resource.name;
        if (fileName.endsWith('.yaml') || fileName.endsWith('.yml') || fileName.endsWith('.md')) {
          const agentName = path.basename(fileName, path.extname(fileName));
          const result = await this.loadAgent(agentName);
          
          if (result.success && result.agent) {
            loaded.push(result.agent);
          } else {
            errors.push(result.error || `Failed to load ${agentName}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Error loading agents: ${error}`);
    }

    return { loaded, errors };
  }

  /**
   * Parse agent YAML content into ParsedAgent
   */
  private parseAgentYaml(content: string, agentName: string, filePath: string): AgentLoadResult {
    try {
      const yamlData = yaml.parse(content);
      
      if (!yamlData || typeof yamlData !== 'object') {
        return {
          success: false,
          error: `Invalid YAML structure in ${agentName}`
        };
      }

      const definition: AgentDefinition = {
        name: agentName,
        id: yamlData.id || agentName,
        title: yamlData.title || yamlData.name || agentName,
        icon: yamlData.icon || '🤖',
        whenToUse: yamlData.whenToUse || yamlData['when-to-use'] || yamlData.description || '',
        customization: yamlData.customization || null,
        persona: {
          role: yamlData.persona?.role || '',
          style: yamlData.persona?.style || 'professional',
          identity: yamlData.persona?.identity || '',
          focus: yamlData.persona?.focus || '',
          core_principles: yamlData.persona?.core_principles || yamlData.persona?.['core-principles'] || []
        },
        commands: this.parseCommands(yamlData.commands || {}),
        dependencies: {
          checklists: yamlData.dependencies?.checklists || [],
          data: yamlData.dependencies?.data || [],
          tasks: yamlData.dependencies?.tasks || [],
          templates: yamlData.dependencies?.templates || [],
          utils: yamlData.dependencies?.utils || [],
          workflows: yamlData.dependencies?.workflows || [],
          'agent-teams': yamlData.dependencies?.['agent-teams'] || []
        },
        'activation-instructions': yamlData['activation-instructions'] || [],
        'story-file-permissions': yamlData['story-file-permissions'] || [],
        'help-display-template': yamlData['help-display-template'] || ''
      };

      const parsedAgent: ParsedAgent = {
        definition,
        content,
        filePath,
        isValid: true,
        errors: []
      };

      return {
        success: true,
        agent: parsedAgent
      };
    } catch (error) {
      return {
        success: false,
        error: `YAML parsing error in ${agentName}: ${error}`
      };
    }
  }

  /**
   * Parse agent Markdown content with YAML front-matter into ParsedAgent
   */
  private parseAgentMarkdown(content: string, agentName: string, filePath: string): AgentLoadResult {
    try {
      // Extract YAML block from markdown content
      let yamlContent = '';
      
      // Look for YAML block marked with ```yaml
      const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      if (yamlBlockMatch && yamlBlockMatch[1]) {
        yamlContent = yamlBlockMatch[1];
      } else {
        // Try front-matter style (between --- markers)
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch && frontMatterMatch[1]) {
          yamlContent = frontMatterMatch[1];
        } else {
          return {
            success: false,
            error: `No YAML block found in Markdown agent: ${agentName}`
          };
        }
      }

      // Parse the extracted YAML content
      const yamlData = yaml.parse(yamlContent);
      
      if (!yamlData || typeof yamlData !== 'object') {
        return {
          success: false,
          error: `Invalid YAML structure in Markdown agent: ${agentName}`
        };
      }

      // Use agent field if it exists, otherwise use root level
      const agentData = yamlData.agent || yamlData;

      const definition: AgentDefinition = {
        name: agentData.name || agentName,
        id: agentData.id || agentName,
        title: agentData.title || agentData.name || agentName,
        icon: agentData.icon || '🤖',
        whenToUse: agentData.whenToUse || agentData['when-to-use'] || agentData.description || '',
        customization: agentData.customization || null,
        persona: {
          role: yamlData.persona?.role || '',
          style: yamlData.persona?.style || 'professional',
          identity: yamlData.persona?.identity || '',
          focus: yamlData.persona?.focus || '',
          core_principles: yamlData.persona?.core_principles || yamlData.persona?.['core-principles'] || []
        },
        commands: this.parseCommands(yamlData.commands || {}),
        dependencies: {
          checklists: yamlData.dependencies?.checklists || [],
          data: yamlData.dependencies?.data || [],
          tasks: yamlData.dependencies?.tasks || [],
          templates: yamlData.dependencies?.templates || [],
          utils: yamlData.dependencies?.utils || [],
          workflows: yamlData.dependencies?.workflows || [],
          'agent-teams': yamlData.dependencies?.['agent-teams'] || []
        },
        'activation-instructions': yamlData['activation-instructions'] || [],
        'story-file-permissions': yamlData['story-file-permissions'] || [],
        'help-display-template': yamlData['help-display-template'] || ''
      };

      const parsedAgent: ParsedAgent = {
        definition,
        content,
        filePath,
        isValid: true,
        errors: []
      };

      return {
        success: true,
        agent: parsedAgent
      };
    } catch (error) {
      return {
        success: false,
        error: `Markdown parsing error in ${agentName}: ${error}`
      };
    }
  }

  /**
   * Parse commands from YAML data
   */
  private parseCommands(commandsData: any): Record<string, string | AgentCommand> {
    const commands: Record<string, string | AgentCommand> = {};
    
    if (typeof commandsData === 'object' && commandsData !== null) {
      for (const [name, cmdData] of Object.entries(commandsData)) {
        if (typeof cmdData === 'string') {
          commands[name] = cmdData;
        } else if (typeof cmdData === 'object' && cmdData !== null) {
          const cmd = cmdData as any;
          commands[name] = {
            description: cmd.description || '',
            usage: cmd.usage || '',
            examples: cmd.examples || [],
            dependencies: cmd.dependencies || []
          };
        }
      }
    }
    
    return commands;
  }

  /**
   * Validate an agent definition
   */
  private validateAgent(agent: AgentDefinition): AgentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!agent.name) {
      errors.push('Agent name is required');
    }
    
    if (!agent.title) {
      errors.push('Agent title is required');
    }
    
    if (!agent.persona?.role) {
      errors.push('Agent persona role is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get a loaded agent by name
   */
  getAgent(name: string): ParsedAgent | undefined {
    return this.loadedAgents.get(name);
  }

  /**
   * Get all loaded agents
   */
  getAllLoadedAgents(): ParsedAgent[] {
    return Array.from(this.loadedAgents.values());
  }

  /**
   * Check if an agent is loaded
   */
  isAgentLoaded(name: string): boolean {
    return this.loadedAgents.has(name);
  }

  /**
   * Reload an agent (clear cache and load again)
   */
  async reloadAgent(name: string): Promise<AgentLoadResult> {
    this.loadedAgents.delete(name);
    return this.loadAgent(name);
  }

  /**
   * Clear all loaded agents from cache
   */
  clearCache(): void {
    this.loadedAgents.clear();
  }
}
