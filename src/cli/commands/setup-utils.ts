import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import { LayerManager } from '../../core/LayerManager';
import { AgentLoader } from '../../core/AgentLoader';

/**
 * Setup utilities command group for global operations on agents and resources
 * Moved from individual agent/resource commands for better organization
 */

// Valid resource types for validation
const VALID_RESOURCE_TYPES = ['agent', 'checklist', 'template', 'data', 'task', 'workflow', 'utils'];

/**
 * Move command - handles both agents and resources
 */
export const moveCommand = new Command('move')
  .description('Safe movement with conflict detection for agents and resources')
  .argument('<type>', `Resource type: ${VALID_RESOURCE_TYPES.join(', ')}`)
  .argument('<name>', 'Name/ID of the agent or resource to move')
  .argument('<target-layer>', 'Target layer (custom, org)')
  .action(async (type: string, name: string, targetLayer: string) => {
    try {
      if (!VALID_RESOURCE_TYPES.includes(type)) {
        console.error(chalk.red(`❌ Invalid type. Must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`));
        process.exit(1);
      }

      const currentDir = process.cwd();
      await moveResourceOrAgent(type, name, targetLayer, currentDir);
    } catch (error) {
      console.error(chalk.red(`❌ Error moving ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

/**
 * Backup command - handles both agents and resources
 */
export const backupCommand = new Command('backup')
  .description('Create explicit backup before modification for agents and resources')
  .argument('<type>', `Resource type: ${VALID_RESOURCE_TYPES.join(', ')}`)
  .argument('<name>', 'Name/ID of the agent or resource to backup')
  .action(async (type: string, name: string) => {
    try {
      if (!VALID_RESOURCE_TYPES.includes(type)) {
        console.error(chalk.red(`❌ Invalid type. Must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`));
        process.exit(1);
      }

      const currentDir = process.cwd();
      await backupResourceOrAgent(type, name, currentDir);
    } catch (error) {
      console.error(chalk.red(`❌ Error backing up ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

/**
 * Revert command - handles both agents and resources
 */
export const revertCommand = new Command('revert')
  .description('Safe reversion with backup preservation for agents and resources')
  .argument('<type>', `Resource type: ${VALID_RESOURCE_TYPES.join(', ')}`)
  .argument('<name>', 'Name/ID of the agent or resource to revert')
  .argument('[version]', 'Specific backup version to revert to (optional)')
  .action(async (type: string, name: string, version?: string) => {
    try {
      if (!VALID_RESOURCE_TYPES.includes(type)) {
        console.error(chalk.red(`❌ Invalid type. Must be one of: ${VALID_RESOURCE_TYPES.join(', ')}`));
        process.exit(1);
      }

      const currentDir = process.cwd();
      await revertResourceOrAgent(type, name, currentDir, version);
    } catch (error) {
      console.error(chalk.red(`❌ Error reverting ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

/**
 * Implementation: Move resource or agent between layers
 */
async function moveResourceOrAgent(type: string, name: string, targetLayer: string, basePath: string): Promise<void> {
  console.log(chalk.blue(`📦 Moving ${type}: ${name} to ${targetLayer} layer`));

  const layerManager = new LayerManager(basePath);

  if (type === 'agent') {
    // Handle agent movement
    const agentLoader = new AgentLoader(basePath);
    const result = await agentLoader.loadAgent(name);
    
    if (!result.success || !result.agent) {
      console.error(chalk.red(`❌ Agent not found: ${name}`));
      return;
    }

    // Get resolution path to show current layer
    const resolutionPath = await layerManager.resolveAgent(name);
    console.log(chalk.blue(`🔍 Agent layer analysis: ${resolutionPath.layerSources.join(' → ')}`));

    console.log(chalk.yellow('⚠️  Agent movement between layers is not yet implemented'));
    console.log(chalk.dim(`   Current layer: ${resolutionPath.layerSources[0] || 'unknown'}`));
    console.log(chalk.dim(`   Target layer: ${targetLayer}`));
    console.log(chalk.dim('   This feature will be available in a future release'));
  } else {
    // Handle resource movement
    const resourceTypes = ['checklists', 'templates', 'data', 'tasks', 'workflows', 'utils'];
    const resourceType = type === 'checklist' ? 'checklists' : 
                        type === 'template' ? 'templates' :
                        type === 'task' ? 'tasks' :
                        type === 'workflow' ? 'workflows' :
                        `${type}s`; // Default pluralization

    if (!resourceTypes.includes(resourceType)) {
      console.error(chalk.red(`❌ Unsupported resource type: ${type}`));
      return;
    }

    console.log(chalk.yellow('⚠️  Resource movement between layers is not yet implemented'));
    console.log(chalk.dim(`   Resource type: ${resourceType}`));
    console.log(chalk.dim(`   Resource name: ${name}`));
    console.log(chalk.dim(`   Target layer: ${targetLayer}`));
    console.log(chalk.dim('   This feature will be available in a future release'));
  }
}

/**
 * Implementation: Backup resource or agent
 */
async function backupResourceOrAgent(type: string, name: string, basePath: string): Promise<void> {
  console.log(chalk.blue(`💾 Creating ${type} backup: ${name}`));

  const layerManager = new LayerManager(basePath);

  if (type === 'agent') {
    // Handle agent backup (reuse existing logic)
    const agentLoader = new AgentLoader(basePath);
    const result = await agentLoader.loadAgent(name);
    
    if (!result.success || !result.agent) {
      console.error(chalk.red(`❌ Agent not found: ${name}`));
      return;
    }

    // Create backup using existing agent backup logic
    const backupLocation = await createAgentBackup(name, layerManager, result.agent);
    console.log(chalk.green(`✅ Agent backup created: ${backupLocation}`));
  } else {
    // Handle resource backup
    console.log(chalk.yellow('⚠️  Resource backup is not yet implemented'));
    console.log(chalk.dim(`   Resource type: ${type}`));
    console.log(chalk.dim(`   Resource name: ${name}`));
    console.log(chalk.dim('   This feature will be available in a future release'));
  }
}

/**
 * Implementation: Revert resource or agent
 */
async function revertResourceOrAgent(type: string, name: string, basePath: string, version?: string): Promise<void> {
  console.log(chalk.blue(`🔄 Reverting ${type}: ${name}${version ? ` to version ${version}` : ''}`));

  const layerManager = new LayerManager(basePath);

  if (type === 'agent') {
    // Handle agent revert (reuse existing logic)
    const agentLoader = new AgentLoader(basePath);
    const result = await agentLoader.loadAgent(name);
    
    if (!result.success || !result.agent) {
      console.error(chalk.red(`❌ Agent not found: ${name}`));
      return;
    }

    // Get resolution path to show current layer
    const resolutionPath = await layerManager.resolveAgent(name);
    console.log(chalk.blue(`🔍 Agent layer analysis: ${resolutionPath.layerSources.join(' → ')}`));

    console.log(chalk.yellow('⚠️  Agent revert is not yet implemented'));
    console.log(chalk.dim(`   Current layer: ${resolutionPath.layerSources[0] || 'unknown'}`));
    console.log(chalk.dim(`   Version: ${version || 'latest backup'}`));
    console.log(chalk.dim('   This feature will be available in a future release'));
  } else {
    // Handle resource revert
    console.log(chalk.yellow('⚠️  Resource revert is not yet implemented'));
    console.log(chalk.dim(`   Resource type: ${type}`));
    console.log(chalk.dim(`   Resource name: ${name}`));
    console.log(chalk.dim(`   Version: ${version || 'latest backup'}`));
    console.log(chalk.dim('   This feature will be available in a future release'));
  }
}

/**
 * Helper function to create agent backup (based on agent.ts logic)
 */
async function createAgentBackup(agentId: string, layerManager: LayerManager, agent: any): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupVersion = `backup-${timestamp}`;
  
  // Access LayerManager's lcagentsPath (following the agent.ts pattern)
  const lcagentsPath = (layerManager as any).lcagentsPath;
  const backupDir = path.join(lcagentsPath, 'custom', 'backups', agentId);
  await fs.ensureDir(backupDir);
  
  const backupPath = path.join(backupDir, `${backupVersion}.yaml`);
  const backupContent = JSON.stringify(agent.definition || agent, null, 2);
  
  await fs.writeFile(backupPath, backupContent, 'utf-8');
  
  console.log(chalk.green('✅ Automatic backup created'));
  console.log(chalk.dim(`📁 Backup: ${backupVersion}`));
  
  return backupPath;
}
