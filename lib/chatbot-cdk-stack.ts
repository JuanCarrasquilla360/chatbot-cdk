import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApiConstruct,
  WebAppConstruct,
  TinyVectorDBConstruct,
  FunctionConstruct,
} from "devarchy-cdk";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ChatbotCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vectorDB = new TinyVectorDBConstruct(this, "TinyVectorDB");
    const ragHandler = new FunctionConstruct(this, "handler");

    // ragHandler.useLayer(vectorDB.layerName);

    // ragHandler.createLayer("web-knowledge", "./knowledge/db");

    // ragHandler.code(
    //   async function handler(event) {
    //     const fs = require("fs/promises");

    //     const { search, askClaude } = require("/opt/nodejs/lib/tiny-vector");

    //     const { dbName, query, ask } = event;
    //     const res = await search(`/opt/${dbName}`, "samples", query);

    //     const chunks = res.map((res) => {
    //       const noVectorRes = { ...res };
    //       delete noVectorRes.vector;
    //       return noVectorRes;
    //     });

    //     if (!ask) {
    //       return {
    //         event,
    //         chunks,
    //       };
    //     }
    //     const answer =
    //       await askClaude(`Based on the following chunks of documents
    //   <chunks>
    //     ${chunks.map((chunk) => chunk.item).join("\n\n")}
    //   </chunks>

    //   please answer the following question:

    //   <request>
    //     ${query}
    //   </question>
    //   `);

    //     return {
    //       event,
    //       chunks,
    //       answer,
    //     };
    //   }.toString()
    // );

    // ragHandler.handlerFn.addToRolePolicy(vectorDB.titanPolicyStatement);

    // const chatBotApi = new RestApiConstruct(this, "chatbotApi");

    // chatBotApi.cors();

    // const handleQuery = new FunctionConstruct(this, "handleQuery");

    // handleQuery.useLayer(vectorDB.layerName);

    // handleQuery.useLayer("web-knowledge");
    // handleQuery.code(
    //   async function handler(event) {
    //     const fs = require("fs/promises");
    //     const { search, askClaude } = require("/opt/nodejs/lib/tiny-vector");
    //     console.log("event", event);
    //     const isRest = event.body && typeof event.body === "string";
    //     const body = isRest ? JSON.parse(event.body) : event;

    //     // query is to look on the vector db
    //     // question is the question on that topic
    //     const { dbName, query, question } = body;

    //     let chunks;

    //     if (query) {
    //       const res = await search(
    //         `/opt/${dbName || "importdb"}`,
    //         "samples",
    //         query
    //       );
    //       chunks = res.map((res) => {
    //         const noVectorRes = { ...res };
    //         delete noVectorRes.vector;
    //         return noVectorRes;
    //       });
    //     }

    //     let response;
    //     if (!question || question === "") {
    //       response = {
    //         chunks,
    //       };
    //     } else if (!chunks) {
    //       const answer = await askClaude(question);

    //       response = { answer };
    //     } else {
    //       const answer =
    //         await askClaude(`Based on the following chunks of documents
    //     <chunks>
    //       ${chunks
    //         .map(
    //           (chunk, index) => `<chunk index="${index}" ref="${chunk.path}">
    //         ${chunk.item}
    //       </chunk>`
    //         )
    //         .join("\n")}
    //     </chunks>
        
    //     please answer the following request:
        
    //     <request>
    //     ${question}
    //     </request>
    //     `);

    //       response = {
    //         chunks,
    //         answer,
    //       };
    //     }

    //     // [ ] save the whole conversation on S3 so I can look back to see what people is asking

    //     if (!isRest) {
    //       return response;
    //     }

    //     return {
    //       statusCode: 200,
    //       body: JSON.stringify(response),
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Access-Control-Allow-Origin": "*",
    //         "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
    //       },
    //     };
    //   }.toString(),
    //   {
    //     // @ts-ignore
    //     timeout: cdk.Duration.minutes(1),
    //   }
    // );
  }
}
