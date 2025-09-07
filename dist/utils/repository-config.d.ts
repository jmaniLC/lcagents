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
export declare function loadRepositoryConfig(): RepositoryConfig;
/**
 * Get NPX installation command
 */
export declare function getNpxCommand(config?: RepositoryConfig): string;
/**
 * Get short repository reference
 */
export declare function getShortRepo(config?: RepositoryConfig): string;
/**
 * Get full repository URL
 */
export declare function getRepositoryUrl(config?: RepositoryConfig): string;
export {};
//# sourceMappingURL=repository-config.d.ts.map