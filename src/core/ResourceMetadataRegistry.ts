/**
 * LCAgents Resource Metadata Registry
 * Central registry for all resource type metadata definitions
 */

import { ResourceMetadata, ResourceType } from './ResourceMetadata';
import { AgentMetadata } from './metadata/AgentMetadata';
import { ChecklistMetadata } from './metadata/ChecklistMetadata';
import { TemplateMetadata } from './metadata/TemplateMetadata';
import { TaskMetadata } from './metadata/TaskMetadata';
import { DataMetadata } from './metadata/DataMetadata';
import { WorkflowMetadata } from './metadata/WorkflowMetadata';
import { UtilsMetadata } from './metadata/UtilsMetadata';
import { AgentTeamMetadata } from './metadata/AgentTeamMetadata';

/**
 * Registry of all resource type metadata
 * Used by creation wizards, validation engines, and IDE integration
 */
export class ResourceMetadataRegistry {
  private static metadata: Map<ResourceType, ResourceMetadata> = new Map([
    [ResourceType.AGENT, AgentMetadata],
    [ResourceType.CHECKLIST, ChecklistMetadata],
    [ResourceType.TEMPLATE, TemplateMetadata],
    [ResourceType.TASK, TaskMetadata],
    [ResourceType.DATA, DataMetadata],
    [ResourceType.WORKFLOW, WorkflowMetadata],
    [ResourceType.UTILS, UtilsMetadata],
    [ResourceType.AGENT_TEAM, AgentTeamMetadata]
  ]);

  /**
   * Get metadata for a specific resource type
   */
  static getMetadata(type: ResourceType): ResourceMetadata | undefined {
    return this.metadata.get(type);
  }

  /**
   * Get all available resource types
   */
  static getResourceTypes(): ResourceType[] {
    return Array.from(this.metadata.keys());
  }

  /**
   * Get all metadata entries
   */
  static getAllMetadata(): ResourceMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Validate a resource against its metadata
   */
  static validateResource(type: ResourceType, resource: any): ValidationResult {
    const metadata = this.getMetadata(type);
    if (!metadata) {
      return {
        valid: false,
        errors: [`Unknown resource type: ${type}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const fieldName of metadata.requiredFields) {
      const fieldValue = this.getNestedValue(resource, fieldName);
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        errors.push(`Required field missing: ${fieldName}`);
      }
    }

    // Validate individual fields
    for (const fieldSchema of metadata.schema) {
      const fieldValue = this.getNestedValue(resource, fieldSchema.name);
      
      if (fieldValue !== undefined && fieldSchema.validation) {
        for (const rule of fieldSchema.validation) {
          const validationResult = this.validateField(fieldValue, rule);
          if (!validationResult.valid) {
            if (rule.severity === 'error') {
              errors.push(`${fieldSchema.name}: ${rule.message}`);
            } else if (rule.severity === 'warning') {
              warnings.push(`${fieldSchema.name}: ${rule.message}`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate a creation wizard configuration for a resource type
   */
  static getWizardConfig(type: ResourceType): WizardConfiguration | undefined {
    const metadata = this.getMetadata(type);
    if (!metadata) {
      return undefined;
    }

    return {
      resourceType: type,
      metadata: metadata,
      sections: metadata.wizard.sections,
      mode: metadata.wizard.mode,
      conditionalRules: metadata.wizard.conditional || []
    };
  }

  /**
   * Get field schema for a specific field in a resource type
   */
  static getFieldSchema(type: ResourceType, fieldName: string) {
    const metadata = this.getMetadata(type);
    if (!metadata) {
      return undefined;
    }

    return metadata.schema.find(field => field.name === fieldName);
  }

  /**
   * Get all fields that reference a specific resource type
   */
  static getCrossReferences(targetType: ResourceType): CrossReference[] {
    const references: CrossReference[] = [];

    for (const [sourceType, metadata] of this.metadata) {
      if (metadata.validation?.crossReference) {
        for (const ref of metadata.validation.crossReference) {
          if (ref.referenceType === targetType) {
            references.push({
              sourceType,
              sourceField: ref.field,
              targetType: ref.referenceType,
              targetField: ref.referenceField || undefined,
              required: ref.required
            });
          }
        }
      }
    }

    return references;
  }

  /**
   * Get recommendations for creating a new resource
   */
  static getCreationRecommendations(type: ResourceType): CreationRecommendation[] {
    const metadata = this.getMetadata(type);
    if (!metadata) {
      return [];
    }

    const recommendations: CreationRecommendation[] = [];

    // Add best practices as recommendations
    if (metadata.bestPractices) {
      recommendations.push({
        type: 'best-practice',
        title: 'Best Practices',
        items: metadata.bestPractices
      });
    }

    // Add examples as recommendations
    if (metadata.examples) {
      recommendations.push({
        type: 'examples',
        title: 'Examples',
        items: metadata.examples.map(ex => `${ex.name}: ${ex.description}`)
      });
    }

    // Add dependency recommendations
    const dependencies = this.getCrossReferences(type);
    if (dependencies.length > 0) {
      recommendations.push({
        type: 'dependencies',
        title: 'Consider These Dependencies',
        items: dependencies.map(dep => 
          `${dep.sourceType} resources may reference this ${type}`
        )
      });
    }

    return recommendations;
  }

  /**
   * Helper method to get nested object values
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Helper method to validate individual fields
   */
  private static validateField(_value: any, _rule: any): { valid: boolean } {
    // This would contain the actual validation logic
    // For now, returning a placeholder
    return { valid: true };
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WizardConfiguration {
  resourceType: ResourceType;
  metadata: ResourceMetadata;
  sections: any[];
  mode: string;
  conditionalRules: any[];
}

export interface CrossReference {
  sourceType: ResourceType;
  sourceField: string;
  targetType: ResourceType;
  targetField?: string | undefined;
  required: boolean;
}

export interface CreationRecommendation {
  type: 'best-practice' | 'examples' | 'dependencies' | 'warnings';
  title: string;
  items: string[];
}

/**
 * Export the registry for use throughout the application
 */
export default ResourceMetadataRegistry;
