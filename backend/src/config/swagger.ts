import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Rick & Morty Explorer API',
      version: '1.0.0',
      description: `
## Rick & Morty Explorer API

OpenAPI-style docs for the GraphQL API. **All data requests go to a single endpoint:** \`POST /graphql\`.

The paths shown under **/graphql/queries/...** and **/graphql/mutations/...** in this UI are **documentation aliases only**—they are not separate HTTP routes. Use the request body from each operation with \`POST http://localhost:4000/graphql\`.

### How to call
Send JSON with a \`query\` or \`mutation\` string and optional \`variables\`.

\`\`\`json
{
  "query": "query GetCharacters($page: Int) { characters(page: $page) { total results { id name } } }",
  "variables": { "page": 1 }
}
\`\`\`
      `,
      license: { name: 'MIT' },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development' },
    ],
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Characters', description: 'Query and filter Rick & Morty characters' },
      { name: 'Favorites', description: 'Manage character favorites per user' },
      { name: 'Comments', description: 'Add and delete comments (POST /graphql)' },
      { name: 'Soft Delete', description: 'Soft-delete and restore characters (POST /graphql)' },
    ],
    components: {
      schemas: {
        GraphQLRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', description: 'GraphQL query or mutation string' },
            variables: { type: 'object', description: 'Optional variables map', additionalProperties: true },
            operationName: { type: 'string', description: 'Optional operation name' },
          },
        },
        GraphQLResponse: {
          type: 'object',
          properties: {
            data: { type: 'object', additionalProperties: true },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  locations: { type: 'array', items: { type: 'object' } },
                  path: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        Character: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            externalId: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Rick Sanchez' },
            status: { type: 'string', enum: ['Alive', 'Dead', 'unknown'], example: 'Alive' },
            species: { type: 'string', example: 'Human' },
            type: { type: 'string', example: '' },
            gender: { type: 'string', enum: ['Female', 'Male', 'Genderless', 'unknown'], example: 'Male' },
            originName: { type: 'string', example: 'Earth (C-137)' },
            locationName: { type: 'string', example: 'Citadel of Ricks' },
            image: { type: 'string', format: 'uri', example: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg' },
            episode: { type: 'array', items: { type: 'string' } },
            url: { type: 'string', format: 'uri' },
            isDeleted: { type: 'boolean', example: false },
            isFavorite: { type: 'boolean', example: false },
            comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            characterId: { type: 'integer', example: 1 },
            author: { type: 'string', example: 'John Doe' },
            content: { type: 'string', example: 'Best character ever!' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedCharacters: {
          type: 'object',
          properties: {
            results: { type: 'array', items: { $ref: '#/components/schemas/Character' } },
            total: { type: 'integer', example: 15 },
            page: { type: 'integer', example: 1 },
            pages: { type: 'integer', example: 1 },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
