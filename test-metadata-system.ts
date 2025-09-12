/**
 * Test script to verify the metadata system functionality
 */

import { ResourceMetadataRegistry } from './src/core/ResourceMetadataRegistry';
import { ResourceType } from './src/core/ResourceMetadata';

console.log('🧪 Testing BMAD-Core Resource Metadata System\n');

// Test 1: Registry functionality
console.log('1️⃣ Testing ResourceMetadataRegistry...');
const resourceTypes = ResourceMetadataRegistry.getResourceTypes();
console.log(`   ✓ Found ${resourceTypes.length} resource types: ${resourceTypes.join(', ')}`);

// Test 2: Metadata retrieval
console.log('\n2️⃣ Testing metadata retrieval...');
for (const type of resourceTypes) {
  const metadata = ResourceMetadataRegistry.getMetadata(type);
  if (metadata) {
    console.log(`   ✓ ${type}: ${metadata.name} v${metadata.version} (${metadata.schema.length} fields)`);
  } else {
    console.log(`   ❌ ${type}: No metadata found`);
  }
}

// Test 3: Wizard configuration
console.log('\n3️⃣ Testing wizard configurations...');
const agentWizard = ResourceMetadataRegistry.getWizardConfig(ResourceType.AGENT);
if (agentWizard) {
  console.log(`   ✓ Agent wizard: ${agentWizard.sections.length} sections, ${agentWizard.mode} mode`);
  for (const section of agentWizard.sections) {
    console.log(`     - ${section.title}: ${section.fields.length} fields`);
  }
} else {
  console.log('   ❌ Agent wizard configuration not found');
}

// Test 4: Field schema access
console.log('\n4️⃣ Testing field schema access...');
const agentNameField = ResourceMetadataRegistry.getFieldSchema(ResourceType.AGENT, 'agent.name');
if (agentNameField) {
  console.log(`   ✓ agent.name field: ${agentNameField.type}, required: ${agentNameField.required}`);
  console.log(`     Question: "${agentNameField.wizard.question}"`);
} else {
  console.log('   ❌ agent.name field schema not found');
}

// Test 5: Cross-references
console.log('\n5️⃣ Testing cross-references...');
const templateRefs = ResourceMetadataRegistry.getCrossReferences(ResourceType.TEMPLATE);
console.log(`   ✓ Found ${templateRefs.length} references to templates:`);
for (const ref of templateRefs) {
  console.log(`     - ${ref.sourceType}.${ref.sourceField} → ${ref.targetType}`);
}

// Test 6: Resource validation (mock test)
console.log('\n6️⃣ Testing resource validation...');
const mockAgent = {
  agent: {
    name: 'Test Agent',
    id: 'test-agent',
    title: 'Test Agent',
    icon: '🧪',
    whenToUse: 'For testing purposes'
  },
  persona: {
    role: 'Test Role',
    style: 'Testing',
    identity: 'Test Identity',
    focus: 'Testing',
    core_principles: ['Test principle']
  },
  commands: ['test', 'validate']
};

const validationResult = ResourceMetadataRegistry.validateResource(ResourceType.AGENT, mockAgent);
console.log(`   ${validationResult.valid ? '✓' : '❌'} Agent validation: ${validationResult.valid ? 'PASSED' : 'FAILED'}`);
if (!validationResult.valid) {
  console.log(`     Errors: ${validationResult.errors.join(', ')}`);
}
if (validationResult.warnings.length > 0) {
  console.log(`     Warnings: ${validationResult.warnings.join(', ')}`);
}

// Test 7: Creation recommendations
console.log('\n7️⃣ Testing creation recommendations...');
const agentRecommendations = ResourceMetadataRegistry.getCreationRecommendations(ResourceType.AGENT);
console.log(`   ✓ Found ${agentRecommendations.length} recommendation categories for agents:`);
for (const rec of agentRecommendations) {
  console.log(`     - ${rec.title}: ${rec.items.length} items`);
}

console.log('\n🎉 Metadata system test completed!');
console.log('\n📊 Summary:');
console.log(`   - Resource types: ${resourceTypes.length}`);
console.log(`   - Metadata schemas: ${ResourceMetadataRegistry.getAllMetadata().length}`);
console.log(`   - Total fields across all types: ${ResourceMetadataRegistry.getAllMetadata().reduce((sum, m) => sum + m.schema.length, 0)}`);
console.log(`   - Cross-references: ${templateRefs.length}`);

export {};
