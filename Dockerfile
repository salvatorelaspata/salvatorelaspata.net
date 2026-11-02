# Lo stage di build gira sempre sull'architettura nativa del builder ($BUILDPLATFORM):
# dist/ è statico e identico per ogni piattaforma, e il compilatore WASM di Astro
# va in crash sotto emulazione QEMU (build linux/arm64 su runner amd64).
FROM --platform=$BUILDPLATFORM node:lts-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:stable-alpine-slim AS runtime

# Update Alpine packages to get security patches
RUN apk update && apk upgrade --no-cache

# Create nginx user if it doesn't exist and set proper permissions
RUN addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true

# Copy configuration and built files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Set proper permissions.
# NB: nginx:*-alpine-slim non contiene /etc/nginx/conf.d (e nginx.conf non lo
# include: la server block e' inline). Farci chown fa fallire la build.
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Use non-root user
USER nginx

EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/ || exit 1
