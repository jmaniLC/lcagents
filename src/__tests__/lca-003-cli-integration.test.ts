import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('LCA-003 CLI Integration Tests', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-cli-test-'));
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('lcagents init with layered architecture', () => {
    it('should initialize with bmad-core by default in non-interactive mode', async () => {
      // Run init command in non-interactive mode
      const command = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --no-interactive --no-github`;
      
      try {
        const output = execSync(command, { 
          encoding: 'utf8', 
          cwd: testDir,
          stdio: 'pipe'
        });

        expect(output).toContain('initialized successfully');

        // Verify layered structure was created
        const lcagentsPath = path.join(testDir, '.lcagents');
        expect(await fs.pathExists(lcagentsPath)).toBe(true);

        // Verify core layer
        expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core', 'agents'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core', 'tasks'))).toBe(true);

        // Verify other layers
        expect(await fs.pathExists(path.join(lcagentsPath, 'org'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'custom'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'runtime'))).toBe(true);

        // Verify backward compatibility
        expect(await fs.pathExists(path.join(lcagentsPath, 'agents'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'tasks'))).toBe(true);

        // Verify configuration files
        expect(await fs.pathExists(path.join(lcagentsPath, 'custom', 'config', 'pod-config.yaml'))).toBe(true);
        expect(await fs.pathExists(path.join(lcagentsPath, 'config.yaml'))).toBe(true);

      } catch (error) {
        console.error('CLI execution failed:', error);
        throw error;
      }
    });

    it('should handle force reinstallation', async () => {
      // First installation
      const initCommand = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --no-interactive --no-github`;
      execSync(initCommand, { cwd: testDir, stdio: 'pipe' });

      // Force reinstallation
      const forceCommand = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --force --no-interactive --no-github`;
      const output = execSync(forceCommand, { 
        encoding: 'utf8', 
        cwd: testDir,
        stdio: 'pipe'
      });

      expect(output).toContain('initialized successfully');
    });
  });

  describe('lcagents core commands', () => {
    beforeEach(async () => {
      // Initialize lcagents first
      const initCommand = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --no-interactive --no-github`;
      execSync(initCommand, { cwd: testDir, stdio: 'pipe' });
    });

    it('should list available core systems', async () => {
      const command = `node ${path.join(originalCwd, 'dist/cli/index.js')} core list`;
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: testDir,
        stdio: 'pipe'
      });

      expect(output).toContain('Core Agent Systems');
      expect(output).toContain('Available Core Systems');
      expect(output).toContain('bmad-core');
    });

    it('should show core system status', async () => {
      const command = `node ${path.join(originalCwd, 'dist/cli/index.js')} core status`;
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: testDir,
        stdio: 'pipe'
      });

      expect(output).toContain('Core System Status');
      expect(output).toContain('Active Core System');
      expect(output).toContain('bmad-core');
    });

    it('should validate core system switch', async () => {
      const command = `node ${path.join(originalCwd, 'dist/cli/index.js')} core validate-switch bmad-core`;
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: testDir,
        stdio: 'pipe'
      });

      expect(output).toContain('Validation Results');
      expect(output).toContain('Core system is valid');
    });
  });

  describe('Migration scenarios', () => {
    it('should migrate existing flat installation', async () => {
      // Create a mock flat installation
      const lcagentsPath = path.join(testDir, '.lcagents');
      await fs.ensureDir(path.join(lcagentsPath, 'agents'));
      await fs.ensureDir(path.join(lcagentsPath, 'tasks'));
      await fs.writeFile(path.join(lcagentsPath, 'agents', 'test-agent.md'), 'Mock agent');
      await fs.writeFile(path.join(lcagentsPath, 'tasks', 'test-task.md'), 'Mock task');

      // Run init with force since flat installation exists
      const command = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --force --no-interactive --no-github`;
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: testDir,
        stdio: 'pipe'
      });

      expect(output).toContain('initialized successfully');

      // Verify migration occurred
      expect(await fs.pathExists(path.join(lcagentsPath, 'core', 'bmad-core'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'org'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom'))).toBe(true);

      // Verify backward compatibility files exist
      expect(await fs.pathExists(path.join(lcagentsPath, 'agents'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'tasks'))).toBe(true);
    });
  });

  describe('Configuration management', () => {
    beforeEach(async () => {
      const initCommand = `node ${path.join(originalCwd, 'dist/cli/index.js')} init --no-interactive --no-github`;
      execSync(initCommand, { cwd: testDir, stdio: 'pipe' });
    });

    it('should create proper configuration files', async () => {
      const lcagentsPath = path.join(testDir, '.lcagents');

      // Check main config
      const configPath = path.join(lcagentsPath, 'config.yaml');
      expect(await fs.pathExists(configPath)).toBe(true);

      // Check pod config
      const podConfigPath = path.join(lcagentsPath, 'custom', 'config', 'pod-config.yaml');
      expect(await fs.pathExists(podConfigPath)).toBe(true);

      // Check active core config
      const activeCoreConfigPath = path.join(lcagentsPath, 'core', 'active-core.json');
      expect(await fs.pathExists(activeCoreConfigPath)).toBe(true);

      // Verify active core config content
      const activeCoreConfig = await fs.readJSON(activeCoreConfigPath);
      expect(activeCoreConfig.activeCore).toBe('bmad-core');
      expect(activeCoreConfig.availableCores).toBeDefined();
      expect(activeCoreConfig.availableCores.length).toBeGreaterThan(0);
    });
  });
});
