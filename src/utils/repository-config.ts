import * as fs from 'fs';
import * as path from 'path';

interface RepositoryConfig {
  repository: {
    url: string;
    shortName: string;
    owner: string;
    name: string;
  };
  author: {
    name: string;
    email: string;
  };
  organization: string;
  license: string;
}

/**
 * Load repository configuration
 */
export function loadRepositoryConfig(): RepositoryConfig {
  const configPath = path.join(__dirname, '..', '..', 'config', 'repository.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('Repository configuration not found at: ' + configPath);
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error('Failed to parse repository configuration: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get NPX installation command
 */
export function getNpxCommand(config?: RepositoryConfig): string {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return `npx git+${config.repository.url}`;
}

/**
 * Get short repository reference
 */
export function getShortRepo(config?: RepositoryConfig): string {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return config.repository.shortName;
}

/**
 * Get full repository URL
 */
export function getRepositoryUrl(config?: RepositoryConfig): string {
  if (!config) {
    config = loadRepositoryConfig();
  }
  return config.repository.url;
}
