import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

/**
 * Remove shell alias for lcagent command
 */
async function removeShellAlias(): Promise<{ success: boolean; message: string; instructions?: string; needsManualUnalias?: boolean; shellName?: string }> {
  try {
    const homeDir = os.homedir();
    const shell = process.env['SHELL'] || '';
    
    // Determine which shell config file to use
    let configFile = '';
    let shellName = '';
    
    if (shell.includes('zsh')) {
      configFile = path.join(homeDir, '.zshrc');
      shellName = 'zsh';
    } else if (shell.includes('bash')) {
      // Check for .bash_profile first, then .bashrc
      const bashProfile = path.join(homeDir, '.bash_profile');
      const bashrc = path.join(homeDir, '.bashrc');
      
      if (await fs.pathExists(bashProfile)) {
        configFile = bashProfile;
      } else {
        configFile = bashrc;
      }
      shellName = 'bash';
    } else {
      return {
        success: false,
        message: 'Unsupported shell detected - manually remove lcagent and lcagents aliases',
        needsManualUnalias: false
      };
    }
    
    // Check if config file exists and has the alias
    if (!await fs.pathExists(configFile)) {
      return {
        success: true,
        message: 'No shell configuration file found',
        needsManualUnalias: false
      };
    }
    
    const content = await fs.readFile(configFile, 'utf-8');
    if (!content.includes('alias lcagent=') && !content.includes('alias lcagents=')) {
      return {
        success: true,
        message: 'No lcagent/lcagents aliases found in shell configuration',
        needsManualUnalias: false
      };
    }
    
    // Remove the aliases and comment
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => 
      !line.includes('alias lcagent=') && 
      !line.includes('alias lcagents=') &&
      !line.includes('# LCAgents alias') // Updated to match both old and new comments
    );
    
    await fs.writeFile(configFile, filteredLines.join('\n'));
    
    return {
      success: true,
      message: `Aliases removed from ${shellName} configuration`,
      needsManualUnalias: true,
      shellName: shellName
    };
    
  } catch (error) {
    return {
        success: false,
        message: 'Failed to remove shell aliases - manually remove lcagent and lcagents aliases',
        needsManualUnalias: false
      };
  }
}

export const uninstallCommand = new Command('uninstall')
  .description('Remove LCAgents from the current directory')
  .option('-f, --force', 'Force removal without confirmation')
  .option('--keep-config', 'Keep configuration files')
  .addHelpText('after', `
Note: To avoid npx install prompts, use the standalone uninstaller:
curl -fsSL https://raw.githubusercontent.com/jmaniLC/lcagents/main/uninstall.js | node -- --force
  `)
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
      
      // Remove shell alias
      const aliasResult = await removeShellAlias();
      
      spinner.succeed('LCAgents removed successfully!');
      
      console.log();
      if (options.keepConfig) {
        console.log(chalk.green('✅ LCAgents removed (configuration preserved)'));
        console.log(chalk.dim('Configuration files kept in .lcagents/'));
      } else {
        console.log(chalk.green('✅ LCAgents completely removed'));
      }
      
      // Show alias removal result
      console.log(chalk.cyan('🔧 Shell Alias Cleanup:'));
      if (aliasResult.success) {
        console.log(chalk.white(`   ✅ ${aliasResult.message}`));
        
        // Always create automated unalias script for successful removals
        console.log(chalk.dim('   🔧 Creating automated unalias script...'));
        try {
          const tempScript = path.join(os.tmpdir(), 'lcagents-unalias.sh');
          const unaliasScript = `#!/bin/bash
# Temporary script to remove LCAgents aliases from current session
unalias lcagent 2>/dev/null || true
unalias lcagents 2>/dev/null || true
echo "✅ LCAgents aliases removed from current session"
# Clean up this temporary script
rm -f "${tempScript}"
`;
          
          await fs.writeFile(tempScript, unaliasScript, { mode: 0o755 });
          console.log(chalk.dim(`   ✅ Script created at: ${tempScript}`));
          
          console.log(chalk.yellow('   🔧 To remove aliases from current session, run:'));
          console.log(chalk.cyan(`   source ${tempScript}`));
        } catch (error) {
          console.log(chalk.red(`   ❌ Failed to create script: ${error}`));
          console.log(chalk.dim(`   💡 Run "unalias lcagent lcagents" or restart terminal to remove from current session`));
        }
        
        if (aliasResult.instructions) {
          console.log(chalk.dim(`   💡 ${aliasResult.instructions}`));
        }
      } else {
        console.log(chalk.yellow(`   ⚠️  ${aliasResult.message}`));
      }
      
      console.log();
      console.log(chalk.dim('To reinstall: npx git+https://github.com/jmaniLC/lcagents.git init'));
      
      // Always provide automated unalias solution
      if (aliasResult.success) {
        console.log();
        console.log(chalk.cyan('🔧 Automated Alias Removal:'));
        console.log(chalk.white('   Copy and paste this command to remove aliases from current session:'));
        console.log(chalk.yellow('   unalias lcagent lcagents 2>/dev/null && echo "✅ Aliases removed from current session"'));
      }
      
    } catch (error) {
      spinner.fail('Failed to remove LCAgents');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });
