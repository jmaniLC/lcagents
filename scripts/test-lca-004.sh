#!/bin/bash

# LCA-004 Switchable Core Systems - Comprehensive Demo
# This script demonstrates all LCA-004 features with proper test isolation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 LCA-004 Switchable Core Systems Demo${NC}"
echo "=============================================="
echo

# Create isolated test workspace
TEST_DIR="test-workspace-lca004"
if [ -d "$TEST_DIR" ]; then
    echo -e "${YELLOW}📁 Removing existing test workspace...${NC}"
    rm -rf "$TEST_DIR"
fi

echo -e "${BLUE}📁 Creating isolated test workspace: $TEST_DIR${NC}"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize workspace
echo -e "${BLUE}🔧 Initializing LCAagents workspace...${NC}"
npx /Users/jmani/LC/AI/dev/lca/lendingclub-lcagents-1.0.0-alpha.4.tgz init
echo

# Check initial status
echo -e "${CYAN}📊 Initial Core System Status:${NC}"
lcagents core status
echo

# List available core systems
echo -e "${CYAN}📋 Listing available core systems:${NC}"
lcagents core list
echo

# Test core system switching
echo -e "${CYAN}🔄 Testing core system switching...${NC}"
echo

echo -e "${BLUE}1. Switching to minimal-core...${NC}"
lcagents core switch minimal-core
echo

echo -e "${BLUE}2. Verifying switch to minimal-core...${NC}"
lcagents core status
echo

echo -e "${BLUE}3. Switching back to bmad-core...${NC}"
lcagents core switch bmad-core
echo

echo -e "${BLUE}4. Verifying switch back to bmad-core...${NC}"
lcagents core status
echo

# Test resource listing with different cores
echo -e "${CYAN}🔍 Testing resource access with different cores...${NC}"
echo

echo -e "${BLUE}1. Agents available in bmad-core:${NC}"
lcagents resource list agents
echo

echo -e "${BLUE}2. Switching to minimal-core and checking agents:${NC}"
lcagents core switch minimal-core
lcagents resource list agents
echo

echo -e "${BLUE}3. Templates available in minimal-core:${NC}"
lcagents resource list templates
echo

# Test configuration management
echo -e "${CYAN}⚙️ Testing configuration management...${NC}"
echo

echo -e "${BLUE}1. Current runtime configuration:${NC}"
cat .lcagents/runtime/config.yaml
echo

echo -e "${BLUE}2. Core system directories:${NC}"
ls -la .lcagents/core/
echo

# Test validation
echo -e "${CYAN}✅ Testing validation...${NC}"
echo

echo -e "${BLUE}1. Validating switch to existing system (bmad-core):${NC}"
lcagents core validate-switch bmad-core
echo

echo -e "${BLUE}2. Validating switch to non-existent system (should fail):${NC}"
lcagents core validate-switch non-existent-core || echo -e "${YELLOW}   ✓ Validation correctly failed for non-existent core${NC}"
echo

# Test comprehensive status again
echo -e "${CYAN}📊 Final comprehensive status:${NC}"
lcagents core status
echo

# Test resource mapping integrity
echo -e "${CYAN}🗺️ Testing resource mapping integrity...${NC}"
echo

echo -e "${BLUE}1. Resource map structure:${NC}"
if [ -f ".lcagents/resource-map.json" ]; then
    head -20 .lcagents/resource-map.json
else
    echo "   ❌ Resource map not found"
fi
echo

# Performance test (optional)
echo -e "${CYAN}⚡ Performance test - Multiple switches:${NC}"
echo

echo -e "${BLUE}Testing rapid core system switches...${NC}"
time (
    lcagents core switch minimal-core > /dev/null
    lcagents core switch bmad-core > /dev/null
    lcagents core switch minimal-core > /dev/null
    lcagents core switch bmad-core > /dev/null
)
echo -e "${GREEN}✓ Performance test completed${NC}"
echo

# Summary
echo -e "${CYAN}📋 LCA-004 Demo Summary:${NC}"
echo "=================================="
echo -e "${GREEN}✅ Core system initialization${NC}"
echo -e "${GREEN}✅ Core system listing${NC}"
echo -e "${GREEN}✅ Core system switching${NC}"
echo -e "${GREEN}✅ Runtime configuration management${NC}"
echo -e "${GREEN}✅ Resource access validation${NC}"
echo -e "${GREEN}✅ Switch validation${NC}"
echo -e "${GREEN}✅ Status reporting${NC}"
echo -e "${GREEN}✅ Performance verification${NC}"
echo

echo -e "${CYAN}🎉 LCA-004 Switchable Core Systems Demo Complete!${NC}"
echo

# Cleanup option
echo -e "${YELLOW}🧹 Test workspace created at: $(pwd)${NC}"
echo -e "${YELLOW}   To cleanup: cd .. && rm -rf $TEST_DIR${NC}"
