import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import CodepipelineAndLocalLambdaGuidance = require('../lib/codepipeline-and-local-lambda-guidance-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CodepipelineAndLocalLambdaGuidance.CodepipelineAndLocalLambdaGuidanceStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
