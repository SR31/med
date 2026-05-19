FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/frontend-host ./apps/frontend-host
COPY apps/mfe-appointments ./apps/mfe-appointments
COPY apps/mfe-medcard ./apps/mfe-medcard
RUN npm install --workspaces --include-workspace-root
RUN npm run build:host
RUN npm run build:appointments
RUN npm run build:medcard

FROM nginx:alpine
COPY --from=builder /app/apps/frontend-host/dist /usr/share/nginx/html
COPY --from=builder /app/apps/mfe-appointments/dist /usr/share/nginx/html/appointments
COPY --from=builder /app/apps/mfe-medcard/dist /usr/share/nginx/html/medcard
COPY apps/frontend-host/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
