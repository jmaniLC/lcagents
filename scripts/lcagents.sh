#!/bin/bash

# LCAgents Installation Script
# Simple alias for easier installation

# Load configuration
CONFIG_FILE="$(dirname "$0")/../config/repository.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Repository configuration not found"
    exit 1
fi

# Extract repository URL and short name using jq (fallback to manual parsing if jq not available)
if command -v jq >/dev/null 2>&1; then
    REPO_URL=$(jq -r '.repository.url' "$CONFIG_FILE")
    SHORT_NAME=$(jq -r '.repository.shortName' "$CONFIG_FILE")
else
    # Fallback manual parsing
    REPO_URL=$(grep -o '"url": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
    SHORT_NAME=$(grep -o '"shortName": *"[^"]*"' "$CONFIG_FILE" | cut -d'"' -f4)
fi

# Installation functions
install_lcagents() {
    echo "🚀 Installing LCAgents..."
    echo "📦 Using repository: $REPO_URL"
    
    if [ "$1" = "--global" ] || [ "$1" = "-g" ]; then
        echo "🌐 Global installation..."
        npm install -g "git+$REPO_URL"
    else
        echo "📂 Local project installation..."
        npx "git+$REPO_URL" init
    fi
}

# Simple alias function
lcagents() {
    if [ "$1" = "install" ]; then
        shift
        install_lcagents "$@"
    else
        npx "git+$REPO_URL" "$@"
    fi
}

# Main execution
case "$1" in
    "install")
        shift
        install_lcagents "$@"
        ;;
    "alias")
        echo "# Add this to your ~/.bashrc or ~/.zshrc:"
        echo "alias lcagents='npx git+$REPO_URL'"
        echo ""
        echo "# Then you can use:"
        echo "lcagents init"
        echo "lcagents validate" 
        echo "lcagents info"
        ;;
    *)
        npx "git+$REPO_URL" "$@"
        ;;
esac
