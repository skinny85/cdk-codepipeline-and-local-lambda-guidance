#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LambdaStack } from "../lib/lambda-stack";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();

// These are local development stacks,
// that can be used by developers to test their changes before pushing them.
// We assume these will be deployed to some test account
const testLambdaStack = new LambdaStack(app, 'TestLambdaStack');
new InfrastructureStack(app, 'TestInfraStack', {
  function: testLambdaStack.function,
});
