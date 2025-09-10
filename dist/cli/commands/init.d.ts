import { Command } from 'commander';
import { TechStackData } from '../../utils/techStacker';
/**
 * Ask user for installation directory
 */
export declare function selectInstallationDirectory(): Promise<string>;
/**
 * Validate directory for LCAgents installation
 */
export declare function validateInstallationDirectory(installPath: string): Promise<void>;
/**
 * Get pod information from user
 */
export declare function getPodInformation(): Promise<{
    name: string;
    id: string;
    owner: string;
}>;
/**
 * Analyze tech stack and get repository information
 */
export declare function analyzeTechStackWithContext(installPath: string, podInfo: {
    name: string;
    id: string;
    owner: string;
}): Promise<TechStackData>;
/**
 * Update GitHub Copilot instructions with LCAgents information
 */
export declare function updateGitHubCopilotInstructions(installPath: string, podInfo: {
    name: string;
    id: string;
    owner: string;
}, techStackData: TechStackData): Promise<void>;
export declare const initCommand: Command;
//# sourceMappingURL=init.d.ts.map