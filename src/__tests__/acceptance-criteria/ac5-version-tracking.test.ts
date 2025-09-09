import { CoreSystemManager } from '../../core/CoreSystemManager';
import { LayerManager } from '../../core/LayerManager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';

describe('CoreSystemManager - AC5: Version Tracking and Metadata', () => {
  let testDir: string;
  let coreSystemManager: CoreSystemManager;
  let layerManager: LayerManager;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-ac5-test-'));
    coreSystemManager = new CoreSystemManager(testDir);
    layerManager = new LayerManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('AC5: Version Tracking and Metadata', () => {
    it('should track core system version in active-core.json', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      await coreSystemManager.switchCoreSystem('bmad-core', 'Initial setup');
      
      const activeCoreConfig = await coreSystemManager.getActiveCoreConfig();
      
      expect(activeCoreConfig).not.toBeNull();
      expect(activeCoreConfig!.activeCore).toBe('bmad-core');
      expect(activeCoreConfig!.lastUpdated).toBeDefined();
      expect(activeCoreConfig!.availableCores).toBeDefined();
      expect(activeCoreConfig!.availableCores.length).toBeGreaterThan(0);
      
      const activeCore = activeCoreConfig!.availableCores.find(c => c.isActive);
      expect(activeCore).toBeDefined();
      expect(activeCore!.version).toBe('1.0.0-alpha.1');
      expect(activeCore!.installDate).toBeDefined();
    });

    it('should maintain switch history with timestamps', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      await coreSystemManager.switchCoreSystem('bmad-core', 'First switch');
      await coreSystemManager.switchCoreSystem('bmad-core', 'Second switch');
      
      const activeCoreConfig = await coreSystemManager.getActiveCoreConfig();
      
      expect(activeCoreConfig).not.toBeNull();
      expect(activeCoreConfig!.switchHistory).toBeDefined();
      expect(activeCoreConfig!.switchHistory.length).toBeGreaterThan(0);
      
      const latestEntry = activeCoreConfig!.switchHistory[activeCoreConfig!.switchHistory.length - 1];
      expect(latestEntry).toBeDefined();
      expect(latestEntry!.reason).toBe('Second switch');
      expect(latestEntry!.timestamp).toBeDefined();
    });

    it('should create installation metadata in core system directory', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const metadataPath = path.join(testDir, '.lcagents', 'core-systems', 'bmad-core', '.metadata.json');
      expect(await fs.pathExists(metadataPath)).toBe(true);
      
      const metadata = await fs.readJson(metadataPath);
      expect(metadata.name).toBe('bmad-core');
      expect(metadata.version).toBe('1.0.0-alpha.1');
      expect(metadata.installedAt).toBeDefined();
      expect(metadata.source).toBe('bundled');
    });

    it('should track layered structure version in pod-config.yaml', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const podConfigPath = path.join(testDir, '.lcagents', 'pod-config.yaml');
      expect(await fs.pathExists(podConfigPath)).toBe(true);
      
      const config = yaml.load(await fs.readFile(podConfigPath, 'utf-8')) as any;
      expect(config.pod.version).toBe('1.0.0');
      expect(config.pod.created).toBeDefined();
      expect(config.coreSystem).toBe('bmad-core');
      expect(config.architecture.layers).toContain('core');
      expect(config.architecture.layers).toContain('org');
      expect(config.architecture.layers).toContain('custom');
    });

    it('should document upgrade paths in UPGRADE.md', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const upgradePath = path.join(testDir, '.lcagents', 'UPGRADE.md');
      expect(await fs.pathExists(upgradePath)).toBe(true);
      
      const content = await fs.readFile(upgradePath, 'utf-8');
      expect(content).toContain('Upgrade Guide');
      expect(content).toContain('core system');
      expect(content).toContain('migration');
    });

    it('should maintain compatibility matrix', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const compatibilityPath = path.join(testDir, '.lcagents', 'COMPATIBILITY.md');
      expect(await fs.pathExists(compatibilityPath)).toBe(true);
      
      const content = await fs.readFile(compatibilityPath, 'utf-8');
      expect(content).toContain('Compatibility Matrix');
      expect(content).toContain('lcagents');
      expect(content).toContain('core system');
    });

    it('should create version lock file', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const lockPath = path.join(testDir, '.lcagents', 'lcagents-lock.json');
      expect(await fs.pathExists(lockPath)).toBe(true);
      
      const lock = await fs.readJson(lockPath);
      expect(lock.lcagentsVersion).toBeDefined();
      expect(lock.coreSystem).toBe('bmad-core');
      expect(lock.coreSystemVersion).toBe('1.0.0-alpha.1');
      expect(lock.architecture).toBe('layered');
    });

    it('should track migration history', async () => {
      // Create legacy structure first
      const legacyDir = path.join(testDir, '.lcagents', 'agents');
      await fs.ensureDir(legacyDir);
      await fs.writeFile(path.join(legacyDir, 'test-agent.md'), 'test content');
      
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const migrationPath = path.join(testDir, '.lcagents', 'MIGRATION.md');
      expect(await fs.pathExists(migrationPath)).toBe(true);
      
      const content = await fs.readFile(migrationPath, 'utf-8');
      expect(content).toContain('Migration History');
      expect(content).toContain('layered architecture');
    });

    it('should validate version compatibility', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const isValid = await coreSystemManager.validateCoreSystemStructure('bmad-core');
      expect(isValid.isValid).toBe(true);
      expect(isValid.version).toBe('1.0.0-alpha.1');
    });

    it('should create backup references before major changes', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      await layerManager.createLayeredStructure('bmad-core');
      
      const backupPath = path.join(testDir, '.lcagents', 'backups');
      expect(await fs.pathExists(backupPath)).toBe(true);
      
      const backupInfo = path.join(backupPath, 'backup-info.json');
      expect(await fs.pathExists(backupInfo)).toBe(true);
    });

    it('should maintain changelog for core system updates', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const changelogPath = path.join(testDir, '.lcagents', 'CHANGELOG.md');
      expect(await fs.pathExists(changelogPath)).toBe(true);
      
      const content = await fs.readFile(changelogPath, 'utf-8');
      expect(content).toContain('Change Log');
      expect(content).toContain('## [1.0.0]');
    });

    it('should create installation receipt', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const receiptPath = path.join(testDir, '.lcagents', 'core-systems', 'bmad-core', 'RECEIPT.md');
      expect(await fs.pathExists(receiptPath)).toBe(true);
      
      const content = await fs.readFile(receiptPath, 'utf-8');
      expect(content).toContain('Installation Receipt');
      expect(content).toContain('bmad-core');
    });

    it('should track resource checksums for integrity', async () => {
      await coreSystemManager.installCoreSystem('bmad-core');
      
      const checksumPath = path.join(testDir, '.lcagents', 'core-systems', 'bmad-core', 'CHECKSUMS.json');
      expect(await fs.pathExists(checksumPath)).toBe(true);
      
      const checksums = await fs.readJson(checksumPath);
      expect(checksums.agents).toBeDefined();
      expect(checksums.tasks).toBeDefined();
      expect(checksums.templates).toBeDefined();
    });
  });
});
