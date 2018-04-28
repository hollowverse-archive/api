import awsServerlessExpress from 'aws-serverless-express';
import { apiServer } from './server';

const serverPromise = apiServer.then(expressApp =>
  awsServerlessExpress.createServer(expressApp as any, undefined, ['*/*']),
);

export const serveApi: AWSLambda.Handler = async (event, context) =>
  serverPromise.then(async server => {
    // tslint:disable-next-line promise-must-complete
    return new Promise(resolve => {
      // See https://github.com/awslabs/aws-serverless-express/issues/134
      context.succeed = resolve;

      awsServerlessExpress.proxy(server, event, context);
    });
  });
