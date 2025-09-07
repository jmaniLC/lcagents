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
const ConfigManager_1 = require("../../core/ConfigManager");
const GitHubIntegration_1 = require("../../core/GitHubIntegration");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
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
        const configManager = new ConfigManager_1.ConfigManager(currentDir);
        let githubEnabled = options.github !== false;
        let repository = '';
        if (options.interactive !== false) {
            const answers = await inquirer_1.default.prompt([
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
                        if (!input)
                            return 'Repository is required for GitHub integration';
                        if (!input.includes('/'))
                            return 'Repository must be in format org/repo';
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
            const githubIntegration = new GitHubIntegration_1.GitHubIntegration(currentDir, config);
            await githubIntegration.initialize();
        }
        spinner.succeed('LCAgents initialized successfully!');
        console.log();
        console.log(chalk_1.default.green('🎉 Setup Complete!'));
        console.log();
        console.log('Next steps:');
        console.log(chalk_1.default.cyan('  1. Explore available agents:'), 'ls .lcagents/agents/');
        console.log(chalk_1.default.cyan('  2. Validate installation:'), 'npx lcagents validate');
        console.log(chalk_1.default.cyan('  3. Generate documentation:'), 'npx lcagents docs');
        console.log();
        console.log(chalk_1.default.dim('For help: npx lcagents --help'));
    }
    catch (error) {
        spinner.fail('Failed to initialize LCAgents');
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=init.js.map