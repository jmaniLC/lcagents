import { Command } from 'commander';
import chalk from 'chalk';
import { AgentLoader } from '../../core/AgentLoader';
import { LayerManager } from '../../core/LayerManager';
import { CoreSystemManager } from '../../core/CoreSystemManager';
import { ParsedAgent } from '../../types/AgentDefinition';

// Helper function removed - AgentLoader no longer needs config

// Helper function to categorize agents
function categorizeAgent(agent: ParsedAgent): string {
  const role = agent.definition.persona.role.toLowerCase();
  if (role.includes('manager') || role.includes('pm') || role.includes('product')) return 'Business';
  if (role.includes('developer') || role.includes('dev') || role.includes('engineer')) return 'Technical';
  if (role.includes('qa') || role.includes('test') || role.includes('quality')) return 'Quality';
  if (role.includes('architect') || role.includes('design')) return 'Architecture';
  if (role.includes('security') || role.includes('compliance')) return 'Compliance';
  return 'General';
}

// Helper function to format agent display
function formatAgentDisplay(agent: ParsedAgent, layer: string): string {
  const agentId = agent.definition.id;
  const name = agent.definition.name;
  const whenToUse = agent.definition.whenToUse;
  const layerBadge = layer === 'core' ? chalk.blue('[CORE]') : 
                    layer === 'org' ? chalk.yellow('[ORG]') : 
                    chalk.magenta('[CUSTOM]');
  
  return `${chalk.yellow(agentId)} ${chalk.cyan(name)} ${layerBadge} - ${chalk.dim(whenToUse)}`;
}

// Helper function to search agents
function searchAgents(agents: ParsedAgent[], query: string): ParsedAgent[] {
  const lowerQuery = query.toLowerCase();
  return agents.filter(agent => {
    return agent.definition.name.toLowerCase().includes(lowerQuery) ||
           agent.definition.title.toLowerCase().includes(lowerQuery) ||
           agent.definition.whenToUse.toLowerCase().includes(lowerQuery) ||
           agent.definition.persona.role.toLowerCase().includes(lowerQuery) ||
           agent.definition.persona.focus.toLowerCase().includes(lowerQuery) ||
           Object.keys(agent.definition.commands).some(cmd => cmd.toLowerCase().includes(lowerQuery));
  });
}

// Helper function to get template descriptions
function getTemplateDescription(templateName: string): string {
  const descriptions: { [key: string]: string } = {
    'architecture-tmpl.yaml': 'System architecture and technical design template',
    'brainstorming-output-tmpl.yaml': 'Structured brainstorming session output format',
    'brownfield-architecture-tmpl.yaml': 'Architecture analysis for existing systems',
    'brownfield-prd-tmpl.yaml': 'Product requirements for legacy system enhancements',
    'competitor-analysis-tmpl.yaml': 'Competitive landscape and feature comparison analysis',
    'front-end-architecture-tmpl.yaml': 'Frontend system design and component architecture',
    'front-end-spec-tmpl.yaml': 'Frontend technical specifications and requirements',
    'fullstack-architecture-tmpl.yaml': 'Complete application architecture template',
    'market-research-tmpl.yaml': 'Market analysis and research findings template',
    'prd-tmpl.yaml': 'Product Requirements Document for new features/products',
    'project-brief-tmpl.yaml': 'High-level project overview and objectives template',
    'qa-gate-tmpl.yaml': 'Quality assurance checkpoint and review template',
    'story-tmpl.yaml': 'User story documentation and acceptance criteria template'
  };
  
  return descriptions[templateName] || 'Template for agent workflow generation';
}

export const agentCommand = new Command('agent')
  .description('Discover, explore, and manage agents in the LCAgents ecosystem')
  
  // Story 1.1: Browse Available Agents
  .addCommand(
    new Command('browse')
      .description('Interactive agent browser showing all available agents')
      .action(async () => {
        try {
          console.log(chalk.blue('🔍 Loading agents from all layers...'));
          
          const currentDir = process.cwd();
          const agentLoader = new AgentLoader(currentDir);
          const layerManager = new LayerManager(currentDir);
          const coreSystemManager = new CoreSystemManager(currentDir);
          
          // Load all agents using AgentLoader.loadAllAgents()
          const { loaded: agents, errors } = await agentLoader.loadAllAgents();
          
          if (errors.length > 0) {
            console.log(chalk.yellow('⚠️  Some agents failed to load:'));
            
            // Group errors by failure reason
            const errorGroups = new Map<string, string[]>();
            
            errors.forEach(error => {
              // Extract agent name and reason from error message
              // Expected format: "agentName: Agent validation failed: reason1, reason2" 
              if (error.includes('Agent validation failed:')) {
                const match = error.match(/^(.+?): Agent validation failed: (.+)$/);
                if (match && match[1] && match[2]) {
                  const agentName = match[1];
                  const allReasons = match[2];
                  
                  // Split multiple reasons and process each
                  const reasons = allReasons.split(', ');
                  reasons.forEach(reason => {
                    // Group similar errors
                    let groupKey = reason;
                    if (reason.includes('name is required')) {
                      groupKey = 'Missing required name field';
                    } else if (reason.includes('title is required')) {
                      groupKey = 'Missing required title field';
                    } else if (reason.includes('persona role is required')) {
                      groupKey = 'Missing persona role';
                    } else if (reason.includes('commands are required')) {
                      groupKey = 'Missing commands field';
                    } else if (reason.includes('persona must be an object') || reason.includes('not a string')) {
                      groupKey = 'Invalid persona format';
                    }
                    
                    if (!errorGroups.has(groupKey)) {
                      errorGroups.set(groupKey, []);
                    }
                    errorGroups.get(groupKey)!.push(agentName);
                  });
                }
              } else if (error.includes('Failed to load')) {
                const nameMatch = error.match(/Failed to load (.+)$/);
                const agentName = (nameMatch && nameMatch[1]) ? nameMatch[1] : 'unknown';
                const reason = 'Loading error';
                
                if (!errorGroups.has(reason)) {
                  errorGroups.set(reason, []);
                }
                errorGroups.get(reason)!.push(agentName);
              } else {
                // Try to extract YAML parsing errors
                if (error.includes('YAML parsing error')) {
                  const nameMatch = error.match(/YAML parsing error in (.+?):/);
                  const agentName = (nameMatch && nameMatch[1]) ? nameMatch[1] : 'unknown';
                  const reason = 'YAML parsing error';
                  
                  if (!errorGroups.has(reason)) {
                    errorGroups.set(reason, []);
                  }
                  errorGroups.get(reason)!.push(agentName);
                } else {
                  // Generic error - try to extract agent name
                  const reason = 'Parse error';
                  let agentName = 'unknown';
                  
                  // Try common patterns to extract agent names
                  const patterns = [
                    /Error loading agent (.+?):/,
                    /(.+?): .+/,
                    /in (.+?):/
                  ];
                  
                  for (const pattern of patterns) {
                    const match = error.match(pattern);
                    if (match && match[1]) {
                      agentName = match[1];
                      break;
                    }
                  }
                  
                  if (!errorGroups.has(reason)) {
                    errorGroups.set(reason, []);
                  }
                  errorGroups.get(reason)!.push(agentName);
                }
              }
            });
            
            // Display grouped errors
            for (const [reason, agentNames] of errorGroups) {
              const uniqueAgents = [...new Set(agentNames)]; // Remove duplicates
              const agentList = uniqueAgents.join(', ');
              console.log(chalk.red(`   Agent validation failed: ${reason} (${agentList})`));
            }
          }

          if (agents.length === 0) {
            console.log(chalk.yellow('📭 No agents found. Initialize LCAgents first with: lcagents init'));
            return;
          }

          // Get active core system
          const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
          
          console.log(chalk.green(`\n📋 Available Agents (${agents.length} found)`));
          console.log(chalk.dim(`Active Core System: ${activeCoreSystem || 'Not detected'}\n`));

          // Categorize agents
          const categorized = new Map<string, ParsedAgent[]>();
          
          for (const agent of agents) {
            // Resolve agent layer information
            try {
              const resolutionPath = await layerManager.resolveAgent(agent.definition.id);
              let layer = 'core';
              
              if (resolutionPath.layerSources.includes('custom')) {
                layer = 'custom';
              } else if (resolutionPath.layerSources.includes('org')) {
                layer = 'org';
              }
              
              const category = categorizeAgent(agent);
              if (!categorized.has(category)) {
                categorized.set(category, []);
              }
              
              // Add layer info to agent for display
              (agent as any).layerInfo = layer;
              categorized.get(category)!.push(agent);
            } catch (error) {
              // Fallback to core if resolution fails
              const category = categorizeAgent(agent);
              if (!categorized.has(category)) {
                categorized.set(category, []);
              }
              (agent as any).layerInfo = 'core';
              categorized.get(category)!.push(agent);
            }
          }

          // Display agents by category
          for (const [category, categoryAgents] of categorized) {
            console.log(chalk.cyan(`\n📂 ${category}:`));
            categoryAgents.forEach(agent => {
              const layer = (agent as any).layerInfo || 'core';
              console.log(`   ${formatAgentDisplay(agent, layer)}`);
            });
          }

          console.log(chalk.dim('\n💡 Commands:'));
          console.log(chalk.dim('   lcagents agent info <name>     - Get detailed information'));
          console.log(chalk.dim('   lcagents agent search <query>  - Search agents'));
          console.log(chalk.dim('   lcagents agent templates       - Browse agent templates'));
          
        } catch (error) {
          console.error(chalk.red(`❌ Error browsing agents: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.1: Search agents by capability
  .addCommand(
    new Command('search')
      .description('Search agents by keywords or capabilities')
      .argument('<query>', 'Search query for agent capabilities')
      .action(async (query: string) => {
        try {
          console.log(chalk.blue(`🔍 Searching agents for: "${query}"`));
          
          const currentDir = process.cwd();
          const agentLoader = new AgentLoader(currentDir);
          
          // Load all agents and search
          const { loaded: agents } = await agentLoader.loadAllAgents();
          const searchResults = searchAgents(agents, query);

          if (searchResults.length === 0) {
            console.log(chalk.yellow(`📭 No agents found matching "${query}"`));
            console.log(chalk.dim('\n💡 Try:'));
            console.log(chalk.dim('   lcagents agent browse          - Browse all available agents'));
            console.log(chalk.dim('   lcagents agent suggest         - Get smart recommendations'));
            return;
          }

          console.log(chalk.green(`\n📋 Search Results (${searchResults.length} found):`));

          // Auto-trigger detailed info if single result
          if (searchResults.length === 1) {
            const agent = searchResults[0];
            if (agent) {
              console.log(`\n${formatAgentDisplay(agent, 'core')}`);
              console.log(chalk.dim('\n🔍 Showing detailed information (single result):\n'));
              
              // Show detailed info inline - use agent ID, not display name
              await showAgentInfo(agent.definition.id, currentDir);
              return;
            }
          }

          // Show search results
          searchResults.forEach((agent, index) => {
            const layer = 'core'; // TODO: Resolve actual layer
            console.log(`   ${index + 1}. ${formatAgentDisplay(agent, layer)}`);
          });

          console.log(chalk.dim('\n💡 Use "lcagents agent info <name>" for detailed information'));
          
        } catch (error) {
          console.error(chalk.red(`❌ Error searching agents: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.2: Get detailed agent information
  .addCommand(
    new Command('info')
      .description('Show detailed information about a specific agent')
      .argument('<agent-name>', 'Name or ID of the agent')
      .action(async (agentName: string) => {
        try {
          await showAgentInfo(agentName, process.cwd());
        } catch (error) {
          console.error(chalk.red(`❌ Error getting agent info: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.1: List available agent templates
  .addCommand(
    new Command('templates')
      .description('List available agent templates from all layers')
      .action(async () => {
        try {
          console.log(chalk.blue('🔍 Loading agent templates...'));
          
          const currentDir = process.cwd();
          const layerManager = new LayerManager(currentDir);
          
          // List template resources from all layers
          const templateFiles = await layerManager.listResources('templates');
          // Show all templates as they can be used for agent workflows
          const agentTemplates = templateFiles;

          if (agentTemplates.length === 0) {
            console.log(chalk.yellow('📭 No agent templates found'));
            return;
          }

          console.log(chalk.green(`\n📋 Available Agent Templates (${agentTemplates.length} found):`));

          agentTemplates.forEach((template, index) => {
            const layerBadge = template.source === 'core' ? chalk.blue('[CORE]') : 
                              template.source === 'org' ? chalk.yellow('[ORG]') : 
                              chalk.magenta('[CUSTOM]');
            
            // Get template description
            const description = getTemplateDescription(template.name);
            
            console.log(`   ${index + 1}. ${chalk.cyan(template.name)} ${layerBadge}`);
            console.log(chalk.dim(`      ${description}`));
          });

          console.log(chalk.dim('\n💡 Use templates with: lcagents agent create --template <name>'));
          
        } catch (error) {
          console.error(chalk.red(`❌ Error listing templates: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.1: Gap analysis to find missing capabilities
  .addCommand(
    new Command('gaps-analysis')
      .description('Analyze current agents and suggest missing capabilities')
      .action(async () => {
        try {
          console.log(chalk.blue('🔍 Analyzing agent capabilities and gaps...'));
          
          const currentDir = process.cwd();
          const agentLoader = new AgentLoader(currentDir);
          const coreSystemManager = new CoreSystemManager(currentDir);
          
          const { loaded: agents } = await agentLoader.loadAllAgents();
          const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();
          
          // Analyze current capabilities
          const capabilities = new Set<string>();
          const roles = new Set<string>();
          
          agents.forEach(agent => {
            roles.add(agent.definition.persona.role);
            Object.keys(agent.definition.commands).forEach(cmd => capabilities.add(cmd));
          });

          console.log(chalk.green('\n📊 Current Agent Analysis:'));
          console.log(chalk.cyan(`   Agents: ${agents.length}`));
          console.log(chalk.cyan(`   Roles: ${Array.from(roles).join(', ')}`));
          console.log(chalk.cyan(`   Commands: ${capabilities.size}`));
          console.log(chalk.cyan(`   Core System: ${activeCoreSystem || 'Not detected'}`));

          // Suggest common missing capabilities
          const commonRoles = ['Product Manager', 'Developer', 'Security Engineer'];
          const missingRoles = commonRoles.filter(role => {
            const roleLower = role.toLowerCase();
            return !Array.from(roles).some(existingRole => {
              const existingLower = existingRole.toLowerCase();
              
              // Simple matching - check if role keywords exist
              if (roleLower.includes('product')) {
                return existingLower.includes('product');
              }
              if (roleLower.includes('developer')) {
                return existingLower.includes('developer') || existingLower.includes('dev');
              }
              if (roleLower.includes('security')) {
                return existingLower.includes('security');
              }
              
              return false;
            });
          });

          if (missingRoles.length > 0) {
            console.log(chalk.yellow('\n🔍 Potential Missing Roles:'));
            missingRoles.forEach(role => {
              console.log(chalk.dim(`   • ${role}`));
            });
            console.log(chalk.dim('\n💡 Use "lcagents agent suggest" for personalized recommendations'));
          } else {
            console.log(chalk.green('\n✅ Core roles well covered!'));
          }
          
        } catch (error) {
          console.error(chalk.red(`❌ Error analyzing gaps: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.1: Smart agent recommendations  
  .addCommand(
    new Command('suggest')
      .description('Get intelligent agent recommendations based on current setup')
      .action(async () => {
        try {
          console.log(chalk.blue('🔍 Analyzing current setup for recommendations...'));
          
          const currentDir = process.cwd();
          const agentLoader = new AgentLoader(currentDir);
          
          const { loaded: agents } = await agentLoader.loadAllAgents();
          
          // Simple recommendation logic for MVP
          const recommendations = [];
          
          const hasDevAgent = agents.some(a => 
            a.definition.persona.role.toLowerCase().includes('developer') ||
            a.definition.persona.role.toLowerCase().includes('dev') ||
            a.definition.id === 'dev'
          );
          const hasPMAgent = agents.some(a => 
            a.definition.persona.role.toLowerCase().includes('manager') ||
            a.definition.persona.role.toLowerCase().includes('product') ||
            a.definition.id === 'pm'
          );
          const hasQAAgent = agents.some(a => 
            a.definition.persona.role.toLowerCase().includes('qa') ||
            a.definition.persona.role.toLowerCase().includes('test') ||
            a.definition.persona.role.toLowerCase().includes('quality') ||
            a.definition.id === 'qa'
          );
          
          if (!hasDevAgent) {
            recommendations.push('🧑‍💻 Developer Agent - Essential for code implementation and technical tasks');
          }
          if (!hasPMAgent) {
            recommendations.push('👔 Product Manager Agent - Helps with requirements and feature planning');
          }
          if (!hasQAAgent) {
            recommendations.push('🧪 QA Engineer Agent - Crucial for testing and quality assurance');
          }

          if (recommendations.length === 0) {
            console.log(chalk.green('✅ You have a well-rounded agent setup!'));
            console.log(chalk.dim('Consider specialized agents for advanced use cases:'));
            console.log(chalk.dim('   • Security Engineer - For security reviews'));
            console.log(chalk.dim('   • Data Engineer - For data pipeline tasks'));
            console.log(chalk.dim('   • DevOps Engineer - For deployment automation'));
          } else {
            console.log(chalk.yellow('\n💡 Recommended Agents:'));
            recommendations.forEach(rec => {
              console.log(`   ${rec}`);
            });
            console.log(chalk.dim('\n🚀 Create agents with: lcagents agent create'));
          }
          
        } catch (error) {
          console.error(chalk.red(`❌ Error generating suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )

  // Story 1.2: List agent resources/dependencies
  .addCommand(
    new Command('resources')
      .description('Show resources and dependencies for a specific agent')
      .argument('<agent-name>', 'Name or ID of the agent')
      .action(async (agentName: string) => {
        try {
          console.log(chalk.blue(`🔍 Loading resources for agent: ${agentName}`));
          
          const currentDir = process.cwd();
          const agentLoader = new AgentLoader(currentDir);
          
          const result = await agentLoader.loadAgent(agentName);
          if (!result.success || !result.agent) {
            console.log(chalk.red(`❌ Agent not found: ${agentName}`));
            console.log(chalk.dim('💡 Use "lcagents agent browse" to see available agents'));
            return;
          }

          const agent = result.agent;
          const deps = agent.definition.dependencies;

          console.log(chalk.green(`\n📦 Resources for ${agent.definition.name}:`));

          // Show each dependency type
          const depTypes = ['checklists', 'data', 'tasks', 'templates', 'utils', 'workflows', 'agent-teams'] as const;
          
          depTypes.forEach(type => {
            const items = deps[type] || [];
            if (items.length > 0) {
              console.log(chalk.cyan(`\n  ${type}:`));
              items.forEach(item => {
                console.log(chalk.dim(`    • ${item}`));
              });
            }
          });

          const totalDeps = Object.values(deps).flat().length;
          if (totalDeps === 0) {
            console.log(chalk.dim('   No external dependencies'));
          } else {
            console.log(chalk.dim(`\n📊 Total dependencies: ${totalDeps}`));
          }
          
        } catch (error) {
          console.error(chalk.red(`❌ Error loading agent resources: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  );

// Helper function to show detailed agent information
async function showAgentInfo(agentName: string, basePath: string): Promise<void> {
  const agentLoader = new AgentLoader(basePath);
  const layerManager = new LayerManager(basePath);
  const coreSystemManager = new CoreSystemManager(basePath);
  
  console.log(chalk.blue(`🔍 Loading agent information: ${agentName}`));
  
  const result = await agentLoader.loadAgent(agentName);
  if (!result.success || !result.agent) {
    console.log(chalk.red(`❌ Agent not found: ${agentName}`));
    console.log(chalk.dim('💡 Use "lcagents agent browse" to see available agents'));
    return;
  }

  const agent = result.agent;
  const def = agent.definition;
  
  // Get layer information
  let layerInfo = 'core';
  try {
    const resolutionPath = await layerManager.resolveAgent(def.id);
    if (resolutionPath.layerSources.includes('custom')) {
      layerInfo = 'custom';
    } else if (resolutionPath.layerSources.includes('org')) {
      layerInfo = 'org';
    }
  } catch (error) {
    // Use default
  }

  // Get core system compatibility
  const activeCoreSystem = await coreSystemManager.getActiveCoreSystem();

  console.log(chalk.green(`\n${def.icon} ${def.name} - ${def.title}`));
  console.log(chalk.dim(`ID: ${def.id}`));
  
  const layerBadge = layerInfo === 'core' ? chalk.blue('[CORE]') : 
                    layerInfo === 'org' ? chalk.yellow('[ORG]') : 
                    chalk.magenta('[CUSTOM]');
  console.log(`Layer: ${layerBadge}`);
  console.log(chalk.dim(`Core System: ${activeCoreSystem || 'Not detected'}`));

  console.log(chalk.cyan('\n📝 Description:'));
  console.log(chalk.dim(`   ${def.whenToUse}`));

  console.log(chalk.cyan('\n👤 Persona:'));
  console.log(chalk.dim(`   Role: ${def.persona.role}`));
  console.log(chalk.dim(`   Style: ${def.persona.style}`));
  console.log(chalk.dim(`   Focus: ${def.persona.focus}`));
  
  if (def.persona.core_principles && def.persona.core_principles.length > 0) {
    console.log(chalk.dim('   Principles:'));
    def.persona.core_principles.forEach(principle => {
      console.log(chalk.dim(`     • ${principle}`));
    });
  }

  console.log(chalk.cyan('\n⚡ Commands:'));
  const commands = Object.entries(def.commands);
  if (commands.length > 0) {
    commands.forEach(([cmd, desc], index) => {
      if (typeof desc === 'string') {
        console.log(chalk.dim(`   ${index + 1}- ${cmd} - ${desc}`));
      } else {
        console.log(chalk.dim(`   ${index + 1}- ${cmd} - ${desc.description}`));
        if (desc.usage) {
          console.log(chalk.dim(`      Usage: ${desc.usage}`));
        }
      }
    });
  } else {
    console.log(chalk.dim('   No specific commands defined'));
  }

  // Show dependencies if any
  const deps = def.dependencies;
  const totalDeps = Object.values(deps).flat().length;
  if (totalDeps > 0) {
    console.log(chalk.cyan('\n📦 Dependencies:'));
    Object.entries(deps).forEach(([type, items]) => {
      if (items && items.length > 0) {
        console.log(chalk.dim(`   ${type}: ${items.join(', ')}`));
      }
    });
  }

  console.log(chalk.dim('\n💡 Commands:'));
  console.log(chalk.dim(`   lcagents agent resources ${agentName}  - Show all dependencies`));
  console.log(chalk.dim('   lcagents agent browse                  - Browse all agents'));
}
