FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY services/analytics-service ./services/analytics-service
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=services/analytics-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/analytics-service/dist ./services/analytics-service/dist
COPY --from=builder /app/services/analytics-service/package.json ./services/analytics-service/package.json
RUN npm ci --omit=dev
EXPOSE 4007
CMD ["node", "services/analytics-service/dist/server.js"]
