import { LayerManager } from '../../core/LayerManager';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

describe('LayerManager - AC4: Customization Layer Scaffolding', () => {
  let testDir: string;
  let layerManager: LayerManager;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac4-test-'));
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

  describe('AC4: Customization Layer Scaffolding', () => {
    it('should create customization scaffolding in custom/ layer', async () => {
      const customDir = path.join(testDir, '.lcagents', 'custom');
      expect(await fs.pathExists(customDir)).toBe(true);
      
      // Should have all resource type directories
      const expectedDirs = ['agents', 'tasks', 'templates', 'checklists', 'data', 'utils', 'workflows', 'agent-teams'];
      
      for (const dir of expectedDirs) {
        const dirPath = path.join(customDir, dir);
        expect(await fs.pathExists(dirPath)).toBe(true);
      }
    });

    it('should create example customization files', async () => {
      const customAgentsDir = path.join(testDir, '.lcagents', 'custom', 'agents');
      expect(await fs.pathExists(customAgentsDir)).toBe(true);
      
      // Check for example files
      const exampleAgentPath = path.join(customAgentsDir, 'custom-example.md');
      expect(await fs.pathExists(exampleAgentPath)).toBe(true);
      
      const content = await fs.readFile(exampleAgentPath, 'utf-8');
      expect(content).toContain('Example custom agent');
    });

    it('should create pod-config.yaml with scaffolding metadata', async () => {
      const podConfigPath = path.join(testDir, '.lcagents', 'pod-config.yaml');
      expect(await fs.pathExists(podConfigPath)).toBe(true);
      
      const config = yaml.load(await fs.readFile(podConfigPath, 'utf-8')) as any;
      expect(config.pod).toBeDefined();
      expect(config.coreSystem).toBe('bmad-core');
      expect(config.customization).toBeDefined();
    });

    it('should provide organization scaffolding in org/ layer', async () => {
      const orgDir = path.join(testDir, '.lcagents', 'org');
      expect(await fs.pathExists(orgDir)).toBe(true);
      
      // Should have organizational resource directories
      const expectedDirs = ['agents', 'tasks', 'templates', 'checklists', 'data', 'utils', 'workflows', 'agent-teams'];
      
      for (const dir of expectedDirs) {
        const dirPath = path.join(orgDir, dir);
        expect(await fs.pathExists(dirPath)).toBe(true);
      }
    });

    it('should create customization documentation in custom/README.md', async () => {
      const readmePath = path.join(testDir, '.lcagents', 'custom', 'README.md');
      expect(await fs.pathExists(readmePath)).toBe(true);
      
      const content = await fs.readFile(readmePath, 'utf-8');
      expect(content).toContain('Custom Layer');
      expect(content).toContain('customization');
    });

    it('should create organization documentation in org/README.md', async () => {
      const readmePath = path.join(testDir, '.lcagents', 'org', 'README.md');
      expect(await fs.pathExists(readmePath)).toBe(true);
      
      const content = await fs.readFile(readmePath, 'utf-8');
      expect(content).toContain('Organization Layer');
      expect(content).toContain('organization');
    });

    it('should provide example task customization', async () => {
      const customTasksDir = path.join(testDir, '.lcagents', 'custom', 'tasks');
      const exampleTaskPath = path.join(customTasksDir, 'custom-task-example.md');
      
      expect(await fs.pathExists(exampleTaskPath)).toBe(true);
      
      const content = await fs.readFile(exampleTaskPath, 'utf-8');
      expect(content).toContain('Custom Task Example');
    });

    it('should provide example template customization', async () => {
      const customTemplatesDir = path.join(testDir, '.lcagents', 'custom', 'templates');
      const exampleTemplatePath = path.join(customTemplatesDir, 'custom-template-example.yaml');
      
      expect(await fs.pathExists(exampleTemplatePath)).toBe(true);
      
      const content = await fs.readFile(exampleTemplatePath, 'utf-8');
      expect(content).toContain('custom_template');
    });

    it('should create example agent team configuration', async () => {
      const customTeamsDir = path.join(testDir, '.lcagents', 'custom', 'agent-teams');
      const exampleTeamPath = path.join(customTeamsDir, 'custom-team-example.yaml');
      
      expect(await fs.pathExists(exampleTeamPath)).toBe(true);
      
      const content = await fs.readFile(exampleTeamPath, 'utf-8');
      expect(content).toContain('custom_team');
    });

    it('should configure pod-specific metadata', async () => {
      const podConfigPath = path.join(testDir, '.lcagents', 'pod-config.yaml');
      const config = yaml.load(await fs.readFile(podConfigPath, 'utf-8')) as any;
      
      expect(config.pod.name).toBeDefined();
      expect(config.pod.version).toBe('1.0.0');
      expect(config.pod.created).toBeDefined();
      expect(config.customization.layers).toContain('custom');
      expect(config.customization.layers).toContain('org');
    });

    it('should maintain separation between layers', async () => {
      const coreDir = path.join(testDir, '.lcagents', 'core');
      const orgDir = path.join(testDir, '.lcagents', 'org');
      const customDir = path.join(testDir, '.lcagents', 'custom');
      
      // All should exist
      expect(await fs.pathExists(coreDir)).toBe(true);
      expect(await fs.pathExists(orgDir)).toBe(true);
      expect(await fs.pathExists(customDir)).toBe(true);
      
      // Core should be symlinked, others should be real directories
      const coreStats = await fs.lstat(coreDir);
      const orgStats = await fs.lstat(orgDir);
      const customStats = await fs.lstat(customDir);
      
      expect(coreStats.isSymbolicLink()).toBe(true);
      expect(orgStats.isDirectory()).toBe(true);
      expect(customStats.isDirectory()).toBe(true);
    });

    it('should create gitignore for runtime directories', async () => {
      const gitignorePath = path.join(testDir, '.lcagents', '.gitignore');
      expect(await fs.pathExists(gitignorePath)).toBe(true);
      
      const content = await fs.readFile(gitignorePath, 'utf-8');
      expect(content).toContain('runtime/');
    });

    it('should create customization guidelines', async () => {
      const guidelinesPath = path.join(testDir, '.lcagents', 'CUSTOMIZATION.md');
      expect(await fs.pathExists(guidelinesPath)).toBe(true);
      
      const content = await fs.readFile(guidelinesPath, 'utf-8');
      expect(content).toContain('Customization Guidelines');
      expect(content).toContain('layer precedence');
    });

    it('should support custom utils and workflows', async () => {
      const customUtilsDir = path.join(testDir, '.lcagents', 'custom', 'utils');
      const customWorkflowsDir = path.join(testDir, '.lcagents', 'custom', 'workflows');
      
      expect(await fs.pathExists(customUtilsDir)).toBe(true);
      expect(await fs.pathExists(customWorkflowsDir)).toBe(true);
      
      // Check for example files
      const exampleUtilPath = path.join(customUtilsDir, 'custom-util-example.md');
      const exampleWorkflowPath = path.join(customWorkflowsDir, 'custom-workflow-example.md');
      
      expect(await fs.pathExists(exampleUtilPath)).toBe(true);
      expect(await fs.pathExists(exampleWorkflowPath)).toBe(true);
    });
  });
});
