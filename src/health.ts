import express from 'express';

let isHealthy = true;

export const setIsHealthy = (value: boolean) => {
  isHealthy = value;
};

export const health = express();

health.get('/', (_, res) => {
  res.status(isHealthy ? 200 : 500).send();
});
