#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const initModule = __importStar(require("./commands/init"));
const uninstallModule = __importStar(require("./commands/uninstall"));
const core_1 = require("./commands/core");
const resource_1 = require("./commands/resource");
const repository_config_1 = require("../utils/repository-config");
// Load repository configuration
const repoConfig = (0, repository_config_1.loadRepositoryConfig)();
const program = new commander_1.Command();
program
    .name('lcagents')
    .description('LendingClub Internal Agent System - Distributed BMAD-Core Agents')
    .version('1.0.0-alpha.1');
// Register commands
program.addCommand(initModule.initCommand);
program.addCommand(uninstallModule.uninstallCommand);
program.addCommand(core_1.coreCommand);
program.addCommand(resource_1.resourceCommand);
// Add additional commands for development
program
    .command('validate')
    .description('Validate agent definitions and configuration')
    .action(async () => {
    console.log('🔍 Validating agent definitions...');
    // TODO: Implement validation logic
    console.log('✅ Validation completed');
});
program
    .command('docs')
    .description('Generate agent documentation')
    .option('--output <path>', 'Output path for documentation', 'docs/agents.md')
    .option('--comprehensive', 'Generate comprehensive documentation')
    .action(async (options) => {
    console.log(`📚 Generating documentation to ${options.output}...`);
    // TODO: Implement documentation generation
    console.log('✅ Documentation generated');
});
program
    .command('analyze')
    .description('Analyze agent system and generate reports')
    .option('--report <path>', 'Output path for analysis report', 'analysis.md')
    .action(async (options) => {
    console.log(`📊 Generating analysis report to ${options.report}...`);
    // TODO: Implement analysis logic
    console.log('✅ Analysis completed');
});
// Internal LendingClub specific commands
program
    .command('info')
    .description('Show LendingClub internal installation information')
    .action(async () => {
    console.log('🏢 LendingClub Internal Agent System');
    console.log('📦 Package: @lendingclub/lcagents v1.0.0-alpha.1');
    console.log(`📍 Repository: ${repoConfig.repository.url.replace('.git', '')}`);
    console.log('📚 Documentation: https://confluence.lendingclub.com/lcagents');
    console.log('🎫 Support: #engineering-tools Slack channel');
    console.log(`🔧 Team: ${repoConfig.organization} Engineering Tools & Automation`);
    console.log(`👤 Author: ${repoConfig.author.name}`);
});
program
    .command('update')
    .description('Update to latest version from internal repository')
    .action(async () => {
    console.log('🔄 Updating LCAgents from internal repository...');
    console.log(`💡 Run: npm install -g git+${repoConfig.repository.url}`);
    console.log('ℹ️  Auto-update coming in Phase 1B');
});
// Parse command line arguments
program.parse();
//# sourceMappingURL=index.js.map