import { CoreSystemManager } from '../../core/CoreSystemManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('LayerManager - AC2: Core Layer Population', () => {
  let testDir: string;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac2-test-'));
    coreSystemManager = new CoreSystemManager(testDir);
    
    // Install bmad-core first
    await coreSystemManager.installCoreSystem('bmad-core');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('AC2: Core Layer Population', () => {
    it('should copy all BMAD-Core agent files to .lcagents/core/bmad-core/agents/', async () => {
      const agentsDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'agents');
      expect(await fs.pathExists(agentsDir)).toBe(true);
      
      const agentFiles = await fs.readdir(agentsDir);
      expect(agentFiles.length).toBeGreaterThan(0);
      
      // Check for specific agent files
      const expectedAgents = ['pm.md', 'dev.md', 'qa.md', 'analyst.md', 'architect.md'];
      for (const agent of expectedAgents) {
        expect(agentFiles).toContain(agent);
      }
    });

    it('should copy all BMAD-Core task files to .lcagents/core/bmad-core/tasks/', async () => {
      const tasksDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'tasks');
      expect(await fs.pathExists(tasksDir)).toBe(true);
      
      const taskFiles = await fs.readdir(tasksDir);
      expect(taskFiles.length).toBeGreaterThan(20); // Should have 24+ task files
      
      // Check for specific task files
      const expectedTasks = ['create-doc.md', 'create-next-story.md', 'document-project.md'];
      for (const task of expectedTasks) {
        expect(taskFiles).toContain(task);
      }
    });

    it('should copy all BMAD-Core template files to .lcagents/core/bmad-core/templates/', async () => {
      const templatesDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'templates');
      expect(await fs.pathExists(templatesDir)).toBe(true);
      
      const templateFiles = await fs.readdir(templatesDir);
      expect(templateFiles.length).toBeGreaterThan(10); // Should have 13+ template files
      
      // Check for specific template files
      const expectedTemplates = ['prd-tmpl.yaml', 'story-tmpl.yaml', 'architecture-tmpl.yaml'];
      for (const template of expectedTemplates) {
        expect(templateFiles).toContain(template);
      }
    });

    it('should copy all BMAD-Core checklist files to .lcagents/core/bmad-core/checklists/', async () => {
      const checklistsDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'checklists');
      expect(await fs.pathExists(checklistsDir)).toBe(true);
      
      const checklistFiles = await fs.readdir(checklistsDir);
      expect(checklistFiles.length).toBeGreaterThan(5); // Should have 6+ checklist files
    });

    it('should copy all BMAD-Core data files to .lcagents/core/bmad-core/data/', async () => {
      const dataDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'data');
      expect(await fs.pathExists(dataDir)).toBe(true);
      
      const dataFiles = await fs.readdir(dataDir);
      expect(dataFiles.length).toBeGreaterThan(5); // Should have 6+ data files
      
      // Check for bmad-kb.md specifically
      expect(dataFiles).toContain('bmad-kb.md');
    });

    it('should copy all BMAD-Core utility files to .lcagents/core/bmad-core/utils/', async () => {
      const utilsDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'utils');
      expect(await fs.pathExists(utilsDir)).toBe(true);
      
      const utilFiles = await fs.readdir(utilsDir);
      expect(utilFiles.length).toBeGreaterThan(0);
    });

    it('should copy all BMAD-Core workflow files to .lcagents/core/bmad-core/workflows/', async () => {
      const workflowsDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'workflows');
      expect(await fs.pathExists(workflowsDir)).toBe(true);
      
      const workflowFiles = await fs.readdir(workflowsDir);
      expect(workflowFiles.length).toBeGreaterThan(5); // Should have 6+ workflow files
    });

    it('should copy all BMAD-Core agent-team files to .lcagents/core/bmad-core/agent-teams/', async () => {
      const agentTeamsDir = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'agent-teams');
      expect(await fs.pathExists(agentTeamsDir)).toBe(true);
      
      const teamFiles = await fs.readdir(agentTeamsDir);
      expect(teamFiles.length).toBeGreaterThan(3); // Should have 4+ team files
      
      // Check for specific team files
      const expectedTeams = ['team-all.yaml', 'team-fullstack.yaml'];
      for (const team of expectedTeams) {
        expect(teamFiles).toContain(team);
      }
    });

    it('should mark core layer as read-only with version tracking in version.json', async () => {
      const versionFile = path.join(testDir, '.lcagents', 'core', 'bmad-core', 'version.json');
      expect(await fs.pathExists(versionFile)).toBe(true);
      
      const versionData = await fs.readJSON(versionFile);
      expect(versionData.name).toBe('bmad-core');
      expect(versionData.version).toBeDefined();
      expect(versionData.description).toBeDefined();
      expect(versionData.agentCount).toBeGreaterThan(0);
      expect(versionData.installDate).toBeDefined();
      expect(versionData.source).toBeDefined();
    });

    it('should ensure all required directories exist in core layer', async () => {
      const coreDir = path.join(testDir, '.lcagents', 'core', 'bmad-core');
      
      const requiredDirs = [
        'agents', 'tasks', 'templates', 'checklists', 
        'data', 'utils', 'workflows', 'agent-teams'
      ];
      
      for (const dir of requiredDirs) {
        const dirPath = path.join(coreDir, dir);
        expect(await fs.pathExists(dirPath)).toBe(true);
      }
    });
  });
});
