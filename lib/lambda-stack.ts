import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as path from 'path';

export interface LambdaStackProps extends cdk.StackProps {
  readonly lambdaCode?: lambda.Code;
}

export class LambdaStack extends cdk.Stack {
  public readonly function: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, props: LambdaStackProps = {}) {
    super(scope, id, props);

    const currentDate = new Date().toISOString();

    const func = new lambda.Function(this, 'Lambda', {
      code: props.lambdaCode || lambda.Code.fromAsset(path.join(__dirname, 'lambda-code')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      description: `Function generated on: ${currentDate}`,
    });
    this.function = func;

    const version = func.addVersion(currentDate);
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version,
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }
}
