import { ParsedAgent } from '../types/AgentDefinition';
import { LCAgentsConfig } from '../types/Config';
export interface AgentLoadResult {
    success: boolean;
    agent?: ParsedAgent;
    error?: string;
}
export declare class AgentLoader {
    private resourceResolver;
    private loadedAgents;
    constructor(basePath: string, config: LCAgentsConfig);
    /**
     * Load a specific agent by name
     */
    loadAgent(agentName: string): Promise<AgentLoadResult>;
    /**
     * Load all available agents
     */
    loadAllAgents(): Promise<{
        loaded: ParsedAgent[];
        errors: string[];
    }>;
    /**
     * Parse agent YAML content into ParsedAgent
     */
    private parseAgentYaml;
    /**
     * Parse commands from YAML data
     */
    private parseCommands;
    /**
     * Validate an agent definition
     */
    private validateAgent;
    /**
     * Get a loaded agent by name
     */
    getAgent(name: string): ParsedAgent | undefined;
    /**
     * Get all loaded agents
     */
    getAllLoadedAgents(): ParsedAgent[];
    /**
     * Check if an agent is loaded
     */
    isAgentLoaded(name: string): boolean;
    /**
     * Reload an agent (clear cache and load again)
     */
    reloadAgent(name: string): Promise<AgentLoadResult>;
    /**
     * Clear all loaded agents from cache
     */
    clearCache(): void;
}
//# sourceMappingURL=AgentLoader.d.ts.map