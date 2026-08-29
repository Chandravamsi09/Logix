FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY services/inventory-service ./services/inventory-service
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=services/inventory-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/inventory-service/dist ./services/inventory-service/dist
COPY --from=builder /app/services/inventory-service/package.json ./services/inventory-service/package.json
RUN npm ci --omit=dev
EXPOSE 4003
CMD ["node", "services/inventory-service/dist/server.js"]
