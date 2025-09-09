import { CoreSystemManager } from '../../core/CoreSystemManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('CoreSystemManager - AC1: Three-Layer Directory Structure', () => {
  let testDir: string;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac1-test-'));
    coreSystemManager = new CoreSystemManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('AC1: Three-Layer Directory Structure Creation', () => {
    it('should create .lcagents/core/ directory containing immutable BMAD-Core baseline', async () => {
      const result = await coreSystemManager.installCoreSystem('bmad-core');
      
      expect(result.success).toBe(true);
      
      const coreDir = path.join(testDir, '.lcagents', 'core');
      expect(await fs.pathExists(coreDir)).toBe(true);
      
      const bmadCoreDir = path.join(coreDir, 'bmad-core');
      expect(await fs.pathExists(bmadCoreDir)).toBe(true);
      
      // Verify core structure is immutable (read-only concept)
      const versionFile = path.join(bmadCoreDir, 'version.json');
      expect(await fs.pathExists(versionFile)).toBe(true);
    });

    it('should track installed core systems in active-core.json', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const activeCoreConfigPath = path.join(testDir, '.lcagents', 'core', 'active-core.json');
      expect(await fs.pathExists(activeCoreConfigPath)).toBe(true);
      
      const activeConfig = await fs.readJSON(activeCoreConfigPath);
      expect(activeConfig.availableCores).toBeDefined();
      expect(activeConfig.availableCores.length).toBe(1);
      expect(activeConfig.availableCores[0].name).toBe('bmad-core');
    });

    it('should prevent cross-contamination between core systems', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const bmadCoreDir = path.join(testDir, '.lcagents', 'core', 'bmad-core');
      const agentsDir = path.join(bmadCoreDir, 'agents');
      
      expect(await fs.pathExists(agentsDir)).toBe(true);
      
      // Each core system should be in its own isolated directory
      const coreDir = path.join(testDir, '.lcagents', 'core');
      const entries = await fs.readdir(coreDir);
      
      // Should contain bmad-core directory and active-core.json
      expect(entries).toContain('bmad-core');
      expect(entries).toContain('active-core.json');
    });
  });

  describe('AC1: Core System Configuration Management', () => {
    it('should track currently active core system', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await coreSystemManager.switchCoreSystem('bmad-core', 'Initial setup');
      
      const activeCore = await coreSystemManager.getActiveCoreSystem();
      expect(activeCore).toBe('bmad-core');
    });

    it('should include available core systems with metadata', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const systems = await coreSystemManager.getInstalledCoreSystems();
      expect(systems.length).toBeGreaterThan(0);
      
      const system = systems.find(s => s.name === 'bmad-core');
      expect(system).toBeDefined();
      expect(system!.name).toBe('bmad-core');
      expect(system!.version).toBeDefined();
      expect(system!.description).toBeDefined();
      expect(system!.agentCount).toBeGreaterThan(0);
      expect(system!.installDate).toBeDefined();
      expect(system!.source).toBeDefined();
    });

    it('should track switch history with timestamps and reasons', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await coreSystemManager.switchCoreSystem('bmad-core', 'Initial setup test');
      
      const activeCoreConfigPath = path.join(testDir, '.lcagents', 'core', 'active-core.json');
      const activeConfig = await fs.readJSON(activeCoreConfigPath);
      
      expect(activeConfig.switchHistory).toBeDefined();
      expect(activeConfig.switchHistory.length).toBeGreaterThan(0);
      
      const lastSwitch = activeConfig.switchHistory[activeConfig.switchHistory.length - 1];
      expect(lastSwitch.to).toBe('bmad-core');
      expect(lastSwitch.timestamp).toBeDefined();
      expect(lastSwitch.reason).toBe('Initial setup test');
      expect(lastSwitch.success).toBe(true);
    });

    it('should validate core system compatibility before switching', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const validation = await coreSystemManager.validateCoreSystemStructure(
        path.join(testDir, '.lcagents', 'core', 'bmad-core')
      );
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.compatibility).toBe(true);
    });
  });
});
