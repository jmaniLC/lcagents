// Core System Management Types
export interface CoreSystemsRegistry {
  coreSystems: CoreSystemInfo[];
  registryEndpoints: RegistryEndpoint[];
  metadata: RegistryMetadata;
}

export interface CoreSystemInfo {
  name: string;
  version: string;
  description: string;
  type: CoreSystemType;
  source: CoreSystemSource;
  agentCount: number;
  features: string[];
  compatibility: CoreSystemCompatibility;
  isDefault: boolean;
  installation: InstallationInfo;
}

export type CoreSystemType = 'bundled' | 'registry' | 'github' | 'local';

export interface CoreSystemSource {
  type: CoreSystemType;
  path?: string;        // For bundled
  package?: string;     // For registry (npm package name)
  version?: string;     // For registry
  url?: string;         // For github
  ref?: string;         // For github (branch/tag)
}

export interface CoreSystemCompatibility {
  lcagentsMinVersion: string;
  targetAudience: string;
  industries: string[];
}

export interface InstallationInfo {
  requiresInternet: boolean;
  estimatedTime: string;
  diskSpace: string;
}

export interface RegistryEndpoint {
  name: string;
  url: string;
  type: 'npm' | 'lcagents' | 'github';
}

export interface RegistryMetadata {
  version: string;
  lastUpdated: string;
  schemaVersion: string;
}

// Active Core Configuration (for LCA-004)
export interface ActiveCoreConfig {
  activeCore: string;
  availableCores: InstalledCoreInfo[];
  switchHistory: CoreSwitchEvent[];
  lastUpdated: string;
}

export interface InstalledCoreInfo {
  name: string;
  version: string;
  description: string;
  agentCount: number;
  installDate: string;
  source: CoreSystemSource;
  isActive: boolean;
  installPath: string;
}

export interface CoreSwitchEvent {
  from: string;
  to: string;
  timestamp: string;
  reason?: string;
  success: boolean;
}

// Layer Management Types
export interface LayerConfig {
  name: string;
  type: LayerType;
  priority: number;
  readonly: boolean;
  path: string;
}

export type LayerType = 'core' | 'org' | 'custom' | 'runtime';

export interface LayerResolutionResult {
  path: string;
  source: LayerType;
  exists: boolean;
  lastModified?: Date;
}

export interface AgentResolutionPath {
  agentId: string;
  coreSystem: string;
  corePath: string;
  orgOverridePath?: string;
  customOverridePath?: string;
  finalPath: string;
  layerSources: LayerType[];
}

// Resource Resolution Types
export interface ResourceResolver {
  resolveAgent(agentId: string, coreSystem?: string): Promise<AgentResolutionPath>;
  resolveTask(taskId: string, coreSystem?: string): Promise<LayerResolutionResult>;
  resolveTemplate(templateId: string, coreSystem?: string): Promise<LayerResolutionResult>;
  resolveResource(resourceType: string, resourceId: string, coreSystem?: string): Promise<LayerResolutionResult>;
}

// Migration Types
export interface MigrationPlan {
  fromStructure: 'flat' | 'layered';
  toStructure: 'layered' | 'multi-core';
  steps: MigrationStep[];
  backupPath: string;
  estimatedTime: string;
}

export interface MigrationStep {
  type: 'backup' | 'create-directory' | 'move-files' | 'copy-files' | 'generate-config' | 'validate';
  description: string;
  sourcePath?: string;
  targetPath?: string;
  required: boolean;
}

// Installation Types
export interface InstallationOptions {
  force?: boolean;
  coreSystem?: string;
  interactive?: boolean;
  skipGithub?: boolean;
  template?: string;
  customPaths?: Partial<LCAgentsConfig['paths']>;
}

export interface InstallationResult {
  success: boolean;
  coreSystem: string;
  installedPath: string;
  layersCreated: string[];
  configurationPath: string;
  error?: string;
  warnings?: string[];
}

// Core System Management Results
export interface CoreSystemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  compatibility: boolean;
  version?: string;
}

export interface CoreSystemInstallResult {
  success: boolean;
  coreSystem: string;
  version: string;
  installPath: string;
  agentCount: number;
  error?: string;
}

export interface CoreSystemSwitchResult {
  success: boolean;
  fromCore: string;
  toCore: string;
  backupPath?: string;
  error?: string;
  warnings?: string[];
}

// Update the existing LCAgentsConfig to include core system preferences
export interface LCAgentsConfig {
  version: string;
  projectId?: string;
  teamRoles?: Record<string, TeamRole>;
  preferences?: {
    defaultAgent?: string;
    autoUpdate?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    defaultCoreSystem?: string;
    fallbackCoreSystem?: string;
  };
  paths?: {
    agents?: string;
    tasks?: string;
    templates?: string;
    checklists?: string;
    data?: string;
    utils?: string;
    workflows?: string;
    'agent-teams'?: string;
    docs?: string;
    core?: string;           // New: core systems base path
    org?: string;            // New: organization layer path
    custom?: string;         // New: pod customization layer path
    runtime?: string;        // New: runtime resolved resources path
  };
  github?: {
    organization?: string;
    repository?: string;
    integration?: boolean;
    copilotFeatures?: boolean;
    branch?: string;
  };
  customization?: Record<string, any>;
  coreSystem?: {
    active?: string;
    preferences?: Record<string, string>; // agent-id -> core-system
  };
}

export interface TeamRole {
  name: string;
  description: string;
  responsibilities: string[];
  agents: string[];
  preferredCoreSystem?: string; // New: preferred core system for this role
}

export interface TeamRolesConfig {
  name: string;
  githubOrg: string;
  roles: {
    productManagers?: string[];
    developers?: string[];
    qaEngineers?: string[];
    engineeringManagers?: string[];
    architects?: string[];
    admins?: string[];
  };
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DefaultConfig {
  version: string;
  paths: Required<NonNullable<LCAgentsConfig['paths']>>;
  preferences: Required<NonNullable<LCAgentsConfig['preferences']>>;
}
