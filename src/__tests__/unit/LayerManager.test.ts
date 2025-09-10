import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { LayerManager } from '../../core/LayerManager';

describe('LayerManager Unit Tests', () => {
  let testDir: string;
  let layerManager: LayerManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-layer-test-'));
    layerManager = new LayerManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('createLayeredStructure', () => {
    it('should create all required layers', async () => {
      await layerManager.createLayeredStructure();

      const lcagentsDir = path.join(testDir, '.lcagents');
      expect(await fs.pathExists(lcagentsDir)).toBe(true);

      // Check core layer
      expect(await fs.pathExists(path.join(lcagentsDir, 'core'))).toBe(true);

      // Check organization layer
      expect(await fs.pathExists(path.join(lcagentsDir, 'org'))).toBe(true);

      // Check custom layer
      expect(await fs.pathExists(path.join(lcagentsDir, 'custom'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsDir, 'custom', 'agents'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsDir, 'custom', 'config'))).toBe(true);

      // Check runtime layer
      expect(await fs.pathExists(path.join(lcagentsDir, 'runtime'))).toBe(true);
    });

    it('should not overwrite existing structure without force', async () => {
      // Create initial structure
      await layerManager.createLayeredStructure();
      
      // Add a custom file
      const customFile = path.join(testDir, '.lcagents', 'custom', 'test.txt');
      await fs.writeFile(customFile, 'test content');

      // Recreate without force - should preserve custom file
      await layerManager.createLayeredStructure();
      
      expect(await fs.pathExists(customFile)).toBe(true);
      const content = await fs.readFile(customFile, 'utf-8');
      expect(content).toBe('test content');
    });
  });

  describe('getResourcePath', () => {
    beforeEach(async () => {
      await layerManager.createLayeredStructure();
      
      // Create sample resources in different layers
      const coreAgentsDir = path.join(testDir, '.lcagents', 'core', '.bmad-core', 'agents');
      await fs.ensureDir(coreAgentsDir);
      await fs.writeFile(path.join(coreAgentsDir, 'core-agent.md'), '# Core Agent');

      const customAgentsDir = path.join(testDir, '.lcagents', 'custom', 'agents');
      await fs.ensureDir(customAgentsDir);
      await fs.writeFile(path.join(customAgentsDir, 'custom-agent.md'), '# Custom Agent');
      await fs.writeFile(path.join(customAgentsDir, 'core-agent.md'), '# Overridden Core Agent');
    });

    it('should find resource in core layer', async () => {
      const resourcePath = await layerManager.getResourcePath('agents', 'core-agent.md');
      
      expect(resourcePath).toBeTruthy();
      expect(resourcePath).toContain('custom'); // Custom layer takes precedence
    });

    it('should find resource in custom layer', async () => {
      const resourcePath = await layerManager.getResourcePath('agents', 'custom-agent.md');
      
      expect(resourcePath).toBeTruthy();
      expect(resourcePath).toContain('custom');
    });

    it('should return null for non-existent resource', async () => {
      const resourcePath = await layerManager.getResourcePath('agents', 'non-existent.md');
      
      expect(resourcePath).toBeNull();
    });

    it('should prioritize custom layer over core layer', async () => {
      const resourcePath = await layerManager.getResourcePath('agents', 'core-agent.md');
      
      expect(resourcePath).toBeTruthy();
      expect(resourcePath).toContain('custom');
      
      const content = await fs.readFile(resourcePath!, 'utf-8');
      expect(content).toBe('# Overridden Core Agent');
    });
  });

  describe('readResource', () => {
    beforeEach(async () => {
      await layerManager.createLayeredStructure();
      
      const coreAgentsDir = path.join(testDir, '.lcagents', 'core', '.bmad-core', 'agents');
      await fs.ensureDir(coreAgentsDir);
      await fs.writeFile(path.join(coreAgentsDir, 'test-agent.md'), '# Test Agent\nContent');
    });

    it('should read resource content', async () => {
      const content = await layerManager.readResource('agents', 'test-agent.md');
      
      expect(content).toBeTruthy();
      expect(content).toContain('# Test Agent');
      expect(content).toContain('Content');
    });

    it('should return null for non-existent resource', async () => {
      const content = await layerManager.readResource('agents', 'non-existent.md');
      
      expect(content).toBeNull();
    });
  });

  describe('listResources', () => {
    beforeEach(async () => {
      await layerManager.createLayeredStructure();
      
      // Create resources in core layer
      const coreAgentsDir = path.join(testDir, '.lcagents', 'core', '.bmad-core', 'agents');
      await fs.ensureDir(coreAgentsDir);
      await fs.writeFile(path.join(coreAgentsDir, 'analyst.md'), '# Analyst');
      await fs.writeFile(path.join(coreAgentsDir, 'architect.md'), '# Architect');

      // Create resources in custom layer
      const customAgentsDir = path.join(testDir, '.lcagents', 'custom', 'agents');
      await fs.ensureDir(customAgentsDir);
      await fs.writeFile(path.join(customAgentsDir, 'custom-agent.md'), '# Custom');
    });

    it('should list all resources from all layers', async () => {
      const resources = await layerManager.listResources('agents');
      
      expect(resources).toHaveLength(3);
      expect(resources.map(r => r.name)).toContain('analyst.md');
      expect(resources.map(r => r.name)).toContain('architect.md');
      expect(resources.map(r => r.name)).toContain('custom-agent.md');
    });

    it('should include source layer information', async () => {
      const resources = await layerManager.listResources('agents');
      
      const coreResource = resources.find(r => r.name === 'analyst.md');
      expect(coreResource?.source).toBe('core');

      const customResource = resources.find(r => r.name === 'custom-agent.md');
      expect(customResource?.source).toBe('custom');
    });

    it('should handle empty resource directories', async () => {
      const resources = await layerManager.listResources('tasks');
      
      expect(resources).toHaveLength(0);
    });
  });

  describe('resourceExists', () => {
    beforeEach(async () => {
      await layerManager.createLayeredStructure();
      
      const coreAgentsDir = path.join(testDir, '.lcagents', 'core', '.bmad-core', 'agents');
      await fs.ensureDir(coreAgentsDir);
      await fs.writeFile(path.join(coreAgentsDir, 'existing-agent.md'), '# Existing');
    });

    it('should return true for existing resource', async () => {
      const exists = await layerManager.resourceExists('agents', 'existing-agent.md');
      expect(exists).toBe(true);
    });

    it('should return false for non-existing resource', async () => {
      const exists = await layerManager.resourceExists('agents', 'non-existing.md');
      expect(exists).toBe(false);
    });
  });

  describe('createVirtualResolutionSystem', () => {
    beforeEach(async () => {
      await layerManager.createLayeredStructure();
    });

    it('should create virtual resolution system for core', async () => {
      await layerManager.createVirtualResolutionSystem('bmad-core');

      // Verify virtual resolution structure was created
      const coreDir = path.join(testDir, '.lcagents', 'core', '.bmad-core');
      expect(await fs.pathExists(coreDir)).toBe(true);

      // Verify runtime configuration was created
      const runtimeConfigPath = path.join(testDir, '.lcagents', 'runtime', 'config.yaml');
      expect(await fs.pathExists(runtimeConfigPath)).toBe(true);
    });
  });

  describe('migrateFromFlatStructure', () => {
    it('should migrate legacy flat structure to layered', async () => {
      // Create legacy flat structure
      const legacyDir = path.join(testDir, '.lcagents');
      await fs.ensureDir(path.join(legacyDir, 'agents'));
      await fs.writeFile(path.join(legacyDir, 'agents', 'legacy-agent.md'), '# Legacy Agent');

      await layerManager.migrateFromFlatStructure('bmad-core');

      // Verify new layered structure exists
      expect(await fs.pathExists(path.join(legacyDir, 'core'))).toBe(true);
      expect(await fs.pathExists(path.join(legacyDir, 'custom'))).toBe(true);
      expect(await fs.pathExists(path.join(legacyDir, 'runtime'))).toBe(true);
    });
  });
});
