import { LayerManager } from '../../core/LayerManager';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('LayerManager - AC6: Backward Compatibility', () => {
  let testDir: string;
  let layerManager: LayerManager;
  let coreSystemManager: CoreSystemManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac6-test-'));
    layerManager = new LayerManager(testDir);
    coreSystemManager = new CoreSystemManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('AC6: Backward Compatibility', () => {
    it('should detect existing legacy flat structure', async () => {
      // Create legacy structure
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      const legacyTasksDir = path.join(testDir, '.lcagents', 'tasks');
      
      await fs.ensureDir(legacyAgentsDir);
      await fs.ensureDir(legacyTasksDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'legacy-agent.md'), 'Legacy agent content');
      await fs.writeFile(path.join(legacyTasksDir, 'legacy-task.md'), 'Legacy task content');
      
      const hasLegacy = await layerManager.hasLegacyStructure();
      expect(hasLegacy).toBe(true);
    });

    it('should migrate legacy structure to custom layer', async () => {
      // Create legacy structure with sample files
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      const legacyTasksDir = path.join(testDir, '.lcagents', 'tasks');
      const legacyTemplatesDir = path.join(testDir, '.lcagents', 'templates');
      
      await fs.ensureDir(legacyAgentsDir);
      await fs.ensureDir(legacyTasksDir);
      await fs.ensureDir(legacyTemplatesDir);
      
      await fs.writeFile(path.join(legacyAgentsDir, 'custom-agent.md'), 'Custom agent content');
      await fs.writeFile(path.join(legacyTasksDir, 'custom-task.md'), 'Custom task content');
      await fs.writeFile(path.join(legacyTemplatesDir, 'custom-template.yaml'), 'custom_template: true');
      
      // Install and create layered structure (should trigger migration)
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // Verify migration to custom layer
      const customAgentPath = path.join(testDir, '.lcagents', 'custom', 'agents', 'custom-agent.md');
      const customTaskPath = path.join(testDir, '.lcagents', 'custom', 'tasks', 'custom-task.md');
      const customTemplatePath = path.join(testDir, '.lcagents', 'custom', 'templates', 'custom-template.yaml');
      
      expect(await fs.pathExists(customAgentPath)).toBe(true);
      expect(await fs.pathExists(customTaskPath)).toBe(true);
      expect(await fs.pathExists(customTemplatePath)).toBe(true);
      
      // Verify content preserved
      const agentContent = await fs.readFile(customAgentPath, 'utf-8');
      expect(agentContent).toBe('Custom agent content');
    });

    it('should preserve existing workflows during layered installation', async () => {
      // Create legacy structure
      const legacyWorkflowsDir = path.join(testDir, '.lcagents', 'workflows');
      await fs.ensureDir(legacyWorkflowsDir);
      await fs.writeFile(path.join(legacyWorkflowsDir, 'existing-workflow.md'), 'Existing workflow');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // Should be migrated to custom layer
      const customWorkflowPath = path.join(testDir, '.lcagents', 'custom', 'workflows', 'existing-workflow.md');
      expect(await fs.pathExists(customWorkflowPath)).toBe(true);
      
      const content = await fs.readFile(customWorkflowPath, 'utf-8');
      expect(content).toBe('Existing workflow');
    });

    it('should maintain backward compatibility for existing CLI commands', async () => {
      // Create layered structure
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      // Traditional paths should still work
      const traditionalAgentsDir = path.join(testDir, '.lcagents', 'agents');
      const traditionalTasksDir = path.join(testDir, '.lcagents', 'tasks');
      const traditionalTemplatesDir = path.join(testDir, '.lcagents', 'templates');
      
      expect(await fs.pathExists(traditionalAgentsDir)).toBe(true);
      expect(await fs.pathExists(traditionalTasksDir)).toBe(true);
      expect(await fs.pathExists(traditionalTemplatesDir)).toBe(true);
      
      // Should contain resolved files
      const agentFiles = await fs.readdir(traditionalAgentsDir);
      expect(agentFiles.length).toBeGreaterThan(0);
    });

    it('should create migration report', async () => {
      // Create legacy structure
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyAgentsDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'test-agent.md'), 'test content');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const migrationReportPath = path.join(testDir, '.lcagents', 'migration-report.json');
      expect(await fs.pathExists(migrationReportPath)).toBe(true);
      
      const report = await fs.readJson(migrationReportPath);
      expect(report.migrationDate).toBeDefined();
      expect(report.migratedFiles).toBeDefined();
      expect(report.migratedFiles.length).toBeGreaterThan(0);
    });

    it('should backup legacy structure before migration', async () => {
      // Create legacy structure
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyAgentsDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'important-agent.md'), 'Important content');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const backupDir = path.join(testDir, '.lcagents', 'backups');
      expect(await fs.pathExists(backupDir)).toBe(true);
      
      // Should contain timestamped backup
      const backupContents = await fs.readdir(backupDir);
      const backupFolder = backupContents.find(name => name.startsWith('legacy-backup-'));
      expect(backupFolder).toBeDefined();
      
      if (backupFolder) {
        const backupAgentsDir = path.join(backupDir, backupFolder, 'agents');
        expect(await fs.pathExists(backupAgentsDir)).toBe(true);
        
        const backupAgentFile = path.join(backupAgentsDir, 'important-agent.md');
        expect(await fs.pathExists(backupAgentFile)).toBe(true);
      }
    });

    it('should handle partial legacy structure gracefully', async () => {
      // Create partial legacy structure (only agents)
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyAgentsDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'solo-agent.md'), 'Solo agent');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // Migration should work even with partial structure
      const customAgentPath = path.join(testDir, '.lcagents', 'custom', 'agents', 'solo-agent.md');
      expect(await fs.pathExists(customAgentPath)).toBe(true);
    });

    it('should preserve custom configuration files during migration', async () => {
      // Create legacy structure with config
      const lcagentsDir = path.join(testDir, '.lcagents');
      await fs.ensureDir(lcagentsDir);
      await fs.writeFile(path.join(lcagentsDir, 'config.yaml'), 'custom_config: true');
      await fs.writeFile(path.join(lcagentsDir, 'settings.json'), '{"custom": true}');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // Config files should be preserved
      expect(await fs.pathExists(path.join(lcagentsDir, 'config.yaml'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsDir, 'settings.json'))).toBe(true);
    });

    it('should provide rollback capability', async () => {
      // Create legacy structure
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyAgentsDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'rollback-test.md'), 'Original content');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // Check rollback documentation exists
      const rollbackPath = path.join(testDir, '.lcagents', 'ROLLBACK.md');
      expect(await fs.pathExists(rollbackPath)).toBe(true);
      
      const rollbackContent = await fs.readFile(rollbackPath, 'utf-8');
      expect(rollbackContent).toContain('rollback');
      expect(rollbackContent).toContain('backup');
    });

    it('should maintain symbolic link resolution for backward compatibility', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      await layerManager.createBackwardCompatibilityResolution('bmad-core');
      
      // Check that traditional paths resolve properly
      const agentsDir = path.join(testDir, '.lcagents', 'agents');
      const agentFiles = await fs.readdir(agentsDir);
      
      // Pick a known agent file and verify it's accessible
      if (agentFiles.length > 0) {
        const firstAgent = agentFiles[0];
        if (firstAgent) {
          const agentPath = path.join(agentsDir, firstAgent);
          const content = await fs.readFile(agentPath, 'utf-8');
          expect(content.length).toBeGreaterThan(0);
        }
      }
    });

    it('should preserve git repository status during migration', async () => {
      // Create legacy structure with git (simulate)
      const legacyAgentsDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyAgentsDir);
      await fs.writeFile(path.join(legacyAgentsDir, 'versioned-agent.md'), 'Git versioned content');
      
      // Create .gitignore to simulate git repo
      await fs.writeFile(path.join(testDir, '.gitignore'), '.lcagents/cache\n');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      // .gitignore should be preserved and updated
      const gitignorePath = path.join(testDir, '.gitignore');
      expect(await fs.pathExists(gitignorePath)).toBe(true);
      
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('.lcagents/cache');
    });
  });
});
