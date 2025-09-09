"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const CoreSystemManager_1 = require("../../core/CoreSystemManager");
const LayerManager_1 = require("../../core/LayerManager");
const ConfigManager_1 = require("../../core/ConfigManager");
exports.initCommand = new commander_1.Command('init')
    .description('Initialize LCAgents in the current directory')
    .option('-f, --force', 'Overwrite existing installation')
    .option('--no-github', 'Skip GitHub integration setup')
    .option('--template <name>', 'Use specific project template')
    .option('--no-interactive', 'Skip interactive prompts')
    .option('--core-system <name>', 'Specify core system to install (default: bmad-core)')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Initializing LCAgents...').start();
    try {
        const currentDir = process.cwd();
        const lcagentsDir = path.join(currentDir, '.lcagents');
        // Check if already initialized
        if (await fs.pathExists(lcagentsDir) && !options.force) {
            spinner.fail('LCAgents already initialized in this directory');
            console.log(chalk_1.default.yellow('Use --force to overwrite existing installation'));
            return;
        }
        spinner.stop();
        // Initialize managers
        const coreSystemManager = new CoreSystemManager_1.CoreSystemManager(currentDir);
        const layerManager = new LayerManager_1.LayerManager(currentDir);
        const configManager = new ConfigManager_1.ConfigManager(currentDir);
        let selectedCoreSystem = options.coreSystem;
        // Interactive core system selection if not specified
        if (!selectedCoreSystem && options.interactive !== false) {
            const availableSystems = await coreSystemManager.getAvailableCoreSystems();
            if (availableSystems.length === 0) {
                console.log(chalk_1.default.red('No core systems available in registry'));
                process.exit(1);
            }
            console.log();
            console.log(chalk_1.default.cyan('🔧 Core Agent System Selection'));
            console.log(chalk_1.default.dim('Choose the core agent system that best fits your team and project needs:'));
            console.log();
            // Display available systems
            availableSystems.forEach((system, index) => {
                console.log(chalk_1.default.white(`${index + 1}. ${chalk_1.default.bold(system.name)} (v${system.version})`));
                console.log(chalk_1.default.dim(`   ${system.description}`));
                console.log(chalk_1.default.dim(`   ${system.agentCount} agents | ${system.installation.estimatedTime} | ${system.installation.diskSpace}`));
                if (system.isDefault) {
                    console.log(chalk_1.default.green('   ✅ Recommended for most teams'));
                }
                console.log();
            });
            const { coreSystemChoice } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'coreSystemChoice',
                    message: 'Select a core agent system:',
                    choices: availableSystems.map((system) => ({
                        name: `${system.name} - ${system.description}${system.isDefault ? ' (Recommended)' : ''}`,
                        value: system.name,
                        short: system.name
                    })),
                    default: availableSystems.find(s => s.isDefault)?.name || availableSystems[0]?.name
                }
            ]);
            selectedCoreSystem = coreSystemChoice;
            // Show selected system details
            const selectedSystemInfo = availableSystems.find(s => s.name === selectedCoreSystem);
            if (selectedSystemInfo) {
                console.log();
                console.log(chalk_1.default.green(`✅ Selected: ${chalk_1.default.bold(selectedSystemInfo.name)}`));
                console.log(chalk_1.default.dim(`Description: ${selectedSystemInfo.description}`));
                console.log(chalk_1.default.dim(`Features: ${selectedSystemInfo.features.join(', ')}`));
                console.log();
            }
        }
        // Use default if still not selected
        if (!selectedCoreSystem) {
            selectedCoreSystem = await coreSystemManager.getDefaultCoreSystem();
        }
        const installationOptions = {
            force: options.force,
            coreSystem: selectedCoreSystem,
            interactive: options.interactive,
            skipGithub: !options.github,
            template: options.template
        };
        const result = await performLayeredInstallation(currentDir, installationOptions, coreSystemManager, layerManager, configManager);
        if (!result.success) {
            console.log(chalk_1.default.red('❌ Installation failed:'), result.error);
            process.exit(1);
        }
        console.log(chalk_1.default.green('🎉 LCAgents initialized successfully!'));
        console.log();
        console.log(chalk_1.default.cyan('📁 Layered Architecture Created:'));
        console.log(chalk_1.default.white(`  Core System: ${result.coreSystem} at ${path.relative(currentDir, result.installedPath)}`));
        result.layersCreated.forEach(layer => {
            console.log(chalk_1.default.dim(`  ${layer} layer ready for customization`));
        });
        console.log();
        console.log(chalk_1.default.cyan('🔧 Next Steps:'));
        console.log(chalk_1.default.white('  1. Explore available agents:'), chalk_1.default.dim('ls .lcagents/agents/'));
        console.log(chalk_1.default.white('  2. View core system resources:'), chalk_1.default.dim(`ls .lcagents/core/${result.coreSystem}/`));
        console.log(chalk_1.default.white('  3. Customize agents:'), chalk_1.default.dim('edit .lcagents/custom/agents/overrides/'));
        console.log(chalk_1.default.white('  4. Configure your pod:'), chalk_1.default.dim('edit .lcagents/custom/config/pod-config.yaml'));
        console.log();
        if (result.warnings && result.warnings.length > 0) {
            console.log(chalk_1.default.yellow('⚠️  Warnings:'));
            result.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
            console.log();
        }
        console.log(chalk_1.default.dim('For help: lcagents --help'));
    }
    catch (error) {
        console.log(chalk_1.default.red('❌ Failed to initialize LCAgents'));
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
/**
 * Perform layered installation with the new architecture
 */
async function performLayeredInstallation(basePath, options, coreSystemManager, layerManager, configManager) {
    const spinner = (0, ora_1.default)('Installing core agent system...').start();
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
        }
        else {
            // Step 3: Install selected core system
            spinner.text = `Installing ${coreSystemName} core system...`;
            const installResult = await coreSystemManager.installCoreSystem(coreSystemName, options.force);
            if (!installResult.success) {
                throw new Error(installResult.error);
            }
            // Step 4: Create layered directory structure
            spinner.text = 'Creating layered architecture...';
            await layerManager.createLayeredStructure(coreSystemName);
            // Step 5: Create backward compatibility resolution
            spinner.text = 'Setting up backward compatibility...';
            await layerManager.createVirtualResolutionSystem(coreSystemName);
        }
        // Step 6: Set active core system
        spinner.text = 'Configuring core system...';
        await coreSystemManager.switchCoreSystem(coreSystemName, 'Initial installation');
        // Step 7: Initialize configuration
        spinner.text = 'Initializing configuration...';
        await configManager.initializeConfig({
            enableGithub: !options.skipGithub,
            enableCopilot: !options.skipGithub,
            repository: '' // Would be detected from git
        });
        spinner.succeed('Installation completed successfully!');
        return {
            success: true,
            coreSystem: coreSystemName,
            installedPath: path.join(lcagentsDir, 'core', coreSystemName),
            layersCreated: ['Core', 'Organization', 'Pod Custom', 'Runtime'],
            configurationPath: path.join(lcagentsDir, 'config.yaml'),
            warnings: []
        };
    }
    catch (error) {
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
async function checkForFlatInstallation(lcagentsDir) {
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
//# sourceMappingURL=init.js.map