import { LayerManager } from '../../core/LayerManager';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('LayerManager - AC3: Runtime Resource Resolution Setup', () => {
  let testDir: string;
  let layerManager: LayerManager;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac3-test-'));
    layerManager = new LayerManager(testDir);
    coreSystemManager = new CoreSystemManager(testDir);
    
    // Install and configure bmad-core
    await coreSystemManager.installCoreSystem('bmad-core');
    await layerManager.createLayeredStructure('bmad-core');
    await coreSystemManager.switchCoreSystem('bmad-core', 'Test setup');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('AC3: Runtime Resource Resolution Setup', () => {
    it('should implement layer resolution engine for intelligent agent merging', async () => {
      // Test that layer manager can resolve agents with layer precedence
      const agentResolution = await layerManager.resolveAgent('pm');
      
      expect(agentResolution.agentId).toBe('pm');
      expect(agentResolution.coreSystem).toBe('bmad-core');
      expect(agentResolution.layerSources).toContain('core');
      expect(agentResolution.corePath).toContain('bmad-core/agents/pm.md');
    });

    it('should resolve active agent configurations to .lcagents/agents/ with layer precedence', async () => {
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      const agentsDir = path.join(testDir, '.lcagents', 'agents');
      expect(await fs.pathExists(agentsDir)).toBe(true);
      
      const agentFiles = await fs.readdir(agentsDir);
      expect(agentFiles.length).toBeGreaterThan(0);
      
      // Verify specific agents exist
      expect(agentFiles).toContain('pm.md');
      expect(agentFiles).toContain('dev.md');
    });

    it('should cache runtime merged agents in .lcagents/runtime/merged-agents/', async () => {
      const runtimeDir = path.join(testDir, '.lcagents', 'runtime');
      expect(await fs.pathExists(runtimeDir)).toBe(true);
      
      const mergedAgentsDir = path.join(runtimeDir, 'merged-agents');
      expect(await fs.pathExists(mergedAgentsDir)).toBe(true);
    });

    it('should resolve active templates to .lcagents/templates/ with layer-based inheritance', async () => {
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      const templatesDir = path.join(testDir, '.lcagents', 'templates');
      expect(await fs.pathExists(templatesDir)).toBe(true);
      
      const templateFiles = await fs.readdir(templatesDir);
      expect(templateFiles.length).toBeGreaterThan(0);
    });

    it('should resolve active tasks to .lcagents/tasks/ with layer-based inheritance', async () => {
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      const tasksDir = path.join(testDir, '.lcagents', 'tasks');
      expect(await fs.pathExists(tasksDir)).toBe(true);
      
      const taskFiles = await fs.readdir(tasksDir);
      expect(taskFiles.length).toBeGreaterThan(0);
    });

    it('should resolve all other resource types to root-level directories with layer precedence', async () => {
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      const resourceTypes = ['checklists', 'data', 'utils', 'workflows', 'agent-teams'];
      
      for (const resourceType of resourceTypes) {
        const resourceDir = path.join(testDir, '.lcagents', resourceType);
        expect(await fs.pathExists(resourceDir)).toBe(true);
      }
    });

    it('should maintain backward compatibility through resolution links', async () => {
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      // Test that resolved resources exist and are accessible
      const agentFile = path.join(testDir, '.lcagents', 'agents', 'pm.md');
      expect(await fs.pathExists(agentFile)).toBe(true);
      
      // Verify content exists
      const content = await fs.readFile(agentFile, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it('should create runtime cache directory', async () => {
      const cacheDir = path.join(testDir, '.lcagents', 'runtime', 'cache');
      expect(await fs.pathExists(cacheDir)).toBe(true);
    });

    it('should create runtime logs directory', async () => {
      const logsDir = path.join(testDir, '.lcagents', 'runtime', 'logs');
      expect(await fs.pathExists(logsDir)).toBe(true);
    });

    it('should implement proper layer precedence (custom > org > core)', async () => {
      // Create test files in different layers
      const orgAgentPath = path.join(testDir, '.lcagents', 'org', 'agents', 'test-agent.md');
      const customAgentPath = path.join(testDir, '.lcagents', 'custom', 'agents', 'test-agent.md');
      
      await fs.ensureDir(path.dirname(orgAgentPath));
      await fs.ensureDir(path.dirname(customAgentPath));
      
      await fs.writeFile(orgAgentPath, 'org version');
      await fs.writeFile(customAgentPath, 'custom version');
      
      // Resolution should prefer custom over org
      const resolution = await layerManager.resolveResource('agents', 'test-agent.md');
      expect(resolution.source).toBe('custom');
      expect(resolution.path).toBe(customAgentPath);
    });

    it('should resolve tasks with proper layer precedence', async () => {
      const taskResolution = await layerManager.resolveTask('create-doc');
      
      expect(taskResolution.source).toBe('core');
      expect(taskResolution.exists).toBe(true);
      expect(taskResolution.path).toContain('bmad-core/tasks/create-doc.md');
    });

    it('should resolve templates with proper layer precedence', async () => {
      const templateResolution = await layerManager.resolveTemplate('prd-tmpl.yaml');
      
      expect(templateResolution.source).toBe('core');
      expect(templateResolution.exists).toBe(true);
      expect(templateResolution.path).toContain('bmad-core/templates/prd-tmpl.yaml');
    });
  });
});
