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
exports.AgentLoader = void 0;
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const ResourceResolver_1 = require("./ResourceResolver");
class AgentLoader {
    constructor(basePath, config) {
        this.loadedAgents = new Map();
        this.resourceResolver = new ResourceResolver_1.ResourceResolver(basePath, config);
    }
    /**
     * Load a specific agent by name
     */
    async loadAgent(agentName) {
        try {
            // Check if agent is already loaded
            const cachedAgent = this.loadedAgents.get(agentName);
            if (cachedAgent) {
                return {
                    success: true,
                    agent: cachedAgent
                };
            }
            // Resolve agent file
            const agentResult = await this.resourceResolver.resolveResource('agents', `${agentName}.yaml`);
            if (!agentResult.found || !agentResult.content) {
                return {
                    success: false,
                    error: `Agent not found: ${agentName}`
                };
            }
            // Parse YAML content
            const parseResult = this.parseAgentYaml(agentResult.content, agentName, agentResult.path || '');
            if (!parseResult.success) {
                return parseResult;
            }
            // Validate agent definition
            const validation = this.validateAgent(parseResult.agent.definition);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Agent validation failed: ${validation.errors.join(', ')}`
                };
            }
            // Cache the loaded agent
            this.loadedAgents.set(agentName, parseResult.agent);
            return {
                success: true,
                agent: parseResult.agent
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error loading agent ${agentName}: ${error}`
            };
        }
    }
    /**
     * Load all available agents
     */
    async loadAllAgents() {
        const loaded = [];
        const errors = [];
        try {
            const agentFiles = await this.resourceResolver.listResources('agents');
            for (const fileName of agentFiles) {
                if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
                    const agentName = path.basename(fileName, path.extname(fileName));
                    const result = await this.loadAgent(agentName);
                    if (result.success && result.agent) {
                        loaded.push(result.agent);
                    }
                    else {
                        errors.push(result.error || `Failed to load ${agentName}`);
                    }
                }
            }
        }
        catch (error) {
            errors.push(`Error loading agents: ${error}`);
        }
        return { loaded, errors };
    }
    /**
     * Parse agent YAML content into ParsedAgent
     */
    parseAgentYaml(content, agentName, filePath) {
        try {
            const yamlData = yaml.parse(content);
            if (!yamlData || typeof yamlData !== 'object') {
                return {
                    success: false,
                    error: `Invalid YAML structure in ${agentName}`
                };
            }
            const definition = {
                name: agentName,
                id: yamlData.id || agentName,
                title: yamlData.title || yamlData.name || agentName,
                icon: yamlData.icon || '🤖',
                whenToUse: yamlData.whenToUse || yamlData['when-to-use'] || yamlData.description || '',
                customization: yamlData.customization || null,
                persona: {
                    role: yamlData.persona?.role || '',
                    style: yamlData.persona?.style || 'professional',
                    identity: yamlData.persona?.identity || '',
                    focus: yamlData.persona?.focus || '',
                    core_principles: yamlData.persona?.core_principles || yamlData.persona?.['core-principles'] || []
                },
                commands: this.parseCommands(yamlData.commands || {}),
                dependencies: {
                    checklists: yamlData.dependencies?.checklists || [],
                    data: yamlData.dependencies?.data || [],
                    tasks: yamlData.dependencies?.tasks || [],
                    templates: yamlData.dependencies?.templates || [],
                    utils: yamlData.dependencies?.utils || [],
                    workflows: yamlData.dependencies?.workflows || [],
                    'agent-teams': yamlData.dependencies?.['agent-teams'] || []
                },
                'activation-instructions': yamlData['activation-instructions'] || [],
                'story-file-permissions': yamlData['story-file-permissions'] || [],
                'help-display-template': yamlData['help-display-template'] || ''
            };
            const parsedAgent = {
                definition,
                content,
                filePath,
                isValid: true,
                errors: []
            };
            return {
                success: true,
                agent: parsedAgent
            };
        }
        catch (error) {
            return {
                success: false,
                error: `YAML parsing error in ${agentName}: ${error}`
            };
        }
    }
    /**
     * Parse commands from YAML data
     */
    parseCommands(commandsData) {
        const commands = {};
        if (typeof commandsData === 'object' && commandsData !== null) {
            for (const [name, cmdData] of Object.entries(commandsData)) {
                if (typeof cmdData === 'string') {
                    commands[name] = cmdData;
                }
                else if (typeof cmdData === 'object' && cmdData !== null) {
                    const cmd = cmdData;
                    commands[name] = {
                        description: cmd.description || '',
                        usage: cmd.usage || '',
                        examples: cmd.examples || [],
                        dependencies: cmd.dependencies || []
                    };
                }
            }
        }
        return commands;
    }
    /**
     * Validate an agent definition
     */
    validateAgent(agent) {
        const errors = [];
        const warnings = [];
        // Required fields validation
        if (!agent.name) {
            errors.push('Agent name is required');
        }
        if (!agent.title) {
            errors.push('Agent title is required');
        }
        if (!agent.persona?.role) {
            errors.push('Agent persona role is required');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Get a loaded agent by name
     */
    getAgent(name) {
        return this.loadedAgents.get(name);
    }
    /**
     * Get all loaded agents
     */
    getAllLoadedAgents() {
        return Array.from(this.loadedAgents.values());
    }
    /**
     * Check if an agent is loaded
     */
    isAgentLoaded(name) {
        return this.loadedAgents.has(name);
    }
    /**
     * Reload an agent (clear cache and load again)
     */
    async reloadAgent(name) {
        this.loadedAgents.delete(name);
        return this.loadAgent(name);
    }
    /**
     * Clear all loaded agents from cache
     */
    clearCache() {
        this.loadedAgents.clear();
    }
}
exports.AgentLoader = AgentLoader;
//# sourceMappingURL=AgentLoader.js.map