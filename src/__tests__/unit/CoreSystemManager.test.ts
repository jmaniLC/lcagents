import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { CoreSystemManager } from '../../core/CoreSystemManager';

describe('CoreSystemManager Unit Tests', () => {
  let testDir: string;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-core-test-'));
    coreSystemManager = new CoreSystemManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('getAvailableCoreSystems', () => {
    it('should return list of available core systems', async () => {
      const systems = await coreSystemManager.getAvailableCoreSystems();

      expect(systems).toHaveLength(3);
      expect(systems.map(s => s.name)).toContain('bmad-core');
      expect(systems.map(s => s.name)).toContain('enterprise-core');
      expect(systems.map(s => s.name)).toContain('minimal-core');

      // Check bmad-core details
      const bmadCore = systems.find(s => s.name === 'bmad-core');
      expect(bmadCore).toBeDefined();
      expect(bmadCore?.isDefault).toBe(true);
      expect(bmadCore?.version).toBe('4.45.0');
      expect(bmadCore?.agentCount).toBe(11);
    });

    it('should mark bmad-core as default', async () => {
      const systems = await coreSystemManager.getAvailableCoreSystems();
      const defaultSystem = systems.find(s => s.isDefault);

      expect(defaultSystem?.name).toBe('bmad-core');
    });
  });

  describe('getDefaultCoreSystem', () => {
    it('should return bmad-core as default', async () => {
      const defaultSystem = await coreSystemManager.getDefaultCoreSystem();
      expect(defaultSystem).toBe('bmad-core');
    });
  });

  describe('validateCoreSystemStructure', () => {
    it('should validate existing core system structure', async () => {
      // Create mock core system directory
      const coreDir = path.join(testDir, '.lcagents', 'core', '.bmad-core');
      await fs.ensureDir(path.join(coreDir, 'agents'));
      await fs.ensureDir(path.join(coreDir, 'tasks'));
      await fs.ensureDir(path.join(coreDir, 'templates'));
      await fs.writeJSON(path.join(coreDir, 'version.json'), {
        name: 'bmad-core',
        version: '4.45.0'
      });

      const result = await coreSystemManager.validateCoreSystemStructure(coreDir);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate incomplete core system structure', async () => {
      // Create incomplete core system directory
      const coreDir = path.join(testDir, '.lcagents', 'core', '.incomplete-core');
      await fs.ensureDir(coreDir);
      // Missing required subdirectories

      const result = await coreSystemManager.validateCoreSystemStructure(coreDir);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getInstalledCoreSystems', () => {
    it('should return empty array when no systems installed', async () => {
      const installed = await coreSystemManager.getInstalledCoreSystems();
      expect(installed).toHaveLength(0);
    });

    it('should detect installed core system', async () => {
      // Create mock installation
      const coreDir = path.join(testDir, '.lcagents', 'core', '.bmad-core');
      await fs.ensureDir(coreDir);
      await fs.writeJSON(path.join(coreDir, 'version.json'), {
        name: 'bmad-core',
        version: '4.45.0',
        installedAt: new Date().toISOString()
      });

      const installed = await coreSystemManager.getInstalledCoreSystems();
      expect(installed).toHaveLength(1);
      expect(installed[0].name).toBe('bmad-core');
      expect(installed[0].version).toBe('4.45.0');
    });
  });

  describe('getActiveCoreSystem', () => {
    it('should return null when no system is active', async () => {
      const active = await coreSystemManager.getActiveCoreSystem();
      expect(active).toBeNull();
    });

    it('should return active core system name', async () => {
      // Create mock installation and config
      const coreDir = path.join(testDir, '.lcagents', 'core', '.bmad-core');
      await fs.ensureDir(coreDir);
      await fs.writeJSON(path.join(coreDir, 'version.json'), {
        name: 'bmad-core',
        version: '4.45.0',
        installedAt: new Date().toISOString()
      });

      const runtimeDir = path.join(testDir, '.lcagents', 'runtime');
      await fs.ensureDir(runtimeDir);
      await fs.writeFile(path.join(runtimeDir, 'config.yaml'), 'activeCore: bmad-core\n');

      const active = await coreSystemManager.getActiveCoreSystem();
      expect(active).toBe('bmad-core');
    });
  });

  describe('switchCoreSystem', () => {
    beforeEach(async () => {
      // Set up initial installation
      const coreDir = path.join(testDir, '.lcagents', 'core', '.bmad-core');
      await fs.ensureDir(coreDir);
      await fs.writeJSON(path.join(coreDir, 'version.json'), {
        name: 'bmad-core',
        version: '4.45.0',
        installedAt: new Date().toISOString()
      });
    });

    it('should switch to installed core system', async () => {
      const result = await coreSystemManager.switchCoreSystem('bmad-core');

      expect(result.success).toBe(true);
      expect(result.toCore).toBe('bmad-core');

      // Verify config was updated
      const configPath = path.join(testDir, '.lcagents', 'runtime', 'config.yaml');
      expect(await fs.pathExists(configPath)).toBe(true);
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain('activeCore: bmad-core');
    });

    it('should fail to switch to non-installed system', async () => {
      const result = await coreSystemManager.switchCoreSystem('enterprise-core');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not installed');
    });
  });
});
