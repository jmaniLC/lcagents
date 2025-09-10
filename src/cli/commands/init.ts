import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import { LayerManager } from '../../core/LayerManager';
import { RuntimeConfigManager } from '../../core/RuntimeConfigManager';
import { InstallationOptions, InstallationResult } from '../../types/CoreSystem';

/**
 * Setup shell alias for lcagent command
 */
async function setupShellAlias(): Promise<{ success: boolean; message: string; instructions?: string }> {
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
        message: 'Unsupported shell detected',
        instructions: 'Manually add: alias lcagent="npx git+https://github.com/jmaniLC/lcagents.git"'
      };
    }

    const aliasCommand1 = 'alias lcagent="npx git+https://github.com/jmaniLC/lcagents.git"';
    const aliasCommand2 = 'alias lcagents="npx git+https://github.com/jmaniLC/lcagents.git"';
    const aliasComment = '# LCAgents aliases for easy access';
    
    // Check if alias already exists
    if (await fs.pathExists(configFile)) {
      const content = await fs.readFile(configFile, 'utf-8');
      if (content.includes('alias lcagent=') && content.includes('alias lcagents=')) {
        return {
          success: true,
          message: 'Aliases already exist in shell configuration'
        };
      }
    }
    
    // Add aliases to shell config
    const aliasEntry = `\n${aliasComment}\n${aliasCommand1}\n${aliasCommand2}\n`;
    await fs.ensureFile(configFile);
    await fs.appendFile(configFile, aliasEntry);
    
    // Attempt to source the config file to make aliases immediately available
    // Note: This will work in some environments but not others due to process isolation
    try {
      const execAsync = promisify(exec);
      
      // Try to source the config file
      await execAsync(`source ${configFile}`, { shell: '/bin/zsh' });
      
      // The source command succeeded, but it only affects the child process
      // The aliases won't be available in the current terminal session
      return {
        success: true,
        message: `Aliases added to ${shellName} configuration`,
        instructions: `Run 'source ${path.basename(configFile)}' or restart your terminal to use 'lcagent' and 'lcagents' commands`
      };
    } catch (sourceError) {
      // Sourcing failed, but aliases were still added
      return {
        success: true,
        message: `Aliases added to ${shellName} configuration`,
        instructions: `Run 'source ${path.basename(configFile)}' or restart your terminal to use 'lcagent' and 'lcagents' commands`
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to setup shell alias',
      instructions: 'Manually add: alias lcagent="npx git+https://github.com/jmaniLC/lcagents.git"'
    };
  }
}

export const initCommand = new Command('init')
  .description('Initialize LCAgents in the current directory')
  .option('-f, --force', 'Overwrite existing installation')
  .option('--no-github', 'Skip GitHub integration setup')
  .option('--template <name>', 'Use specific project template')
  .option('--no-interactive', 'Skip interactive prompts')
  .option('--core-system <name>', 'Specify core system to install (default: bmad-core)')
  .action(async (options) => {
    // Show version info during install
    const packageJson = require('../../../package.json');
    console.log(chalk.cyan('🔧 LCAgents Installer'));
    console.log(chalk.gray(`github:jmaniLC/lcagents ver${packageJson.version}`));
    console.log();
    
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

      spinner.stop();

      // Initialize managers
      const coreSystemManager = new CoreSystemManager(currentDir);
      const layerManager = new LayerManager(currentDir);
      const runtimeConfigManager = new RuntimeConfigManager(currentDir);

      let selectedCoreSystem = options.coreSystem;

      // Interactive core system selection if not specified
      if (!selectedCoreSystem && options.interactive !== false) {
        const availableSystems = await coreSystemManager.getAvailableCoreSystems();
        
        if (availableSystems.length === 0) {
          console.log(chalk.red('No core systems available in registry'));
          process.exit(1);
        }

        console.log();
        console.log(chalk.cyan('🔧 Core Agent System Selection'));
        console.log(chalk.dim('Choose the core agent system that best fits your team and project needs:'));
        console.log();

        // Display available systems
        availableSystems.forEach((system, index) => {
          console.log(chalk.white(`${index + 1}. ${chalk.bold(system.name)} (v${system.version})`));
          console.log(chalk.dim(`   ${system.description}`));
          console.log(chalk.dim(`   ${system.agentCount} agents | ${system.installation.estimatedTime} | ${system.installation.diskSpace}`));
          if (system.isDefault) {
            console.log(chalk.green('   ✅ Recommended for most teams'));
          }
          // Add development warnings for non-ready systems
          if (system.name === 'enterprise-core' || system.name === 'minimal-core') {
            console.log(chalk.red('   ⚠️  [DEV MODE] - Not ready for production use'));
          }
          console.log();
        });

        const { coreSystemChoice } = await inquirer.prompt([
          {
            type: 'list',
            name: 'coreSystemChoice',
            message: 'Select a core agent system:',
            choices: availableSystems.map((system) => {
              let warningText = '';
              if (system.name === 'enterprise-core') {
                warningText = chalk.red(' [NOT READY]');
              } else if (system.name === 'minimal-core') {
                warningText = chalk.red(' [DEV MODE]');
              }
              
              return {
                name: `${system.name} - ${system.description}${system.isDefault ? ' (Recommended)' : ''}${warningText}`,
                value: system.name,
                short: system.name
              };
            }),
            default: availableSystems.find(s => s.isDefault)?.name || availableSystems[0]?.name
          }
        ]);

        selectedCoreSystem = coreSystemChoice;

        // Show selected system details
        const selectedSystemInfo = availableSystems.find(s => s.name === selectedCoreSystem);
        if (selectedSystemInfo) {
          console.log();
          console.log(chalk.green(`✅ Selected: ${chalk.bold(selectedSystemInfo.name)}`));
          console.log(chalk.dim(`Description: ${selectedSystemInfo.description}`));
          console.log(chalk.dim(`Features: ${selectedSystemInfo.features.join(', ')}`));
          console.log();
        }
      }

      // Use default if still not selected
      if (!selectedCoreSystem) {
        selectedCoreSystem = await coreSystemManager.getDefaultCoreSystem();
      }

      const installationOptions: InstallationOptions = {
        force: options.force,
        coreSystem: selectedCoreSystem,
        interactive: options.interactive,
        skipGithub: !options.github,
        template: options.template
      };

      const result = await performLayeredInstallation(
        currentDir,
        installationOptions,
        coreSystemManager,
        layerManager,
        runtimeConfigManager
      );

      if (!result.success) {
        console.log(chalk.red('❌ Installation failed:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('🎉 LCAgents initialized successfully!'));
      console.log();
      
      // Setup shell alias
      const aliasResult = await setupShellAlias();
      if (aliasResult.success) {
        console.log(chalk.green('🔧 Shell Alias Setup:'));
        console.log(chalk.white(`   ✅ ${aliasResult.message}`));
        if (aliasResult.instructions) {
          console.log(chalk.dim(`   💡 ${aliasResult.instructions}`));
        }
        console.log(chalk.white('   Available commands:'), chalk.cyan('lcagent <command>'), chalk.dim('or'), chalk.cyan('lcagents <command>'));
        console.log();
      } else {
        console.log(chalk.yellow('⚠️  Shell Alias Setup:'));
        console.log(chalk.white(`   ⚠️  ${aliasResult.message}`));
        if (aliasResult.instructions) {
          console.log(chalk.dim(`   💡 ${aliasResult.instructions}`));
        }
        console.log();
      }
      
      console.log(chalk.cyan('📁 Layered Architecture Created:'));
      console.log(chalk.white(`  Core System: ${result.coreSystem} at ${path.relative(currentDir, result.installedPath)}`));
      result.layersCreated.forEach(layer => {
        console.log(chalk.dim(`  ${layer} layer ready for customization`));
      });
      console.log();
      console.log(chalk.cyan('🔧 Next Steps:'));
      console.log(chalk.white('  1. Explore available agents:'), chalk.dim('ls .lcagents/agents/'));
      console.log(chalk.white('  2. View core system resources:'), chalk.dim(`ls .lcagents/core/${result.coreSystem}/`));
      console.log(chalk.white('  3. Customize agents:'), chalk.dim('edit .lcagents/custom/agents/overrides/'));
      console.log(chalk.white('  4. Configure your pod:'), chalk.dim('edit .lcagents/custom/config/pod-config.yaml'));
      console.log();
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings:'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
        console.log();
      }
      console.log(chalk.dim('For help: lcagents --help or lcagent --help'));
      
    } catch (error) {
      console.log(chalk.red('❌ Failed to initialize LCAgents'));
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * Perform layered installation with the new architecture
 */
async function performLayeredInstallation(
  basePath: string,
  options: InstallationOptions,
  coreSystemManager: CoreSystemManager,
  layerManager: LayerManager,
  runtimeConfigManager: RuntimeConfigManager
): Promise<InstallationResult> {
  const spinner = ora('Installing core agent system...').start();
  
  try {
    const lcagentsDir = path.join(basePath, '.lcagents');
    const coreSystemName = options.coreSystem || 'bmad-core';

    // Step 1: Clean existing installation if force
    if (options.force && await fs.pathExists(lcagentsDir)) {
      spinner.text = 'Cleaning existing installation...';
      await fs.remove(lcagentsDir);
    }

    // Step 2: Check for existing flat installation and migrate
    const hasExistingFlat = await checkForFlatInstallation(lcagentsDir);
    if (hasExistingFlat) {
      spinner.text = 'Migrating from flat structure to layered architecture...';
      await layerManager.migrateFromFlatStructure(coreSystemName);
    } else {
      // Step 3: Install selected core system
      spinner.text = `Installing ${coreSystemName} core system...`;
      const installResult = await coreSystemManager.installCoreSystem(coreSystemName, options.force);
      
      if (!installResult.success) {
        throw new Error(installResult.error);
      }

      // Step 4: Create layered directory structure
      spinner.text = 'Creating layered architecture...';
      await layerManager.createLayeredStructure();

      // Step 5: Set active core system (before virtual resolution setup)
      spinner.text = 'Configuring core system...';
      await coreSystemManager.switchCoreSystem(coreSystemName, 'Initial installation');

      // Step 6: Create backward compatibility resolution (after active core is set)
      spinner.text = 'Setting up backward compatibility...';
      await layerManager.createVirtualResolutionSystem(coreSystemName);
    }

    // Step 7: Initialize configuration
    spinner.text = 'Initializing configuration...';
    // Initialize runtime configuration with GitHub settings
    await runtimeConfigManager.updateRuntimeConfig({
      github: {
        integration: !options.skipGithub,
        copilotFeatures: !options.skipGithub,
        repository: "",
        branch: 'main'
      },
      coreSystem: {
        active: coreSystemName,
        fallback: coreSystemName
      }
    });

    spinner.succeed('Installation completed successfully!');

    return {
      success: true,
      coreSystem: coreSystemName,
      installedPath: path.join(lcagentsDir, 'core', `.${coreSystemName}`),
      layersCreated: ['Core', 'Organization', 'Pod Custom', 'Runtime'],
      configurationPath: path.join(lcagentsDir, 'runtime', 'config.yaml'),
      warnings: []
    };

  } catch (error) {
    spinner.fail('Installation failed');
    return {
      success: false,
      coreSystem: options.coreSystem || 'bmad-core',
      installedPath: '',
      layersCreated: [],
      configurationPath: '',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if there's an existing flat installation
 */
async function checkForFlatInstallation(lcagentsDir: string): Promise<boolean> {
  if (!await fs.pathExists(lcagentsDir)) {
    return false;
  }

  // Check if it's already layered (has core directory)
  const coreDir = path.join(lcagentsDir, 'core');
  if (await fs.pathExists(coreDir)) {
    return false; // Already layered
  }

  // Check if it has flat structure (agents directory directly in .lcagents)
  const agentsDir = path.join(lcagentsDir, 'agents');
  return await fs.pathExists(agentsDir);
}
