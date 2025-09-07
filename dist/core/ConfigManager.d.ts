import { LCAgentsConfig, TeamRole } from '../types/Config';
export declare class ConfigManager {
    private configPath;
    private config;
    constructor(basePath: string);
    /**
     * Load configuration from .lcagents/config.yaml
     */
    loadConfig(): Promise<{
        config: LCAgentsConfig | null;
        error?: string;
    }>;
    /**
     * Save configuration to .lcagents/config.yaml
     */
    saveConfig(config: LCAgentsConfig): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get the current configuration
     */
    getConfig(): LCAgentsConfig;
    /**
     * Update specific configuration values
     */
    updateConfig(updates: Partial<LCAgentsConfig>): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Add or update a team role
     */
    setTeamRole(roleName: string, role: TeamRole): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Remove a team role
     */
    removeTeamRole(roleName: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get a specific team role
     */
    getTeamRole(roleName: string): TeamRole | undefined;
    /**
     * List all team roles
     */
    getTeamRoles(): Record<string, TeamRole>;
    /**
     * Update path configuration
     */
    updatePaths(paths: Partial<LCAgentsConfig['paths']>): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Reset to default configuration
     */
    resetToDefaults(): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Validate configuration structure and values
     */
    private validateConfig;
    /**
     * Parse YAML data into LCAgentsConfig
     */
    private parseConfig;
    /**
     * Get default configuration
     */
    private getDefaultConfig;
    /**
     * Check if configuration file exists
     */
    configExists(): Promise<boolean>;
    /**
     * Get configuration file path
     */
    getConfigPath(): string;
    /**
     * Create initial configuration with user input
     */
    initializeConfig(options: {
        enableGithub?: boolean;
        enableCopilot?: boolean;
        repository?: string;
        customPaths?: Partial<LCAgentsConfig['paths']>;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=ConfigManager.d.ts.map