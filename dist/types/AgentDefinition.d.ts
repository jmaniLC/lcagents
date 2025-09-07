export interface AgentDefinition {
    name: string;
    id: string;
    title: string;
    icon: string;
    whenToUse: string;
    customization?: string | null;
    persona: {
        role: string;
        style: string;
        identity: string;
        focus: string;
        core_principles?: string[];
    };
    commands: Record<string, string | AgentCommand>;
    dependencies: {
        checklists?: string[];
        data?: string[];
        tasks?: string[];
        templates?: string[];
        utils?: string[];
        workflows?: string[];
        'agent-teams'?: string[];
    };
    'activation-instructions'?: string[];
    'story-file-permissions'?: string[];
    'help-display-template'?: string;
}
export interface AgentCommand {
    description: string;
    usage?: string;
    examples?: string[];
    dependencies?: string[];
}
export interface ParsedAgent {
    definition: AgentDefinition;
    content: string;
    filePath: string;
    isValid: boolean;
    errors: string[];
}
export interface AgentRegistry {
    agents: Map<string, ParsedAgent>;
    loadedAt: Date;
}
export interface AgentValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
//# sourceMappingURL=AgentDefinition.d.ts.map