import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'yaml';
import { LCAgentsConfig, TeamRole, ConfigValidationResult } from '../types/Config';

export class ConfigManager {
  private configPath: string;
  private config: LCAgentsConfig | null = null;

  constructor(basePath: string) {
    this.configPath = path.join(basePath, '.lcagents', 'config.yaml');
  }

  /**
   * Load configuration from .lcagents/config.yaml
   */
  async loadConfig(): Promise<{ config: LCAgentsConfig | null; error?: string }> {
    try {
      const exists = await fs.pathExists(this.configPath);
      if (!exists) {
        // Return default configuration
        this.config = this.getDefaultConfig();
        return { config: this.config };
      }

      const content = await fs.readFile(this.configPath, 'utf-8');
      const yamlData = yaml.parse(content);
      
      if (!yamlData || typeof yamlData !== 'object') {
        return { config: null, error: 'Invalid YAML structure in config.yaml' };
      }

      this.config = this.parseConfig(yamlData);
      return { config: this.config };
    } catch (error) {
      return { config: null, error: `Error loading config: ${error}` };
    }
  }

  /**
   * Save configuration to .lcagents/config.yaml
   */
  async saveConfig(config: LCAgentsConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate configuration before saving
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Ensure config directory exists
      await fs.ensureDir(path.dirname(this.configPath));

      // Convert to YAML and save
      const yamlContent = yaml.stringify(config, {
        indent: 2,
        lineWidth: 100,
        minContentWidth: 50
      });

      await fs.writeFile(this.configPath, yamlContent, 'utf-8');
      this.config = config;

      return { success: true };
    } catch (error) {
      return { success: false, error: `Error saving config: ${error}` };
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): LCAgentsConfig {
    return this.config || this.getDefaultConfig();
  }

  /**
   * Update specific configuration values
   */
  async updateConfig(updates: Partial<LCAgentsConfig>): Promise<{ success: boolean; error?: string }> {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    return this.saveConfig(newConfig);
  }

  /**
   * Add or update a team role
   */
  async setTeamRole(roleName: string, role: TeamRole): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    if (!config.teamRoles) {
      config.teamRoles = {};
    }
    config.teamRoles[roleName] = role;
    return this.saveConfig(config);
  }

  /**
   * Remove a team role
   */
  async removeTeamRole(roleName: string): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    if (config.teamRoles && config.teamRoles[roleName]) {
      delete config.teamRoles[roleName];
      return this.saveConfig(config);
    }
    return { success: true }; // Already removed
  }

  /**
   * Get a specific team role
   */
  getTeamRole(roleName: string): TeamRole | undefined {
    const config = this.getConfig();
    return config.teamRoles?.[roleName];
  }

  /**
   * List all team roles
   */
  getTeamRoles(): Record<string, TeamRole> {
    const config = this.getConfig();
    return config.teamRoles || {};
  }

  /**
   * Update path configuration
   */
  async updatePaths(paths: Partial<LCAgentsConfig['paths']>): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    config.paths = { ...config.paths, ...paths };
    return this.saveConfig(config);
  }

  /**
   * Reset to default configuration
   */
  async resetToDefaults(): Promise<{ success: boolean; error?: string }> {
    const defaultConfig = this.getDefaultConfig();
    return this.saveConfig(defaultConfig);
  }

  /**
   * Validate configuration structure and values
   */
  private validateConfig(config: LCAgentsConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check team roles
    if (config.teamRoles) {
      for (const [roleName, role] of Object.entries(config.teamRoles)) {
        if (!role.name) {
          errors.push(`Team role '${roleName}' is missing name`);
        }
        if (!role.description) {
          warnings.push(`Team role '${roleName}' is missing description`);
        }
        if (!Array.isArray(role.responsibilities)) {
          errors.push(`Team role '${roleName}' responsibilities must be an array`);
        }
        if (!Array.isArray(role.agents)) {
          errors.push(`Team role '${roleName}' agents must be an array`);
        }
      }
    }

    // Check paths
    if (config.paths) {
      for (const [pathType, pathValue] of Object.entries(config.paths)) {
        if (typeof pathValue !== 'string') {
          errors.push(`Path '${pathType}' must be a string`);
        }
      }
    }

    // Check GitHub integration settings
    if (config.github) {
      if (config.github.integration && typeof config.github.integration !== 'boolean') {
        errors.push('GitHub integration setting must be a boolean');
      }
      if (config.github.copilotFeatures && typeof config.github.copilotFeatures !== 'boolean') {
        errors.push('GitHub Copilot features setting must be a boolean');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Parse YAML data into LCAgentsConfig
   */
  private parseConfig(yamlData: any): LCAgentsConfig {
    return {
      version: yamlData.version || '1.0.0',
      teamRoles: yamlData.teamRoles || yamlData['team-roles'] || {},
      paths: {
        agents: yamlData.paths?.agents || '.lcagents/agents',
        tasks: yamlData.paths?.tasks || '.lcagents/tasks',
        templates: yamlData.paths?.templates || '.lcagents/templates',
        checklists: yamlData.paths?.checklists || '.lcagents/checklists',
        data: yamlData.paths?.data || '.lcagents/data',
        utils: yamlData.paths?.utils || '.lcagents/utils',
        workflows: yamlData.paths?.workflows || '.lcagents/workflows',
        'agent-teams': yamlData.paths?.['agent-teams'] || '.lcagents/agent-teams'
      },
      github: {
        integration: yamlData.github?.integration !== false,
        copilotFeatures: yamlData.github?.copilotFeatures !== false,
        repository: yamlData.github?.repository || '',
        branch: yamlData.github?.branch || 'main'
      },
      customization: yamlData.customization || {}
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): LCAgentsConfig {
    return {
      version: '1.0.0',
      teamRoles: {
        'project-manager': {
          name: 'Project Manager',
          description: 'Oversees project planning, coordination, and delivery',
          responsibilities: [
            'Project planning and scheduling',
            'Resource allocation and management',
            'Risk assessment and mitigation',
            'Stakeholder communication',
            'Progress tracking and reporting'
          ],
          agents: ['pm']
        },
        'developer': {
          name: 'Developer',
          description: 'Handles software development and technical implementation',
          responsibilities: [
            'Code development and implementation',
            'Technical architecture design',
            'Code review and quality assurance',
            'Testing and debugging',
            'Documentation and maintenance'
          ],
          agents: ['dev']
        },
        'analyst': {
          name: 'Business Analyst',
          description: 'Analyzes requirements and provides business insights',
          responsibilities: [
            'Requirements gathering and analysis',
            'Business process modeling',
            'Data analysis and insights',
            'Solution design and validation',
            'Stakeholder requirement translation'
          ],
          agents: ['ba']
        }
      },
      paths: {
        agents: '.lcagents/agents',
        tasks: '.lcagents/tasks',
        templates: '.lcagents/templates',
        checklists: '.lcagents/checklists',
        data: '.lcagents/data',
        utils: '.lcagents/utils',
        workflows: '.lcagents/workflows',
        'agent-teams': '.lcagents/agent-teams'
      },
      github: {
        integration: true,
        copilotFeatures: true,
        repository: '',
        branch: 'main'
      },
      customization: {}
    };
  }

  /**
   * Check if configuration file exists
   */
  async configExists(): Promise<boolean> {
    return fs.pathExists(this.configPath);
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Create initial configuration with user input
   */
  async initializeConfig(options: {
    enableGithub?: boolean;
    enableCopilot?: boolean;
    repository?: string;
    customPaths?: Partial<LCAgentsConfig['paths']>;
  }): Promise<{ success: boolean; error?: string }> {
    console.log('DEBUG ConfigManager: Starting initializeConfig with options:', options);
    
    const defaultConfig = this.getDefaultConfig();
    console.log('DEBUG ConfigManager: Got default config');
    
    // Apply user options
    if (options.enableGithub !== undefined && defaultConfig.github) {
      defaultConfig.github.integration = options.enableGithub;
      console.log('DEBUG ConfigManager: Set GitHub integration to:', options.enableGithub);
    }
    
    if (options.enableCopilot !== undefined && defaultConfig.github) {
      defaultConfig.github.copilotFeatures = options.enableCopilot;
      console.log('DEBUG ConfigManager: Set Copilot features to:', options.enableCopilot);
    }
    
    if (options.repository && defaultConfig.github) {
      defaultConfig.github.repository = options.repository;
      console.log('DEBUG ConfigManager: Set repository to:', options.repository);
    }
    
    if (options.customPaths && defaultConfig.paths) {
      defaultConfig.paths = { ...defaultConfig.paths, ...options.customPaths };
      console.log('DEBUG ConfigManager: Applied custom paths');
    }

    console.log('DEBUG ConfigManager: About to save config');
    const result = await this.saveConfig(defaultConfig);
    console.log('DEBUG ConfigManager: Save config result:', result);
    
    return result;
  }
}
