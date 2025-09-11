import { AgentLoader } from '../../core/AgentLoader';
import { LCAgentsConfig } from '../../types/Config';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

describe('AgentLoader', () => {
  let agentLoader: AgentLoader;
  let testDir: string;
  let originalCwd: string;
  let config: LCAgentsConfig;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lcagents-agentloader-test-'));
    process.chdir(testDir);

    // Create test structure
    const lcagentsDir = path.join(testDir, '.lcagents');
    const coreDir = path.join(lcagentsDir, 'core');
    const agentsDir = path.join(coreDir, 'agents');
    await fs.ensureDir(agentsDir);

    // Create test agent files
    await fs.writeFile(path.join(agentsDir, 'test-agent.yaml'), `name: Test Agent
id: test-agent
title: Test Agent for Unit Testing
icon: test
whenToUse: For testing functionality
persona:
  role: Testing Agent
  style: professional
  identity: unit test agent
  focus: validation
commands:
  test:
    description: Run tests
    prompt: "Run unit tests"
dependencies:
  checklists: []
  data: []
  tasks: []`);

    await fs.writeFile(path.join(agentsDir, 'another-agent.yaml'), `name: Another Agent
id: another-agent
title: Secondary Test Agent
icon: secondary
whenToUse: For support functionality
persona:
  role: Secondary Testing Agent
  style: helpful
  identity: support agent
  focus: assistance
commands:
  support:
    description: Provide support
    prompt: "Provide support functionality"
dependencies:
  checklists: []
  data: []
  tasks: []`);

    // Create test config
    config = {
      version: '1.0.0'
    };

    const configPath = path.join(lcagentsDir, 'config.json');
    await fs.writeJson(configPath, config);

    agentLoader = new AgentLoader(testDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  });

  describe('loadAgent', () => {
    it('should load specific agent by name', async () => {
      const result = await agentLoader.loadAgent('test-agent');

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
      expect(result.agent!.definition.name).toBe('Test Agent');
      expect(result.agent!.definition.id).toBe('test-agent');
      expect(result.agent!.definition.persona.role).toBe('Testing Agent');
    });

    it('should handle non-existent agent', async () => {
      const result = await agentLoader.loadAgent('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Agent not found');
    });

    it('should cache loaded agents', async () => {
      const result1 = await agentLoader.loadAgent('test-agent');
      const result2 = await agentLoader.loadAgent('test-agent');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.agent).toBe(result2.agent); // Same object reference for cached agent
    });
  });

  describe('loadAllAgents', () => {
    it('should load all available agents', async () => {
      const result = await agentLoader.loadAllAgents();

      expect(result.loaded).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.loaded.some(agent => agent.definition.id === 'test-agent')).toBe(true);
      expect(result.loaded.some(agent => agent.definition.id === 'another-agent')).toBe(true);
    });

    it('should handle empty agents directory', async () => {
      // Remove all agent files
      const agentsDir = path.join(testDir, '.lcagents', 'core', 'agents');
      await fs.emptyDir(agentsDir);

      const result = await agentLoader.loadAllAgents();
      expect(result.loaded).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors for malformed agents', async () => {
      // Create malformed agent
      const malformedPath = path.join(testDir, '.lcagents', 'core', 'agents', 'malformed.yaml');
      await fs.writeFile(malformedPath, 'invalid: yaml: content: [unclosed');

      const result = await agentLoader.loadAllAgents();
      expect(result.loaded).toHaveLength(2); // Still loads valid agents
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('agent validation', () => {
    it('should validate well-formed agents', async () => {
      const result = await agentLoader.loadAgent('test-agent');

      expect(result.success).toBe(true);
      expect(result.agent).toBeDefined();
      expect(result.agent!.definition.commands).toBeDefined();
      expect(Object.keys(result.agent!.definition.commands).length).toBeGreaterThan(0);
    });

    it('should handle agents missing required fields', async () => {
      // Create incomplete agent
      const incompletePath = path.join(testDir, '.lcagents', 'core', 'agents', 'incomplete.yaml');
      await fs.writeFile(incompletePath, `name: Incomplete Agent
# Missing required fields like id, title, etc.`);

      const result = await agentLoader.loadAgent('incomplete');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('agent caching', () => {
    it('should cache agents correctly', async () => {
      // Load agent first time
      const result1 = await agentLoader.loadAgent('test-agent');
      expect(result1.success).toBe(true);

      // Modify the file after loading
      const agentPath = path.join(testDir, '.lcagents', 'core', 'agents', 'test-agent.yaml');
      await fs.writeFile(agentPath, `name: Modified Agent
id: test-agent
title: Modified Title
icon: modified
whenToUse: Modified usage
persona:
  role: Modified Role
  style: modified
  identity: modified agent
  focus: modification
commands: {}
dependencies:
  checklists: []`);

      // Load again - should return cached version
      const result2 = await agentLoader.loadAgent('test-agent');
      expect(result2.success).toBe(true);
      expect(result2.agent!.definition.name).toBe('Test Agent'); // Original name, not modified
    });
  });

  describe('error handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Remove entire agents directory
      const agentsDir = path.join(testDir, '.lcagents', 'core', 'agents');
      await fs.remove(agentsDir);

      const result = await agentLoader.loadAgent('test-agent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Agent not found');
    });

    it('should handle YAML parsing errors', async () => {
      // Create agent with invalid YAML
      const invalidPath = path.join(testDir, '.lcagents', 'core', 'agents', 'invalid.yaml');
      await fs.writeFile(invalidPath, `name: Invalid Agent
[invalid yaml syntax`);

      const result = await agentLoader.loadAgent('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
