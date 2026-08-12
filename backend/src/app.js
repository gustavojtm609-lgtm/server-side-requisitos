import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import routes from './routes/index.js';
import { ApiError } from './utils/ApiError.js';

export const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(ApiError.forbidden('Origem não permitida pelo CORS.', 'CORS_DENIED'));
    },
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(apiRateLimiter);
app.use('/api/v1', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
