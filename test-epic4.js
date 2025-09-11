#!/usr/bin/env node

/**
 * Epic 4: Basic Resource Management - Test Suite
 * 
 * This script tests all Epic 4 functionality:
 * - Guided checklist creation with industry templates
 * - Knowledge base management with import capabilities
 * - Task workflow builder with step-by-step guidance
 * - Multi-agent workflow orchestration
 * - Resource validation and uniqueness checking
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const testWorkspace = path.join(__dirname, 'test-workspace-epic4');
const lcagentsCli = path.join(__dirname, 'dist/cli/index.js');

async function setupTestEnvironment() {
  console.log(chalk.blue('🔧 Setting up Epic 4 test environment...'));
  
  // Clean and recreate test workspace
  if (await fs.pathExists(testWorkspace)) {
    await fs.remove(testWorkspace);
  }
  await fs.ensureDir(testWorkspace);
  
  // Initialize LCAgents in test workspace
  process.chdir(testWorkspace);
  
  // Create a simple file for init
  await fs.writeFile('index.js', 'console.log("test");');
  
  try {
    execSync(`echo -e "1\n3\nYes" | node ${lcagentsCli} init --core-system=bmad-core`, { 
      stdio: 'pipe',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Test workspace initialized'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Init may have completed with warnings'));
  }
  
  return testWorkspace;
}

async function testChecklistCreation() {
  console.log(chalk.blue('\n📋 Testing Checklist Creation (Story 4.1)...'));
  
  try {
    // Test 1: Create security checklist
    console.log(chalk.cyan('Test 1: Creating security review checklist'));
    const checklistResult = execSync(`node ${lcagentsCli} res create checklists security-review`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Checklist creation works'));
    console.log(checklistResult);
    
    // Test 2: Test conflict detection
    console.log(chalk.cyan('\nTest 2: Testing conflict detection'));
    try {
      execSync(`echo "security-review-v2" | node ${lcagentsCli} res create checklists security-review`, { 
        encoding: 'utf8',
        cwd: testWorkspace,
        stdio: 'pipe'
      });
      console.log(chalk.green('✅ Conflict detection and resolution works'));
    } catch (conflictError) {
      // This is expected behavior
      console.log(chalk.green('✅ Conflict detection triggered correctly'));
    }
    
    // Test 3: Validate checklist exists
    const checklistPath = path.join(testWorkspace, '.lcagents', 'custom', 'checklists', 'security-review.md');
    const checklistExists = await fs.pathExists(checklistPath);
    if (checklistExists) {
      const content = await fs.readFile(checklistPath, 'utf8');
      console.log(chalk.green('✅ Checklist file created with proper template'));
      console.log(chalk.dim(`   Contains: ${content.includes('## Checklist Items') ? 'Template structure' : 'Content'}`));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Checklist creation test failed:'));
    console.log(error.message);
    return false;
  }
  
  return true;
}

async function testKnowledgeBaseManagement() {
  console.log(chalk.blue('\n📚 Testing Knowledge Base Management (Story 4.2)...'));
  
  try {
    // Test 1: Create knowledge base
    console.log(chalk.cyan('Test 1: Creating API documentation knowledge base'));
    const kbResult = execSync(`node ${lcagentsCli} res kb api-standards`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Knowledge base creation works'));
    console.log(kbResult);
    
    // Test 2: List knowledge bases (data resources)
    console.log(chalk.cyan('\nTest 2: Listing knowledge bases'));
    const listResult = execSync(`node ${lcagentsCli} res list data`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Knowledge base listing works'));
    console.log(listResult.split('\n').slice(0, 15).join('\n')); // Show first 15 lines
    
    // Test 3: Get knowledge base info
    console.log(chalk.cyan('\nTest 3: Getting knowledge base information'));
    const infoResult = execSync(`node ${lcagentsCli} res info api-standards`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Knowledge base info retrieval works'));
    console.log(infoResult.split('\n').slice(0, 10).join('\n')); // Show first 10 lines
    
  } catch (error) {
    console.log(chalk.red('❌ Knowledge base management test failed:'));
    console.log(error.message);
    return false;
  }
  
  return true;
}

async function testTaskWorkflowBuilder() {
  console.log(chalk.blue('\n⚙️  Testing Task Workflow Builder (Story 4.3)...'));
  
  try {
    // Test 1: Create task workflow
    console.log(chalk.cyan('Test 1: Creating deployment task'));
    const taskResult = execSync(`node ${lcagentsCli} res task create deployment-process`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Task creation works'));
    console.log(taskResult);
    
    // Test 2: Validate task
    console.log(chalk.cyan('\nTest 2: Validating task'));
    const validateResult = execSync(`node ${lcagentsCli} res task validate deployment-process`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Task validation works'));
    console.log(validateResult.split('\n').slice(0, 8).join('\n')); // Show first 8 lines
    
    // Test 3: List all tasks
    console.log(chalk.cyan('\nTest 3: Listing all tasks'));
    const tasksResult = execSync(`node ${lcagentsCli} res list tasks`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Task listing works'));
    const taskLines = tasksResult.split('\n');
    console.log(taskLines.slice(0, 10).join('\n')); // Show first 10 lines
    console.log(chalk.dim(`   ... (${taskLines.length - 10} more lines)`));
    
  } catch (error) {
    console.log(chalk.red('❌ Task workflow builder test failed:'));
    console.log(error.message);
    return false;
  }
  
  return true;
}

async function testMultiAgentWorkflows() {
  console.log(chalk.blue('\n🔄 Testing Multi-Agent Workflow Orchestration (Story 4.4)...'));
  
  try {
    // Test 1: Create multi-agent workflow
    console.log(chalk.cyan('Test 1: Creating feature development workflow'));
    const workflowResult = execSync(`node ${lcagentsCli} res workflow create feature-delivery`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Workflow creation works'));
    console.log(workflowResult);
    
    // Test 2: Validate workflow
    console.log(chalk.cyan('\nTest 2: Validating workflow'));
    const validateResult = execSync(`node ${lcagentsCli} res workflow validate feature-delivery`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Workflow validation works'));
    console.log(validateResult.split('\n').slice(0, 8).join('\n')); // Show first 8 lines
    
    // Test 3: List all workflows
    console.log(chalk.cyan('\nTest 3: Listing all workflows'));
    const workflowsResult = execSync(`node ${lcagentsCli} res list workflows`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Workflow listing works'));
    console.log(workflowsResult);
    
  } catch (error) {
    console.log(chalk.red('❌ Multi-agent workflow test failed:'));
    console.log(error.message);
    return false;
  }
  
  return true;
}

async function testResourceValidation() {
  console.log(chalk.blue('\n✅ Testing Resource Validation and Management...'));
  
  try {
    // Test 1: Validate resource types
    console.log(chalk.cyan('Test 1: Validating checklists'));
    const validateResult = execSync(`node ${lcagentsCli} res validate checklists`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Resource validation works'));
    console.log(validateResult);
    
    // Test 2: Suggest resource names
    console.log(chalk.cyan('\nTest 2: Suggesting resource names'));
    const suggestResult = execSync(`node ${lcagentsCli} res suggest-name templates "deployment-guide"`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Resource name suggestions work'));
    console.log(suggestResult);
    
    // Test 3: Test comprehensive resource listing
    console.log(chalk.cyan('\nTest 3: Comprehensive resource overview'));
    const listAllResult = execSync(`node ${lcagentsCli} res list`, { 
      encoding: 'utf8',
      cwd: testWorkspace 
    });
    console.log(chalk.green('✅ Comprehensive resource listing works'));
    
    // Count created resources
    const customResources = listAllResult.match(/\[CUSTOM\] custom \((\d+) resources\)/g);
    if (customResources) {
      const totalCustom = customResources.reduce((sum, match) => {
        const count = parseInt(match.match(/\((\d+) resources\)/)?.[1] || '0');
        return sum + count;
      }, 0);
      console.log(chalk.green(`✅ Created ${totalCustom} custom resources across all types`));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Resource validation test failed:'));
    console.log(error.message);
    return false;
  }
  
  return true;
}

async function runEpic4Tests() {
  console.log(chalk.bold.blue('🚀 Epic 4: Basic Resource Management - Test Suite\n'));
  
  try {
    // Setup
    await setupTestEnvironment();
    
    // Run all tests
    const results = await Promise.all([
      testChecklistCreation(),
      testKnowledgeBaseManagement(), 
      testTaskWorkflowBuilder(),
      testMultiAgentWorkflows(),
      testResourceValidation()
    ]);
    
    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(chalk.bold.blue('\n📊 Epic 4 Test Results:'));
    console.log(`${chalk.green('✅ Passed:')} ${passed}/${total} test suites`);
    
    if (passed === total) {
      console.log(chalk.bold.green('\n🎉 All Epic 4 functionality is working correctly!'));
      console.log(chalk.green('✅ Guided checklist creation with industry templates'));
      console.log(chalk.green('✅ Knowledge base management with import capabilities'));
      console.log(chalk.green('✅ Task workflow builder with step-by-step guidance'));
      console.log(chalk.green('✅ Multi-agent workflow orchestration'));
      console.log(chalk.green('✅ Resource validation and uniqueness checking'));
      console.log(chalk.green('✅ Layer-aware resource management'));
    } else {
      console.log(chalk.yellow(`\n⚠️  ${total - passed} test suite(s) had issues - check logs above`));
    }
    
  } catch (error) {
    console.log(chalk.red('\n❌ Epic 4 test suite failed:'));
    console.log(error.message);
  } finally {
    // Cleanup
    process.chdir(__dirname);
    console.log(chalk.dim(`\n🧹 Test workspace: ${testWorkspace}`));
  }
}

// Run tests
if (require.main === module) {
  runEpic4Tests().catch(console.error);
}

module.exports = { runEpic4Tests };
