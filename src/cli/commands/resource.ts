import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as readline from 'readline';
import chalk from 'chalk';
import { LayerManager } from '../../core/LayerManager';

// Resource validation functions for Epic 3 Story 3.3 & Epic 4 Basic Resource Management
export const resCommand = new Command('res')
  .description('Resource management utilities for validation, creation, and management')
  
  .addCommand(
    new Command('create')
      .description('Create new resources using ResourceResolver with enhanced validation (Epic 4)')
      .argument('<type>', 'Resource type (checklists, templates, data, tasks, workflows)')
      .argument('<name>', 'Resource name')
      .option('--import <file>', 'Import from existing file')
      .option('--template <template>', 'Use template as base')
      .action(async (type: string, name: string, options: { import?: string, template?: string }) => {
        try {
          const currentDir = process.cwd();
          await createResource(type, name, currentDir, options);
        } catch (error) {
          console.error(chalk.red(`❌ Error creating resource: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('kb')
      .description('Knowledge base management commands (Epic 4, Story 4.2)')
      .option('--import <file>', 'Import from existing documentation')
      .argument('[name]', 'Knowledge base name')
      .action(async (name?: string, options?: { import?: string }) => {
        try {
          const currentDir = process.cwd();
          if (name) {
            const importOptions = options?.import ? { import: options.import } : {};
            await createResource('data', name, currentDir, importOptions);
          } else {
            console.log(chalk.blue('📚 Knowledge Base Management'));
            console.log(chalk.dim('Usage: lcagents res kb <name> [--import <file>]'));
            console.log(chalk.dim('       lcagents res create data <name> --import <file>'));
          }
        } catch (error) {
          console.error(chalk.red(`❌ Error with knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('task')
      .description('Task workflow commands (Epic 4, Story 4.3)')
      .argument('[subcommand]', 'Subcommand: create, validate, clone')
      .argument('[name]', 'Task name')
      .action(async (subcommand?: string, name?: string) => {
        try {
          const currentDir = process.cwd();
          
          if (!subcommand) {
            console.log(chalk.blue('⚙️ Task Workflow Commands'));
            console.log(chalk.dim('Usage: lcagents res task create <name>'));
            console.log(chalk.dim('       lcagents res task validate <name>'));
            console.log(chalk.dim('       lcagents res task clone <existing> <new-name>'));
            return;
          }
          
          switch (subcommand) {
            case 'create':
              if (name) {
                await createResource('tasks', name, currentDir, {});
              } else {
                console.log(chalk.red('❌ Task name required'));
              }
              break;
            case 'validate':
              if (name) {
                await getResourceInfo(name, currentDir, 'tasks');
              } else {
                console.log(chalk.red('❌ Task name required'));
              }
              break;
            case 'clone':
              console.log(chalk.yellow('⚠️  Task cloning not yet implemented'));
              break;
            default:
              console.log(chalk.red(`❌ Unknown subcommand: ${subcommand}`));
          }
        } catch (error) {
          console.error(chalk.red(`❌ Error with task: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('workflow')
      .description('Multi-agent workflow commands (Epic 4, Story 4.4)')
      .argument('[subcommand]', 'Subcommand: create, validate, clone')
      .argument('[name]', 'Workflow name')
      .action(async (subcommand?: string, name?: string) => {
        try {
          const currentDir = process.cwd();
          
          if (!subcommand) {
            console.log(chalk.blue('🔄 Multi-Agent Workflow Commands'));
            console.log(chalk.dim('Usage: lcagents res workflow create <name>'));
            console.log(chalk.dim('       lcagents res workflow validate <name>'));
            console.log(chalk.dim('       lcagents res workflow clone <existing> <new-name>'));
            return;
          }
          
          switch (subcommand) {
            case 'create':
              if (name) {
                await createResource('workflows', name, currentDir, {});
              } else {
                console.log(chalk.red('❌ Workflow name required'));
              }
              break;
            case 'validate':
              if (name) {
                await getResourceInfo(name, currentDir, 'workflows');
              } else {
                console.log(chalk.red('❌ Workflow name required'));
              }
              break;
            case 'clone':
              console.log(chalk.yellow('⚠️  Workflow cloning not yet implemented'));
              break;
            default:
              console.log(chalk.red(`❌ Unknown subcommand: ${subcommand}`));
          }
        } catch (error) {
          console.error(chalk.red(`❌ Error with workflow: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('list')
      .description('Layer-aware resource listing with AgentLoader.loadAllAgents() integration (Epic 4)')
      .argument('[type]', 'Resource type to filter by')
      .argument('[layer]', 'Layer to filter by (core, org, custom)')
      .action(async (type?: string, layer?: string) => {
        try {
          const currentDir = process.cwd();
          await listResources(type, layer, currentDir);
        } catch (error) {
          console.error(chalk.red(`❌ Error listing resources: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('info')
      .description('Detailed resource info with enhanced error grouping and numbered sequences (Epic 4)')
      .argument('<resource-name>', 'Name of the resource to get info about')
      .option('--type <type>', 'Resource type to search in')
      .action(async (resourceName: string, options: { type?: string }) => {
        try {
          const currentDir = process.cwd();
          await getResourceInfo(resourceName, currentDir, options.type);
        } catch (error) {
          console.error(chalk.red(`❌ Error getting resource info: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('move')
      .description('Safe resource movement with conflict detection using AgentLoader patterns (Epic 4)')
      .argument('<resource>', 'Resource to move (type/name or just name)')
      .argument('<target-layer>', 'Target layer (custom, org)')
      .action(async (resource: string, targetLayer: string) => {
        try {
          const currentDir = process.cwd();
          await moveResource(resource, targetLayer, currentDir);
        } catch (error) {
          console.error(chalk.red(`❌ Error moving resource: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('validate')
      .description('Validate resource uniqueness across all layers with enhanced reporting')
      .argument('<resource-type>', 'Type of resource to validate (templates, checklists, data, etc.)')
      .action(async (resourceType: string) => {
        try {
          const currentDir = process.cwd();
          await validateResourceType(resourceType, currentDir);
        } catch (error) {
          console.error(chalk.red(`❌ Error validating resources: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('suggest-name')
      .description('Suggest unique names for new resources using AgentLoader patterns')
      .argument('<resource-type>', 'Type of resource (templates, checklists, data, etc.)')
      .argument('<base-name>', 'Base name for the resource')
      .action(async (resourceType: string, baseName: string) => {
        try {
          const currentDir = process.cwd();
          await suggestResourceName(resourceType, baseName, currentDir);
        } catch (error) {
          console.error(chalk.red(`❌ Error suggesting resource name: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('get')
      .description('Get the physical path of a resource')
      .argument('<type>', 'Resource type (agents, tasks, templates, etc.)')
      .argument('<name>', 'Resource name (with extension)')
      .action(async (type: string, name: string) => {
        try {
          const currentDir = process.cwd();
          const layerManager = new LayerManager(currentDir);
          
          const resourcePath = await layerManager.getResourcePath(type, name);
          
          if (resourcePath) {
            console.log(chalk.green(`✅ Resource found:`));
            console.log(chalk.cyan(`   Path: ${resourcePath}`));
            
            // Show which layer it's from
            const relativePath = path.relative(path.join(currentDir, '.lcagents'), resourcePath);
            const layer = relativePath.split(path.sep)[0];
            console.log(chalk.yellow(`   Layer: ${layer}`));
          } else {
            console.log(chalk.red(`❌ Resource not found: ${type}/${name}`));
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('read')
      .description('Read the content of a resource')
      .argument('<type>', 'Resource type (agents, tasks, templates, etc.)')
      .argument('<name>', 'Resource name (with extension)')
      .action(async (type: string, name: string) => {
        try {
          const currentDir = process.cwd();
          const layerManager = new LayerManager(currentDir);
          
          const content = await layerManager.readResource(type, name);
          
          if (content) {
            console.log(chalk.green(`✅ Resource content:`));
            console.log(chalk.cyan(`--- ${type}/${name} ---`));
            console.log(content);
          } else {
            console.log(chalk.red(`❌ Resource not found: ${type}/${name}`));
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  )
  
  .addCommand(
    new Command('exists')
      .description('Check if a resource exists')
      .argument('<type>', 'Resource type (agents, tasks, templates, etc.)')
      .argument('<name>', 'Resource name (with extension)')
      .action(async (type: string, name: string) => {
        try {
          const currentDir = process.cwd();
          const layerManager = new LayerManager(currentDir);
          
          const exists = await layerManager.resourceExists(type, name);
          
          if (exists) {
            console.log(chalk.green(`✅ Resource exists: ${type}/${name}`));
            process.exit(0);
          } else {
            console.log(chalk.red(`❌ Resource not found: ${type}/${name}`));
            process.exit(1);
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          process.exit(1);
        }
      })
  );

// Keep the old resourceCommand name for backward compatibility if needed
export const resourceCommand = resCommand;

// Helper function for readline questions
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Validate resource type uniqueness (Epic 3, Story 3.3)
 */
async function validateResourceType(resourceType: string, basePath: string): Promise<void> {
  console.log(chalk.blue(`🔍 Validating ${resourceType} resources across all layers`));
  
  const layerManager = new LayerManager(basePath);
  const validTypes = ['templates', 'checklists', 'data', 'tasks', 'utils', 'workflows', 'agent-teams'];
  
  if (!validTypes.includes(resourceType)) {
    console.log(chalk.red(`❌ Invalid resource type: ${resourceType}`));
    console.log(chalk.dim(`💡 Valid types: ${validTypes.join(', ')}`));
    return;
  }
  
  try {
    const resources = await layerManager.listResources(resourceType);
    
    if (resources.length === 0) {
      console.log(chalk.yellow(`📭 No ${resourceType} found in any layer`));
      return;
    }
    
    // Group by layer
    const layerGroups = new Map<string, typeof resources>();
    resources.forEach(resource => {
      if (!layerGroups.has(resource.source)) {
        layerGroups.set(resource.source, []);
      }
      layerGroups.get(resource.source)!.push(resource);
    });
    
    console.log(chalk.green(`\n✅ ${resourceType} validation complete:`));
    
    for (const [layer, layerResources] of layerGroups) {
      const layerBadge = layer === 'core' ? chalk.blue('[CORE]') : 
                         layer === 'org' ? chalk.yellow('[ORG]') : 
                         chalk.magenta('[CUSTOM]');
      
      console.log(`\n${layerBadge} ${layer.toUpperCase()} (${layerResources.length} resources):`);
      layerResources.forEach(resource => {
        console.log(`   • ${resource.name}`);
      });
    }
    
    // Check for naming conflicts across layers
    const nameCount = new Map<string, number>();
    resources.forEach(resource => {
      const count = nameCount.get(resource.name) || 0;
      nameCount.set(resource.name, count + 1);
    });
    
    const conflicts = Array.from(nameCount.entries()).filter(([_, count]) => count > 1);
    if (conflicts.length > 0) {
      console.log(chalk.yellow('\n⚠️  Name conflicts detected (layer precedence applies):'));
      conflicts.forEach(([name, count]) => {
        console.log(`   • ${name} (appears in ${count} layers)`);
      });
    } else {
      console.log(chalk.green('\n✅ No naming conflicts detected'));
    }
    
  } catch (error) {
    console.log(chalk.red(`❌ Error validating ${resourceType}: ${error}`));
  }
}

/**
 * Suggest unique resource names (Epic 3, Story 3.3)
 */
async function suggestResourceName(resourceType: string, baseName: string, basePath: string): Promise<void> {
  console.log(chalk.blue(`💡 Suggesting unique names for ${resourceType}: "${baseName}"`));
  
  const layerManager = new LayerManager(basePath);
  const validTypes = ['templates', 'checklists', 'data', 'tasks', 'utils', 'workflows', 'agent-teams'];
  
  if (!validTypes.includes(resourceType)) {
    console.log(chalk.red(`❌ Invalid resource type: ${resourceType}`));
    console.log(chalk.dim(`💡 Valid types: ${validTypes.join(', ')}`));
    return;
  }
  
  try {
    const existingResources = await layerManager.listResources(resourceType);
    const existingNames = new Set(existingResources.map(r => r.name));
    
    const suggestions: string[] = [];
    const sanitizedBase = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    // Strategy 1: Base name variations
    if (!existingNames.has(sanitizedBase)) {
      suggestions.push(sanitizedBase);
    }
    
    // Strategy 2: Add prefixes
    const prefixes = ['custom', 'new', 'enhanced', 'improved', 'v2'];
    prefixes.forEach(prefix => {
      const prefixedName = `${prefix}-${sanitizedBase}`;
      if (!existingNames.has(prefixedName)) {
        suggestions.push(prefixedName);
      }
    });
    
    // Strategy 3: Add suffixes  
    const suffixes = ['template', 'v2', 'new', 'custom', 'ext'];
    suffixes.forEach(suffix => {
      const suffixedName = `${sanitizedBase}-${suffix}`;
      if (!existingNames.has(suffixedName)) {
        suggestions.push(suffixedName);
      }
    });
    
    // Strategy 4: Numbered variations
    for (let i = 1; i <= 5; i++) {
      const numberedName = `${sanitizedBase}-${i}`;
      if (!existingNames.has(numberedName)) {
        suggestions.push(numberedName);
      }
    }
    
    if (suggestions.length > 0) {
      console.log(chalk.green('\n✅ Available resource names:'));
      suggestions.slice(0, 5).forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${chalk.cyan(suggestion)}`);
      });
    } else {
      console.log(chalk.yellow('\n⚠️  All suggested variations are taken'));
      console.log(chalk.dim('💡 Try a different base name or add more specific descriptors'));
    }
    
    console.log(chalk.dim(`\n📊 Currently ${existingNames.size} ${resourceType} exist across all layers`));
    
  } catch (error) {
    console.log(chalk.red(`❌ Error suggesting names: ${error}`));
  }
}

/**
 * Create a new resource with guided wizard (Epic 4, Story 4.1-4.4)
 */
async function createResource(type: string, name: string, basePath: string, options: { import?: string, template?: string }): Promise<void> {
  console.log(chalk.blue(`📋 Creating ${type}: ${name}\n`));
  
  const layerManager = new LayerManager(basePath);
  const resourceTypes = ['checklists', 'templates', 'data', 'tasks', 'workflows', 'utils'];
  
  // Validate resource type
  if (!resourceTypes.includes(type)) {
    console.log(chalk.red(`❌ Invalid resource type: ${type}`));
    console.log(chalk.yellow(`💡 Valid types: ${resourceTypes.join(', ')}`));
    return;
  }
  
  // Check for existing resource conflicts
  const existingResources = await layerManager.listResources(type);
  const resourceExists = existingResources.some(r => r.name === `${name}.md` || r.name === `${name}.yaml`);
  
  if (resourceExists) {
    const existingResource = existingResources.find(r => r.name.includes(name));
    console.log(chalk.yellow(`⚠️  Resource '${name}' already exists!`));
    console.log(chalk.dim(`📍 Found in: .lcagents/${existingResource?.source}/${type}/${existingResource?.name}`));
    
    console.log(chalk.cyan('\n💡 What would you like to do?'));
    console.log('  1) Create with different name (e.g., "enhanced-' + name + '")');
    console.log('  2) Extend existing resource (adds your content)');
    console.log('  3) Override existing resource (advanced)');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    try {
      const choice = await askQuestion(rl, '> ');
      
      switch (choice) {
        case '1':
          const newName = await askQuestion(rl, '? New name: ');
          name = newName;
          break;
        case '2':
          await createExtensionResource(type, name, basePath, layerManager, options);
          return;
        case '3':
          console.log(chalk.yellow('⚠️  Override mode - proceed with caution'));
          break;
        default:
          console.log(chalk.yellow('❌ Invalid choice. Creation cancelled.'));
          return;
      }
    } finally {
      rl.close();
    }
  }
  
  // Create the resource
  await createNewResource(type, name, basePath, layerManager, options);
}

/**
 * List resources with layer-aware filtering (Epic 4)
 */
async function listResources(type?: string, layer?: string, basePath?: string): Promise<void> {
  console.log(chalk.blue('📁 Resource Listing\n'));
  
  const layerManager = new LayerManager(basePath || process.cwd());
  const resourceTypes = ['checklists', 'templates', 'data', 'tasks', 'workflows', 'utils', 'agents'];
  
  const typesToList = type ? [type] : resourceTypes;
  
  for (const resourceType of typesToList) {
    try {
      const resources = await layerManager.listResources(resourceType);
      const filteredResources = layer ? resources.filter(r => r.source === layer) : resources;
      
      if (filteredResources.length === 0) {
        if (type) {
          console.log(chalk.yellow(`No ${resourceType} resources found${layer ? ` in ${layer} layer` : ''}`));
        }
        continue;
      }
      
      console.log(chalk.green(`📂 ${resourceType.toUpperCase()} (${filteredResources.length} resources):`));
      
      // Group by layer
      const byLayer = filteredResources.reduce((acc, resource) => {
        if (!acc[resource.source]) acc[resource.source] = [];
        acc[resource.source]!.push(resource);
        return acc;
      }, {} as Record<string, typeof filteredResources>);
      
      Object.entries(byLayer).forEach(([layerName, layerResources]) => {
        const layerColor = layerName === 'custom' ? chalk.magenta : 
                          layerName === 'org' ? chalk.blue : chalk.gray;
        console.log(`\n[${layerColor(layerName.toUpperCase())}] ${layerName} (${layerResources.length} resources):`);
        layerResources.forEach(resource => {
          console.log(`   • ${chalk.cyan(resource.name)}`);
        });
      });
      
      console.log('');
    } catch (error) {
      console.log(chalk.red(`❌ Error listing ${resourceType}: ${error}`));
    }
  }
  
  console.log(chalk.dim('💡 Use "lcagents res info <name>" for detailed information'));
}

/**
 * Get detailed resource information (Epic 4)
 */
async function getResourceInfo(resourceName: string, basePath: string, resourceType?: string): Promise<void> {
  console.log(chalk.blue(`🔍 Resource Information: ${resourceName}\n`));
  
  const layerManager = new LayerManager(basePath);
  const resourceTypes = ['checklists', 'templates', 'data', 'tasks', 'workflows', 'utils', 'agents'];
  
  const typesToSearch = resourceType ? [resourceType] : resourceTypes;
  let foundResource = null;
  let foundType = '';
  
  // Search for the resource across types
  for (const type of typesToSearch) {
    try {
      const resources = await layerManager.listResources(type);
      const resource = resources.find(r => 
        r.name === resourceName || 
        r.name === `${resourceName}.md` || 
        r.name === `${resourceName}.yaml` ||
        r.name.includes(resourceName)
      );
      
      if (resource) {
        foundResource = resource;
        foundType = type;
        break;
      }
    } catch (error) {
      // Continue searching other types
    }
  }
  
  if (!foundResource) {
    console.log(chalk.red(`❌ Resource not found: ${resourceName}`));
    console.log(chalk.dim('💡 Use "lcagents res list" to see available resources'));
    return;
  }
  
  // Display resource information
  console.log(chalk.green(`📄 ${foundResource.name}`));
  console.log(chalk.dim(`Type: ${foundType}`));
  console.log(chalk.dim(`Layer: ${foundResource.source}`));
  console.log(chalk.dim(`Path: ${foundResource.path}`));
  
  try {
    // Try to read and display content preview
    const content = await layerManager.readResource(foundType, foundResource.name);
    if (content) {
      console.log(chalk.cyan('\n📝 Content Preview:'));
      const lines = content.split('\n');
      const preview = lines.slice(0, 10).join('\n');
      console.log(chalk.dim(preview));
      if (lines.length > 10) {
        console.log(chalk.dim(`... (${lines.length - 10} more lines)`));
      }
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Could not read resource content'));
  }
  
  // Show usage information
  console.log(chalk.cyan('\n💡 Usage:'));
  console.log(chalk.dim(`   lcagents res read ${foundType} ${foundResource.name}`));
  console.log(chalk.dim(`   lcagents res move ${foundResource.name} <target-layer>`));
}

/**
 * Move resource between layers (Epic 4)
 */
async function moveResource(resource: string, targetLayer: string, _basePath: string): Promise<void> {
  console.log(chalk.blue(`🚚 Moving Resource: ${resource} → ${targetLayer}\n`));
  
  const validLayers = ['custom', 'org'];
  
  if (!validLayers.includes(targetLayer)) {
    console.log(chalk.red(`❌ Invalid target layer: ${targetLayer}`));
    console.log(chalk.yellow(`💡 Valid layers: ${validLayers.join(', ')}`));
    return;
  }
  
  console.log(chalk.yellow('⚠️  Resource movement is not yet implemented'));
  console.log(chalk.dim('This feature will be available in a future update'));
  console.log(chalk.dim('For now, manually copy resources between layer directories'));
}

/**
 * Create extension resource (Epic 4)
 */
async function createExtensionResource(type: string, name: string, basePath: string, _layerManager: LayerManager, _options: { import?: string, template?: string }): Promise<void> {
  console.log(chalk.blue(`📋 Creating extension: ${name}-enhancement`));
  
  const enhancementName = `${name}-enhancement`;
  const targetPath = path.join(basePath, '.lcagents', 'custom', type, `${enhancementName}.md`);
  
  try {
    await fs.ensureDir(path.dirname(targetPath));
    
    const content = `# ${enhancementName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

This resource extends the base ${name} with additional context and customizations.

## Base Resource
Extends: ${name} (from core/org layer)

## Additional Content
<!-- Add your enhancements here -->

## Usage
This enhancement will be automatically merged with the base resource for richer context.
`;
    
    await fs.writeFile(targetPath, content);
    console.log(chalk.green(`✅ Enhancement created: ${enhancementName}.md`));
    console.log(chalk.dim(`📁 Location: ${targetPath}`));
    console.log(chalk.dim('💡 Edit the file to add your specific enhancements'));
    
  } catch (error) {
    console.log(chalk.red(`❌ Error creating enhancement: ${error}`));
  }
}

/**
 * Create new resource with content (Epic 4)
 */
async function createNewResource(type: string, name: string, basePath: string, _layerManager: LayerManager, options: { import?: string, template?: string }): Promise<void> {
  const targetPath = path.join(basePath, '.lcagents', 'custom', type, `${name}.md`);
  
  try {
    await fs.ensureDir(path.dirname(targetPath));
    
    let content = '';
    
    if (options.import) {
      // Import from existing file
      if (await fs.pathExists(options.import)) {
        content = await fs.readFile(options.import, 'utf8');
        console.log(chalk.green(`📥 Imported content from: ${options.import}`));
      } else {
        console.log(chalk.yellow(`⚠️  Import file not found: ${options.import}`));
      }
    }
    
    if (!content) {
      // Generate template content based on type
      content = generateResourceTemplate(type, name);
    }
    
    await fs.writeFile(targetPath, content);
    console.log(chalk.green(`✅ Resource created: ${name}.md`));
    console.log(chalk.dim(`📁 Location: ${targetPath}`));
    console.log(chalk.dim(`💡 Edit the file to customize the ${type.slice(0, -1)}`));
    
  } catch (error) {
    console.log(chalk.red(`❌ Error creating resource: ${error}`));
  }
}

/**
 * Generate template content for different resource types (Epic 4)
 */
function generateResourceTemplate(type: string, name: string): string {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  switch (type) {
    case 'checklists':
      return `# ${title}

## Purpose
Describe the purpose and scope of this checklist.

## Prerequisites
- [ ] List any prerequisites here

## Checklist Items
- [ ] Step 1: Describe the first step
- [ ] Step 2: Describe the second step
- [ ] Step 3: Describe the third step

## Completion Criteria
Define what constitutes successful completion.

## Notes
Add any additional notes or references.
`;

    case 'templates':
      return `# ${title}

## Template Description
Describe what this template is for and when to use it.

## Template Variables
- {{variable1}}: Description of variable
- {{variable2}}: Description of variable

## Template Content
Your template content goes here with {{variables}} as placeholders.

## Usage Example
Show how to use this template.
`;

    case 'data':
      return `# ${title}

## Description
Describe the knowledge or data contained in this resource.

## Content
Your knowledge base content goes here.

## Related Resources
- List related checklists, templates, or other resources
- Link to external documentation if applicable

## Last Updated
${new Date().toISOString().split('T')[0]}
`;

    case 'tasks':
      return `# ${title}

## Task Overview
Describe what this task accomplishes.

## Prerequisites
- List any prerequisites or setup required

## Steps
1. **Step 1**: Describe the first step
   - Details about step 1
   
2. **Step 2**: Describe the second step
   - Details about step 2

3. **Step 3**: Describe the third step
   - Details about step 3

## Expected Outcomes
Describe what should be accomplished after completing this task.

## Troubleshooting
Common issues and solutions.
`;

    case 'workflows':
      return `# ${title}

## Workflow Description
Describe the business process this workflow supports.

## Participants
- **Agent 1**: Role and responsibilities
- **Agent 2**: Role and responsibilities

## Workflow Steps
1. **Initiation**: How the workflow starts
2. **Processing**: Main workflow steps
3. **Review**: Quality gates and approval steps
4. **Completion**: How the workflow concludes

## Handoff Points
- Between Agent 1 and Agent 2: Criteria and deliverables
- Quality gates: What triggers each gate

## Success Criteria
Define successful workflow completion.
`;

    default:
      return `# ${title}

## Description
Describe this ${type.slice(0, -1)} resource.

## Content
Add your content here.

## Usage
Explain how to use this resource.
`;
  }
}
