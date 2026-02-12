import type { APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ok: true,
      service: "job-tracker-api",
      time: new Date().toISOString(),
    }),
  };
};