FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/backend-auth/package.json ./apps/backend-auth/
COPY apps/backend-api/package.json ./apps/backend-api/
COPY apps/frontend-host/package.json ./apps/frontend-host/
COPY apps/mfe-medcard/package.json ./apps/mfe-medcard/
COPY apps/mfe-appointments ./apps/mfe-appointments
RUN npm install --workspaces --include-workspace-root
RUN npm run build:appointments

FROM nginx:alpine
COPY --from=builder /app/apps/mfe-appointments/dist /usr/share/nginx/html/appointments
COPY apps/mfe-appointments/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
