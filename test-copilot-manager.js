const { GitHubCopilotManager } = require('./dist/core/GitHubCopilotManager');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

(async () => {
  const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'github-copilot-test-'));
  console.log('Test directory:', testDir);
  
  try {
    const manager = new GitHubCopilotManager(testDir);
    
    const config = {
      projectPath: testDir,
      podInfo: {
        name: 'Test Pod',
        id: 'test-pod',
        owner: 'team-test'
      },
      techStack: ['TypeScript', 'React', 'Node.js']
    };
    
    await manager.updateCopilotInstructions(config);
    
    const instructionsFile = path.join(testDir, '.github', 'copilot-instructions.md');
    const exists = await fs.pathExists(instructionsFile);
    console.log('Instructions file created:', exists);
    
    if (exists) {
      const content = await fs.readFile(instructionsFile, 'utf-8');
      console.log('Content includes LCAgents:', content.includes('LCAgents Integration'));
      console.log('Content includes pod:', content.includes('Test Pod'));
      console.log('Content includes tech stack:', content.includes('TypeScript'));
      console.log('Content preview:', content.substring(0, 200) + '...');
    }
    
    // Test removal
    console.log('Testing removal...');
    const contentBefore = await fs.readFile(instructionsFile, 'utf-8');
    console.log('Content before removal (first 100 chars):', contentBefore.substring(0, 100));
    
    await manager.removeCopilotInstructions();
    const existsAfterRemoval = await fs.pathExists(instructionsFile);
    console.log('File exists after removal:', existsAfterRemoval);
    
    if (existsAfterRemoval) {
      const contentAfter = await fs.readFile(instructionsFile, 'utf-8');
      console.log('Content after removal (first 100 chars):', contentAfter.substring(0, 100));
      console.log('Content length after removal:', contentAfter.length);
      console.log('Content trimmed length:', contentAfter.trim().length);
    }
    
    console.log('File removed successfully:', !existsAfterRemoval);
    
    // Check if .github directory still exists
    const githubDir = path.join(testDir, '.github');
    const githubDirExists = await fs.pathExists(githubDir);
    console.log('GitHub directory exists after removal:', githubDirExists);
    
  } finally {
    await fs.remove(testDir);
    console.log('Cleanup completed');
  }
})().catch(console.error);
