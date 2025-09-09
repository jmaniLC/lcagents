import { Command } from 'commander';
import * as path from 'path';
import chalk from 'chalk';
import { LayerManager } from '../../core/LayerManager';

export const resourceCommand = new Command('resource')
  .description('Access resources through virtual resolution layer')
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
    new Command('list')
      .description('List all available resources of a type')
      .argument('<type>', 'Resource type (agents, tasks, templates, etc.)')
      .option('--layer <layer>', 'Filter by layer (custom, org, core)')
      .action(async (type: string, options: { layer?: string }) => {
        try {
          const currentDir = process.cwd();
          const layerManager = new LayerManager(currentDir);
          
          let resources = await layerManager.listResources(type);
          
          if (options.layer) {
            resources = resources.filter(r => r.source === options.layer);
          }
          
          if (resources.length === 0) {
            console.log(chalk.yellow(`No ${type} resources found${options.layer ? ` in ${options.layer} layer` : ''}`));
            return;
          }
          
          console.log(chalk.green(`📁 Available ${type} resources:`));
          
          resources.forEach(resource => {
            const layerColor = resource.source === 'custom' ? chalk.magenta : 
                             resource.source === 'org' ? chalk.blue : chalk.gray;
            console.log(`   ${layerColor(resource.source.padEnd(6))} ${chalk.cyan(resource.name)}`);
          });
          
          console.log(chalk.gray(`\nTotal: ${resources.length} resources`));
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
