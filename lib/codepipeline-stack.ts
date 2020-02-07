import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

export interface PipelineStackProps extends cdk.StackProps {
  readonly lambdaCode: lambda.CfnParametersCode;
}

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');
    new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'ProdCdkCodePipelineForLocalLambdaDevGuidance',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'Source_GitHub',
              output: sourceOutput,
              oauthToken: cdk.SecretValue.secretsManager('my-github-token'),
              owner: 'skinny85',
              repo: 'cdk-codepipeline-and-local-lambda-guidance',
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Build_CodeBuild',
              project: new codebuild.PipelineProject(this, 'Build', {
                buildSpec: codebuild.BuildSpec.fromObject({
                  version: '0.2',
                  phases: {
                    // first, NPM install and run `cdk synth` to generate CloudFormation templates
                    install: {
                      commands: 'npm install',
                    },
                    build: {
                      commands: 'npm run cdk synth',
                    },
                    // then, build the Lambda code
                    post_build: {
                      commands: [
                          'cd lib/lambda-code',
                          'npm install',
                      ],
                    },
                  },
                  // save the generated files in the correct artifacts
                  artifacts: {
                    'secondary-artifacts': {
                      'CdkBuildOutput': {
                        'base-directory': 'cdk.out',
                        files: ['**/*'],
                      },
                      'LambdaBuildOutput': {
                        'base-directory': 'lib/lambda-code',
                        files: ['**/*'],
                      },
                    },
                  },
                }),
              }),
              input: sourceOutput,
              outputs: [cdkBuildOutput, lambdaBuildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            // first, deploy the Infrastructure Stack
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Deploy_Infrastructure_Stack',
              templatePath: cdkBuildOutput.atPath('ProdInfraStack.template.json'),
              stackName: 'ProdInfraStack',
              adminPermissions: true,
            }),
            // then, deploy the Lambda Stack
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Deploy_Lambda_Stack',
              templatePath: cdkBuildOutput.atPath('ProdLambdaStack.template.json'),
              stackName: 'ProdLambdaStack',
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode.assign(lambdaBuildOutput.s3Location),
              },
              extraInputs: [lambdaBuildOutput],
              runOrder: 2,
            }),
          ],
        },
      ],
    });
  }
}
