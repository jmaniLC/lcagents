import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { RuntimeConfigManager, RuntimeConfig } from '../../core/RuntimeConfigManager';

describe('RuntimeConfigManager Unit Tests', () => {
  let testDir: string;
  let runtimeConfigManager: RuntimeConfigManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-runtime-test-'));
    runtimeConfigManager = new RuntimeConfigManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('getRuntimeConfig', () => {
    it('should return default config when no config file exists', async () => {
      const config = await runtimeConfigManager.getRuntimeConfig();

      expect(config).toBeDefined();
      expect(config.coreSystem.active).toBe('bmad-core');
      expect(config.lastUpdated).toBeDefined();
      expect(config.version).toBeDefined();
    });

    it('should load existing config file', async () => {
      // Create config directory and file
      const configDir = path.join(testDir, '.lcagents', 'runtime');
      await fs.ensureDir(configDir);
      const configContent = `coreSystem:
  active: enterprise-core
  fallback: bmad-core
lastUpdated: "2023-01-01T00:00:00.000Z"
version: "1.0.0"
paths:
  qa: "docs/qa"
  prd: "docs/prd"
  architecture: "docs/architecture"
features:
  markdownExploder: true
  shardedPrd: false
  qaGate: true
patterns:
  epicFile: "epic-*.md"
  storyFile: "story-*.md"
github:
  integration: true
  copilotFeatures: true
  repository: "test-repo"
  branch: "main"
`;
      await fs.writeFile(path.join(configDir, 'config.yaml'), configContent);

      const config = await runtimeConfigManager.getRuntimeConfig();

      expect(config.coreSystem.active).toBe('enterprise-core');
      expect(config.lastUpdated).toBe('2023-01-01T00:00:00.000Z');
      expect(config.version).toBe('1.0.0');
      expect(config.github.repository).toBe('test-repo');
    });

    it('should handle malformed config file', async () => {
      // Create config directory and malformed file
      const configDir = path.join(testDir, '.lcagents', 'runtime');
      await fs.ensureDir(configDir);
      await fs.writeFile(path.join(configDir, 'config.yaml'), 'invalid: yaml: content:');

      const config = await runtimeConfigManager.getRuntimeConfig();

      // Should return default config when file is malformed
      expect(config.coreSystem.active).toBe('bmad-core');
    });
  });

  describe('updateRuntimeConfig', () => {
    it('should create config file with updated values', async () => {
      await runtimeConfigManager.updateRuntimeConfig({ 
        coreSystem: { active: 'enterprise-core', fallback: 'bmad-core' }
      });

      const configPath = path.join(testDir, '.lcagents', 'runtime', 'config.yaml');
      expect(await fs.pathExists(configPath)).toBe(true);

      const config = await runtimeConfigManager.getRuntimeConfig();
      expect(config.coreSystem.active).toBe('enterprise-core');
      expect(config.lastUpdated).toBeDefined();
    });

    it('should update existing config file', async () => {
      // Create initial config
      await runtimeConfigManager.updateRuntimeConfig({ 
        coreSystem: { active: 'bmad-core', fallback: 'bmad-core' }
      });

      // Update config
      await runtimeConfigManager.updateRuntimeConfig({ 
        coreSystem: { active: 'enterprise-core', fallback: 'bmad-core' },
        version: '2.0.0' 
      });

      const config = await runtimeConfigManager.getRuntimeConfig();
      expect(config.coreSystem.active).toBe('enterprise-core');
      expect(config.version).toBe('2.0.0');
    });

    it('should preserve existing config values when updating partially', async () => {
      // Create initial config
      await runtimeConfigManager.updateRuntimeConfig({ 
        coreSystem: { active: 'bmad-core', fallback: 'bmad-core' },
        version: '1.0.0' 
      });

      // Update only core system
      await runtimeConfigManager.updateRuntimeConfig({ 
        coreSystem: { active: 'enterprise-core', fallback: 'bmad-core' }
      });

      const config = await runtimeConfigManager.getRuntimeConfig();
      expect(config.coreSystem.active).toBe('enterprise-core');
      expect(config.version).toBe('1.0.0'); // Should be preserved
    });
  });

  describe('updateConfig', () => {
    it('should update configuration using updateConfig method', async () => {
      await runtimeConfigManager.updateConfig({ 
        coreSystem: { active: 'enterprise-core', fallback: 'bmad-core' }
      });

      const config = await runtimeConfigManager.getRuntimeConfig();
      expect(config.coreSystem.active).toBe('enterprise-core');
    });

    it('should update lastUpdated timestamp', async () => {
      const beforeTime = new Date();
      await runtimeConfigManager.updateConfig({ 
        coreSystem: { active: 'enterprise-core', fallback: 'bmad-core' }
      });
      const afterTime = new Date();

      const config = await runtimeConfigManager.getRuntimeConfig();
      const lastUpdated = new Date(config.lastUpdated);
      
      expect(lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(lastUpdated.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('saveRuntimeConfig', () => {
    it('should save complete runtime configuration', async () => {
      const testConfig: RuntimeConfig = {
        coreSystem: {
          active: 'test-core',
          fallback: 'bmad-core'
        },
        paths: {
          qa: 'docs/qa',
          prd: 'docs/prd',
          architecture: 'docs/arch'
        },
        features: {
          markdownExploder: true,
          shardedPrd: false,
          qaGate: true
        },
        patterns: {
          epicFile: 'epic-*.md',
          storyFile: 'story-*.md'
        },
        github: {
          integration: true,
          copilotFeatures: true,
          repository: 'test-repo',
          branch: 'main'
        },
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      };

      await runtimeConfigManager.saveRuntimeConfig(testConfig);

      const configPath = path.join(testDir, '.lcagents', 'runtime', 'config.yaml');
      expect(await fs.pathExists(configPath)).toBe(true);

      const loadedConfig = await runtimeConfigManager.getRuntimeConfig();
      expect(loadedConfig.coreSystem.active).toBe('test-core');
      expect(loadedConfig.paths.qa).toBe('docs/qa');
      expect(loadedConfig.features.markdownExploder).toBe(true);
    });
  });
});
