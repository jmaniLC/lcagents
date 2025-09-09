import { CoreSystemManager } from '../../src/core/CoreSystemManager';
import { LayerManager } from '../../src/core/LayerManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('LCA-003 Layered Architecture Implementation', () => {
  let testDir: string;
  let coreSystemManager: CoreSystemManager;
  let layerManager: LayerManager;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-test-'));
    coreSystemManager = new CoreSystemManager(testDir);
    layerManager = new LayerManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('Core System Registry', () => {
    it('should load available core systems from registry', async () => {
      const availableSystems = await coreSystemManager.getAvailableCoreSystems();
      
      expect(availableSystems).toBeDefined();
      expect(availableSystems.length).toBeGreaterThan(0);
      
      // Should include bmad-core as default
      const bmadCore = availableSystems.find(s => s.name === 'bmad-core');
      expect(bmadCore).toBeDefined();
      expect(bmadCore?.isDefault).toBe(true);
    });

    it('should get default core system', async () => {
      const defaultCore = await coreSystemManager.getDefaultCoreSystem();
      expect(defaultCore).toBe('bmad-core');
    });
  });

  describe('Core System Installation', () => {
    it('should install bmad-core system successfully', async () => {
      const result = await coreSystemManager.installCoreSystem('bmad-core');
      
      expect(result.success).toBe(true);
      expect(result.coreSystem).toBe('bmad-core');
      expect(result.agentCount).toBeGreaterThan(0);

      // Verify installation structure
      const installPath = path.join(testDir, '.lcagents', 'core', 'bmad-core');
      expect(await fs.pathExists(installPath)).toBe(true);
      
      // Verify required directories
      const requiredDirs = ['agents', 'tasks', 'templates'];
      for (const dir of requiredDirs) {
        expect(await fs.pathExists(path.join(installPath, dir))).toBe(true);
      }

      // Verify version.json
      const versionFile = path.join(installPath, 'version.json');
      expect(await fs.pathExists(versionFile)).toBe(true);
    });

    it('should prevent duplicate installation without force', async () => {
      // Install once
      await coreSystemManager.installCoreSystem('bmad-core');
      
      // Try to install again without force
      const result = await coreSystemManager.installCoreSystem('bmad-core', false);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already installed');
    });

    it('should allow duplicate installation with force', async () => {
      // Install once
      await coreSystemManager.installCoreSystem('bmad-core');
      
      // Install again with force
      const result = await coreSystemManager.installCoreSystem('bmad-core', true);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Layered Architecture Creation', () => {
    beforeEach(async () => {
      // Install bmad-core first
      await coreSystemManager.installCoreSystem('bmad-core');
    });

    it('should create layered directory structure', async () => {
      await layerManager.createLayeredStructure('bmad-core');

      const lcagentsPath = path.join(testDir, '.lcagents');
      
      // Verify layer directories
      expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'org'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'runtime'))).toBe(true);

      // Verify org layer structure
      expect(await fs.pathExists(path.join(lcagentsPath, 'org', 'agents', 'overrides'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'org', 'templates'))).toBe(true);

      // Verify custom layer structure
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom', 'config'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom', 'agents', 'overrides'))).toBe(true);

      // Verify runtime structure
      expect(await fs.pathExists(path.join(lcagentsPath, 'runtime', 'merged-agents'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'runtime', 'cache'))).toBe(true);
    });

    it('should create example configuration files', async () => {
      await layerManager.createLayeredStructure('bmad-core');

      const lcagentsPath = path.join(testDir, '.lcagents');
      
      // Check for pod config
      const podConfigPath = path.join(lcagentsPath, 'custom', 'config', 'pod-config.yaml');
      expect(await fs.pathExists(podConfigPath)).toBe(true);

      // Check for example override files
      const exampleOrgOverride = path.join(lcagentsPath, 'org', 'agents', 'overrides', 'example-org-override.yaml');
      expect(await fs.pathExists(exampleOrgOverride)).toBe(true);

      const exampleOverride = path.join(lcagentsPath, 'custom', 'agents', 'overrides', 'example-override.yaml');
      expect(await fs.pathExists(exampleOverride)).toBe(true);

      // Check for example custom agent
      const customAgent = path.join(lcagentsPath, 'custom', 'agents', 'custom-data-engineer.md');
      expect(await fs.pathExists(customAgent)).toBe(true);
    });

    it('should create backward compatibility resolution', async () => {
      await layerManager.createLayeredStructure('bmad-core');
      await layerManager.createBackwardCompatibilityResolution('bmad-core');

      const lcagentsPath = path.join(testDir, '.lcagents');
      
      // Check that resources are available at root level for backward compatibility
      const resourceTypes = ['agents', 'tasks', 'templates'];
      for (const resourceType of resourceTypes) {
        expect(await fs.pathExists(path.join(lcagentsPath, resourceType))).toBe(true);
      }
    });
  });

  describe('Core System Management', () => {
    beforeEach(async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
    });

    it('should track installed core systems', async () => {
      const installedSystems = await coreSystemManager.getInstalledCoreSystems();
      
      expect(installedSystems).toBeDefined();
      expect(installedSystems.length).toBe(1);
      expect(installedSystems[0]).toBeDefined();
      expect(installedSystems[0]!.name).toBe('bmad-core');
    });

    it('should switch active core system', async () => {
      const result = await coreSystemManager.switchCoreSystem('bmad-core', 'Initial setup');
      
      expect(result.success).toBe(true);
      expect(result.toCore).toBe('bmad-core');

      const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
      expect(activeCoreSystem).toBe('bmad-core');
    });

    it('should validate core system structure', async () => {
      const installPath = path.join(testDir, '.lcagents', 'core', 'bmad-core');
      const validation = await coreSystemManager.validateCoreSystemStructure(installPath);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Resource Resolution', () => {
    beforeEach(async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      await coreSystemManager.switchCoreSystem('bmad-core', 'Test setup');
    });

    it('should resolve agents with layer precedence', async () => {
      // This test assumes pm.md exists in bmad-core
      const resolution = await layerManager.resolveAgent('pm');
      
      expect(resolution.agentId).toBe('pm');
      expect(resolution.coreSystem).toBe('bmad-core');
      expect(resolution.layerSources).toContain('core');
      expect(resolution.corePath).toContain('bmad-core/agents/pm.md');
    });

    it('should resolve tasks with layer precedence', async () => {
      // This test assumes create-doc.md exists in bmad-core
      const resolution = await layerManager.resolveTask('create-doc');
      
      expect(resolution.source).toBe('core');
      expect(resolution.path).toContain('bmad-core/tasks/create-doc.md');
    });

    it('should resolve templates with layer precedence', async () => {
      // This test assumes prd-tmpl.yaml exists in bmad-core
      const resolution = await layerManager.resolveTemplate('prd-tmpl.yaml');
      
      expect(resolution.source).toBe('core');
      expect(resolution.path).toContain('bmad-core/templates/prd-tmpl.yaml');
    });
  });

  describe('Migration from Flat Structure', () => {
    beforeEach(async () => {
      // Create a mock flat structure
      const lcagentsPath = path.join(testDir, '.lcagents');
      await fs.ensureDir(path.join(lcagentsPath, 'agents'));
      await fs.ensureDir(path.join(lcagentsPath, 'tasks'));
      await fs.writeFile(path.join(lcagentsPath, 'agents', 'pm.md'), 'Mock PM agent');
      await fs.writeFile(path.join(lcagentsPath, 'tasks', 'create-doc.md'), 'Mock task');
    });

    it('should detect flat installation', async () => {
      // This is tested implicitly in the migration function
      // We'll verify the migration works correctly
      await layerManager.migrateFromFlatStructure('bmad-core');

      const lcagentsPath = path.join(testDir, '.lcagents');
      
      // Verify resources moved to core layer
      expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core', 'agents', 'pm.md'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core', 'tasks', 'create-doc.md'))).toBe(true);

      // Verify layered structure created
      expect(await fs.pathExists(path.join(lcagentsPath, 'org'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom'))).toBe(true);

      // Verify backward compatibility restored
      expect(await fs.pathExists(path.join(lcagentsPath, 'agents', 'pm.md'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'tasks', 'create-doc.md'))).toBe(true);
    });
  });
});
