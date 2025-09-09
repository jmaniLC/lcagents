#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json to get files list
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const filesPatterns = packageJson.files || [];

console.log('Files patterns from package.json:');
filesPatterns.forEach(pattern => {
  console.log(`  ${pattern}`);
});

console.log('\nChecking .bmad-core directory:');
const bmadCorePath = '.bmad-core';
if (fs.existsSync(bmadCorePath)) {
  console.log('✅ .bmad-core directory exists');
  const files = fs.readdirSync(bmadCorePath, { recursive: true });
  console.log(`📁 Contains ${files.length} files/directories:`);
  files.slice(0, 10).forEach(file => {
    console.log(`   ${file}`);
  });
  if (files.length > 10) {
    console.log(`   ... and ${files.length - 10} more`);
  }
} else {
  console.log('❌ .bmad-core directory not found');
}
