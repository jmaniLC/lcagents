const fs = require('fs');
const path = require('path');

/**
 * Load repository configuration
 */
function loadRepositoryConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'repository.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('Repository configuration not found at: ' + configPath);
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error('Failed to parse repository configuration: ' + error.message);
  }
}

/**
 * Get NPX installation command
 */
function getNpxCommand(config = null) {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return `npx git+${config.repository.url}`;
}

/**
 * Get short repository reference
 */
function getShortRepo(config = null) {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return config.repository.shortName;
}

/**
 * Get full repository URL
 */
function getRepositoryUrl(config = null) {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return config.repository.url;
}

module.exports = {
  loadRepositoryConfig,
  getNpxCommand,
  getShortRepo,
  getRepositoryUrl
};
