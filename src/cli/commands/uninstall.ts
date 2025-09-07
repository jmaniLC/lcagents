import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export const uninstallCommand = new Command('uninstall')
  .description('Remove LCAgents from the current directory')
  .option('-f, --force', 'Force removal without confirmation')
  .option('--keep-config', 'Keep configuration files')
  .action(async (options) => {
    const currentDir = process.cwd();
    const lcagentsDir = path.join(currentDir, '.lcagents');
    
    // Check if LCAgents is installed
    if (!await fs.pathExists(lcagentsDir)) {
      console.log(chalk.yellow('LCAgents is not installed in this directory'));
      return;
    }
    
    let confirmed = options.force;
    
    if (!confirmed) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to remove LCAgents from this directory?',
          default: false
        }
      ]);
      confirmed = answer.confirm;
    }
    
    if (!confirmed) {
      console.log(chalk.gray('Uninstall cancelled'));
      return;
    }
    
    const spinner = ora('Removing LCAgents...').start();
    
    try {
      if (options.keepConfig) {
        spinner.text = 'Removing LCAgents (keeping config)...';
        
        // Remove everything except config files
        const items = await fs.readdir(lcagentsDir);
        for (const item of items) {
          if (item !== 'config.yaml' && item !== 'user-settings.yaml') {
            await fs.remove(path.join(lcagentsDir, item));
          }
        }
      } else {
        spinner.text = 'Removing LCAgents completely...';
        await fs.remove(lcagentsDir);
      }
      
      // Also remove GitHub workflow files if they exist
      const githubWorkflowsDir = path.join(currentDir, '.github', 'workflows');
      if (await fs.pathExists(githubWorkflowsDir)) {
        const lcagentsWorkflows = [
          'lcagents-validation.yml',
          'lcagents-docs.yml'
        ];
        
        for (const workflow of lcagentsWorkflows) {
          const workflowPath = path.join(githubWorkflowsDir, workflow);
          if (await fs.pathExists(workflowPath)) {
            await fs.remove(workflowPath);
          }
        }
      }
      
      // Remove GitHub templates created by LCAgents
      const githubTemplatesDir = path.join(currentDir, '.github', 'ISSUE_TEMPLATE');
      if (await fs.pathExists(githubTemplatesDir)) {
        const lcagentsTemplates = [
          'agent-request.md',
          'bug-report.md'
        ];
        
        for (const template of lcagentsTemplates) {
          const templatePath = path.join(githubTemplatesDir, template);
          if (await fs.pathExists(templatePath)) {
            await fs.remove(templatePath);
          }
        }
      }
      
      spinner.succeed('LCAgents removed successfully!');
      
      console.log();
      if (options.keepConfig) {
        console.log(chalk.green('✅ LCAgents removed (configuration preserved)'));
        console.log(chalk.dim('Configuration files kept in .lcagents/'));
      } else {
        console.log(chalk.green('✅ LCAgents completely removed'));
      }
      console.log();
      console.log(chalk.dim('To reinstall: npx @lendingclub/lcagents init'));
      
    } catch (error) {
      spinner.fail('Failed to remove LCAgents');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });
