import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  LayerConfig, 
  LayerType, 
  LayerResolutionResult,
  AgentResolutionPath,
  ResourceResolver
} from '../types/CoreSystem';
import { CoreSystemManager } from './CoreSystemManager';
import { RuntimeConfigManager } from './RuntimeConfigManager';

export class LayerManager implements ResourceResolver {
  private readonly lcagentsPath: string;
  private readonly coreSystemManager: CoreSystemManager;
  private readonly runtimeConfigManager: RuntimeConfigManager;

  constructor(basePath: string) {
    this.lcagentsPath = path.join(basePath, '.lcagents');
    this.coreSystemManager = new CoreSystemManager(basePath);
    this.runtimeConfigManager = new RuntimeConfigManager(basePath);
  }

  /**
   * Get layer configuration
   */
  getLayerConfig(): LayerConfig[] {
    return [
      {
        name: 'core',
        type: 'core',
        priority: 1,
        readonly: true,
        path: path.join(this.lcagentsPath, 'core')
      },
      {
        name: 'org',
        type: 'org',
        priority: 2,
        readonly: false,
        path: path.join(this.lcagentsPath, 'org')
      },
      {
        name: 'custom',
        type: 'custom',
        priority: 3,
        readonly: false,
        path: path.join(this.lcagentsPath, 'custom')
      },
      {
        name: 'runtime',
        type: 'runtime',
        priority: 4,
        readonly: false,
        path: path.join(this.lcagentsPath, 'runtime')
      }
    ];
  }

  /**
   * Resolve agent with layer precedence
   */
  async resolveAgent(agentId: string, coreSystem?: string): Promise<AgentResolutionPath> {
    const activeCore = coreSystem || await this.coreSystemManager.getActiveCoreSystem() || 'bmad-core';
    
    const activeCoreSystem = await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCoreSystem) {
      return { 
        agentId, 
        coreSystem: '', 
        corePath: '', 
        finalPath: '', 
        layerSources: [] 
      };
    }
    
    const corePath = path.join(this.lcagentsPath, 'core', `.${activeCoreSystem}`, 'agents', `${agentId}.md`);
    const orgOverridePath = path.join(this.lcagentsPath, 'org', 'agents', 'overrides', `${agentId}.yaml`);
    const customOverridePath = path.join(this.lcagentsPath, 'custom', 'agents', 'overrides', `${agentId}.yaml`);
    
    const layerSources: LayerType[] = ['core'];
    let finalPath = corePath;

    // Check if org override exists
    if (await fs.pathExists(orgOverridePath)) {
      layerSources.push('org');
    }

    // Check if custom override exists  
    if (await fs.pathExists(customOverridePath)) {
      layerSources.push('custom');
    }

    // For now, final path is the core agent
    // Later this would merge the overrides and create a resolved agent
    
    return {
      agentId,
      coreSystem: activeCore,
      corePath,
      ...(await fs.pathExists(orgOverridePath) && { orgOverridePath }),
      ...(await fs.pathExists(customOverridePath) && { customOverridePath }),
      finalPath,
      layerSources
    };
  }

  /**
   * Resolve task with layer precedence
   */
  async resolveTask(taskId: string, coreSystem?: string): Promise<LayerResolutionResult> {
    // Check custom layer first (highest priority)
    const customPath = path.join(this.lcagentsPath, 'custom', 'tasks', `${taskId}.md`);
    if (await fs.pathExists(customPath)) {
      const stats = await fs.stat(customPath);
      return {
        path: customPath,
        source: 'custom',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Check org layer
    const orgPath = path.join(this.lcagentsPath, 'org', 'tasks', `${taskId}.md`);
    if (await fs.pathExists(orgPath)) {
      const stats = await fs.stat(orgPath);
      return {
        path: orgPath,
        source: 'org',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Fall back to core layer
    const activeCoreSystem = coreSystem || await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCoreSystem) {
      return { path: '', source: 'core', exists: false };
    }
    
    const corePath = path.join(this.lcagentsPath, 'core', `.${activeCoreSystem}`, 'tasks', `${taskId}.md`);
    if (await fs.pathExists(corePath)) {
      const stats = await fs.stat(corePath);
      return {
        path: corePath,
        source: 'core',
        exists: true,
        lastModified: stats.mtime
      };
    }

    return {
      path: corePath,
      source: 'core',
      exists: false
    };
  }

  /**
   * Resolve template with layer precedence
   */
  async resolveTemplate(templateId: string, coreSystem?: string): Promise<LayerResolutionResult> {
    // Check custom layer first
    const customPath = path.join(this.lcagentsPath, 'custom', 'templates', `${templateId}`);
    if (await fs.pathExists(customPath)) {
      const stats = await fs.stat(customPath);
      return {
        path: customPath,
        source: 'custom',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Check org layer
    const orgPath = path.join(this.lcagentsPath, 'org', 'templates', `${templateId}`);
    if (await fs.pathExists(orgPath)) {
      const stats = await fs.stat(orgPath);
      return {
        path: orgPath,
        source: 'org',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Fall back to core layer
    const activeCoreSystem = coreSystem || await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCoreSystem) {
      return { path: '', source: 'core', exists: false };
    }
    
    const corePath = path.join(this.lcagentsPath, 'core', `.${activeCoreSystem}`, 'templates', `${templateId}`);
    if (await fs.pathExists(corePath)) {
      const stats = await fs.stat(corePath);
      return {
        path: corePath,
        source: 'core',
        exists: true,
        lastModified: stats.mtime
      };
    }

    return {
      path: corePath,
      source: 'core',
      exists: false
    };
  }

  /**
   * Generic resource resolver with layer precedence
   */
  async resolveResource(
    resourceType: string, 
    resourceId: string, 
    coreSystem?: string
  ): Promise<LayerResolutionResult> {
    const activeCore = coreSystem || await this.coreSystemManager.getActiveCoreSystem() || 'bmad-core';
    
    // Check custom layer first
    const customPath = path.join(this.lcagentsPath, 'custom', resourceType, resourceId);
    if (await fs.pathExists(customPath)) {
      const stats = await fs.stat(customPath);
      return {
        path: customPath,
        source: 'custom',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Check org layer
    const orgPath = path.join(this.lcagentsPath, 'org', resourceType, resourceId);
    if (await fs.pathExists(orgPath)) {
      const stats = await fs.stat(orgPath);
      return {
        path: orgPath,
        source: 'org',
        exists: true,
        lastModified: stats.mtime
      };
    }

    // Fall back to core layer
    const corePath = path.join(this.lcagentsPath, 'core', `.${activeCore}`, resourceType, resourceId);
    if (await fs.pathExists(corePath)) {
      const stats = await fs.stat(corePath);
      return {
        path: corePath,
        source: 'core',
        exists: true,
        lastModified: stats.mtime
      };
    }

    return {
      path: corePath,
      source: 'core',
      exists: false
    };
  }

  /**
   * Check if legacy flat structure exists
   */
  async hasLegacyStructure(): Promise<boolean> {
    const legacyDirs = ['agents', 'tasks', 'templates', 'checklists', 'data', 'utils', 'workflows', 'agent-teams'];
    
    for (const dir of legacyDirs) {
      const dirPath = path.join(this.lcagentsPath, dir);
      if (await fs.pathExists(dirPath)) {
        const stats = await fs.lstat(dirPath);
        // If it's a real directory (not a symlink), it's legacy
        if (stats.isDirectory() && !stats.isSymbolicLink()) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Create the layered directory structure
   */
  async createLayeredStructure(): Promise<void> {
    // Create base directories (core directory is created by CoreSystemManager with dot prefix)
    await fs.ensureDir(path.join(this.lcagentsPath, 'org'));
    await fs.ensureDir(path.join(this.lcagentsPath, 'custom'));
    await fs.ensureDir(path.join(this.lcagentsPath, 'runtime'));

    // Create org layer structure
    await this.createOrgLayerStructure();

    // Create custom layer structure
    await this.createCustomLayerStructure();

    // Create runtime structure
    await this.createRuntimeStructure();
  }

  /**
   * Create organization layer structure
   */
  private async createOrgLayerStructure(): Promise<void> {
    const orgPath = path.join(this.lcagentsPath, 'org');
    
    // Create directories
    await fs.ensureDir(path.join(orgPath, 'agents', 'overrides'));
    await fs.ensureDir(path.join(orgPath, 'templates'));
    await fs.ensureDir(path.join(orgPath, 'policies'));
    await fs.ensureDir(path.join(orgPath, 'config'));

    // Create example override file
    const exampleOrgOverride = `# Example Organization Agent Override
# This file demonstrates how to override agent configurations at the organization level
# Place this file in .lcagents/org/agents/overrides/{agent-name}.yaml

agentOverrides:
  pm:
    # Override specific prompts or behaviors for PM agent
    customPrompts:
      - "Always ensure compliance with company coding standards"
      - "Include security considerations in all planning"
    
    # Add organization-specific tools or integrations
    additionalTools:
      - "JIRA integration for ticket management"
      - "Confluence for documentation standards"
    
    # Override template preferences
    preferredTemplates:
      - "company-prd-template.yaml"
      - "security-review-template.yaml"

# Company-wide configuration
organizationConfig:
  companyName: "LendingClub"
  complianceLevel: "financial-services"
  securityRequirements: "strict"
  documentationStandards: "confluence-based"
`;

    await fs.writeFile(
      path.join(orgPath, 'agents', 'overrides', 'example-org-override.yaml'),
      exampleOrgOverride
    );
  }

  /**
   * Create custom layer structure
   */
  private async createCustomLayerStructure(): Promise<void> {
    const customPath = path.join(this.lcagentsPath, 'custom');
    
    // Create directories
    await fs.ensureDir(path.join(customPath, 'config'));
    await fs.ensureDir(path.join(customPath, 'agents', 'overrides'));
    await fs.ensureDir(path.join(customPath, 'agents'));
    await fs.ensureDir(path.join(customPath, 'templates'));
    await fs.ensureDir(path.join(customPath, 'tasks'));

    // Create pod-config.yaml
    const podConfig = `# Pod-specific Configuration
# This file contains customizations specific to this pod/project

podConfig:
  podName: "example-pod"
  projectType: "web-application"
  teamSize: "small"  # small, medium, large
  
  # Preferred core system (for LCA-004)
  preferredCoreSystem: "bmad-core"
  fallbackCoreSystem: "bmad-core"

  # Agent-specific core system preferences
  agentCorePreferences:
    pm: "bmad-core"
    dev: "bmad-core"
    qa: "bmad-core"

# Pod-specific agent overrides
agentCustomizations:
  # Example: Customize the dev agent for this specific project
  dev:
    additionalContext:
      - "This project uses React with TypeScript"
      - "API follows RESTful conventions"
      - "Testing framework is Jest"
    
    preferredTemplates:
      - "react-component-template.tsx"
      - "api-endpoint-template.ts"

# Custom templates specific to this pod
customTemplates:
  enabled: true
  templatePath: "./templates"

# Task workflow customizations
taskCustomizations:
  # Override task behavior for this pod
  enabled: false
`;

    await fs.writeFile(
      path.join(customPath, 'config', 'pod-config.yaml'),
      podConfig
    );

    // Create example override file
    const exampleOverride = `# Example Pod-specific Agent Override
# This file demonstrates how to customize agents for this specific pod
# Place this file in .lcagents/custom/agents/overrides/{agent-name}.yaml

agentOverrides:
  dev:
    # Pod-specific context and instructions
    customContext:
      - "This is a React-based web application"
      - "Use TypeScript for all new code"
      - "Follow the project's ESLint configuration"
      - "API endpoints are documented in docs/api.md"
    
    # Pod-specific tools and preferences
    toolPreferences:
      - "Visual Studio Code with specific extensions"
      - "Jest for unit testing"
      - "Cypress for integration testing"
    
    # Pod-specific coding standards
    codingStandards:
      - "Use functional components with hooks"
      - "Prefer async/await over promises"
      - "Use CSS modules for styling"

# Pod-specific configuration
podSpecificConfig:
  projectName: "example-web-app"
  techStack: ["React", "TypeScript", "Node.js"]
  testingStrategy: "unit-and-integration"
`;

    await fs.writeFile(
      path.join(customPath, 'agents', 'overrides', 'example-override.yaml'),
      exampleOverride
    );

    // Create example custom agent
    const customAgent = `# Custom Data Engineer Agent
# This is an example of a completely custom agent specific to this pod

## Agent Definition

\`\`\`yaml
agent-id: data-engineer
name: "Data Engineer"
description: "Specialized agent for data pipeline and analytics tasks"
version: "1.0.0"

# Core capabilities
capabilities:
  - "Design data pipelines and ETL processes"
  - "Optimize database queries and schemas"
  - "Implement data validation and quality checks"
  - "Create analytics dashboards and reports"

# Agent-specific commands
commands:
  design-pipeline:
    description: "Design a data pipeline architecture"
    dependencies:
      - tasks/design-data-pipeline.md
      - templates/pipeline-architecture-template.yaml
  
  optimize-query:
    description: "Optimize database queries for performance"
    dependencies:
      - tasks/query-optimization.md
      - data/database-best-practices.md

# Custom tools and integrations
tools:
  - "Apache Airflow for pipeline orchestration"
  - "dbt for data transformation"
  - "Great Expectations for data quality"
  - "Tableau for visualization"

# Data sources and connections
dataSources:
  - "PostgreSQL production database"
  - "Snowflake data warehouse"
  - "S3 data lake"
  - "External APIs and feeds"
\`\`\`

## Activation Instructions

When activated, this agent will help with:
1. Designing robust data pipelines
2. Optimizing database performance
3. Ensuring data quality and validation
4. Creating meaningful analytics and reports

The agent has deep knowledge of modern data engineering practices and can provide guidance on architecture, implementation, and best practices.
`;

    await fs.writeFile(
      path.join(customPath, 'agents', 'custom-data-engineer.md'),
      customAgent
    );
  }

  /**
   * Create runtime structure
   */
  private async createRuntimeStructure(): Promise<void> {
    const runtimePath = path.join(this.lcagentsPath, 'runtime');
    
    await fs.ensureDir(path.join(runtimePath, 'merged-agents'));
    await fs.ensureDir(path.join(runtimePath, 'cache'));
    await fs.ensureDir(path.join(runtimePath, 'logs'));
  }

  /**
   * Build resolution mapping for all resources in the system
   */
  async buildResolutionMap(): Promise<Record<string, string>> {
    const resolutionMap: Record<string, string> = {};
    const resourceTypes = [
      'agents', 'tasks', 'templates', 'checklists', 
      'data', 'utils', 'workflows', 'agent-teams'
    ];

    // Get active core system
    const activeCoreSystem = await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCoreSystem) {
      console.warn('No active core system found for building resolution map');
      return resolutionMap;
    }

    for (const resourceType of resourceTypes) {
      // Check custom layer first (highest priority)
      const customDir = path.join(this.lcagentsPath, 'custom', resourceType);
      if (await fs.pathExists(customDir)) {
        const customFiles = await fs.readdir(customDir);
        for (const file of customFiles) {
          const key = `${resourceType}/${file}`;
          resolutionMap[key] = path.join('custom', resourceType, file);
        }
      }

      // Check org layer
      const orgDir = path.join(this.lcagentsPath, 'org', resourceType);
      if (await fs.pathExists(orgDir)) {
        const orgFiles = await fs.readdir(orgDir);
        for (const file of orgFiles) {
          const key = `${resourceType}/${file}`;
          // Only add if not already resolved from custom layer
          if (!resolutionMap[key]) {
            resolutionMap[key] = path.join('org', resourceType, file);
          }
        }
      }

      // Check core layer (lowest priority) - use dot-prefixed directory
      const coreDir = path.join(this.lcagentsPath, 'core', `.${activeCoreSystem}`, resourceType);
      if (await fs.pathExists(coreDir)) {
        const coreFiles = await fs.readdir(coreDir);
        for (const file of coreFiles) {
          const key = `${resourceType}/${file}`;
          // Only add if not already resolved from custom or org layers
          if (!resolutionMap[key]) {
            resolutionMap[key] = path.join('core', `.${activeCoreSystem}`, resourceType, file);
          }
        }
      }
    }

    return resolutionMap;
  }

  /**
   * Create virtual resolution system (no physical files at root level)
   * Resources are accessed through LayerManager.resolve() API only
   */
  async createVirtualResolutionSystem(coreSystemName: string): Promise<void> {
    // NO symbolic links or file copying
    // Resources exist only in their respective layers
    // Access is provided through virtual resolution API
    
    console.log(`🔧 Virtual Resolution: Core system '${coreSystemName}' resources available via LayerManager API`);
    console.log(`📁 Physical location: ${path.join(this.lcagentsPath, 'core', `.${coreSystemName}`)}`);
    console.log(`🔍 Access pattern: LayerManager.resolveResourcePath(type, filename)`);
    
    // Create resolution mapping for runtime cache
    const resolutionMap = await this.buildResolutionMap();
    const runtimeDir = path.join(this.lcagentsPath, 'runtime');
    await fs.ensureDir(runtimeDir);
    
    // Cache the resolution map for performance
    await fs.writeJson(path.join(runtimeDir, 'resource-map.json'), resolutionMap, { spaces: 2 });
    
    // Create simplified runtime configuration (instead of copying multiple config files)
    await this.createRuntimeConfiguration(coreSystemName);
  }

  /**
   * Create simplified runtime configuration for the active core system
   */
  private async createRuntimeConfiguration(coreSystemName: string): Promise<void> {
    // Initialize with defaults
    await this.runtimeConfigManager.updateConfig({
      coreSystem: {
        active: coreSystemName,
        fallback: coreSystemName
      }
    });

    // Load core system specific configuration if available
    const coreConfigPath = path.join(this.lcagentsPath, 'core', `.${coreSystemName}`, 'core-config.yaml');
    if (await fs.pathExists(coreConfigPath)) {
      try {
        const yaml = await import('yaml');
        const coreConfig = yaml.parse(await fs.readFile(coreConfigPath, 'utf-8'));
        
        // Extract only runtime-relevant values
        const runtimeUpdates: any = {};
        
        if (coreConfig.qa?.qaLocation) {
          runtimeUpdates.paths = { qa: coreConfig.qa.qaLocation };
        }
        
        if (coreConfig.prd?.prdFile) {
          runtimeUpdates.paths = { 
            ...runtimeUpdates.paths,
            prd: coreConfig.prd.prdFile 
          };
        }
        
        if (coreConfig.markdownExploder !== undefined) {
          runtimeUpdates.features = { markdownExploder: coreConfig.markdownExploder };
        }
        
        if (coreConfig.prd?.epicFilePattern) {
          runtimeUpdates.patterns = { epicFile: coreConfig.prd.epicFilePattern };
        }
        
        // Update runtime config with extracted values
        if (Object.keys(runtimeUpdates).length > 0) {
          await this.runtimeConfigManager.updateConfig(runtimeUpdates);
        }
        
        // Remove the core-config.yaml file since its values are now in runtime-config.yaml
        // This eliminates configuration duplication
        await fs.remove(coreConfigPath);
        console.log(`🧹 Cleaned up redundant core-config.yaml (values extracted to runtime-config.yaml)`);
        
      } catch (error) {
        console.warn(`Failed to process core config from ${coreSystemName}:`, error);
      }
    }
  }

  /**
   * Get the physical file path for a resource using virtual resolution
   * This is the main API for accessing resources in the layered architecture
   */
  async getResourcePath(resourceType: string, resourceName: string): Promise<string | null> {
    return await this.resolveResourcePath(resourceType, resourceName);
  }

  /**
   * Read a resource file content using virtual resolution
   */
  async readResource(resourceType: string, resourceName: string): Promise<string | null> {
    const resourcePath = await this.getResourcePath(resourceType, resourceName);
    
    if (resourcePath && await fs.pathExists(resourcePath)) {
      return await fs.readFile(resourcePath, 'utf-8');
    }
    
    return null;
  }

  /**
   * List all available resources of a given type across all layers
   */
  async listResources(resourceType: string): Promise<Array<{ name: string; source: string; path: string }>> {
    const resources: Array<{ name: string; source: string; path: string }> = [];
    const seen = new Set<string>();
    
    // Get active core system
    const activeCore = await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCore) {
      return [];
    }

    const layers = [
      { name: 'custom', path: path.join(this.lcagentsPath, 'custom', resourceType) },
      { name: 'org', path: path.join(this.lcagentsPath, 'org', resourceType) },
      { name: 'core', path: path.join(this.lcagentsPath, 'core', `.${activeCore}`, resourceType) }
    ];

    // Check each layer in precedence order
    for (const layer of layers) {
      if (await fs.pathExists(layer.path)) {
        const files = await fs.readdir(layer.path);
        
        for (const file of files) {
          if (!seen.has(file)) {
            seen.add(file);
            resources.push({
              name: file,
              source: layer.name,
              path: path.join(layer.path, file)
            });
          }
        }
      }
    }

    return resources;
  }

  /**
   * Check if a resource exists using virtual resolution
   */
  async resourceExists(resourceType: string, resourceName: string): Promise<boolean> {
    const resourcePath = await this.getResourcePath(resourceType, resourceName);
    return resourcePath ? await fs.pathExists(resourcePath) : false;
  }

  /**
   * Runtime resource resolution with layer precedence (custom > org > core)
   * This is the primary method for LCA-004 resource lookup
   */
  async resolveResourcePath(resourceType: string, resourceName: string): Promise<string | null> {
    const layers = ['custom', 'org', 'core'];
    
    // Get active core system
    const activeCore = await this.coreSystemManager.getActiveCoreSystem();
    if (!activeCore) {
      return null;
    }

    // Check each layer in precedence order
    for (const layer of layers) {
      let layerPath: string;
      
      if (layer === 'core') {
        layerPath = path.join(this.lcagentsPath, 'core', `.${activeCore}`, resourceType);
      } else {
        layerPath = path.join(this.lcagentsPath, layer, resourceType);
      }
      
      const resourcePath = path.join(layerPath, resourceName);
      
      if (await fs.pathExists(resourcePath)) {
        return resourcePath;
      }
    }
    
    return null;
  }

  /**
   * Get all available resources of a type with layer precedence
   */
  async getAvailableResources(resourceType: string): Promise<Array<{name: string, source: string, path: string}>> {
    const resources = new Map<string, {name: string, source: string, path: string}>();
    const activeCore = await this.coreSystemManager.getActiveCoreSystem();
    
    if (!activeCore) {
      return [];
    }

    // Check layers in reverse precedence to allow overrides
    const layers = [
      { name: 'core', path: path.join(this.lcagentsPath, 'core', `.${activeCore}`, resourceType) },
      { name: 'org', path: path.join(this.lcagentsPath, 'org', resourceType) },
      { name: 'custom', path: path.join(this.lcagentsPath, 'custom', resourceType) }
    ];

    for (const layer of layers) {
      if (await fs.pathExists(layer.path)) {
        const files = await fs.readdir(layer.path);
        
        for (const file of files) {
          const fullPath = path.join(layer.path, file);
          const stats = await fs.lstat(fullPath);
          
          if (stats.isFile()) {
            // Higher precedence layers override lower ones
            resources.set(file, {
              name: file,
              source: layer.name,
              path: fullPath
            });
          }
        }
      }
    }

    return Array.from(resources.values());
  }

  /**
   * Migrate from flat structure to layered structure
   */
  async migrateFromFlatStructure(coreSystemName: string): Promise<void> {
    const backupPath = path.join(this.lcagentsPath, 'migration-backup-' + Date.now());
    
    // Create backup
    await fs.ensureDir(backupPath);

    const resourceTypes = [
      'agents', 'tasks', 'templates', 'checklists',
      'data', 'utils', 'workflows', 'agent-teams'
    ];

    // Move existing flat resources to core layer
    const coreSystemPath = path.join(this.lcagentsPath, 'core', coreSystemName);
    await fs.ensureDir(coreSystemPath);

    for (const resourceType of resourceTypes) {
      const flatPath = path.join(this.lcagentsPath, resourceType);
      
      if (await fs.pathExists(flatPath)) {
        // Backup
        await fs.copy(flatPath, path.join(backupPath, resourceType));
        
        // Move to core system
        const coreResourcePath = path.join(coreSystemPath, resourceType);
        await fs.move(flatPath, coreResourcePath);
      }
    }

    // Create new layered structure
    await this.createLayeredStructure();

    // Set up virtual resolution system (no symlinks)
    await this.createVirtualResolutionSystem(coreSystemName);
  }
}
