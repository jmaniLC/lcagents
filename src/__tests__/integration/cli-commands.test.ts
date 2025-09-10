import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('CLI Commands Integration Tests', () => {
  let testDir: string;
  let originalCwd: string;
  let cliPath: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-test-'));
    cliPath = path.join(originalCwd, 'dist/cli/index.js');
    
    // Ensure CLI is built
    if (!await fs.pathExists(cliPath)) {
      execSync('npm run build', { cwd: originalCwd, stdio: 'pipe' });
    }
    
    process.chdir(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('lcagents init', () => {
    it('should initialize LCAgents successfully', async () => {
      const command = `node ${cliPath} init --no-interactive --core-system bmad-core`;
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

      expect(output).toContain('LCAgents initialized successfully');
      expect(output).toContain('Virtual Resolution');

      // Verify directory structure
      const lcagentsPath = path.join(testDir, '.lcagents');
      expect(await fs.pathExists(lcagentsPath)).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'core'))).toBe(true);
    });
  });

  describe('lcagents info', () => {
    it('should display system information', async () => {
      const command = `node ${cliPath} info`;
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });

      expect(output).toContain('LendingClub Internal Agent System');
      expect(output).toContain('Package:');
    });
  });
});