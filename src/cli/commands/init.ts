import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigManager } from '../../core/ConfigManager';
import { GitHubIntegration } from '../../core/GitHubIntegration';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export const initCommand = new Command('init')
  .description('Initialize LCAgents in the current directory')
  .option('-f, --force', 'Overwrite existing installation')
  .option('--no-github', 'Skip GitHub integration setup')
  .option('--template <name>', 'Use specific project template')
  .option('--no-interactive', 'Skip interactive prompts')
  .action(async (options) => {
    const spinner = ora('Initializing LCAgents...').start();
    
    try {
      const currentDir = process.cwd();
      const lcagentsDir = path.join(currentDir, '.lcagents');
      
      // Check if already initialized
      if (await fs.pathExists(lcagentsDir) && !options.force) {
        spinner.fail('LCAgents already initialized in this directory');
        console.log(chalk.yellow('Use --force to overwrite existing installation'));
        return;
      }
      
      spinner.text = 'Creating directory structure...';
      
      // Create .lcagents directory structure
      const directories = [
        'agents',
        'tasks', 
        'templates',
        'checklists',
        'data',
        'utils',
        'workflows',
        'agent-teams',
        'logs',
        'cache'
      ];
      
      for (const dir of directories) {
        await fs.ensureDir(path.join(lcagentsDir, dir));
      }
      
      spinner.text = 'Copying BMAD-Core resources...';
      
      // TODO: Copy BMAD-Core resources from package
      // This would copy from node_modules/@lendingclub/lcagents/resources
      const packageResourcesPath = path.join(__dirname, '../../../resources');
      if (await fs.pathExists(packageResourcesPath)) {
        await fs.copy(packageResourcesPath, lcagentsDir);
      }
      
      spinner.text = 'Setting up configuration...';
      
      // Initialize configuration
      const configManager = new ConfigManager(currentDir);
      let githubEnabled = options.github !== false;
      let repository = '';
      
      if (options.interactive !== false) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'enableGithub',
            message: 'Enable GitHub integration?',
            default: githubEnabled
          },
          {
            type: 'input',
            name: 'repository',
            message: 'GitHub repository (org/repo):',
            when: (answers) => answers.enableGithub,
            validate: (input) => {
              if (!input) return 'Repository is required for GitHub integration';
              if (!input.includes('/')) return 'Repository must be in format org/repo';
              return true;
            }
          }
        ]);
        
        githubEnabled = answers.enableGithub;
        repository = answers.repository || '';
      }
      
      await configManager.initializeConfig({
        enableGithub: githubEnabled,
        enableCopilot: githubEnabled,
        repository
      });
      
      if (githubEnabled) {
        spinner.text = 'Setting up GitHub integration...';
        const config = configManager.getConfig();
        const githubIntegration = new GitHubIntegration(currentDir, config);
        await githubIntegration.initialize();
      }
      
      spinner.succeed('LCAgents initialized successfully!');
      
      console.log();
      console.log(chalk.green('🎉 Setup Complete!'));
      console.log();
      console.log('Next steps:');
      console.log(chalk.cyan('  1. Explore available agents:'), 'ls .lcagents/agents/');
      console.log(chalk.cyan('  2. Validate installation:'), 'npx lcagents validate');
      console.log(chalk.cyan('  3. Generate documentation:'), 'npx lcagents docs');
      console.log();
      console.log(chalk.dim('For help: npx lcagents --help'));
      
    } catch (error) {
      spinner.fail('Failed to initialize LCAgents');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });
