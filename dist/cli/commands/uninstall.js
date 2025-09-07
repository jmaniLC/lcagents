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
exports.uninstallCommand = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
exports.uninstallCommand = new commander_1.Command('uninstall')
    .description('Remove LCAgents from the current directory')
    .option('-f, --force', 'Force removal without confirmation')
    .option('--keep-config', 'Keep configuration files')
    .action(async (options) => {
    const currentDir = process.cwd();
    const lcagentsDir = path.join(currentDir, '.lcagents');
    // Check if LCAgents is installed
    if (!await fs.pathExists(lcagentsDir)) {
        console.log(chalk_1.default.yellow('LCAgents is not installed in this directory'));
        return;
    }
    let confirmed = options.force;
    if (!confirmed) {
        const answer = await inquirer_1.default.prompt([
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
        console.log(chalk_1.default.gray('Uninstall cancelled'));
        return;
    }
    const spinner = (0, ora_1.default)('Removing LCAgents...').start();
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
        }
        else {
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
            console.log(chalk_1.default.green('✅ LCAgents removed (configuration preserved)'));
            console.log(chalk_1.default.dim('Configuration files kept in .lcagents/'));
        }
        else {
            console.log(chalk_1.default.green('✅ LCAgents completely removed'));
        }
        console.log();
        console.log(chalk_1.default.dim('To reinstall: npx @lendingclub/lcagents init'));
    }
    catch (error) {
        spinner.fail('Failed to remove LCAgents');
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
//# sourceMappingURL=uninstall.js.map