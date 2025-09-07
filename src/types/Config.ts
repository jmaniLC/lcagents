export interface LCAgentsConfig {
  version: string;
  projectId?: string;
  teamRoles?: Record<string, TeamRole>;
  preferences?: {
    defaultAgent?: string;
    autoUpdate?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
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
  };
  github?: {
    organization?: string;
    repository?: string;
    integration?: boolean;
    copilotFeatures?: boolean;
    branch?: string;
  };
  customization?: Record<string, any>;
}

export interface TeamRole {
  name: string;
  description: string;
  responsibilities: string[];
  agents: string[];
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
