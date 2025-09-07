"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRepositoryConfig = loadRepositoryConfig;
exports.getNpxCommand = getNpxCommand;
exports.getShortRepo = getShortRepo;
exports.getRepositoryUrl = getRepositoryUrl;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Load repository configuration
 */
function loadRepositoryConfig() {
    const configPath = path.join(__dirname, '..', '..', 'config', 'repository.json');
    if (!fs.existsSync(configPath)) {
        throw new Error('Repository configuration not found at: ' + configPath);
    }
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
    }
    catch (error) {
        throw new Error('Failed to parse repository configuration: ' + (error instanceof Error ? error.message : String(error)));
    }
}
/**
 * Get NPX installation command
 */
function getNpxCommand(config) {
    if (!config) {
        config = loadRepositoryConfig();
    }
    return `npx git+${config.repository.url}`;
}
/**
 * Get short repository reference
 */
function getShortRepo(config) {
    if (!config) {
        config = loadRepositoryConfig();
    }
    return config.repository.shortName;
}
/**
 * Get full repository URL
 */
function getRepositoryUrl(config) {
    if (!config) {
        config = loadRepositoryConfig();
    }
    return config.repository.url;
}
//# sourceMappingURL=repository-config.js.map