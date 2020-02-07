#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CodepipelineAndLocalLambdaGuidanceStack } from '../lib/codepipeline-and-local-lambda-guidance-stack';

const app = new cdk.App();
new CodepipelineAndLocalLambdaGuidanceStack(app, 'CodepipelineAndLocalLambdaGuidanceStack');
