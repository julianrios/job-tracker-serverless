import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export interface InfraStackProps extends cdk.StackProps {
  stageName: "dev" | "prod";
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const isProd = props.stageName === "prod";

    // --- DynamoDB table (on-demand billing, cheap) ---
    const applicationsTable = new dynamodb.Table(this, `ApplicationsTable-${props.stageName}`, {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "applicationId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // DEV ONLY (safe for learning) // In production, consider RETAIN or SNAPSHOT to avoid data loss
    });

    // --- Lambda: /health ---
    const healthFn = new NodejsFunction(this, "HealthFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/health.ts"),
      handler: "handler",
    });

    // --- Lambda: /applications (CRUD starter) ---
    const applicationsFn = new NodejsFunction(this, "ApplicationsFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/applications.ts"),
      handler: "handler",
      environment: {
        APPLICATIONS_TABLE_NAME: applicationsTable.tableName,
      },
    });

    // Permission: let Lambda read/write the table
    applicationsTable.grantReadWriteData(applicationsFn);

    // --- HTTP API ---
    const api = new HttpApi(this, `JobTrackerApi-${props.stageName}`);;

    api.addRoutes({
      path: "/health",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("HealthIntegration", healthFn),
    });

    api.addRoutes({
      path: "/applications",
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration: new HttpLambdaIntegration("ApplicationsIntegration", applicationsFn),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "unknown",
    });
  }
}