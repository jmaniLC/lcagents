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
        console.log('DEBUG: Starting configuration setup...');
        const configManager = new ConfigManager_1.ConfigManager(currentDir);
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
        }
        else if (explicitlyInteractive) {
            shouldRunInteractive = true;
        }
        else if (isNPXEnvironment) {
            // Default to non-interactive in NPX environments
            shouldRunInteractive = false;
        }
        else {
            // Local environment - default to interactive if TTY available
            shouldRunInteractive = process.stdin.isTTY;
        }
        console.log('DEBUG: Is NPX environment:', isNPXEnvironment);
        console.log('DEBUG: Explicitly interactive:', explicitlyInteractive);
        console.log('DEBUG: Explicitly non-interactive:', explicitlyNonInteractive);
        console.log('DEBUG: Should run interactive:', shouldRunInteractive);
        if (shouldRunInteractive) {
            console.log('DEBUG: Running interactive prompts...');
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
            console.log('DEBUG: Interactive setup completed');
        }
        else {
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
            const githubIntegration = new GitHubIntegration_1.GitHubIntegration(currentDir, config);
            await githubIntegration.initialize();
        }
        spinner.succeed('LCAgents initialized successfully!');
        console.log();
        console.log(chalk_1.default.green('🎉 Setup Complete!'));
        console.log();
        console.log('Next steps:');
        console.log(chalk_1.default.cyan('  1. Set up alias for easy access:'));
        console.log(chalk_1.default.white("     alias lcagents='npx git+https://github.com/jmaniLC/lcagents.git'"));
        console.log(chalk_1.default.dim('     (Add this to your ~/.bashrc or ~/.zshrc)'));
        console.log(chalk_1.default.cyan('  2. Explore available agents:'), 'ls .lcagents/agents/');
        console.log(chalk_1.default.cyan('  3. Validate installation:'), 'lcagents validate');
        console.log(chalk_1.default.cyan('  4. Generate documentation:'), 'lcagents docs');
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