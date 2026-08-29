FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY services/order-service ./services/order-service
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=services/order-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist
COPY --from=builder /app/services/order-service/package.json ./services/order-service/package.json
RUN npm ci --omit=dev
EXPOSE 4002
CMD ["node", "services/order-service/dist/server.js"]
