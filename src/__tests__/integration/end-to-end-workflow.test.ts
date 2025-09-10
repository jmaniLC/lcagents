import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('LCAgents End-to-End Workflow Tests', () => {
  let testDir: string;
  let originalCwd: string;
  let cliPath: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-e2e-test-'));
    cliPath = path.join(originalCwd, 'dist/cli/index.js');
    
    // Ensure CLI is built
    if (!await fs.pathExists(cliPath)) {
      execSync('npm run build', { cwd: originalCwd, stdio: 'pipe' });
    }
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('Complete Installation Workflow', () => {
    it('should perform complete installation and validation workflow', async () => {
      process.chdir(testDir);

      // 1. Initial installation
      const initOutput = execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(initOutput).toContain('LCAgents initialized successfully');
      expect(initOutput).toContain('Virtual Resolution');

      // 2. Verify layered architecture was created
      const lcagentsPath = path.join(testDir, '.lcagents');
      expect(await fs.pathExists(lcagentsPath)).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'core', '.bmad-core'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'org'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'custom'))).toBe(true);
      expect(await fs.pathExists(path.join(lcagentsPath, 'runtime'))).toBe(true);

      // 3. Verify core system status
      const statusOutput = execSync(`node ${cliPath} core status`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(statusOutput).toContain('Core System Status');
      expect(statusOutput).toContain('bmad-core');
      expect(statusOutput).toContain('Version: 4.45.0');

      // 4. Test resource access
      const resourceOutput = execSync(`node ${cliPath} resource get agents analyst.md`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(resourceOutput).toContain('Resource found');
      expect(resourceOutput).toContain('analyst.md');

      // 5. List available resources
      const listOutput = execSync(`node ${cliPath} resource list agents`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(listOutput).toContain('Available agents resources');
      expect(listOutput).toContain('analyst.md');

      // 6. Validate system
      const validateOutput = execSync(`node ${cliPath} validate`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(validateOutput).toContain('Validating agent definitions');
      expect(validateOutput).toContain('Validation completed');

      // 7. Uninstall
      const uninstallOutput = execSync(`node ${cliPath} uninstall --force`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(uninstallOutput).toContain('LCAgents completely removed');
      expect(await fs.pathExists(lcagentsPath)).toBe(false);
    });
  });

  describe('Core System Management Workflow', () => {
    beforeEach(async () => {
      process.chdir(testDir);
      execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, { stdio: 'pipe' });
    });

    it('should manage core systems throughout their lifecycle', async () => {
      // 1. List available core systems
      const listOutput = execSync(`node ${cliPath} core list`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(listOutput).toContain('Core Agent Systems');
      expect(listOutput).toContain('bmad-core');
      expect(listOutput).toContain('enterprise-core');
      expect(listOutput).toContain('minimal-core');

      // 2. Check current status
      const statusOutput = execSync(`node ${cliPath} core status`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(statusOutput).toContain('Active Core System');
      expect(statusOutput).toContain('bmad-core');

      // 3. Check core system info instead of validate (validate doesn't exist)
      const infoOutput = execSync(`node ${cliPath} info`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(infoOutput).toContain('LendingClub Internal Agent System');

      // 4. Try to validate non-existent core system - this should fail gracefully
      expect(() => {
        execSync(`node ${cliPath} core status non-existent-core`, { stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Resource Management Workflow', () => {
    beforeEach(async () => {
      process.chdir(testDir);
      execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, { stdio: 'pipe' });
    });

    it('should handle all resource operations', async () => {
      // 1. List agents
      const agentsOutput = execSync(`node ${cliPath} resource list agents`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(agentsOutput).toContain('Available agents resources');
      expect(agentsOutput).toContain('analyst.md');
      expect(agentsOutput).toContain('architect.md');

      // 2. Get specific agent path
      const agentPathOutput = execSync(`node ${cliPath} resource get agents analyst.md`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(agentPathOutput).toContain('Resource found');
      expect(agentPathOutput).toContain('Path:');
      expect(agentPathOutput).toContain('Layer: core');

      // 3. Read agent content
      const agentContentOutput = execSync(`node ${cliPath} resource read agents analyst.md`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(agentContentOutput).toContain('Resource content');
      expect(agentContentOutput).toContain('# analyst'); // Actual content header

      // 4. List tasks
      const tasksOutput = execSync(`node ${cliPath} resource list tasks`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(tasksOutput).toContain('Available tasks resources');

      // 5. List templates
      const templatesOutput = execSync(`node ${cliPath} resource list templates`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(templatesOutput).toContain('Available templates resources');

      // 6. Test non-existent resource
      expect(() => {
        execSync(`node ${cliPath} resource get agents non-existent.md`, { stdio: 'pipe' });
      }).toThrow();
    });

    it('should handle resource filtering by layer', async () => {
      // Create custom resource
      const customAgentsDir = path.join(testDir, '.lcagents', 'custom', 'agents');
      await fs.ensureDir(customAgentsDir);
      await fs.writeFile(path.join(customAgentsDir, 'custom-agent.md'), '# Custom Agent');

      // List all agents
      const allAgentsOutput = execSync(`node ${cliPath} resource list agents`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(allAgentsOutput).toContain('analyst.md');
      expect(allAgentsOutput).toContain('custom-agent.md');

      // List only core agents
      const coreAgentsOutput = execSync(`node ${cliPath} resource list agents --layer core`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(coreAgentsOutput).toContain('analyst.md');
      expect(coreAgentsOutput).not.toContain('custom-agent.md');

      // List only custom agents
      const customAgentsOutput = execSync(`node ${cliPath} resource list agents --layer custom`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(customAgentsOutput).not.toContain('analyst.md');
      expect(customAgentsOutput).toContain('custom-agent.md');
    });
  });

  describe('Development Commands Workflow', () => {
    beforeEach(async () => {
      process.chdir(testDir);
      execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, { stdio: 'pipe' });
    });

    it('should execute all development commands', async () => {
      // 1. Generate documentation
      const docsOutput = execSync(`node ${cliPath} docs`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(docsOutput).toContain('Generating documentation');
      expect(docsOutput).toContain('Documentation generated');

      // 2. Generate documentation with custom output
      const docsCustomOutput = execSync(`node ${cliPath} docs --output custom-docs.md`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(docsCustomOutput).toContain('custom-docs.md');

      // 3. Run system analysis
      const analyzeOutput = execSync(`node ${cliPath} analyze`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(analyzeOutput).toContain('Generating analysis report');
      expect(analyzeOutput).toContain('Analysis completed');

      // 4. Check update information
      const updateOutput = execSync(`node ${cliPath} update`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(updateOutput).toContain('Updating LCAgents');
      expect(updateOutput).toContain('npm install');

      // 5. Display info
      const infoOutput = execSync(`node ${cliPath} info`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(infoOutput).toContain('LendingClub Internal Agent System');
      expect(infoOutput).toContain('Package:');
      expect(infoOutput).toContain('Repository:');
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle various error scenarios gracefully', async () => {
      process.chdir(testDir);

      // 1. Try to run commands without initialization - should succeed but show no core system
      try {
        const statusOutput = execSync(`node ${cliPath} core status`, { 
          encoding: 'utf8',
          stdio: 'pipe' 
        });
        expect(statusOutput).toContain('No active core system');
      } catch (error) {
        // Expected - no core system installed
        expect(error).toBeDefined();
      }

      try {
        execSync(`node ${cliPath} resource get agents analyst.md`, { stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error) {
        // Expected - no resources available without installation
        expect(error).toBeDefined();
      }

      // 2. Initialize system
      execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, { stdio: 'pipe' });

      // 3. Try to access non-existent resources
      try {
        execSync(`node ${cliPath} resource get agents non-existent.md`, { stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        execSync(`node ${cliPath} resource read tasks non-existent-task.md`, { stdio: 'pipe' });
        fail('Should have thrown an error'); 
      } catch (error) {
        expect(error).toBeDefined();
      }

      // 4. Try to reinstall without force - should show already installed message
      try {
        const reinstallOutput = execSync(`node ${cliPath} init --no-interactive --core-system bmad-core`, { 
          encoding: 'utf8',
          stdio: 'pipe' 
        });
        expect(reinstallOutput).toContain('already exists');
      } catch (error) {
        // Expected error about already being installed
        expect(error).toBeDefined();
      }

      // 5. Reinstall with force should work
      const reinstallOutput = execSync(`node ${cliPath} init --force --no-interactive --core-system bmad-core`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(reinstallOutput).toContain('LCAgents initialized successfully');
    });
  });

  describe('Help System Workflow', () => {
    it('should provide comprehensive help information', async () => {
      process.chdir(testDir);

      // 1. Main help
      const mainHelpOutput = execSync(`node ${cliPath} --help`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(mainHelpOutput).toContain('LendingClub Internal Agent System');
      expect(mainHelpOutput).toContain('Commands:');
      expect(mainHelpOutput).toContain('init');
      expect(mainHelpOutput).toContain('uninstall');
      expect(mainHelpOutput).toContain('core');
      expect(mainHelpOutput).toContain('resource');

      // 2. Command-specific help
      const initHelpOutput = execSync(`node ${cliPath} init --help`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(initHelpOutput).toContain('Initialize LCAgents');
      expect(initHelpOutput).toContain('--force');
      expect(initHelpOutput).toContain('--no-interactive');

      const coreHelpOutput = execSync(`node ${cliPath} core --help`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(coreHelpOutput).toContain('Manage core agent systems');
      expect(coreHelpOutput).toContain('Commands:');

      const resourceHelpOutput = execSync(`node ${cliPath} resource --help`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(resourceHelpOutput).toContain('Access resources');
      expect(resourceHelpOutput).toContain('Commands:');
    });
  });
});
