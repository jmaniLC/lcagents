#!/usr/bin/env node

// Create a test directory with a package.json
const fs = require('fs-extra');
const path = require('path');

async function createTestProject() {
    const testDir = '/tmp/test-pod-selection';
    
    // Clean up and create test directory
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    
    // Create a package.json to make it a valid project
    const packageJson = {
        name: 'test-pod-project',
        version: '1.0.0',
        dependencies: {
            'react': '^18.0.0',
            'express': '^4.18.0'
        }
    };
    
    await fs.writeFile(
        path.join(testDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`✅ Test project created at: ${testDir}`);
    console.log('📋 Package.json with React and Express dependencies added');
    console.log('\n🔧 To test pod selection manually:');
    console.log(`cd ${testDir}`);
    console.log('node -e "require(\'/Users/jmani/LC/AI/dev/lca/dist/utils/techStacker\').analyzeTechStack(process.cwd()).then(console.log).catch(console.error)"');
}

createTestProject().catch(console.error);
