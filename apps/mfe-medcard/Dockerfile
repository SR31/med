FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/backend-auth/package.json ./apps/backend-auth/
COPY apps/backend-api/package.json ./apps/backend-api/
COPY apps/frontend-host/package.json ./apps/frontend-host/
COPY apps/mfe-appointments/package.json ./apps/mfe-appointments/
COPY apps/mfe-medcard ./apps/mfe-medcard
RUN npm install --workspaces --include-workspace-root
RUN npm run build:medcard

FROM nginx:alpine
COPY --from=builder /app/apps/mfe-medcard/dist /usr/share/nginx/html/medcard
COPY apps/mfe-medcard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
