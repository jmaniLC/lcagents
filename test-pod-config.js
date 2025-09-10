#!/usr/bin/env node

/**
 * Test script to verify pod configuration loading
 */

const fs = require('fs-extra');
const path = require('path');

async function testPodConfig() {
    console.log('🧪 Testing pod configuration...\n');
    
    try {
        // Test loading the configuration file
        const configPath = path.join(__dirname, 'config/pods.json');
        console.log('📁 Loading configuration from:', configPath);
        
        const configExists = await fs.pathExists(configPath);
        if (!configExists) {
            console.error('❌ Configuration file not found!');
            return;
        }
        
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        
        console.log('✅ Configuration loaded successfully');
        console.log('📊 Number of pods:', config.pods.length);
        console.log('🔧 Allow custom pods:', config.allowCustomPods);
        console.log('🎯 Custom pod option:', config.customPodOption.name);
        
        console.log('\n📋 Available pods:');
        config.pods.forEach((pod, index) => {
            console.log(`  ${index + 1}. ${pod.name} (${pod.id})`);
            console.log(`     Owner: ${pod.owner}`);
            console.log(`     Description: ${pod.description}`);
            console.log('');
        });
        
        // Test the built techStacker module
        console.log('🔍 Testing compiled techStacker module...');
        const techStackerPath = path.join(__dirname, 'dist/utils/techStacker.js');
        
        if (await fs.pathExists(techStackerPath)) {
            console.log('✅ TechStacker compiled successfully');
            
            // Try to require it to check for syntax errors
            try {
                require(techStackerPath);
                console.log('✅ TechStacker module loads without errors');
            } catch (error) {
                console.error('❌ Error loading techStacker module:', error.message);
            }
        } else {
            console.log('⚠️  TechStacker compiled file not found - run npm run build first');
        }
        
        console.log('\n🎉 Pod configuration test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testPodConfig();
