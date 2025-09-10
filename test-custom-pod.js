#!/usr/bin/env node

const { analyzeTechStack } = require('./dist/utils/techStacker');

// Mock inquirer to simulate "Other - Add new pod" selection
const originalPrompt = require('inquirer').prompt;
require('inquirer').prompt = async (questions) => {
    const question = questions[0];
    
    if (question.name === 'selectedPod') {
        // Simulate selecting "Other - Add new pod"
        return { selectedPod: 'Other - Add new pod' };
    } else if (question.name === 'customPodName') {
        // Simulate entering a custom pod name
        return { customPodName: 'DataScience - ML Platform' };
    }
    
    // Fallback to original for any other prompts
    return originalPrompt(questions);
};

async function testCustomPodSelection() {
    console.log('🧪 Testing Custom Pod Selection\n');
    
    const testDir = '/tmp/test-pod-selection';
    
    try {
        const result = await analyzeTechStack(testDir);
        
        console.log('✅ Custom pod selection test completed');
        console.log('\n📊 Results:');
        console.log(`Primary Stack: ${result.primaryStack}`);
        console.log(`Pod ID: ${result.pod.id}`);
        console.log(`Pod Name: ${result.pod.name}`);
        console.log(`Pod Owner: ${result.pod.owner}`);
        console.log(`Repository: ${result.repository.name}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCustomPodSelection();
