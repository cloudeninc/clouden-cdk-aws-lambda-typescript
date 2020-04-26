# TypeScript Build Step for AWS CDK Lambda Functions

Copyright (C) Clouden Oy 2019-2020, author Kenneth Falck <kennu@clouden.net>.

Released under the MIT license.

Versioning indicates compatibility with AWS CDK major and minor versions. 1.35.x will be compatible with
AWS CDK 1.35.x and so on. AWS CDK has recently stabilized significantly and usually this module is compatible
with the latest version.

## Overview

This is a drop-in wrapper replacement for the [AWS CDK](https://github.com/aws/aws-cdk) Lambda Code asset object to add TypeScript support for Lambda Functions

When using this wrapper, the source asset path is first compiled as TypeScript and the results are saved in
new deploy directory (.deploy), which is then deployed using the standard AWS CDK Lambda Code object.

## Installation

    npm install @clouden-cdk/aws-lambda-typescript

## Usage

Use TypeScriptCode.asset('path/to/lambda-source-code') when creating a Lambda Function.

The path that you provide should include at least a package.json file and a tsconfig.json file.

## Options

You can specify an optional options object as a second parameter to customize the npm install
command or to copy additional files to the .deploy directory before deploying the Lambda function.

The default npm install command is `npm install --production`.

The source paths specified with copyFiles are relative to the source directory (given as the first parameter).
The target paths specified with copyFiles are relative to the .deploy directory (Lambda root path).

```typescript
TypeScriptCode.asset('path/to/lambda-source-code', {
  npmInstallCommand: 'npm',
  npmInstallArguments: ['install', '--production'],
  copyFiles: [{
    sourcePath: 'data/file.dat', // relative to source path, can specify a single file only
    targetPath: 'data/file.dat', // relative to .deploy path, can specify a single file only
  }],
})
```

## Example

```typescript
import { Function } from '@aws-cdk/aws-lambda'
import { TypeScriptCode } from '@clouden-cdk/aws-lambda-typescript'

const lambdaFunction = new Function(this, 'TestFunction', {
  functionName: 'test-function',
  code: TypeScriptCode.asset('path/to/lambda-source-code')),
  handler: 'handler.default',
  runtime: lambda.Runtime.NODEJS_12_X,
})
```

Here is an example tsconfig.json file that we use in Clouden projects like [webcat.fi](https://webcat.fi):

```json
{
  "compilerOptions": {
    "target":"ES2017",
    "module": "commonjs",
    "lib": ["es2016", "es2017.object", "es2017.string", "esnext.asynciterable"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "rootDir": "."
  }
}
```

## Notes

The TypeScript build involves three steps:

1. Run tsc to build the files in the source path and save output to the deploy path.
2. Copy any additional files specified with copyFiles to the deploy path.
3. Copy package.json and package-lock.json from the source path to the deploy path and run npm install --production there.

The end result of these steps is that the deploy path contains everything needed to deploy the Lambda function.

The TypeScriptCode object keeps track of build paths and only builds each path once per
CDK invocation. It also keeps track of package.json and package-lock.json files and only
runs npm install when they have changed, or when npm install has not yet been run.
