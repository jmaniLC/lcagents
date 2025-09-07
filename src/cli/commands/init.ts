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
      
      // Copy BMAD-Core resources from package
      const resourcesPath = path.join(__dirname, '../../resources');
      console.log('DEBUG: Looking for resources at:', resourcesPath);
      
      if (await fs.pathExists(resourcesPath)) {
        console.log('DEBUG: Resources found, copying...');
        
        // Copy agents
        const agentsSource = path.join(resourcesPath, 'agents');
        const agentsTarget = path.join(lcagentsDir, 'agents');
        if (await fs.pathExists(agentsSource)) {
          await fs.copy(agentsSource, agentsTarget);
          console.log('DEBUG: Copied agents');
        }
        
        // Copy tasks  
        const tasksSource = path.join(resourcesPath, 'tasks');
        const tasksTarget = path.join(lcagentsDir, 'tasks');
        if (await fs.pathExists(tasksSource)) {
          await fs.copy(tasksSource, tasksTarget);
          console.log('DEBUG: Copied tasks');
        }
        
        // Copy templates
        const templatesSource = path.join(resourcesPath, 'templates');
        const templatesTarget = path.join(lcagentsDir, 'templates');
        if (await fs.pathExists(templatesSource)) {
          await fs.copy(templatesSource, templatesTarget);
          console.log('DEBUG: Copied templates');
        }
        
        // Copy checklists
        const checklistsSource = path.join(resourcesPath, 'checklists');
        const checklistsTarget = path.join(lcagentsDir, 'checklists');
        if (await fs.pathExists(checklistsSource)) {
          await fs.copy(checklistsSource, checklistsTarget);
          console.log('DEBUG: Copied checklists');
        }
        
        // Copy agent-teams
        const teamsSource = path.join(resourcesPath, 'agent-teams');
        const teamsTarget = path.join(lcagentsDir, 'agent-teams');
        if (await fs.pathExists(teamsSource)) {
          await fs.copy(teamsSource, teamsTarget);
          console.log('DEBUG: Copied agent-teams');
        }
        
        // Copy data
        const dataSource = path.join(resourcesPath, 'data');
        const dataTarget = path.join(lcagentsDir, 'data');
        if (await fs.pathExists(dataSource)) {
          await fs.copy(dataSource, dataTarget);
          console.log('DEBUG: Copied data');
        }
        
        // Copy workflows
        const workflowsSource = path.join(resourcesPath, 'workflows');
        const workflowsTarget = path.join(lcagentsDir, 'workflows');
        if (await fs.pathExists(workflowsSource)) {
          await fs.copy(workflowsSource, workflowsTarget);
          console.log('DEBUG: Copied workflows');
        }
        
        // Copy utils
        const utilsSource = path.join(resourcesPath, 'utils');
        const utilsTarget = path.join(lcagentsDir, 'utils');
        if (await fs.pathExists(utilsSource)) {
          await fs.copy(utilsSource, utilsTarget);
          console.log('DEBUG: Copied utils');
        }
        
        console.log('DEBUG: Resources copied successfully');
      } else {
        console.log('DEBUG: Resources not found at:', resourcesPath);
        // Fallback: try alternative paths
        const alternativePath = path.join(__dirname, '../../../resources');
        console.log('DEBUG: Trying alternative path:', alternativePath);
        if (await fs.pathExists(alternativePath)) {
          await fs.copy(alternativePath, path.join(lcagentsDir, 'bmad-core'));
          console.log('DEBUG: Copied from alternative path');
        }
      }
      
      spinner.text = 'Setting up configuration...';
      
      // Initialize configuration
      console.log('DEBUG: Starting configuration setup...');
      const configManager = new ConfigManager(currentDir);
      console.log('DEBUG: ConfigManager created');
      
      let githubEnabled = options.github !== false;
      let repository = '';
      
      console.log('DEBUG: Interactive check - options.interactive:', options.interactive);
      console.log('DEBUG: GitHub enabled:', githubEnabled);
      console.log('DEBUG: TTY available:', process.stdin.isTTY);
      console.log('DEBUG: Environment:', process.env['npm_execpath'] ? 'NPX' : 'Local');
      
      // Force non-interactive mode in NPX environments unless explicitly requested with --interactive
      const isNPXEnvironment = !!(process.env['npm_execpath'] || process.env['npm_command']);
      const explicitlyInteractive = process.argv.includes('--interactive');
      const explicitlyNonInteractive = process.argv.includes('--no-interactive');
      
      let shouldRunInteractive = false;
      
      if (explicitlyNonInteractive) {
        shouldRunInteractive = false;
      } else if (explicitlyInteractive) {
        shouldRunInteractive = true;
      } else if (isNPXEnvironment) {
        // Default to non-interactive in NPX environments
        shouldRunInteractive = false;
      } else {
        // Local environment - default to interactive if TTY available
        shouldRunInteractive = process.stdin.isTTY;
      }
      
      console.log('DEBUG: Is NPX environment:', isNPXEnvironment);
      console.log('DEBUG: Explicitly interactive:', explicitlyInteractive);
      console.log('DEBUG: Explicitly non-interactive:', explicitlyNonInteractive);
      console.log('DEBUG: Should run interactive:', shouldRunInteractive);
      
      if (shouldRunInteractive) {
        console.log('DEBUG: Running interactive prompts...');
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
        console.log('DEBUG: Interactive setup completed');
      } else {
        console.log('DEBUG: Skipping interactive prompts (non-interactive mode or no TTY)');
      }
      
      console.log('DEBUG: About to initialize config with:', { enableGithub: githubEnabled, repository });
      
      await configManager.initializeConfig({
        enableGithub: githubEnabled,
        enableCopilot: githubEnabled,
        repository
      });
      
      console.log('DEBUG: Config initialization completed');
      
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
      console.log(chalk.cyan('  1. Set up alias for easy access:'));
      console.log(chalk.white("     alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'"));
      console.log(chalk.dim('     (Add this to your ~/.bashrc or ~/.zshrc)'));
      console.log(chalk.cyan('  2. Explore available agents:'), 'ls .lcagents/agents/');
      console.log(chalk.cyan('  3. Validate installation:'), 'lcagents validate');
      console.log(chalk.cyan('  4. Generate documentation:'), 'lcagents docs');
      console.log();
      console.log(chalk.dim('For help: lcagents --help'));
      
    } catch (error) {
      spinner.fail('Failed to initialize LCAgents');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });
