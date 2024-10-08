import { Stack, StackProps } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { RestApiConstruct, FunctionConstruct } from "devarchy-cdk";

export class SimpleChatStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    const region = process.env.AWS_REGION || "us-east-1"; //"us-east-2"
    const queryBedrock = new FunctionConstruct(this, "queryBedrock");
    queryBedrock.code(
      async function handler(event) {
        const question = event.prompt;
        const {
          InvokeModelCommand,
          BedrockRuntimeClient,
        } = require("@aws-sdk/client-bedrock-runtime");
        const bedrock = new BedrockRuntimeClient({
          region: process.env.AWS_REGION || "us-east-1",
        });
        async function askClaude(
          message,
          options = { version: "v1", messages: [] }
        ) {
          console.log("ASKING CLAUDE TEXT");
          const versionMap = {
            v1: "anthropic.claude-instant-v1",
            v2: "anthropic.claude-v2",
          };

          const prompt = `${
            options?.messages || ""
          }\n\nHuman: ${message}\nAssistant:`;
          console.log("PROMPT:", prompt);

          const command = new InvokeModelCommand({
            modelId:
              versionMap[options.version] || "anthropic.claude-instant-v1",
            accept: "*/*",
            contentType: "application/json",
            body: JSON.stringify({
              prompt,
              max_tokens_to_sample: 3000,
              temperature: 0.5,
              top_k: 250,
              top_p: 1,
            }),
          });

          const response = await bedrock.send(command).catch((err) => {
            console.log("bedrock error");
            console.error(err);
            throw err;
          });

          const textResponse = JSON.parse(
            // @ts-ignore
            Buffer.from(response.body, "base64").toString("utf8")
          ).completion;
          // console.log('RESPONSE:', textResponse)
          return textResponse.trim();
        }
        const response = await askClaude(question);
        return {
          statusCode: 200,
          body: JSON.stringify({ response }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
          },
        };
      }.toString()
    );
    queryBedrock.handlerFn.addToRolePolicy(
      new PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: [
          `arn:aws:bedrock:${region}::foundation-model/*`,
          // `arn:aws:bedrock:${region}::foundation-model/amazon.titan-*`,
        ],
        effect: Effect.ALLOW,
      })
    );
    queryBedrock.createLayer("bedrockImports", "./layers/bedrockImports");
  }
}
