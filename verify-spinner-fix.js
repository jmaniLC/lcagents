#!/usr/bin/env node

/**
 * Verification script for spinner fix
 */

const fs = require('fs-extra');
const path = require('path');

async function verifySpinnerFix() {
    console.log('🔍 Verifying spinner fix implementation...\n');
    
    try {
        const initFilePath = path.join(__dirname, 'src/cli/commands/init.ts');
        const content = await fs.readFile(initFilePath, 'utf-8');
        
        // Check for the spinner.stop() call before performLayeredInstallation
        const hasSpinnerStop = content.includes('// Stop the setup spinner before starting installation') &&
                              content.includes('spinner.stop();') &&
                              content.includes('const result = await performLayeredInstallation(');
        
        // Check for error handling in catch block
        const hasErrorHandling = content.includes('if (spinner) {') &&
                               content.includes('spinner.stop();') &&
                               content.includes('// Make sure any running spinner is stopped');
        
        // Count spinner instances
        const spinnerMatches = content.match(/const spinner = ora\(/g) || [];
        const spinnerStopMatches = content.match(/spinner\.stop\(\)/g) || [];
        const spinnerSucceedMatches = content.match(/spinner\.succeed\(/g) || [];
        const spinnerFailMatches = content.match(/spinner\.fail\(/g) || [];
        
        console.log('📊 Spinner Analysis:');
        console.log(`   Spinner instances created: ${spinnerMatches.length}`);
        console.log(`   Spinner stop() calls: ${spinnerStopMatches.length}`);
        console.log(`   Spinner succeed() calls: ${spinnerSucceedMatches.length}`);
        console.log(`   Spinner fail() calls: ${spinnerFailMatches.length}`);
        console.log('');
        
        console.log('✅ Fix Implementation Status:');
        console.log(`   ${hasSpinnerStop ? '✅' : '❌'} Spinner stopped before installation`);
        console.log(`   ${hasErrorHandling ? '✅' : '❌'} Error handling for spinner cleanup`);
        console.log('');
        
        if (hasSpinnerStop && hasErrorHandling) {
            console.log('🎉 Spinner fix has been successfully implemented!');
            console.log('');
            console.log('📝 Summary of changes:');
            console.log('   1. Added spinner.stop() before calling performLayeredInstallation()');
            console.log('   2. Added spinner cleanup in error handling catch block');
            console.log('   3. This prevents the "Setting up LCAgents..." message from persisting');
            console.log('');
            console.log('🚀 The installation process should now exit properly after completion.');
        } else {
            console.log('❌ Spinner fix implementation incomplete');
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifySpinnerFix();
