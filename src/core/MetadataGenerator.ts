/**
 * Metadata Generator for LCAgents Resources
 * 
 */

import * as fs from 'fs';
import * as path from 'path';
import { ResourceMetadataRegistry } from './ResourceMetadataRegistry';
import { ResourceType } from './ResourceMetadata';

export class MetadataGenerator {
  private bmadCorePath: string;
  private outputPath: string;

  constructor(bmadCorePath: string, outputPath: string = '.lcagents/metadata') {
    this.bmadCorePath = bmadCorePath;
    this.outputPath = outputPath;
  }

  /**
   * Generate all metadata files during installation
   */
  async generateMetadata(): Promise<void> {
    console.log('🔧 Generating resource metadata...');

    // Ensure output directory exists
    this.ensureDirectoryExists(this.outputPath);

    // Generate metadata for each resource type
    for (const resourceType of ResourceMetadataRegistry.getResourceTypes()) {
      await this.generateResourceTypeMetadata(resourceType);
    }

    // Generate combined metadata index
    await this.generateMetadataIndex();

    console.log('✅ Resource metadata generation completed');
  }

  /**
   * Generate metadata for a specific resource type
   */
  private async generateResourceTypeMetadata(resourceType: ResourceType): Promise<void> {
    const metadata = ResourceMetadataRegistry.getMetadata(resourceType);
    if (!metadata) {
      console.warn(`⚠️  No metadata found for resource type: ${resourceType}`);
      return;
    }

    // Analyze existing resources of this type
    const resourcePath = path.join(this.bmadCorePath, metadata.directory);
    const existingResources = await this.analyzeExistingResources(resourcePath, metadata.fileExtension);

    // Generate enhanced metadata with resource analysis
    const enhancedMetadata = {
      ...metadata,
      generatedAt: new Date().toISOString(),
      analyzedResources: existingResources,
      resourceCount: existingResources.length,
      validationRules: this.generateValidationRules(metadata, existingResources),
      fieldExamples: this.generateFieldExamples(metadata, existingResources)
    };

    // Write metadata file
    const outputFile = path.join(this.outputPath, `${resourceType}-metadata.json`);
    await fs.promises.writeFile(outputFile, JSON.stringify(enhancedMetadata, null, 2));
    
    console.log(`📄 Generated metadata for ${resourceType}: ${existingResources.length} resources analyzed`);
  }

  /**
   * Analyze existing resources in a directory
   */
  private async analyzeExistingResources(resourcePath: string, fileExtension: string): Promise<ResourceAnalysis[]> {
    const resources: ResourceAnalysis[] = [];

    if (!fs.existsSync(resourcePath)) {
      return resources;
    }

    const files = await fs.promises.readdir(resourcePath);
    const resourceFiles = files.filter(file => file.endsWith(fileExtension));

    for (const file of resourceFiles) {
      const filePath = path.join(resourcePath, file);
      const stats = await fs.promises.stat(filePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');

      resources.push({
        filename: file,
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        contentSample: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        lineCount: content.split('\n').length,
        hasYamlFrontmatter: content.startsWith('---') || content.includes('```yaml'),
        extractedFields: this.extractFieldsFromContent(content, fileExtension)
      });
    }

    return resources;
  }

  /**
   * Extract field information from resource content
   */
  private extractFieldsFromContent(content: string, fileExtension: string): any {
    const fields: any = {};

    if (fileExtension === '.md') {
      // Extract YAML frontmatter or YAML blocks
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/) || 
                       content.match(/^---\n([\s\S]*?)\n---/);
      
      if (yamlMatch && yamlMatch[1]) {
        try {
          // Simple YAML parsing for common patterns
          const yamlContent = yamlMatch[1];
          fields.hasYamlContent = true;
          fields.yamlLines = yamlContent.split('\n').length;
          
          // Extract common field patterns
          if (yamlContent.includes('agent:')) fields.hasAgentConfig = true;
          if (yamlContent.includes('persona:')) fields.hasPersona = true;
          if (yamlContent.includes('commands:')) fields.hasCommands = true;
          if (yamlContent.includes('dependencies:')) fields.hasDependencies = true;
          if (yamlContent.includes('workflow:')) fields.hasWorkflow = true;
          if (yamlContent.includes('template:')) fields.hasTemplate = true;
          
        } catch (error) {
          fields.yamlParseError = true;
        }
      }

      // Extract markdown structure
      const headingMatches = content.match(/^#+\s+(.+)$/gm);
      if (headingMatches) {
        fields.headings = headingMatches.map(h => h.replace(/^#+\s+/, ''));
        fields.headingCount = headingMatches.length;
      }

      // Extract checklist items
      const checklistMatches = content.match(/^\s*-\s*\[\s*\]/gm);
      if (checklistMatches) {
        fields.checklistItems = checklistMatches.length;
      }

    } else if (fileExtension === '.yaml') {
      // Extract YAML structure information
      fields.isYamlFile = true;
      const lines = content.split('\n');
      fields.yamlLineCount = lines.length;
      
      // Common YAML patterns
      if (content.includes('template:')) fields.hasTemplate = true;
      if (content.includes('workflow:')) fields.hasWorkflow = true;
      if (content.includes('team:')) fields.hasTeam = true;
      if (content.includes('sections:')) fields.hasSections = true;
      if (content.includes('sequence:')) fields.hasSequence = true;
    }

    return fields;
  }

  /**
   * Generate validation rules based on analyzed resources
   */
  private generateValidationRules(_metadata: any, resources: ResourceAnalysis[]): any {
    const rules: any = {
      commonPatterns: {},
      fieldUsage: {},
      fileSize: {
        min: Math.min(...resources.map(r => r.size)),
        max: Math.max(...resources.map(r => r.size)),
        average: resources.reduce((sum, r) => sum + r.size, 0) / resources.length
      }
    };

    // Analyze common field usage patterns
    for (const resource of resources) {
      for (const [field, value] of Object.entries(resource.extractedFields)) {
        if (!rules.fieldUsage[field]) {
          rules.fieldUsage[field] = { count: 0, percentage: 0 };
        }
        if (value) {
          rules.fieldUsage[field].count++;
        }
      }
    }

    // Calculate percentages
    for (const field of Object.keys(rules.fieldUsage)) {
      rules.fieldUsage[field].percentage = 
        (rules.fieldUsage[field].count / resources.length) * 100;
    }

    return rules;
  }

  /**
   * Generate field examples from existing resources
   */
  private generateFieldExamples(_metadata: any, resources: ResourceAnalysis[]): any {
    const examples: any = {};

    // Extract examples from filenames
    examples.filenames = resources.map(r => r.filename).slice(0, 5);

    // Extract size ranges
    examples.sizeRange = {
      small: resources.filter(r => r.size < 1000).length,
      medium: resources.filter(r => r.size >= 1000 && r.size < 5000).length,
      large: resources.filter(r => r.size >= 5000).length
    };

    return examples;
  }

  /**
   * Generate combined metadata index
   */
  private async generateMetadataIndex(): Promise<void> {
    const index = {
      generatedAt: new Date().toISOString(),
      version: '2.0.0',
      resourceTypes: ResourceMetadataRegistry.getResourceTypes(),
      totalMetadataFiles: ResourceMetadataRegistry.getResourceTypes().length,
      metadataFiles: ResourceMetadataRegistry.getResourceTypes().map(type => 
        `${type}-metadata.json`
      ),
      usage: {
        creationWizards: 'Use ResourceMetadataRegistry.getWizardConfig(type)',
        validation: 'Use ResourceMetadataRegistry.validateResource(type, resource)',
        fieldSchemas: 'Use ResourceMetadataRegistry.getFieldSchema(type, fieldName)',
        crossReferences: 'Use ResourceMetadataRegistry.getCrossReferences(targetType)'
      }
    };

    const indexFile = path.join(this.outputPath, 'index.json');
    await fs.promises.writeFile(indexFile, JSON.stringify(index, null, 2));
    
    console.log('📑 Generated metadata index');
  }

  /**
   * Ensure directory exists
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Static method to generate metadata during installation
   */
  static async generateForInstallation(projectRoot: string): Promise<void> {
    const bmadCorePath = path.join(projectRoot, '.bmad-core');
    const outputPath = path.join(projectRoot, '.lcagents', 'metadata');
    
    const generator = new MetadataGenerator(bmadCorePath, outputPath);
    await generator.generateMetadata();
  }
}

interface ResourceAnalysis {
  filename: string;
  path: string;
  size: number;
  lastModified: Date;
  contentSample: string;
  lineCount: number;
  hasYamlFrontmatter: boolean;
  extractedFields: any;
}

export default MetadataGenerator;
