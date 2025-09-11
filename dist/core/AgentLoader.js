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
const LayerManager_1 = require("./LayerManager");
class AgentLoader {
    constructor(basePath) {
        this.loadedAgents = new Map();
        this.layerManager = new LayerManager_1.LayerManager(basePath);
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
            // Resolve agent file - try both .yaml and .md extensions
            let agentContent = null;
            let agentPath = null;
            // Try .yaml extension first
            agentContent = await this.layerManager.readResource('agents', `${agentName}.yaml`);
            if (agentContent) {
                agentPath = await this.layerManager.getResourcePath('agents', `${agentName}.yaml`);
            }
            else {
                // Try .md extension
                agentContent = await this.layerManager.readResource('agents', `${agentName}.md`);
                if (agentContent) {
                    agentPath = await this.layerManager.getResourcePath('agents', `${agentName}.md`);
                }
            }
            if (!agentContent || !agentPath) {
                return {
                    success: false,
                    error: `Agent not found: ${agentName} (tried .yaml and .md)`
                };
            }
            // Parse agent content (YAML or Markdown with YAML front-matter)
            const parseResult = agentPath.endsWith('.md')
                ? this.parseAgentMarkdown(agentContent, agentName, agentPath)
                : this.parseAgentYaml(agentContent, agentName, agentPath);
            if (!parseResult.success) {
                return parseResult;
            }
            // Validate agent definition
            const validation = this.validateAgent(parseResult.agent.definition);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `${agentName}: Agent validation failed: ${validation.errors.join(', ')}`
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
            const agentResources = await this.layerManager.listResources('agents');
            for (const resource of agentResources) {
                const fileName = resource.name;
                if (fileName.endsWith('.yaml') || fileName.endsWith('.yml') || fileName.endsWith('.md')) {
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
            // Validate the raw YAML data first
            const rawValidation = this.validateRawYaml(yamlData);
            if (!rawValidation.isValid) {
                return {
                    success: false,
                    error: `${agentName}: Agent validation failed: ${rawValidation.errors.join(', ')}`
                };
            }
            const definition = {
                name: yamlData.name || agentName,
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
     * Parse agent Markdown content with YAML front-matter into ParsedAgent
     */
    parseAgentMarkdown(content, agentName, filePath) {
        try {
            // Extract YAML block from markdown content
            let yamlContent = '';
            // Look for YAML block marked with ```yaml
            const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
            if (yamlBlockMatch && yamlBlockMatch[1]) {
                yamlContent = yamlBlockMatch[1];
            }
            else {
                // Try front-matter style (between --- markers)
                const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                if (frontMatterMatch && frontMatterMatch[1]) {
                    yamlContent = frontMatterMatch[1];
                }
                else {
                    return {
                        success: false,
                        error: `No YAML block found in Markdown agent: ${agentName}`
                    };
                }
            }
            // Parse the extracted YAML content
            const yamlData = yaml.parse(yamlContent);
            if (!yamlData || typeof yamlData !== 'object') {
                return {
                    success: false,
                    error: `Invalid YAML structure in Markdown agent: ${agentName}`
                };
            }
            // Use agent field if it exists, otherwise use root level
            const agentData = yamlData.agent || yamlData;
            const definition = {
                name: agentData.name || agentName,
                id: agentData.id || agentName,
                title: agentData.title || agentData.name || agentName,
                icon: agentData.icon || '🤖',
                whenToUse: agentData.whenToUse || agentData['when-to-use'] || agentData.description || '',
                customization: agentData.customization || null,
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
                error: `Markdown parsing error in ${agentName}: ${error}`
            };
        }
    }
    /**
     * Parse commands from YAML data
     */
    parseCommands(commandsData) {
        const commands = {};
        if (Array.isArray(commandsData)) {
            // Handle array format: [{ commandName: description }, ...]
            commandsData.forEach((item) => {
                if (typeof item === 'object' && item !== null) {
                    for (const [name, desc] of Object.entries(item)) {
                        commands[name] = desc;
                    }
                }
            });
        }
        else if (typeof commandsData === 'object' && commandsData !== null) {
            // Handle object format: { commandName: description, ... }
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
     * Validate raw YAML data before processing
     */
    validateRawYaml(yamlData) {
        const errors = [];
        const warnings = [];
        // Required fields validation
        if (!yamlData.name) {
            errors.push('Agent name is required');
        }
        if (!yamlData.title) {
            errors.push('Agent title is required');
        }
        if (!yamlData.persona?.role) {
            errors.push('Agent persona role is required');
        }
        if (!yamlData.commands) {
            errors.push('Agent commands are required');
        }
        if (yamlData.persona && typeof yamlData.persona === 'string') {
            errors.push('Agent persona must be an object, not a string');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
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