# =========================
# Build stage
# =========================
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# allow pipeline to set Node heap (prevents SIGKILL/OOM)
ARG NODE_OPTIONS
ENV NODE_OPTIONS=$NODE_OPTIONS

RUN npm run build

# =========================
# Runtime stage
# =========================
FROM nginx:1.27-alpine

# Change Nginx port to 8082
RUN sed -i 's/listen       80;/listen 8082;/' /etc/nginx/conf.d/default.conf

# Copy built UI
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8082

CMD ["nginx", "-g", "daemon off;"]