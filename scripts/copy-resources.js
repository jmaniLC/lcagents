#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function copyResources() {
  try {
    console.log('Copying resources to dist directory...');
    
    const sourceDir = path.join(__dirname, '../resources');
    const destDir = path.join(__dirname, '../dist/resources');
    
    // Check if source resources directory exists
    if (await fs.pathExists(sourceDir)) {
      // Copy all resources to dist
      await fs.copy(sourceDir, destDir);
      console.log('✅ Resources copied successfully');
    } else {
      console.log('ℹ️  No resources directory found, skipping copy');
    }
    
    // Copy package.json to dist for NPM metadata
    const packageJsonSource = path.join(__dirname, '../package.json');
    const packageJsonDest = path.join(__dirname, '../dist/package.json');
    
    if (await fs.pathExists(packageJsonSource)) {
      await fs.copy(packageJsonSource, packageJsonDest);
      console.log('✅ Package.json copied to dist');
    }
    
    // Copy config directory to dist
    const configSource = path.join(__dirname, '../config');
    const configDest = path.join(__dirname, '../dist/config');
    
    if (await fs.pathExists(configSource)) {
      await fs.copy(configSource, configDest);
      console.log('✅ Config directory copied to dist');
    }
    
    console.log('🎉 Resource copying completed');
  } catch (error) {
    console.error('❌ Error copying resources:', error);
    process.exit(1);
  }
}

copyResources();
