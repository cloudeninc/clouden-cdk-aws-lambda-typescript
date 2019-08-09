"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const pathModule = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const typeScriptAlreadyBuilt = []; // list of source code paths already built in this session
/**
 * Wrapper for the Code abstract class, which provides some static helper methods.
 */
class TypeScriptCode extends aws_lambda_1.Code {
    static asset(path) {
        return new TypeScriptAssetCode(path);
    }
}
exports.TypeScriptCode = TypeScriptCode;
/**
 * Extension for AssetCode to run a TypeScript build step before deployment.
 */
class TypeScriptAssetCode extends aws_lambda_1.AssetCode {
    constructor(path) {
        // Add a .deploy subfolder which contains the built files and is deployed to S3
        super(pathModule.join(path, '.deploy'));
        // Remember the original source folder
        this.typeScriptSourcePath = path;
    }
    bind(construct) {
        this.typeScriptBuild();
        return super.bind(construct);
    }
    typeScriptBuild() {
        // Keep track of which folders have already been built
        if (typeScriptAlreadyBuilt.includes(this.typeScriptSourcePath)) {
            return;
        }
        typeScriptAlreadyBuilt.push(this.typeScriptSourcePath);
        // Run the TypeScript compiler
        const tscChild = child_process.spawnSync('npx', ['tsc', '--outDir', this.path], {
            cwd: this.typeScriptSourcePath,
            stdio: 'inherit',
        });
        if (tscChild.error) {
            throw tscChild.error;
        }
        if (tscChild.status !== 0) {
            throw new Error('TypeScript compiler error: ' + tscChild.status);
        }
        function readFileSyncOrNull(filepath, encoding) {
            try {
                return fs.readFileSync(filepath, encoding);
            }
            catch (err) {
                if (err.code === 'ENOENT')
                    return null;
                else
                    throw err;
            }
        }
        // Run NPM package install so that the Lambda function gets all dependencies - unless we've already run it
        // Ensure the deploy path exists
        try {
            fs.mkdirSync(this.path);
        }
        catch (err) {
            // ignore errors
        }
        // New versions in source path
        const newPackageLockData = readFileSyncOrNull(pathModule.join(this.typeScriptSourcePath, 'package-lock.json'), 'utf8');
        const newPackageData = readFileSyncOrNull(pathModule.join(this.typeScriptSourcePath, 'package.json'), 'utf8');
        // Old versions in deploy path (if any)
        const oldPackageLockData = readFileSyncOrNull(pathModule.join(this.path, 'package-lock.json'), 'utf8');
        const oldPackageData = readFileSyncOrNull(pathModule.join(this.path, 'package.json'), 'utf8');
        if (newPackageData && (newPackageData !== oldPackageData || newPackageLockData !== oldPackageLockData)) {
            // We have a package.json, and either package.json or package-lock.json has changed since last build, or no build done yet
            fs.writeFileSync(pathModule.join(this.path, 'package-lock.json'), newPackageLockData, 'utf8');
            fs.writeFileSync(pathModule.join(this.path, 'package.json'), newPackageData, 'utf8');
            // Execute npm install
            const npmChild = child_process.spawnSync('npm', ['install', '--production'], {
                cwd: this.path,
                stdio: 'inherit',
            });
            if (npmChild.error) {
                throw npmChild.error;
            }
            if (npmChild.status !== 0) {
                throw new Error('TypeScript compiler error: ' + npmChild.status);
            }
        }
    }
}
exports.TypeScriptAssetCode = TypeScriptAssetCode;
