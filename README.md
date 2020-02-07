This is an example [CDK](https://github.com/aws/aws-cdk)
project that demonstrates working with Lambda functions.
You can think of it as an extension of the
[Lambda-CodePipeline example from the official AWS docs](https://docs.aws.amazon.com/de_de/cdk/latest/guide/codepipeline_example.html)
to a more realistic (and thus a little more complicated, and longer) scenario.

# Installation

After checking out the repository, make sure to start with `npm install`.

There is a Lambda Function defined in the [lib/lambda-code](lib/lambda-code) directory -
make sure you also run `npm install` in that directory.

# Application structure

The application is divided into the following CloudFormation Stacks:

1. A Lambda Stack. The Lambda is a NodeJS Lambda with a single dependency
  (to illustrate building non-trivial Lambdas).
  The Lambda is updated using CodeDeploy's blue-green support.
  The Lambda itself is trivial, just prints out the current time in the PST timezone,
  bit it should be enough for our example.
2. The Infrastructure Stack. For this example, this consists of a single SNS Topic
  that subscribes a Lambda from the Lambda Stack to it.
  Because of this, the Infrastructure Stack is a dependency of the Lambda Stack
  (it must be deployed before it).
3. The CodePipeline Stack. We want the application to be have full Continuous Deployment,
  and for that we're using CodePipeline that observes this GitHub repository,
  builds this project,
  and then deploys the Lambda Stack and the Infrastructure Stack
  (in the correct order!) to their "production" environment.

# Goals

We want to make it easy for developers working on this project to
stand up a local development copy of this application,
deployed into some test AWS account.
They shouldn't be forced to test things only after `git push`ing them to production!
This is required for free and easy experimentation before releasing into production.

At the same time, we want the production application to have full Continuous Deployment -
every change to this repository,
whether it's the CDK code, or the Lambda code,
should be automatically built in the Pipeline,
and then deployed to production.

# CDK code structure

The structure of the CDK code is similar to the application structure:

1. There is a [`LambdaStack` class](lib/lambda-stack.ts) that models
  the Lambda Stack. It optionally allows passing a custom `Code` for the Function -
  the default is to take the code directly from the current state of the
  `lib/lambda-code` directory.
2. There is an [`InfrastructureStack` class](lib/infrastructure-stack.ts)
  that models the Infrastructure Stack. It takes in the Lambda to subscribe to the
  SNS Topic that it creates as an input parameter.

# Local development

To deploy a local version of the application,
load your AWS credentials for the test account into the console,
and then execute:

```shell script
$ npm run cdk deploy TestLambdaStack
```

This will deploy first the test `InfrastructureStack`,
and then the test `LambdaStack`
(the CDK tracks the dependency between the Stacks,
and deploys them in the correct order).
