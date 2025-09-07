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
exports.initCommand = new commander_1.Command('init')
    .description('Initialize LCAgents in the current directory')
    .option('-f, --force', 'Overwrite existing installation')
    .option('--no-github', 'Skip GitHub integration setup')
    .option('--template <name>', 'Use specific project template')
    .option('--no-interactive', 'Skip interactive prompts')
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
        spinner.text = 'Creating directory structure...';
        // Create only bmad-core directory under .lcagents
        const bmadCoreDir = path.join(lcagentsDir, 'bmad-core');
        await fs.ensureDir(bmadCoreDir);
        spinner.text = 'Copying BMAD-Core resources...';
        // Copy BMAD-Core resources from package to bmad-core folder
        const resourcesPath = path.join(__dirname, '../../resources');
        console.log('DEBUG: Looking for resources at:', resourcesPath);
        if (await fs.pathExists(resourcesPath)) {
            console.log('DEBUG: Resources found, copying to bmad-core...');
            // Copy all resources to bmad-core directory
            await fs.copy(resourcesPath, bmadCoreDir);
            console.log('DEBUG: All resources copied to bmad-core');
        }
        else {
            console.log('DEBUG: Resources not found at:', resourcesPath);
            // Fallback: try alternative paths
            const alternativePath = path.join(__dirname, '../../../resources');
            console.log('DEBUG: Trying alternative path:', alternativePath);
            if (await fs.pathExists(alternativePath)) {
                await fs.copy(alternativePath, bmadCoreDir);
                console.log('DEBUG: Copied from alternative path');
            }
        }
        spinner.succeed('LCAgents initialized successfully!');
        console.log();
        console.log(chalk_1.default.green('🎉 Setup Complete!'));
        console.log();
        console.log('Next steps:');
        console.log(chalk_1.default.cyan('  1. Set up alias for easy access:'));
        console.log(chalk_1.default.white("     alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'"));
        console.log(chalk_1.default.dim('     (Add this to your ~/.bashrc or ~/.zshrc)'));
        console.log(chalk_1.default.cyan('  2. Explore available agents:'), 'ls .lcagents/bmad-core/agents/');
        console.log(chalk_1.default.cyan('  3. View all resources:'), 'ls .lcagents/bmad-core/');
        console.log();
        console.log(chalk_1.default.dim('For help: lcagents --help'));
    }
    catch (error) {
        spinner.fail('Failed to initialize LCAgents');
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=init.js.map