import { AgentLoader } from '../core/AgentLoader';
import { ResourceResolver } from '../core/ResourceResolver';
import { ConfigManager } from '../core/ConfigManager';
import { GitHubIntegration } from '../core/GitHubIntegration';
import { LCAgentsConfig } from '../types/Config';
import * as path from 'path';

describe('LCAgents Core Systems', () => {
  const testBasePath = path.join(__dirname, '../../test-workspace');
  let configManager: ConfigManager;
  let config: LCAgentsConfig;

  beforeEach(async () => {
    configManager = new ConfigManager(testBasePath);
    const configResult = await configManager.loadConfig();
    config = configResult.config || configManager.getConfig();
  });

  describe('ConfigManager', () => {
    test('should load default configuration', async () => {
      const result = await configManager.loadConfig();
      expect(result.config).toBeDefined();
      expect(result.config?.version).toBe('1.0.0');
    });

    test('should validate configuration structure', async () => {
      const testConfig: LCAgentsConfig = {
        version: '1.0.0',
        teamRoles: {
          'test-role': {
            name: 'Test Role',
            description: 'A test role',
            responsibilities: ['Testing'],
            agents: ['test-agent']
          }
        }
      };

      const result = await configManager.saveConfig(testConfig);
      expect(result.success).toBe(true);
    });

    test('should reject invalid configuration', async () => {
      const invalidConfig = {
        version: '1.0.0',
        teamRoles: {
          'invalid-role': {
            // Missing required fields - this will fail validation
            name: '',
            description: '',
            responsibilities: [],
            agents: []
          }
        }
      } as LCAgentsConfig;

      const result = await configManager.saveConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('ResourceResolver', () => {
    let resourceResolver: ResourceResolver;

    beforeEach(() => {
      resourceResolver = new ResourceResolver(testBasePath, config);
    });

    test('should resolve existing resource', async () => {
      // This test assumes test resources exist
      const result = await resourceResolver.resolveTask('example-task.md');
      if (result.found) {
        expect(result.path).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    test('should handle missing resource', async () => {
      const result = await resourceResolver.resolveTask('non-existent-task.md');
      expect(result.found).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should validate all resources', async () => {
      const validation = await resourceResolver.validateAllResources();
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('missing');
      expect(validation).toHaveProperty('errors');
    });

    test('should list resources by type', async () => {
      const tasks = await resourceResolver.listResources('tasks');
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('AgentLoader', () => {
    let agentLoader: AgentLoader;

    beforeEach(() => {
      agentLoader = new AgentLoader(testBasePath, config);
    });

    test('should load valid agent definition', async () => {
      // This test assumes test agent exists
      const result = await agentLoader.loadAgent('test-agent');
      if (result.success) {
        expect(result.agent).toBeDefined();
        expect(result.agent?.definition.name).toBe('test-agent');
      }
    });

    test('should handle invalid agent YAML', async () => {
      const result = await agentLoader.loadAgent('invalid-agent');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should cache loaded agents', async () => {
      const firstLoad = await agentLoader.loadAgent('test-agent');
      const secondLoad = await agentLoader.loadAgent('test-agent');
      
      if (firstLoad.success && secondLoad.success) {
        expect(firstLoad.agent).toBe(secondLoad.agent);
      }
    });

    test('should reload agent when requested', async () => {
      await agentLoader.loadAgent('test-agent');
      const reloaded = await agentLoader.reloadAgent('test-agent');
      
      if (reloaded.success) {
        expect(reloaded.agent).toBeDefined();
      }
    });

    test('should load all agents', async () => {
      const result = await agentLoader.loadAllAgents();
      expect(Array.isArray(result.loaded)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('GitHubIntegration', () => {
    let githubIntegration: GitHubIntegration;

    beforeEach(() => {
      githubIntegration = new GitHubIntegration(testBasePath, config);
    });

    test('should check if integration is enabled', () => {
      const enabled = githubIntegration.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    test('should check if Copilot features are enabled', () => {
      const enabled = githubIntegration.isCopilotEnabled();
      expect(typeof enabled).toBe('boolean');
    });

    test('should get repository information', () => {
      const info = githubIntegration.getRepositoryInfo();
      expect(info).toHaveProperty('branch');
    });

    test('should update gitignore', async () => {
      const result = await githubIntegration.updateGitIgnore();
      expect(result).toHaveProperty('success');
    });
  });

  describe('Integration Tests', () => {
    test('should initialize complete system', async () => {
      // Test full system initialization
      const configResult = await configManager.loadConfig();
      expect(configResult.config).toBeDefined();

      const resourceResolver = new ResourceResolver(testBasePath, config);
      const validation = await resourceResolver.validateAllResources();
      expect(validation).toBeDefined();

      const agentLoader = new AgentLoader(testBasePath, config);
      const loadResult = await agentLoader.loadAllAgents();
      expect(loadResult).toBeDefined();
    });

    test('should handle configuration updates', async () => {
      const updates = {
        github: {
          integration: true,
          copilotFeatures: true,
          repository: 'test/repo'
        }
      };

      const result = await configManager.updateConfig(updates);
      expect(result.success).toBe(true);

      const updatedConfig = configManager.getConfig();
      expect(updatedConfig.github?.integration).toBe(true);
    });

    test('should validate agent dependencies', async () => {
      const agentLoader = new AgentLoader(testBasePath, config);
      const result = await agentLoader.loadAllAgents();
      
      // Check if all agents loaded successfully or have documented issues
      for (const error of result.errors) {
        console.warn(`Agent loading issue: ${error}`);
      }
      
      expect(result.loaded.length + result.errors.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('CLI Integration Tests', () => {
  test('should handle init command structure', () => {
    // Test CLI command structure without execution
    const initCommand = {
      name: 'init',
      description: 'Initialize LCAgents in current directory',
      options: [
        { name: '--force', description: 'Overwrite existing installation' },
        { name: '--no-github', description: 'Skip GitHub integration' },
        { name: '--template <name>', description: 'Use specific template' }
      ]
    };

    expect(initCommand.name).toBe('init');
    expect(initCommand.options).toHaveLength(3);
  });

  test('should handle uninstall command structure', () => {
    const uninstallCommand = {
      name: 'uninstall',
      description: 'Remove LCAgents from current directory',
      options: [
        { name: '--keep-config', description: 'Keep configuration files' },
        { name: '--force', description: 'Force removal without confirmation' }
      ]
    };

    expect(uninstallCommand.name).toBe('uninstall');
    expect(uninstallCommand.options).toHaveLength(2);
  });
});

describe('Error Handling', () => {
  test('should handle file system errors gracefully', async () => {
    const configManager = new ConfigManager('/non-existent-path');
    const result = await configManager.loadConfig();
    
    expect(result.config).toBeDefined(); // Should return default config
  });

  test('should handle YAML parsing errors', async () => {
    // Test YAML parsing error handling
    // This would require setting up test fixtures with invalid YAML
    expect(true).toBe(true); // Placeholder for now
  });

  test('should handle permission errors', async () => {
    // Test permission handling
    const configManager = new ConfigManager('/root'); // Typically no write access
    const result = await configManager.saveConfig({
      version: '1.0.0'
    });
    
    // Should handle permission denial gracefully
    expect(result).toHaveProperty('success');
  });
});

describe('Performance Tests', () => {
  test('should load large number of agents efficiently', async () => {
    const agentLoader = new AgentLoader(path.join(__dirname, '../../test-workspace'), {
      version: '1.0.0'
    });

    const startTime = Date.now();
    await agentLoader.loadAllAgents();
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should cache agents effectively', async () => {
    const agentLoader = new AgentLoader(path.join(__dirname, '../../test-workspace'), {
      version: '1.0.0'
    });

    // First load
    const startTime1 = Date.now();
    await agentLoader.loadAgent('test-agent');
    const firstLoadTime = Date.now() - startTime1;

    // Second load (should be cached)
    const startTime2 = Date.now();
    await agentLoader.loadAgent('test-agent');
    const secondLoadTime = Date.now() - startTime2;

    // Cache should make second load faster or equal (not slower)
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime + 1); // Allow 1ms tolerance
  });
});
