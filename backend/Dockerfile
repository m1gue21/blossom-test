FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/routes ./src/routes
COPY .sequelizerc ./
COPY src/config/database.js ./src/config/database.js
COPY src/database/migrations ./src/database/migrations
COPY .env.example .env

EXPOSE 4000
CMD ["node", "dist/index.js"]
