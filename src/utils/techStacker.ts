import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import * as inquirer from 'inquirer';

// Pod configuration interface
interface PodConfig {
    name: string;
    id: string;
    owner: string;
    description: string;
}

interface PodsConfiguration {
    pods: PodConfig[];
    allowCustomPods: boolean;
    customPodOption: {
        name: string;
        description: string;
    };
}

/**
 * Load pod configuration from config file
 */
async function loadPodConfiguration(): Promise<PodsConfiguration> {
    try {
        const configPath = path.join(__dirname, '../../config/pods.json');
        const configContent = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(configContent) as PodsConfiguration;
    } catch (error) {
        console.warn('Warning: Could not load pod configuration, using fallback list');
        // Fallback configuration if file is not found
        return {
            pods: [
                { name: 'Default Pod', id: 'default-pod', owner: 'team-default', description: 'Default development pod' }
            ],
            allowCustomPods: true,
            customPodOption: { name: 'Other - Add new pod', description: 'Create a new pod' }
        };
    }
}

export interface TechStackData {
  stack: string;
  allStacks: string[];
  javaBuildTool?: string | null;
  frameworks: string[];
  buildTools: string[];
  packageManagers: string[];
  databases: string[];
  deployment: string[];
  primaryStack: string;
  workspacePath: string;
  isEmpty: boolean;
  noTechStack: boolean;
  error?: string;
  message?: string;
  // Pod and repository information
  pod: {
    id: string;
    name: string;
    description: string;
    owner: string;
    createdAt: string;
    repositoryCount: number;
  };
  repository: {
    name: string;
    path: string;
    url?: string;
    branch: string;
    lastAnalyzed: string;
    isMainRepo: boolean;
  };
}

/**
 * Allows user to select pod or add a new one
 */
export async function selectPod(): Promise<{ name: string; id: string; owner: string }> {
    const podConfig = await loadPodConfiguration();
    
    // Build choices array from configuration
    const choices = podConfig.pods.map(pod => pod.name);
    if (podConfig.allowCustomPods) {
        choices.push(podConfig.customPodOption.name);
    }

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'selectedPod',
        message: 'Which pod does this repository belong to?',
        choices: choices,
        pageSize: 15
    });

    const selectedPod = answer.selectedPod;

    if (selectedPod === podConfig.customPodOption.name) {
        const customAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'podName',
                message: 'Enter the new pod name:',
                validate: (input) => input.trim().length > 0 || 'Pod name cannot be empty'
            },
            {
                type: 'input',
                name: 'podOwner',
                message: 'Enter the pod owner/team:',
                validate: (input) => input.trim().length > 0 || 'Pod owner cannot be empty'
            }
        ]);

        return {
            name: customAnswer.podName.trim(),
            id: customAnswer.podName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            owner: customAnswer.podOwner.trim()
        };
    } else {
        // Find the selected pod in configuration
        const selectedPodConfig = podConfig.pods.find(pod => pod.name === selectedPod);
        
        if (selectedPodConfig) {
            return {
                name: selectedPodConfig.name,
                id: selectedPodConfig.id,
                owner: selectedPodConfig.owner
            };
        } else {
            // Fallback for backward compatibility
            const parts = selectedPod.split(' - ');
            const teamName = parts[0];
            
            return {
                name: selectedPod,
                id: selectedPod.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                owner: teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')
            };
        }
    }
}

export async function analyzeTechStack(
    workspacePath: string, 
    providedPodInfo?: { name: string; id: string; owner: string }
): Promise<TechStackData> {
    // Helper function to generate pod and repository information
    const generatePodInfo = async (workspacePath: string) => {
        const repoName = path.basename(workspacePath);
        
        // Use provided pod info or interactive selection
        let selectedPod;
        if (providedPodInfo) {
            selectedPod = providedPodInfo;
        } else {
            selectedPod = await selectPod();
        }
        
        const { name: podName, id: podId, owner } = selectedPod;
        
        return {
            pod: {
                id: podId,
                name: podName,
                description: `Development pod for ${podName} and related repositories`,
                owner: owner,
                createdAt: new Date().toISOString(),
                repositoryCount: 3 // Dummy value - could have main repo, docs repo, config repo
            },
            repository: {
                name: repoName,
                path: workspacePath,
                url: `https://github.com/company/${repoName.toLowerCase()}`, // Dummy URL
                branch: 'main',
                lastAnalyzed: new Date().toISOString(),
                isMainRepo: true
            }
        };
    };
    // Helper function to find files matching a pattern
    const find = async (pattern: string): Promise<Array<{ fsPath: string }>> => {
        return new Promise((resolve, reject) => {
            const fullPattern = path.join(workspacePath, pattern);
            glob.glob(fullPattern, { 
                ignore: ['**/node_modules/**'],
                windowsPathsNoEscape: true 
            })
            .then((files: string[]) => {
                resolve(files.map(f => ({ fsPath: f })));
            })
            .catch(reject);
        });
    };

    // Helper function to read file content
    const readFile = async (filePath: { fsPath: string } | string): Promise<string> => {
        try {
            const actualPath = typeof filePath === 'string' ? filePath : filePath.fsPath;
            return await fs.readFile(actualPath, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    let detectedStacks: string[] = [];
    let primaryStack: string | null = null;
    let javaBuildTool: string | null = null;
    let packageManagers: string[] = [];
    let frameworks = new Set<string>();
    let buildTools = new Set<string>();
    let databases = new Set<string>();
    let deployment = new Set<string>();

    console.log(`Analyzing tech stack for workspace: ${path.basename(workspacePath)}`);
    console.log(`Workspace path: ${workspacePath}`);

    // Check if directory is empty or doesn't exist
    try {
        const stats = await fs.stat(workspacePath);
        if (!stats.isDirectory()) {
            throw new Error('Path is not a directory');
        }
        
        const dirContents = await fs.readdir(workspacePath);
        if (dirContents.length === 0) {
            console.log('❌ Directory is empty - cannot analyze tech stack');
            const podInfo = await generatePodInfo(workspacePath);
            return { 
                isEmpty: true, 
                noTechStack: false,
                error: 'Directory is empty',
                message: 'The selected directory is empty. Please choose a directory with source code files to analyze.',
                stack: '',
                allStacks: [],
                frameworks: [],
                buildTools: [],
                packageManagers: [],
                databases: [],
                deployment: [],
                primaryStack: '',
                workspacePath,
                ...podInfo
            };
        }
    } catch (error) {
        console.log('❌ Directory access error:', error instanceof Error ? error.message : String(error));
        const podInfo = await generatePodInfo(workspacePath);
        return { 
            isEmpty: true, 
            noTechStack: false,
            error: error instanceof Error ? error.message : String(error),
            message: `Cannot access directory: ${error instanceof Error ? error.message : String(error)}`,
            stack: '',
            allStacks: [],
            frameworks: [],
            buildTools: [],
            packageManagers: [],
            databases: [],
            deployment: [],
            primaryStack: '',
            workspacePath,
            ...podInfo
        };
    }

    // First, let's do a broad file search to understand the project structure
    try {
        const allFiles = await find('*');
        console.log(`Found ${allFiles.length} files in root directory:`);
        allFiles.slice(0, 20).forEach(file => {
            console.log(`  - ${path.basename(file.fsPath)}`);
        });
        if (allFiles.length > 20) {
            console.log(`  ... and ${allFiles.length - 20} more files`);
        }
    } catch (e) {
        console.error('Error listing files:', e);
    }

    // Look for common configuration files more broadly
    const commonConfigFiles = [
        'package.json', '*/package.json', '**/package.json',
        'requirements.txt', '*/requirements.txt', '**/requirements.txt',
        'pyproject.toml', '*/pyproject.toml', '**/pyproject.toml',
        'Pipfile', '*/Pipfile', '**/Pipfile',
        'setup.py', '*/setup.py', '**/setup.py',
        'pom.xml', '*/pom.xml', '**/pom.xml',
        'build.gradle', '*/build.gradle', '**/build.gradle',
        'Dockerfile', '*/Dockerfile', '**/Dockerfile',
        'docker-compose.yml', '*/docker-compose.yml', '**/docker-compose.yml',
        'go.mod', '*/go.mod', '**/go.mod',
        'Cargo.toml', '*/Cargo.toml', '**/Cargo.toml',
        'Gemfile', '*/Gemfile', '**/Gemfile',
        'composer.json', '*/composer.json', '**/composer.json'
    ];

    console.log('Searching for configuration files...');
    for (const pattern of commonConfigFiles) {
        try {
            const files = await find(pattern);
            if (files.length > 0) {
                console.log(`Found ${files.length} files matching pattern "${pattern}":`);
                files.forEach(file => {
                    const relativePath = path.relative(workspacePath, file.fsPath);
                    console.log(`  - ${relativePath}`);
                });
            }
        } catch (e) {
            console.error(`Error searching for pattern ${pattern}:`, e);
        }
    }

    // JavaScript/TypeScript - Enhanced search
    const packageJsonFiles = await find('**/package.json');
    if (packageJsonFiles.length > 0) {
        try {
            console.log(`Found ${packageJsonFiles.length} package.json files:`);
            packageJsonFiles.forEach(file => {
                const relativePath = path.relative(workspacePath, file.fsPath);
                console.log(`  - ${relativePath}`);
            });
            
            const packageJsonContent = await readFile(packageJsonFiles[0]!);
            const packageJson = JSON.parse(packageJsonContent);
            const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
            
            console.log(`Dependencies found:`, Object.keys(dependencies).slice(0, 10));
            
            let jsFrameworks: string[] = [];
            if (dependencies.react) jsFrameworks.push('React');
            if (dependencies['@angular/core']) jsFrameworks.push('Angular');
            if (dependencies.vue) jsFrameworks.push('Vue');
            if (dependencies.next) jsFrameworks.push('Next.js');
            if (dependencies.svelte) jsFrameworks.push('Svelte');
            if (dependencies.express) jsFrameworks.push('Express');
            if (dependencies['@nestjs/core']) jsFrameworks.push('NestJS');
            if (dependencies.koa) jsFrameworks.push('Koa');
            if (dependencies.fastify) jsFrameworks.push('Fastify');
            if (dependencies.nuxt) jsFrameworks.push('Nuxt.js');
            if (dependencies['@vuepress/core']) jsFrameworks.push('VuePress');
            if (dependencies.gatsby) jsFrameworks.push('Gatsby');
            if (dependencies.vite) buildTools.add('Vite');
            if (dependencies.webpack) buildTools.add('Webpack');
            if (dependencies.rollup) buildTools.add('Rollup');
            if (dependencies.typescript) buildTools.add('TypeScript');
            
            // Package managers
            packageManagers.push('npm');
            if (await fs.pathExists(path.join(workspacePath, 'yarn.lock'))) {
                packageManagers.push('Yarn');
            }
            if (await fs.pathExists(path.join(workspacePath, 'pnpm-lock.yaml'))) {
                packageManagers.push('pnpm');
            }

            jsFrameworks.forEach(fw => frameworks.add(fw));

            let jsStack = 'JavaScript/TypeScript';
            if (jsFrameworks.length > 0) {
                jsStack += ` (${jsFrameworks.join(', ')})`;
            }
            detectedStacks.push(jsStack);
            if (!primaryStack) primaryStack = jsStack;
        } catch (e) {
            console.error('Error parsing package.json', e);
            detectedStacks.push('JavaScript/TypeScript');
            if (!primaryStack) primaryStack = 'JavaScript/TypeScript';
        }
    }

    // Python - Enhanced search
    const requirementsFiles = await find('**/requirements.txt');
    const pyprojectFiles = await find('**/pyproject.toml');
    const pipfileFiles = await find('**/Pipfile');
    const setupPyFiles = await find('**/setup.py');
    const managePyFiles = await find('**/manage.py'); // Django specific
    
    if (requirementsFiles.length > 0 || pyprojectFiles.length > 0 || pipfileFiles.length > 0 || setupPyFiles.length > 0 || managePyFiles.length > 0) {
        console.log(`Found Python project files:`);
        console.log(`  - requirements.txt: ${requirementsFiles.length}`);
        console.log(`  - pyproject.toml: ${pyprojectFiles.length}`);
        console.log(`  - Pipfile: ${pipfileFiles.length}`);
        console.log(`  - setup.py: ${setupPyFiles.length}`);
        console.log(`  - manage.py: ${managePyFiles.length}`);
        
        let pythonFrameworks = new Set<string>();
        
        // Package managers for Python
        if (requirementsFiles.length > 0) packageManagers.push('pip');
        if (pyprojectFiles.length > 0) packageManagers.push('Poetry/pip');
        if (pipfileFiles.length > 0) packageManagers.push('Pipenv');
        
        // Django detection via manage.py
        if (managePyFiles.length > 0) {
            pythonFrameworks.add('Django');
            console.log('Detected Django via manage.py');
        }
        
        try {
            if (requirementsFiles.length > 0) {
                const requirementsContent = await readFile(requirementsFiles[0]!);
                if (/(Django)/i.test(requirementsContent)) pythonFrameworks.add('Django');
                if (/(Flask)/i.test(requirementsContent)) pythonFrameworks.add('Flask');
                if (/(fastapi)/i.test(requirementsContent)) pythonFrameworks.add('FastAPI');
                if (/(tornado)/i.test(requirementsContent)) pythonFrameworks.add('Tornado');
                if (/(pyramid)/i.test(requirementsContent)) pythonFrameworks.add('Pyramid');
                if (/(pandas)/i.test(requirementsContent)) frameworks.add('Pandas');
                if (/(numpy)/i.test(requirementsContent)) frameworks.add('NumPy');
                if (/(tensorflow)/i.test(requirementsContent)) frameworks.add('TensorFlow');
                if (/(pytorch|torch)/i.test(requirementsContent)) frameworks.add('PyTorch');
            }
            if (pyprojectFiles.length > 0) {
                const pyprojectContent = await readFile(pyprojectFiles[0]!);
                if (/(Django)/i.test(pyprojectContent)) pythonFrameworks.add('Django');
                if (/(Flask)/i.test(pyprojectContent)) pythonFrameworks.add('Flask');
                if (/(fastapi)/i.test(pyprojectContent)) pythonFrameworks.add('FastAPI');
                if (/(tornado)/i.test(pyprojectContent)) pythonFrameworks.add('Tornado');
                if (/(pyramid)/i.test(pyprojectContent)) pythonFrameworks.add('Pyramid');
                if (/(pandas)/i.test(pyprojectContent)) frameworks.add('Pandas');
                if (/(numpy)/i.test(pyprojectContent)) frameworks.add('NumPy');
                if (/(tensorflow)/i.test(pyprojectContent)) frameworks.add('TensorFlow');
                if (/(pytorch|torch)/i.test(pyprojectContent)) frameworks.add('PyTorch');
            }
        } catch (e) {
            console.error('Error reading python project files', e);
        }
        
        pythonFrameworks.forEach(fw => frameworks.add(fw));
        
        let pythonStack = 'Python';
        if (pythonFrameworks.size > 0) {
            pythonStack += ` (${[...pythonFrameworks].join(', ')})`;
        }
        detectedStacks.push(pythonStack);
        if (!primaryStack) primaryStack = pythonStack;
    }

    // Java - Enhanced search
    const pomFiles = await find('**/pom.xml');
    const gradleFiles = await find('**/build.gradle');
    const gradleKtsFiles = await find('**/build.gradle.kts');
    if (pomFiles.length > 0 || gradleFiles.length > 0 || gradleKtsFiles.length > 0) {
        console.log(`Found Java project files:`);
        console.log(`  - pom.xml: ${pomFiles.length}`);
        console.log(`  - build.gradle: ${gradleFiles.length}`);
        console.log(`  - build.gradle.kts: ${gradleKtsFiles.length}`);
        
        let buildTool = pomFiles.length > 0 ? 'Maven' : 'Gradle';
        let javaFrameworks = new Set<string>();
        
        if (buildTool === 'Maven') packageManagers.push('Maven');
        if (buildTool === 'Gradle') packageManagers.push('Gradle');
        buildTools.add(buildTool);
        
        try {
            if (pomFiles.length > 0) {
                const pomContent = await readFile(pomFiles[0]!);
                if (pomContent.includes('spring-boot')) javaFrameworks.add('Spring Boot');
                if (pomContent.includes('quarkus')) javaFrameworks.add('Quarkus');
                if (pomContent.includes('micronaut')) javaFrameworks.add('Micronaut');
            }
            const allGradleFiles = [...gradleFiles, ...gradleKtsFiles];
            if (allGradleFiles.length > 0) {
                const gradleContent = await readFile(allGradleFiles[0]!);
                if (gradleContent.includes('spring-boot')) javaFrameworks.add('Spring Boot');
                if (gradleContent.includes('quarkus')) javaFrameworks.add('Quarkus');
                if (gradleContent.includes('micronaut')) javaFrameworks.add('Micronaut');
            }
        } catch (e) {
            console.error('Error reading java project files', e);
        }
        
        javaFrameworks.forEach(fw => frameworks.add(fw));
        
        let stackName = `Java (${buildTool})`;
        if (javaFrameworks.size > 0) {
            stackName += ` with ${[...javaFrameworks].join(', ')}`;
        }
        detectedStacks.push(stackName);
        if (!primaryStack) primaryStack = stackName;
        javaBuildTool = buildTool;
    }

    // .NET
    const csharpProj = await find('**/*.csproj');
    const fsharpProj = await find('**/*.fsproj');
    if (csharpProj.length > 0 || fsharpProj.length > 0) {
        console.log(`Found .NET project files: .csproj(${csharpProj.length}), .fsproj(${fsharpProj.length})`);
        let projectType = csharpProj.length > 0 ? 'C#' : 'F#';
        detectedStacks.push(`.NET (${projectType})`);
        if (!primaryStack) primaryStack = `.NET (${projectType})`;
    }

    // Go
    const goModFiles = await find('**/go.mod');
    if (goModFiles.length > 0) {
        console.log(`Found Go project files: go.mod(${goModFiles.length})`);
        detectedStacks.push('Go');
        if (!primaryStack) primaryStack = 'Go';
    }

    // Ruby
    const gemfiles = await find('**/Gemfile');
    if (gemfiles.length > 0) {
        console.log(`Found Ruby project files: Gemfile(${gemfiles.length})`);
        detectedStacks.push('Ruby');
        if (!primaryStack) primaryStack = 'Ruby';
    }

    // PHP
    const composerJsonFiles = await find('**/composer.json');
    if (composerJsonFiles.length > 0) {
        console.log(`Found PHP project files: composer.json(${composerJsonFiles.length})`);
        detectedStacks.push('PHP');
        if (!primaryStack) primaryStack = 'PHP';
    }

    // Rust
    const cargoTomlFiles = await find('**/Cargo.toml');
    if (cargoTomlFiles.length > 0) {
        console.log(`Found Rust project files: Cargo.toml(${cargoTomlFiles.length})`);
        detectedStacks.push('Rust');
        if (!primaryStack) primaryStack = 'Rust';
    }

    // Additional technology detection
    const dockerFiles = await find('**/Dockerfile');
    const dockerComposeFiles = await find('**/docker-compose.yml');
    const dockerComposeYamlFiles = await find('**/docker-compose.yaml');
    const k8sFiles = await find('**/*.yaml');
    
    console.log(`Found containerization files:`);
    console.log(`  - Dockerfile: ${dockerFiles.length}`);
    console.log(`  - docker-compose.yml: ${dockerComposeFiles.length}`);
    console.log(`  - docker-compose.yaml: ${dockerComposeYamlFiles.length}`);
    
    let additionalTechs: string[] = [];
    if (dockerFiles.length > 0 || dockerComposeFiles.length > 0 || dockerComposeYamlFiles.length > 0) {
        additionalTechs.push('Docker');
        deployment.add('Docker');
    }
    
    // Check for Kubernetes
    try {
        for (const yamlFile of k8sFiles.slice(0, 5)) { // Check first 5 yaml files
            const content = await readFile(yamlFile);
            if (content.includes('apiVersion:') && content.includes('kind:')) {
                deployment.add('Kubernetes');
                additionalTechs.push('Kubernetes');
                break;
            }
        }
    } catch (e) {
        // Ignore YAML parsing errors
    }

    // Database detection
    const dbFiles = await find('**/*.sql');
    if (dbFiles.length > 0) databases.add('SQL Database');
    
    // Check for database configs in various files
    try {
        const configPatterns = ['**/*.env', '**/.env*', '**/application.properties', '**/application.yml'];
        for (const pattern of configPatterns) {
            const files = await find(pattern);
            for (const file of files.slice(0, 3)) {
                const content = await readFile(file);
                if (/(mongodb|mongo)/i.test(content)) databases.add('MongoDB');
                if (/(postgresql|postgres)/i.test(content)) databases.add('PostgreSQL');
                if (/(mysql)/i.test(content)) databases.add('MySQL');
                if (/(redis)/i.test(content)) databases.add('Redis');
                if (/(elasticsearch)/i.test(content)) databases.add('Elasticsearch');
            }
        }
    } catch (e) {
        // Ignore config file errors
    }

    console.log(`Final detected tech stacks: ${detectedStacks.join(', ')}`);
    console.log(`Additional technologies: ${additionalTechs.join(', ')}`);

    if (detectedStacks.length === 0) {
        console.log('❌ No technology stack detected - this might indicate:');
        console.log('  1. The project uses an unsupported technology stack');
        console.log('  2. The project files are in subdirectories not being scanned');
        console.log('  3. The project structure is non-standard');
        console.log('  4. The directory contains non-code files only');
        const podInfo = await generatePodInfo(workspacePath);
        return { 
            isEmpty: false, 
            noTechStack: true,
            error: 'No recognized technology stack found',
            message: 'No recognized technology stack found in the selected directory. This may not be a suitable directory for lcagents installation.',
            stack: '',
            allStacks: [],
            frameworks: [],
            buildTools: [],
            packageManagers: [],
            databases: [],
            deployment: [],
            primaryStack: '',
            workspacePath,
            ...podInfo
        };
    }

    // For multi-stack projects, create a combined description
    let finalStack = primaryStack || '';
    if (detectedStacks.length > 1) {
        finalStack = `Multi-stack: ${detectedStacks.join(' + ')}`;
    }

    if (additionalTechs.length > 0) {
        finalStack += ` (${additionalTechs.join(', ')})`;
    }

    const podInfo = await generatePodInfo(workspacePath);
    return { 
        stack: finalStack, 
        allStacks: detectedStacks, 
        javaBuildTool,
        frameworks: [...frameworks],
        buildTools: [...buildTools],
        packageManagers: [...new Set(packageManagers)],
        databases: [...databases],
        deployment: [...deployment],
        primaryStack: primaryStack || '',
        workspacePath,
        isEmpty: false,
        noTechStack: false,
        ...podInfo
    };
}

/**
 * Generate detailed tech stack report for technical preferences
 */
export function generateTechStackReport(techStackData: TechStackData): string | null {
    if (!techStackData || techStackData.isEmpty || techStackData.noTechStack) {
        return null;
    }

    const report = `# Technical Preferences and Stack Analysis

Generated on: ${new Date().toISOString()}
Workspace: ${techStackData.workspacePath}

## Pod Information
**Pod ID**: ${techStackData.pod.id}  
**Pod Name**: ${techStackData.pod.name}  
**Description**: ${techStackData.pod.description}  
**Owner**: ${techStackData.pod.owner}  
**Created**: ${techStackData.pod.createdAt}  
**Repository Count**: ${techStackData.pod.repositoryCount}  

## Repository Information
**Repository Name**: ${techStackData.repository.name}  
**Path**: ${techStackData.repository.path}  
**URL**: ${techStackData.repository.url || 'Not specified'}  
**Branch**: ${techStackData.repository.branch}  
**Last Analyzed**: ${techStackData.repository.lastAnalyzed}  
**Main Repository**: ${techStackData.repository.isMainRepo ? 'Yes' : 'No'}  

## Primary Technology Stack
${techStackData.primaryStack}

## All Detected Stacks
${techStackData.allStacks.map(stack => `- ${stack}`).join('\n')}

## Frameworks and Libraries
${techStackData.frameworks.length > 0 ? techStackData.frameworks.map(fw => `- ${fw}`).join('\n') : 'None detected'}

## Build Tools
${techStackData.buildTools.length > 0 ? techStackData.buildTools.map(tool => `- ${tool}`).join('\n') : 'None detected'}

## Package Managers
${techStackData.packageManagers.length > 0 ? techStackData.packageManagers.map(pm => `- ${pm}`).join('\n') : 'None detected'}

## Databases
${techStackData.databases.length > 0 ? techStackData.databases.map(db => `- ${db}`).join('\n') : 'None detected'}

## Deployment Technologies
${techStackData.deployment.length > 0 ? techStackData.deployment.map(dep => `- ${dep}`).join('\n') : 'None detected'}

## Analysis Summary
This project appears to be a ${techStackData.primaryStack} project${techStackData.allStacks.length > 1 ? ' with multiple technology stacks' : ''}. 

### Recommended LCAgents Configuration
Based on the detected stack, the following configurations are recommended:
- **Core System**: bmad-core (default)
- **Documentation Focus**: ${getDomainFocus(techStackData.primaryStack)}
- **Integration Points**: ${getIntegrationRecommendations(techStackData)}

---
*This analysis was performed automatically by LCAgents tech stack analyzer*
`;

    return report;
}

/**
 * Get domain focus based on primary stack
 */
function getDomainFocus(primaryStack: string): string {
    if (primaryStack.includes('React') || primaryStack.includes('Angular') || primaryStack.includes('Vue')) {
        return 'Frontend development, UI/UX patterns, component architecture';
    } else if (primaryStack.includes('Express') || primaryStack.includes('NestJS') || primaryStack.includes('FastAPI')) {
        return 'API development, backend services, microservices architecture';
    } else if (primaryStack.includes('Django') || primaryStack.includes('Flask')) {
        return 'Web application development, MVC patterns, data modeling';
    } else if (primaryStack.includes('Java')) {
        return 'Enterprise application development, service architecture, design patterns';
    } else if (primaryStack.includes('Python')) {
        return 'Data processing, automation, scripting, and application development';
    }
    return 'General software development best practices';
}

/**
 * Get integration recommendations based on tech stack
 */
function getIntegrationRecommendations(techStackData: TechStackData): string {
    const recommendations: string[] = [];
    
    if (techStackData.deployment.includes('Docker')) {
        recommendations.push('Container-based development workflow');
    }
    if (techStackData.deployment.includes('Kubernetes')) {
        recommendations.push('Cloud-native deployment patterns');
    }
    if (techStackData.databases.length > 0) {
        recommendations.push('Database schema evolution tracking');
    }
    if (techStackData.buildTools.includes('TypeScript')) {
        recommendations.push('Type-safe development practices');
    }
    
    return recommendations.length > 0 ? recommendations.join(', ') : 'Standard development workflow';
}
