import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import CacheService from './services/CacheService';
import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';
import { requestLogger } from './middleware/logger';
import { startUpdateCronJob } from './jobs/updateCharacters';
import { swaggerSpec } from './config/swagger';
import healthRouter from './routes/health';
import './routes/graphql.docs';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000');

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(requestLogger);

  app.use(healthRouter);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Rick & Morty API Docs',
      customCss: `
        .topbar { background-color: #1a1a2e !important; }
        .topbar-wrapper img { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Ctext y='24' font-size='20' fill='%2397ce4c' font-family='sans-serif' font-weight='bold'%3ERick %26 Morty API%3C/text%3E%3C/svg%3E"); width: 200px; }
        .swagger-ui .info .title { color: #97ce4c; }
      `,
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
      },
    })
  );

  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    context: ({ req }) => ({ req }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as Parameters<typeof apolloServer.applyMiddleware>[0]['app'], path: '/graphql', cors: false });

  await sequelize.authenticate();
  console.log('✅ PostgreSQL connected');

  await CacheService.connect();

  startUpdateCronJob();

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`📖 Swagger Docs:       http://localhost:${PORT}/api-docs`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
