FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY apps/web-dashboard ./apps/web-dashboard
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=apps/web-dashboard build

FROM nginx:alpine
COPY --from=builder /app/apps/web-dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
