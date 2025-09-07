import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

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
      
      // Ensure .lcagents directory exists
      await fs.ensureDir(lcagentsDir);
      
      spinner.text = 'Copying BMAD-Core resources...';
      
      // Copy BMAD-Core resources from package directly to .lcagents folder
      const resourcesPath = path.join(__dirname, '../../resources');
      console.log('DEBUG: Looking for resources at:', resourcesPath);
      
      if (await fs.pathExists(resourcesPath)) {
        console.log('DEBUG: Resources found, copying to .lcagents...');
        
        // Copy all resources directly to .lcagents directory
        await fs.copy(resourcesPath, lcagentsDir);
        console.log('DEBUG: All resources copied to .lcagents');
      } else {
        console.log('DEBUG: Resources not found at:', resourcesPath);
        // Fallback: try alternative paths
        const alternativePath = path.join(__dirname, '../../../resources');
        console.log('DEBUG: Trying alternative path:', alternativePath);
        if (await fs.pathExists(alternativePath)) {
          await fs.copy(alternativePath, lcagentsDir);
          console.log('DEBUG: Copied from alternative path');
        }
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
      console.log(chalk.cyan('  3. View all resources:'), 'ls .lcagents/');
      console.log();
      console.log(chalk.dim('For help: lcagents --help'));
      
    } catch (error) {
      spinner.fail('Failed to initialize LCAgents');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });
