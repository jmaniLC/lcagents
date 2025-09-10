#!/usr/bin/env node

const { analyzeTechStack } = require('./dist/utils/techStacker');

// Mock inquirer to simulate user selection
const originalPrompt = require('inquirer').prompt;
require('inquirer').prompt = async (questions) => {
    const question = questions[0];
    
    if (question.name === 'selectedPod') {
        // Simulate selecting "Alchemy - Lending"
        return { selectedPod: 'Alchemy - Lending' };
    }
    
    // Fallback to original for any other prompts
    return originalPrompt(questions);
};

async function testPodSelection() {
    console.log('🧪 Testing Pod Selection with Mocked User Input\n');
    
    const testDir = '/tmp/test-pod-selection';
    
    try {
        const result = await analyzeTechStack(testDir);
        
        console.log('✅ Pod selection test completed');
        console.log('\n📊 Results:');
        console.log(`Primary Stack: ${result.primaryStack}`);
        console.log(`Pod ID: ${result.pod.id}`);
        console.log(`Pod Name: ${result.pod.name}`);
        console.log(`Pod Owner: ${result.pod.owner}`);
        console.log(`Repository: ${result.repository.name}`);
        console.log(`Tech Stack: ${result.frameworks.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testPodSelection();
