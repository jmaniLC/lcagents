import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Simple runtime configuration manager
 * Consolidates all runtime config into a single, programmer-friendly file
 */
export class RuntimeConfigManager {
  private readonly configPath: string;

  constructor(basePath: string) {
    this.configPath = path.join(basePath, '.lcagents', 'runtime-config.yaml');
  }

  /**
   * Get the current runtime configuration
   */
  async getRuntimeConfig(): Promise<RuntimeConfig> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const yaml = await import('yaml');
        const content = await fs.readFile(this.configPath, 'utf-8');
        return yaml.parse(content) as RuntimeConfig;
      }
      return this.getDefaultConfig();
    } catch (error) {
      console.warn('Failed to load runtime config, using defaults:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Update runtime configuration with partial updates
   */
  async updateRuntimeConfig(updates: Partial<RuntimeConfig>): Promise<void> {
    const existingConfig = await this.getRuntimeConfig();
    const updatedConfig = this.deepMerge(existingConfig, updates);
    updatedConfig.lastUpdated = new Date().toISOString();
    await this.saveRuntimeConfig(updatedConfig);
  }

  /**
   * Save runtime configuration
   */
  async saveRuntimeConfig(config: RuntimeConfig): Promise<void> {
    try {
      const yaml = await import('yaml');
      const content = yaml.stringify(config, { 
        indent: 2,
        lineWidth: 120,
        minContentWidth: 20
      });
      
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeFile(this.configPath, content, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save runtime config: ${errorMessage}`);
    }
  }

  /**
   * Get default configuration for new installations
   */
  private getDefaultConfig(): RuntimeConfig {
    return {
      // Core system settings
      coreSystem: {
        active: 'bmad-core',
        fallback: 'bmad-core'
      },

      // Essential runtime paths (relative to .lcagents)
      paths: {
        qa: 'docs/qa',
        prd: 'docs/prd.md',
        architecture: 'docs/architecture'
      },

      // Feature toggles
      features: {
        markdownExploder: true,
        shardedPrd: true,
        qaGate: true
      },

      // File patterns
      patterns: {
        epicFile: 'epic-{n}*.md',
        storyFile: 'story-{id}.md'
      },

      // GitHub integration
      github: {
        integration: true,
        copilotFeatures: true,
        repository: '',
        branch: 'main'
      },

      // Version info
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update specific configuration values
   */
  async updateConfig(updates: Partial<RuntimeConfig>): Promise<void> {
    const current = await this.getRuntimeConfig();
    const merged = this.deepMerge(current, updates);
    merged.lastUpdated = new Date().toISOString();
    await this.saveRuntimeConfig(merged);
  }

  /**
   * Deep merge configuration objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}

/**
 * Simple, consolidated runtime configuration
 * Contains only values needed at runtime, programmer-friendly
 */
export interface RuntimeConfig {
  // Active core system configuration
  coreSystem: {
    active: string;           // Currently active core system
    fallback: string;         // Fallback if active system fails
  };

  // Essential runtime paths
  paths: {
    qa: string;               // QA documentation location
    prd: string;              // PRD file location  
    architecture: string;     // Architecture docs location
  };

  // Feature flags
  features: {
    markdownExploder: boolean;  // Enable markdown processing
    shardedPrd: boolean;        // Use sharded PRD structure
    qaGate: boolean;            // Enable QA gate checks
  };

  // File patterns for discovery
  patterns: {
    epicFile: string;           // Epic file naming pattern
    storyFile: string;          // Story file naming pattern
  };

  // GitHub integration settings
  github: {
    integration: boolean;       // Enable GitHub integration
    copilotFeatures: boolean;   // Enable GitHub Copilot features
    repository: string;         // Repository URL or name
    branch: string;             // Default branch
  };

  // Metadata
  version: string;
  lastUpdated: string;
}
