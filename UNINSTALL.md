# LCAgents Uninstall Guide

## Quick Uninstall (Recommended)

To avoid npx installation prompts during uninstall, use our standalone uninstaller:

```bash
curl -fsSL https://raw.githubusercontent.com/jmaniLC/lcagents/main/uninstall.js | node -- --force
```

This method:
- ✅ **No download prompts** - Direct execution
- ✅ **Fast removal** - No temporary package installation
- ✅ **Clean uninstall** - Removes all LCAgents files and GitHub templates
- ✅ **Version tagged** - Shows `github:jmaniLC/lcagents ver2.2`

## Alternative Method

If you prefer using npx (will prompt to install first):

```bash
npx git+https://github.com/jmaniLC/lcagents.git uninstall --force
```

## What Gets Removed

Both methods remove:
- `.lcagents/` directory and all contents
- GitHub workflow files (`lcagents-validation.yml`, `lcagents-docs.yml`)
- GitHub issue templates (`agent-request.md`, `bug-report.md`)

## Options

- `--force` - Skip confirmation prompt (recommended for scripts)
- `--keep-config` - (npx method only) Preserve configuration files

## Reinstallation

After uninstalling, you can reinstall with:

```bash
npx git+https://github.com/jmaniLC/lcagents.git init
```
