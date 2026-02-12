import { randomUUID } from "crypto";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.APPLICATIONS_TABLE_NAME;
const DEMO_USER_ID = "demo-user";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const method = event.requestContext?.http?.method;
    const path = event.rawPath;

    if (path !== "/applications") {
      return resp(404, { message: "Not found" });
    }

    if (!TABLE_NAME) {
      return resp(500, { message: "Missing APPLICATIONS_TABLE_NAME env var" });
    }

    if (method === "GET") {
      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": DEMO_USER_ID },
        })
      );

      return resp(200, { items: result.Items ?? [] });
    }

    if (method === "POST") {
      const body = event.body ? safeJson(event.body) : {};
      const company = (body.company ?? "").toString();
      const title = (body.title ?? "").toString();
      const status = body.status?.toString();
      const appliedDate = body.appliedDate?.toString();

      if (!company.trim() || !title.trim()) {
        return resp(400, { message: "company and title are required" });
      }

      const applicationId = randomUUID();

      const item = {
        userId: DEMO_USER_ID,
        applicationId,
        company: company.trim(),
        title: title.trim(),
        status: status ?? "applied",
        appliedDate: appliedDate ?? new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );

      return resp(201, item);
    }

    return resp(405, { message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return resp(500, { message: "Internal server error" });
  }
};

function resp(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function safeJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}