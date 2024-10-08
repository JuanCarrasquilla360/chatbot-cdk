#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ChatbotCdkStack } from "../lib/chatbot-cdk-stack";
import { SimpleChatStack } from "../lib/simpleChatStack";

const app = new cdk.App();
new ChatbotCdkStack(app, "ChatbotCdkStack", {});
new SimpleChatStack(app, "SimpleChatStack", { env: { region: "us-east-1" } });
