import awsServerlessExpress from "aws-serverless-express";
import app from "./src/server.js";
const server = awsServerlessExpress.createServer(app);

export const handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
