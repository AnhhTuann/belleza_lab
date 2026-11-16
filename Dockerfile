FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Chỉ build frontend (Vite), server chạy bằng tsx trực tiếp
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy frontend build
COPY --from=build /app/dist ./dist

# Copy toàn bộ server
COPY --from=build /app/server ./server

USER node
EXPOSE 3000
CMD ["npm", "start"]
