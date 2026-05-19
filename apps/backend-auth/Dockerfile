FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend-auth ./apps/backend-auth
RUN npm install --workspaces --include-workspace-root
RUN npm run build --workspace=backend-auth

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend-auth/dist ./dist
COPY --from=builder /app/apps/backend-auth/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main.js"]
