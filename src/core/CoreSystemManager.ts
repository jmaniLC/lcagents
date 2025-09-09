import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  CoreSystemsRegistry, 
  CoreSystemInfo, 
  ActiveCoreConfig, 
  InstalledCoreInfo,
  CoreSystemValidationResult,
  CoreSystemInstallResult,
  CoreSystemSwitchResult,
  CoreSwitchEvent,
  CoreSystemSource
} from '../types/CoreSystem';

export class CoreSystemManager {
  private readonly basePath: string;
  private readonly coreBasePath: string;
  private readonly activeCoreConfigPath: string;
  private readonly coreSystemsRegistryPath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.coreBasePath = path.join(basePath, '.lcagents', 'core');
    this.activeCoreConfigPath = path.join(this.coreBasePath, 'active-core.json');
    this.coreSystemsRegistryPath = path.join(__dirname, '../../config/core-systems.json');
  }

  /**
   * Get available core systems from registry
   */
  async getAvailableCoreSystems(): Promise<CoreSystemInfo[]> {
    try {
      const registryContent = await fs.readFile(this.coreSystemsRegistryPath, 'utf-8');
      const registry: CoreSystemsRegistry = JSON.parse(registryContent);
      return registry.coreSystems;
    } catch (error) {
      console.warn('Failed to load core systems registry:', error);
      return [];
    }
  }

  /**
   * Get currently installed core systems
   */
  async getInstalledCoreSystems(): Promise<InstalledCoreInfo[]> {
    try {
      if (!await fs.pathExists(this.activeCoreConfigPath)) {
        return [];
      }

      const configContent = await fs.readFile(this.activeCoreConfigPath, 'utf-8');
      const activeConfig: ActiveCoreConfig = JSON.parse(configContent);
      return activeConfig.availableCores;
    } catch (error) {
      console.warn('Failed to load installed core systems:', error);
      return [];
    }
  }

  /**
   * Get currently active core system
   */
  async getActiveCoreSystem(): Promise<string | null> {
    try {
      if (!await fs.pathExists(this.activeCoreConfigPath)) {
        return null;
      }

      const configContent = await fs.readFile(this.activeCoreConfigPath, 'utf-8');
      const activeConfig: ActiveCoreConfig = JSON.parse(configContent);
      return activeConfig.activeCore;
    } catch (error) {
      console.warn('Failed to get active core system:', error);
      return null;
    }
  }

  /**
   * Get active core configuration
   */
  async getActiveCoreConfig(): Promise<ActiveCoreConfig | null> {
    try {
      if (!await fs.pathExists(this.activeCoreConfigPath)) {
        return null;
      }

      const configContent = await fs.readFile(this.activeCoreConfigPath, 'utf-8');
      const activeConfig: ActiveCoreConfig = JSON.parse(configContent);
      return activeConfig;
    } catch (error) {
      console.warn('Failed to get active core configuration:', error);
      return null;
    }
  }

  /**
   * Install a core system
   */
  async installCoreSystem(
    coreSystemName: string, 
    force: boolean = false
  ): Promise<CoreSystemInstallResult> {
    try {
      // Get core system info from registry
      const availableSystems = await this.getAvailableCoreSystems();
      const systemInfo = availableSystems.find(s => s.name === coreSystemName);
      
      if (!systemInfo) {
        return {
          success: false,
          coreSystem: coreSystemName,
          version: '',
          installPath: '',
          agentCount: 0,
          error: `Core system '${coreSystemName}' not found in registry`
        };
      }

      const targetPath = path.join(this.coreBasePath, `.${coreSystemName}`);

      // Check if already installed
      if (await fs.pathExists(targetPath) && !force) {
        return {
          success: false,
          coreSystem: coreSystemName,
          version: systemInfo.version,
          installPath: targetPath,
          agentCount: systemInfo.agentCount,
          error: `Core system '${coreSystemName}' already installed. Use --force to overwrite.`
        };
      }

      // Ensure core directory exists
      await fs.ensureDir(this.coreBasePath);

      // Install based on source type
      await this.installFromSource(systemInfo.source, targetPath);

      // Create version.json for the installed core system
      const versionInfo = {
        name: systemInfo.name,
        version: systemInfo.version,
        description: systemInfo.description,
        agentCount: systemInfo.agentCount,
        installDate: new Date().toISOString(),
        source: systemInfo.source
      };

      await fs.writeFile(
        path.join(targetPath, 'version.json'),
        JSON.stringify(versionInfo, null, 2)
      );

      // Register the installed core system
      await this.registerInstalledCoreSystem({
        name: systemInfo.name,
        version: systemInfo.version,
        description: systemInfo.description,
        agentCount: systemInfo.agentCount,
        installDate: new Date().toISOString(),
        source: systemInfo.source,
        isActive: false,
        installPath: targetPath
      });

      return {
        success: true,
        coreSystem: coreSystemName,
        version: systemInfo.version,
        installPath: targetPath,
        agentCount: systemInfo.agentCount
      };

    } catch (error) {
      return {
        success: false,
        coreSystem: coreSystemName,
        version: '',
        installPath: '',
        agentCount: 0,
        error: `Installation failed: ${error}`
      };
    }
  }

  /**
   * Install core system from source
   */
  private async installFromSource(source: CoreSystemSource, targetPath: string): Promise<void> {
    switch (source.type) {
      case 'bundled':
        await this.installFromBundled(source.path!, targetPath);
        break;
      case 'registry':
        await this.installFromRegistry(source.package!, source.version!, targetPath);
        break;
      case 'github':
        await this.installFromGitHub(source.url!, source.ref || 'main', targetPath);
        break;
      case 'local':
        await this.installFromLocal(source.path!, targetPath);
        break;
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Install from bundled resources (current BMAD-Core)
   */
  private async installFromBundled(resourcePath: string, targetPath: string): Promise<void> {
    const sourcePath = path.join(__dirname, '../../', resourcePath);
    
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Bundled resources not found at: ${sourcePath}`);
    }

    // Copy resources directly to target path (which already has dot prefix)
    await fs.copy(sourcePath, targetPath);
  }

  /**
   * Install from npm registry
   */
  private async installFromRegistry(_packageName: string, _version: string, _targetPath: string): Promise<void> {
    // This would require npm/yarn to be installed and would execute:
    // npm pack @package/name@version
    // tar -xf package.tgz
    // copy to targetPath
    throw new Error('Registry installation not yet implemented');
  }

  /**
   * Install from GitHub repository
   */
  private async installFromGitHub(_url: string, _ref: string, _targetPath: string): Promise<void> {
    // This would require git to be installed and would execute:
    // git clone --depth 1 --branch ${ref} ${url} ${targetPath}
    throw new Error('GitHub installation not yet implemented');
  }

  /**
   * Install from local directory
   */
  private async installFromLocal(sourcePath: string, targetPath: string): Promise<void> {
    if (!await fs.pathExists(sourcePath)) {
      throw new Error(`Local source not found: ${sourcePath}`);
    }
    
    await fs.copy(sourcePath, targetPath);
  }

  /**
   * Switch active core system
   */
  async switchCoreSystem(
    targetCore: string, 
    reason?: string
  ): Promise<CoreSystemSwitchResult> {
    try {
      const installedSystems = await this.getInstalledCoreSystems();
      const targetSystem = installedSystems.find(s => s.name === targetCore);

      if (!targetSystem) {
        return {
          success: false,
          fromCore: '',
          toCore: targetCore,
          error: `Core system '${targetCore}' is not installed`
        };
      }

      const currentActive = await this.getActiveCoreSystem();
      
      // Validate switch compatibility
      const validation = await this.validateCoreSystemSwitch(targetCore);
      if (!validation.isValid) {
        return {
          success: false,
          fromCore: currentActive || '',
          toCore: targetCore,
          error: `Switch validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Create backup if needed
      const backupPath = await this.createSwitchBackup(currentActive);

      // Update active core configuration
      await this.updateActiveCoreConfig(targetCore, reason, currentActive);

      // Rebuild runtime cache (this would be implemented in LayerManager)
      await this.rebuildRuntimeCache();

      return {
        success: true,
        fromCore: currentActive || '',
        toCore: targetCore,
        ...(backupPath && { backupPath })
      };

    } catch (error) {
      return {
        success: false,
        fromCore: '',
        toCore: targetCore,
        error: `Switch failed: ${error}`
      };
    }
  }

  /**
   * Validate core system switch
   */
  private async validateCoreSystemSwitch(targetCore: string): Promise<CoreSystemValidationResult> {
    // This would perform various validation checks:
    // - Target core exists and is properly installed
    // - No conflicting customizations
    // - All required dependencies are available
    // For now, just basic validation
    
    const installedSystems = await this.getInstalledCoreSystems();
    const targetExists = installedSystems.some(s => s.name === targetCore);
    
    if (!targetExists) {
      return {
        isValid: false,
        errors: [`Target core system '${targetCore}' is not installed`],
        warnings: [],
        compatibility: false
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [],
      compatibility: true
    };
  }

  /**
   * Create backup before switching
   */
  private async createSwitchBackup(currentCore: string | null): Promise<string | undefined> {
    if (!currentCore) return undefined;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.basePath, '.lcagents', 'backups', `switch-${timestamp}`);
    
    await fs.ensureDir(backupPath);
    
    // Backup current runtime configuration
    const runtimePath = path.join(this.basePath, '.lcagents', 'runtime');
    if (await fs.pathExists(runtimePath)) {
      await fs.copy(runtimePath, path.join(backupPath, 'runtime'));
    }

    return backupPath;
  }

  /**
   * Update active core configuration
   */
  private async updateActiveCoreConfig(
    newActiveCore: string, 
    reason?: string,
    previousCore?: string | null
  ): Promise<void> {
    const installedSystems = await this.getInstalledCoreSystems();
    
    // Update isActive flag
    installedSystems.forEach(system => {
      system.isActive = system.name === newActiveCore;
    });

    const switchEvent: CoreSwitchEvent = {
      from: previousCore || '',
      to: newActiveCore,
      timestamp: new Date().toISOString(),
      success: true,
      ...(reason && { reason })
    };

    let activeConfig: ActiveCoreConfig;
    
    if (await fs.pathExists(this.activeCoreConfigPath)) {
      const content = await fs.readFile(this.activeCoreConfigPath, 'utf-8');
      activeConfig = JSON.parse(content);
      activeConfig.switchHistory.push(switchEvent);
    } else {
      activeConfig = {
        activeCore: newActiveCore,
        availableCores: [],
        switchHistory: [switchEvent],
        lastUpdated: new Date().toISOString()
      };
    }

    activeConfig.activeCore = newActiveCore;
    activeConfig.availableCores = installedSystems;
    activeConfig.lastUpdated = new Date().toISOString();

    await fs.writeFile(
      this.activeCoreConfigPath,
      JSON.stringify(activeConfig, null, 2)
    );
  }

  /**
   * Register newly installed core system
   */
  private async registerInstalledCoreSystem(coreInfo: InstalledCoreInfo): Promise<void> {
    await fs.ensureDir(this.coreBasePath);

    let activeConfig: ActiveCoreConfig;
    
    if (await fs.pathExists(this.activeCoreConfigPath)) {
      const content = await fs.readFile(this.activeCoreConfigPath, 'utf-8');
      activeConfig = JSON.parse(content);
    } else {
      activeConfig = {
        activeCore: '',
        availableCores: [],
        switchHistory: [],
        lastUpdated: new Date().toISOString()
      };
    }

    // Remove if already exists, then add
    activeConfig.availableCores = activeConfig.availableCores.filter(
      c => c.name !== coreInfo.name
    );
    activeConfig.availableCores.push(coreInfo);
    activeConfig.lastUpdated = new Date().toISOString();

    await fs.writeFile(
      this.activeCoreConfigPath,
      JSON.stringify(activeConfig, null, 2)
    );
  }

  /**
   * Rebuild runtime cache after core system change
   */
  private async rebuildRuntimeCache(): Promise<void> {
    // This would be implemented in coordination with LayerManager
    // For now, just create the runtime directory structure
    const runtimePath = path.join(this.basePath, '.lcagents', 'runtime');
    await fs.ensureDir(path.join(runtimePath, 'merged-agents'));
    await fs.ensureDir(path.join(runtimePath, 'cache'));
    await fs.ensureDir(path.join(runtimePath, 'logs'));
  }

  /**
   * Get default core system name
   */
  async getDefaultCoreSystem(): Promise<string> {
    const availableSystems = await this.getAvailableCoreSystems();
    const defaultSystem = availableSystems.find(s => s.isDefault);
    return defaultSystem ? defaultSystem.name : 'bmad-core';
  }

  /**
   * Validate core system structure
   */
  async validateCoreSystemStructure(coreSystemPath: string): Promise<CoreSystemValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const requiredDirs = ['agents', 'tasks', 'templates'];
    const optionalDirs = ['checklists', 'data', 'utils', 'workflows', 'agent-teams'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(coreSystemPath, dir);
      if (!await fs.pathExists(dirPath)) {
        errors.push(`Required directory missing: ${dir}`);
      }
    }

    for (const dir of optionalDirs) {
      const dirPath = path.join(coreSystemPath, dir);
      if (!await fs.pathExists(dirPath)) {
        warnings.push(`Optional directory missing: ${dir}`);
      }
    }

    const versionJsonPath = path.join(coreSystemPath, 'version.json');
    let version = '1.0.0-alpha.1'; // Default version
    
    if (!await fs.pathExists(versionJsonPath)) {
      warnings.push('version.json file missing');
    } else {
      try {
        const versionContent = await fs.readFile(versionJsonPath, 'utf-8');
        const versionInfo = JSON.parse(versionContent);
        version = versionInfo.version || version;
      } catch (error) {
        warnings.push('Could not read version.json');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      compatibility: true,
      version
    };
  }
}
