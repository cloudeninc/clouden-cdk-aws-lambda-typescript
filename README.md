# TypeScript Build Step for AWS CDK Lambda Functions

Copyright (C) Clouden Oy 2019, author Kenneth Falck <kennu@clouden.net>.

Released under the MIT license.

## Overview

This is a drop-in wrapper replacement for the AWS CDK Lambda Code asset object to add TypeScript support for Lambda Functions

By using this wrapper, the source asset path is first compiled as TypeScript and the results are saved in
new deploy directory (.deploy), which is then deployed using the standard AWS CDK Lambda Code object.

The TypeScript build involves two steps:

1. Run tsc to build the files in the source path and save output to the deploy path.
2. Copy package.json and package-lock.json from the source path to the deploy path and run npm install there.

The end result of these steps is that the deploy path contains everything needed to deploy the Lambda function.

## Installation

    npm install @clouden-cdk/aws-lambda-typescript

## Usage

Use TypeScriptCode.asset() as a parameter to the code property when creating a Lambda Function.

The path that you provide to asset() should include a package.json file and a tsconfig.json file.

```typescript
import { Function } from '@aws-cdk/aws-lambda'
import { TypeScriptCode } from 'clouden-cdk-typescript-code'

const lambdaFunction = new Function(this, 'TestFunction', {
  functionName: 'test-function',
  code: TypeScriptCode.asset('path/to/lambda-source-code')),
  handler: 'handler.default',
  runtime: lambda.Runtime.NODEJS_10_X,
})
```

## Notes

The TypeScriptCode object keeps track of build paths and only builds each path once per
CDK invocation. It also keeps track of package.json and package-lock.json files and only
runs npm install when they have changed, or when npm install has not yet been run.
