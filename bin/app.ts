#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { LambdaStack } from "../lib/lambda-stack";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { CodePipelineStack } from "../lib/codepipeline-stack";

const app = new cdk.App();

/*
 * These are local development stacks,
 * that can be used by developers to test their changes before pushing them.
 * We assume these will be deployed to some test account.
 */
const testLambdaStack = new LambdaStack(app, 'TestLambdaStack');
new InfrastructureStack(app, 'TestInfraStack', {
  function: testLambdaStack.function,
});

/*
 * These are the "production" application stacks.
 * We assume these will only by deployed through CodePipeline.
 */
// we need a CfnParametersCode,
// to fill with the results of building the Lambda code in the Pipeline
const cfnParametersCode = lambda.Code.fromCfnParameters();
const prodLambdaStack = new LambdaStack(app, 'ProdLambdaStack', {
  lambdaCode: cfnParametersCode,
});
new InfrastructureStack(app, 'ProdInfraStack', {
  function: prodLambdaStack.function,
});

/*
 * This is the production CodePipeline Stack.
 */
new CodePipelineStack(app, 'ProdCodePipelineStack', {
  lambdaCode: cfnParametersCode,
});
