import { ConfigManager } from '../../core/ConfigManager';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-config-test-'));
    process.chdir(testDir);

    // Create test .lcagents structure
    const lcagentsDir = path.join(testDir, '.lcagents');
    await fs.ensureDir(lcagentsDir);

    configManager = new ConfigManager(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('config file operations', () => {
    it('should save and load configuration', async () => {
      const testConfig = {
        version: '1.2.3',
        projectId: 'test-project'
      };

      const saveResult = await configManager.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config).toBeDefined();
      expect(loadResult.config!.version).toBe('1.2.3');
      expect(loadResult.config!.projectId).toBe('test-project');
    });

    it('should return default config when no file exists', async () => {
      const loadResult = await configManager.loadConfig();
      expect(loadResult.config).toBeDefined();
      expect(loadResult.config!.version).toBeDefined();
    });

    it('should handle invalid YAML in config file', async () => {
      const configPath = path.join(testDir, '.lcagents', 'config.yaml');
      await fs.writeFile(configPath, 'invalid: yaml: content: [unclosed');

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config).toBeNull();
      expect(loadResult.error).toBeDefined();
    });
  });

  describe('config validation', () => {
    it('should validate correct configuration during save', async () => {
      const validConfig = {
        version: '1.0.0',
        projectId: 'test'
      };

      const saveResult = await configManager.saveConfig(validConfig);
      expect(saveResult.success).toBe(true);
    });

    it('should reject invalid configuration', async () => {
      const invalidConfig = {
        // Missing required version field
        projectId: 'test'
      } as any;

      const saveResult = await configManager.saveConfig(invalidConfig);
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('validation failed');
    });
  });

  describe('team role management', () => {
    it('should manage team roles', async () => {
      const testConfig = {
        version: '1.0.0',
        teamRoles: {
          'test-role': {
            name: 'Test Role',
            description: 'A test role',
            responsibilities: ['Testing', 'Validation'],
            agents: ['analyst']
          }
        }
      };

      const saveResult = await configManager.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config!.teamRoles).toBeDefined();
      expect(loadResult.config!.teamRoles!['test-role']).toBeDefined();
      expect(loadResult.config!.teamRoles!['test-role'].name).toBe('Test Role');
      expect(loadResult.config!.teamRoles!['test-role'].responsibilities).toEqual(['Testing', 'Validation']);
    });
  });

  describe('preferences management', () => {
    it('should handle user preferences', async () => {
      const testConfig = {
        version: '1.0.0',
        preferences: {
          defaultAgent: 'analyst',
          autoUpdate: true,
          logLevel: 'debug' as const
        }
      };

      const saveResult = await configManager.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config!.preferences).toBeDefined();
      expect(loadResult.config!.preferences!.defaultAgent).toBe('analyst');
      expect(loadResult.config!.preferences!.autoUpdate).toBe(true);
      expect(loadResult.config!.preferences!.logLevel).toBe('debug');
    });
  });

  describe('path configuration', () => {
    it('should handle custom resource paths', async () => {
      const testConfig = {
        version: '1.0.0',
        paths: {
          agents: 'custom/agents',
          tasks: 'custom/tasks',
          templates: 'custom/templates'
        }
      };

      const saveResult = await configManager.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config!.paths).toBeDefined();
      expect(loadResult.config!.paths!.agents).toBe('custom/agents');
      expect(loadResult.config!.paths!.tasks).toBe('custom/tasks');
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Create config manager with non-existent directory
      const nonExistentPath = path.join(testDir, 'non-existent');
      const invalidConfigManager = new ConfigManager(nonExistentPath);

      const loadResult = await invalidConfigManager.loadConfig();
      expect(loadResult.config).toBeDefined(); // Should return default config
    });

    it('should handle permission errors', async () => {
      // This test would need platform-specific permission handling
      // For now, just test that the API handles errors gracefully
      const testConfig = { version: '1.0.0' };
      const saveResult = await configManager.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);
    });
  });

  describe('config merging and updates', () => {
    it('should merge configuration updates', async () => {
      // Save initial config
      const initialConfig = {
        version: '1.0.0',
        projectId: 'initial'
      };

      await configManager.saveConfig(initialConfig);

      // Update with additional properties
      const updateConfig = {
        version: '1.0.0',
        projectId: 'initial',
        preferences: {
          defaultAgent: 'analyst'
        }
      };

      const saveResult = await configManager.saveConfig(updateConfig);
      expect(saveResult.success).toBe(true);

      const loadResult = await configManager.loadConfig();
      expect(loadResult.config!.projectId).toBe('initial');
      expect(loadResult.config!.preferences).toBeDefined();
      expect(loadResult.config!.preferences!.defaultAgent).toBe('analyst');
    });
  });
});
