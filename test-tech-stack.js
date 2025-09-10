#!/usr/bin/env node

const { analyzeTechStack, generateTechStackReport } = require('./dist/utils/techStacker');
const path = require('path');

async function testTechStackAnalyzer() {
    console.log('🔍 Testing Tech Stack Analyzer...\n');
    
    // Test with current directory (should detect Node.js/TypeScript)
    try {
        const currentDir = process.cwd();
        console.log(`Analyzing: ${currentDir}\n`);
        
        const result = await analyzeTechStack(currentDir);
        
        console.log('📊 Analysis Results:');
        console.log(`Primary Stack: ${result.primaryStack}`);
        console.log(`All Stacks: ${result.allStacks.join(', ')}`);
        console.log(`Frameworks: ${result.frameworks.join(', ')}`);
        console.log(`Build Tools: ${result.buildTools.join(', ')}`);
        console.log(`Package Managers: ${result.packageManagers.join(', ')}`);
        console.log(`Is Empty: ${result.isEmpty}`);
        console.log(`No Tech Stack: ${result.noTechStack}`);
        
        if (!result.isEmpty && !result.noTechStack) {
            console.log('\n📄 Generating Report...');
            const report = generateTechStackReport(result);
            if (report) {
                console.log('✅ Report generated successfully');
                console.log('First 300 characters:');
                console.log(report.substring(0, 300) + '...');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testTechStackAnalyzer();
