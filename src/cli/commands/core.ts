import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import { LayerManager } from '../../core/LayerManager';
import { RuntimeConfigManager } from '../../core/RuntimeConfigManager';

export const coreCommand = new Command('core')
  .description('Manage core agent systems');

// List available and installed core systems
coreCommand
  .command('list')
  .description('List available and installed core systems')
  .option('-a, --available', 'Show only available core systems')
  .option('-i, --installed', 'Show only installed core systems')
  .action(async (options) => {
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());

      console.log(chalk.cyan('🔧 Core Agent Systems'));
      console.log();

      if (!options.installed) {
        console.log(chalk.white('📦 Available Core Systems:'));
        const availableSystems = await coreSystemManager.getAvailableCoreSystems();
        
        if (availableSystems.length === 0) {
          console.log(chalk.dim('  No core systems available'));
        } else {
          availableSystems.forEach(system => {
            const isDefault = system.isDefault ? chalk.green(' (Default)') : '';
            let warningText = '';
            if (system.name === 'enterprise-core') {
              warningText = chalk.red(' [NOT READY]');
            } else if (system.name === 'minimal-core') {
              warningText = chalk.red(' [DEV MODE]');
            }
            
            console.log(chalk.white(`  • ${chalk.bold(system.name)} v${system.version}${isDefault}${warningText}`));
            console.log(chalk.dim(`    ${system.description}`));
            console.log(chalk.dim(`    ${system.agentCount} agents | ${system.installation.estimatedTime} | ${system.installation.diskSpace}`));
            console.log();
          });
        }
      }

      if (!options.available) {
        console.log(chalk.white('💾 Installed Core Systems:'));
        const installedSystems = await coreSystemManager.getInstalledCoreSystems();
        const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
        
        if (installedSystems.length === 0) {
          console.log(chalk.dim('  No core systems installed'));
        } else {
          installedSystems.forEach(system => {
            const isActive = system.name === activeCoreSystem ? chalk.green(' (Active)') : '';
            console.log(chalk.white(`  • ${chalk.bold(system.name)} v${system.version}${isActive}`));
            console.log(chalk.dim(`    ${system.description}`));
            console.log(chalk.dim(`    Installed: ${new Date(system.installDate).toLocaleDateString()}`));
            console.log();
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('Error listing core systems:'), error);
      process.exit(1);
    }
  });

// Install a core system
coreCommand
  .command('install <name>')
  .description('Install a new core system')
  .option('-f, --force', 'Overwrite if already installed')
  .action(async (name, options) => {
    const spinner = ora(`Installing core system: ${name}...`).start();
    
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());
      const layerManager = new LayerManager(process.cwd());

      const result = await coreSystemManager.installCoreSystem(name, options.force);
      
      if (!result.success) {
        spinner.fail(`Failed to install ${name}`);
        console.error(chalk.red('Error:'), result.error);
        process.exit(1);
      }

      // Create layered structure for new core system
      await layerManager.createLayeredStructure();

      spinner.succeed(`Successfully installed ${name} v${result.version}`);
      
      console.log();
      console.log(chalk.green(`✅ Core system ${chalk.bold(name)} installed successfully!`));
      console.log(chalk.dim(`   Location: ${result.installPath}`));
      console.log(chalk.dim(`   Agents: ${result.agentCount}`));
      console.log();
      console.log(chalk.cyan('To switch to this core system, run:'));
      console.log(chalk.white(`   lcagents core switch ${name}`));
      
    } catch (error) {
      spinner.fail(`Failed to install ${name}`);
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Switch active core system
coreCommand
  .command('switch <name>')
  .description('Switch to a different core system')
  .option('-r, --reason <reason>', 'Reason for switching (for audit log)')
  .action(async (name, options) => {
    const spinner = ora(`Switching to core system: ${name}...`).start();
    
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());
      const layerManager = new LayerManager(process.cwd());

      const result = await coreSystemManager.switchCoreSystem(name, options.reason);
      
      if (!result.success) {
        spinner.fail(`Failed to switch to ${name}`);
        console.error(chalk.red('Error:'), result.error);
        if (result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow('Warnings:'));
          result.warnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning}`));
          });
        }
        process.exit(1);
      }

      // Update backward compatibility resolution
      await layerManager.createVirtualResolutionSystem(name);

      spinner.succeed(`Successfully switched to ${name}`);
      
      console.log();
      console.log(chalk.green(`✅ Now using core system: ${chalk.bold(name)}`));
      if (result.fromCore) {
        console.log(chalk.dim(`   Switched from: ${result.fromCore}`));
      }
      if (result.backupPath) {
        console.log(chalk.dim(`   Backup created at: ${result.backupPath}`));
      }
      console.log();
      console.log(chalk.cyan('Your agents and resources have been updated to use the new core system.'));
      
    } catch (error) {
      spinner.fail(`Failed to switch to ${name}`);
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Show current status
coreCommand
  .command('status')
  .description('Show active core system information')
  .action(async () => {
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());

      const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
      const installedSystems = await coreSystemManager.getInstalledCoreSystems();
      
      console.log(chalk.cyan('🔧 Core System Status'));
      console.log();

      if (!activeCoreSystem) {
        console.log(chalk.yellow('⚠️  No active core system configured'));
        console.log(chalk.dim('   Run "lcagents init" to set up a core system'));
        return;
      }

      const activeSystemInfo = installedSystems.find(s => s.name === activeCoreSystem);
      
      console.log(chalk.white('📍 Active Core System:'));
      console.log(chalk.green(`   ${chalk.bold(activeCoreSystem)}`));
      
      if (activeSystemInfo) {
        console.log(chalk.dim(`   Version: ${activeSystemInfo.version}`));
        console.log(chalk.dim(`   Description: ${activeSystemInfo.description}`));
        console.log(chalk.dim(`   Agents: ${activeSystemInfo.agentCount}`));
        console.log(chalk.dim(`   Installed: ${new Date(activeSystemInfo.installDate).toLocaleDateString()}`));
        console.log(chalk.dim(`   Location: ${activeSystemInfo.installPath}`));
      }

      console.log();
      console.log(chalk.white(`📊 Total Installed Systems: ${installedSystems.length}`));
      
      if (installedSystems.length > 1) {
        console.log(chalk.dim('   Available systems:'));
        installedSystems
          .filter(s => s.name !== activeCoreSystem)
          .forEach(system => {
            console.log(chalk.dim(`   • ${system.name} v${system.version}`));
          });
      }
      
    } catch (error) {
      console.error(chalk.red('Error getting core system status:'), error);
      process.exit(1);
    }
  });

// Validate core system switch
coreCommand
  .command('validate-switch <name>')
  .description('Check compatibility before switching core systems')
  .action(async (name) => {
    const spinner = ora(`Validating switch to: ${name}...`).start();
    
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());

      // Check if target system is installed
      const installedSystems = await coreSystemManager.getInstalledCoreSystems();
      const targetSystem = installedSystems.find(s => s.name === name);
      
      if (!targetSystem) {
        spinner.fail(`Core system ${name} is not installed`);
        console.log(chalk.yellow('💡 To install this core system, run:'));
        console.log(chalk.white(`   lcagents core install ${name}`));
        process.exit(1);
      }

      // Validate the core system structure
      const validation = await coreSystemManager.validateCoreSystemStructure(targetSystem.installPath);
      
      spinner.stop();

      console.log();
      console.log(chalk.cyan(`🔍 Validation Results for ${chalk.bold(name)}:`));
      console.log();

      if (validation.isValid) {
        console.log(chalk.green('✅ Core system is valid and ready for use'));
      } else {
        console.log(chalk.red('❌ Core system has issues:'));
        validation.errors.forEach(error => {
          console.log(chalk.red(`   • ${error}`));
        });
      }

      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning}`));
        });
      }

      console.log();
      if (validation.isValid) {
        console.log(chalk.cyan('Ready to switch! Run:'));
        console.log(chalk.white(`   lcagents core switch ${name}`));
      } else {
        console.log(chalk.red('Cannot switch due to validation errors above.'));
      }
      
    } catch (error) {
      spinner.fail(`Failed to validate ${name}`);
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Show comprehensive core system status
coreCommand
  .command('details')
  .description('Show detailed core system status and configuration')
  .action(async () => {
    try {
      const coreSystemManager = new CoreSystemManager(process.cwd());
      const runtimeConfigManager = new RuntimeConfigManager(process.cwd());

      console.log(chalk.cyan('🔧 Core System Status'));
      console.log();

      // Show active core system
      const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
      if (activeCoreSystem) {
        console.log(chalk.white('📍 Active Core System:'));
        console.log(chalk.green(`   ${chalk.bold(activeCoreSystem)}`));
        
        // Show installation details
        const installedSystems = await coreSystemManager.getInstalledCoreSystems();
        const activeSystem = installedSystems.find(s => s.name === activeCoreSystem);
        
        if (activeSystem) {
          console.log(chalk.dim(`   Version: ${activeSystem.version}`));
          console.log(chalk.dim(`   Installed: ${new Date(activeSystem.installDate).toLocaleDateString()}`));
          console.log(chalk.dim(`   Agents: ${activeSystem.agentCount}`));
          console.log(chalk.dim(`   Location: .lcagents/core/.${activeSystem.name}`));
        }
      } else {
        console.log(chalk.red('❌ No active core system'));
      }

      console.log();

      // Show runtime configuration
      console.log(chalk.white('⚙️  Runtime Configuration:'));
      try {
        const runtimeConfig = await runtimeConfigManager.getRuntimeConfig();
        console.log(chalk.green(`   Active: ${runtimeConfig.coreSystem.active}`));
        console.log(chalk.dim(`   Fallback: ${runtimeConfig.coreSystem.fallback}`));
        console.log(chalk.dim(`   QA Location: ${runtimeConfig.paths.qa}`));
        console.log(chalk.dim(`   PRD Location: ${runtimeConfig.paths.prd}`));
        console.log(chalk.dim(`   GitHub Integration: ${runtimeConfig.github.integration ? 'Enabled' : 'Disabled'}`));
        console.log(chalk.dim(`   Config File: .lcagents/runtime/config.yaml`));
        console.log(chalk.dim(`   Last Updated: ${new Date(runtimeConfig.lastUpdated).toLocaleString()}`));
      } catch (error) {
        console.log(chalk.red(`   ❌ Failed to load runtime config: ${error}`));
      }

      console.log();

      // Show all installed systems
      console.log(chalk.white('💾 All Installed Systems:'));
      const installedSystems = await coreSystemManager.getInstalledCoreSystems();
      
      if (installedSystems.length === 0) {
        console.log(chalk.dim('   No core systems installed'));
      } else {
        installedSystems.forEach(system => {
          const isActive = system.name === activeCoreSystem ? chalk.green(' (Active)') : '';
          console.log(chalk.white(`   • ${chalk.bold(system.name)} v${system.version}${isActive}`));
          console.log(chalk.dim(`     ${system.description}`));
          console.log(chalk.dim(`     ${system.agentCount} agents | Installed: ${new Date(system.installDate).toLocaleDateString()}`));
        });
      }

      console.log();
      console.log(chalk.cyan('💡 Commands:'));
      console.log(chalk.white('   lcagents core list        - List all systems'));
      console.log(chalk.white('   lcagents core switch <name> - Switch active system'));
      console.log(chalk.white('   lcagents resource list agents - View available agents'));

    } catch (error) {
      console.error(chalk.red('❌ Failed to get core system status:'), error);
      process.exit(1);
    }
  });

// Future: Upgrade core system (placeholder)
coreCommand
  .command('upgrade <name>')
  .description('Upgrade a core system to the latest version')
  .action(async (name) => {
    console.log(chalk.yellow(`⚠️  Core system upgrade feature is not yet implemented`));
    console.log(chalk.dim(`   This will upgrade ${name} to the latest version while preserving customizations`));
    console.log();
    console.log(chalk.cyan('Coming in a future release!'));
  });
