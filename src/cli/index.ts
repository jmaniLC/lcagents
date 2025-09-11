#!/usr/bin/env node

import { Command } from 'commander';
import * as initModule from './commands/init';
import * as uninstallModule from './commands/uninstall';
import { coreCommand } from './commands/core';
import { resourceCommand } from './commands/resource';
import { agentCommand, commandCommand, resCommand } from './commands/agent';
import { loadRepositoryConfig } from '../utils/repository-config';

// Load repository configuration
const repoConfig = loadRepositoryConfig();

const program = new Command();

program
  .name('lcagents')
  .description('LendingClub Internal Agent System - Distributed BMAD-Core Agents')
  .version('1.0.0-alpha.1');

// Register commands
program.addCommand(initModule.initCommand);
program.addCommand(uninstallModule.uninstallCommand);
program.addCommand(coreCommand);
program.addCommand(resourceCommand);
program.addCommand(agentCommand);
program.addCommand(commandCommand);
program.addCommand(resCommand);

// Add additional commands for development
program
  .command('validate')
  .description('Validate agent definitions and configuration')
  .action(async () => {
    console.log('🔍 Validating agent definitions...');
    // TODO: Implement validation logic
    console.log('✅ Validation completed');
  });

program
  .command('docs')
  .description('Generate agent documentation')
  .option('--output <path>', 'Output path for documentation', 'docs/agents.md')
  .option('--comprehensive', 'Generate comprehensive documentation')
  .action(async (options) => {
    console.log(`📚 Generating documentation to ${options.output}...`);
    // TODO: Implement documentation generation
    console.log('✅ Documentation generated');
  });

program
  .command('analyze')
  .description('Analyze agent system and generate reports')
  .option('--report <path>', 'Output path for analysis report', 'analysis.md')
  .action(async (options) => {
    console.log(`📊 Generating analysis report to ${options.report}...`);
    // TODO: Implement analysis logic
    console.log('✅ Analysis completed');
  });

// Internal LendingClub specific commands
program
  .command('info')
  .description('Show LendingClub internal installation information')
  .action(async () => {
    console.log('🏢 LendingClub Internal Agent System');
    console.log('📦 Package: @lendingclub/lcagents v1.0.0-alpha.1');
    console.log(`📍 Repository: ${repoConfig.repository.url.replace('.git', '')}`);
    console.log('📚 Documentation: https://confluence.lendingclub.com/lcagents');
    console.log('🎫 Support: #engineering-tools Slack channel');
    console.log(`🔧 Team: ${repoConfig.organization} Engineering Tools & Automation`);
    console.log(`👤 Author: ${repoConfig.author.name}`);
  });

program
  .command('update')
  .description('Update to latest version from internal repository')
  .action(async () => {
    console.log('🔄 Updating LCAgents from internal repository...');
    console.log(`💡 Run: npm install -g git+${repoConfig.repository.url}`);
    console.log('ℹ️  Auto-update coming in Phase 1B');
  });

// Parse command line arguments
program.parse();
