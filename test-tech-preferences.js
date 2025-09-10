#!/usr/bin/env node

const { analyzeTechStack, generateTechStackReport } = require('./dist/utils/techStacker');
const fs = require('fs-extra');
const path = require('path');

async function testTechnicalPreferencesFile() {
    console.log('🔍 Testing technical-preferences.md file creation...\n');
    
    try {
        const testDir = '/tmp/test-lcagents-install';
        const techStackData = await analyzeTechStack(testDir);
        
        console.log('✅ Tech stack analyzed successfully');
        console.log(`Primary Stack: ${techStackData.primaryStack}`);
        console.log(`Frameworks: ${techStackData.frameworks.join(', ')}`);
        
        if (!techStackData.isEmpty && !techStackData.noTechStack) {
            // Generate the report
            const techReport = generateTechStackReport(techStackData);
            
            if (techReport) {
                // Simulate the file path creation as done in init.ts
                const installPath = testDir;
                const techPreferencesPath = path.join(installPath, '.lcagents', 'core', '.bmad-core', 'data', 'technical-preferences.md');
                
                console.log(`\n📁 Creating directory structure...`);
                await fs.ensureDir(path.dirname(techPreferencesPath));
                
                console.log(`📄 Writing technical-preferences.md...`);
                await fs.writeFile(techPreferencesPath, techReport, 'utf-8');
                
                console.log(`✅ File created successfully at:`);
                console.log(`   ${techPreferencesPath}`);
                
                // Verify the file exists and read first few lines
                const fileExists = await fs.pathExists(techPreferencesPath);
                console.log(`✅ File exists: ${fileExists}`);
                
                if (fileExists) {
                    const content = await fs.readFile(techPreferencesPath, 'utf-8');
                    console.log(`📋 File size: ${content.length} characters`);
                    console.log(`📝 First 200 characters:`);
                    console.log(content.substring(0, 200) + '...');
                }
            } else {
                console.log('❌ Failed to generate tech report');
            }
        } else {
            console.log('❌ Tech stack data is empty or no tech stack detected');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testTechnicalPreferencesFile();
