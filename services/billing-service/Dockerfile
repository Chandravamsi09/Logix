FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
COPY packages/common ./packages/common
COPY services/billing-service ./services/billing-service
RUN npm ci
RUN npm run build:common
RUN npm run --workspace=services/billing-service build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/billing-service/dist ./services/billing-service/dist
COPY --from=builder /app/services/billing-service/package.json ./services/billing-service/package.json
RUN npm ci --omit=dev
EXPOSE 4005
CMD ["node", "services/billing-service/dist/server.js"]
