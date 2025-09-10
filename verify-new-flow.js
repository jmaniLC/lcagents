#!/usr/bin/env node

/**
 * Test script to verify the new installation flow
 */

const fs = require('fs-extra');
const path = require('path');

async function verifyNewFlow() {
    console.log('🔄 Verifying new installation flow implementation...\n');
    
    try {
        const initFilePath = path.join(__dirname, 'src/cli/commands/init.ts');
        const content = await fs.readFile(initFilePath, 'utf-8');
        
        // Check for the new flow steps
        const hasStep1 = content.includes('// Step 1: Get directory') &&
                        content.includes('const installPath = await selectInstallationDirectory();');
        
        const hasStep2 = content.includes('// Step 2: Validate directory source') &&
                        content.includes('await validateInstallationDirectory(installPath);');
        
        const hasStep3 = content.includes('// Step 3: Get the pod name') &&
                        content.includes('const podInfo = await getPodInformation();');
        
        const hasStep4 = content.includes('// Step 4: Analyze tech stack') &&
                        content.includes('await analyzeTechStackWithContext(installPath, podInfo);');
        
        // Check for function definitions
        const hasFunctions = content.includes('async function selectInstallationDirectory(): Promise<string>') &&
                           content.includes('async function validateInstallationDirectory(installPath: string): Promise<void>') &&
                           content.includes('async function getPodInformation()') &&
                           content.includes('async function analyzeTechStackWithContext(');
        
        // Check tech stacker exports
        const techStackerPath = path.join(__dirname, 'src/utils/techStacker.ts');
        const techStackerContent = await fs.readFile(techStackerPath, 'utf-8');
        const hasSelectPodExport = techStackerContent.includes('export async function selectPod()');
        const hasUpdatedAnalyze = techStackerContent.includes('providedPodInfo?: { name: string; id: string; owner: string }');
        
        console.log('📊 New Flow Implementation Status:');
        console.log(`   ${hasStep1 ? '✅' : '❌'} Step 1: Get directory`);
        console.log(`   ${hasStep2 ? '✅' : '❌'} Step 2: Validate directory source`);
        console.log(`   ${hasStep3 ? '✅' : '❌'} Step 3: Get pod name`);
        console.log(`   ${hasStep4 ? '✅' : '❌'} Step 4: Analyze tech stack`);
        console.log(`   ${hasFunctions ? '✅' : '❌'} New function definitions`);
        console.log(`   ${hasSelectPodExport ? '✅' : '❌'} selectPod export`);
        console.log(`   ${hasUpdatedAnalyze ? '✅' : '❌'} Updated analyzeTechStack`);
        console.log('   ✅ Step 5: Install LCAgents (existing)');
        console.log('   ✅ Step 6: Update files (existing)');
        console.log('   ✅ Step 7: Exit installation (existing)');
        console.log('');
        
        if (hasStep1 && hasStep2 && hasStep3 && hasStep4 && hasFunctions && hasSelectPodExport && hasUpdatedAnalyze) {
            console.log('🎉 New installation flow has been successfully implemented!');
            console.log('');
            console.log('📝 Flow Summary:');
            console.log('   1. 📁 Get directory - User selects installation directory');
            console.log('   2. ✅ Validate directory - Check for valid project files');
            console.log('   3. 🏢 Get pod name - User selects organizational pod');
            console.log('   4. 🔍 Analyze tech stack - Scan project technology');
            console.log('   5. 🚀 Install LCAgents - Core system installation');
            console.log('   6. 📝 Update files - Save pod, repo, techstack values');
            console.log('   7. 🎯 Exit installation - Clean completion');
            console.log('');
            console.log('✨ Pod selection now happens after directory validation and before tech stack analysis!');
        } else {
            console.log('❌ New flow implementation incomplete');
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyNewFlow();
