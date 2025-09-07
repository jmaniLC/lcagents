import { LCAgentsConfig } from '../types/Config';
export interface GitHubIntegrationResult {
    success: boolean;
    message?: string;
    error?: string;
}
export interface GitIgnoreEntry {
    pattern: string;
    comment?: string;
    section?: string;
}
export declare class GitHubIntegration {
    private basePath;
    private config;
    constructor(basePath: string, config: LCAgentsConfig);
    /**
     * Initialize GitHub integration for the project
     */
    initialize(): Promise<GitHubIntegrationResult>;
    /**
     * Update or create .gitignore file with LCAgents-specific entries
     */
    updateGitIgnore(): Promise<GitHubIntegrationResult>;
    /**
     * Create GitHub Copilot workflow files
     */
    createCopilotWorkflows(): Promise<GitHubIntegrationResult>;
    /**
     * Create GitHub issue and PR templates
     */
    createGitHubTemplates(): Promise<GitHubIntegrationResult>;
    /**
     * Generate validation workflow YAML
     */
    private generateValidationWorkflow;
    /**
     * Generate documentation workflow YAML
     */
    private generateDocsWorkflow;
    /**
     * Generate agent request issue template
     */
    private generateAgentRequestTemplate;
    /**
     * Generate bug report issue template
     */
    private generateBugReportTemplate;
    /**
     * Generate pull request template
     */
    private generatePRTemplate;
    /**
     * Check if GitHub integration is enabled
     */
    isEnabled(): boolean;
    /**
     * Check if Copilot features are enabled
     */
    isCopilotEnabled(): boolean;
    /**
     * Get repository information
     */
    getRepositoryInfo(): {
        organization?: string;
        repository?: string;
        branch?: string;
    };
}
//# sourceMappingURL=GitHubIntegration.d.ts.map