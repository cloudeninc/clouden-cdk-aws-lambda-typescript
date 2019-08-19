import { Construct } from '@aws-cdk/core';
import { Code, AssetCode } from '@aws-cdk/aws-lambda';
/**
 * Wrapper for the Code abstract class, which provides some static helper methods.
 */
export declare abstract class TypeScriptCode extends Code {
    static asset(path: string): TypeScriptAssetCode;
}
/**
 * Extension for AssetCode to run a TypeScript build step before deployment.
 */
export declare class TypeScriptAssetCode extends AssetCode {
    private typeScriptSourcePath;
    constructor(path: string);
    bind(construct: Construct): import("@aws-cdk/aws-lambda").CodeConfig;
    private typeScriptBuild;
}
