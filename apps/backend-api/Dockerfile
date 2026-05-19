FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend-api ./apps/backend-api
RUN npm install --workspaces --include-workspace-root
RUN npm run build --workspace=backend-api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend-api/dist ./dist
COPY --from=builder /app/apps/backend-api/package.json ./package.json
EXPOSE 4001
CMD ["node", "dist/main.js"]
