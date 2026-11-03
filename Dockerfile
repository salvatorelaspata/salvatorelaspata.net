# Un'immagine per sito: APP=net (salvatorelaspata.net, predefinito) o APP=dev (salvatorelaspata.dev).
# Contesto di build: la root del monorepo, per esempio
#   docker build --build-arg APP=dev -t salvatorela/salvatorelaspata.dev .
ARG APP=net

# Lo stage di build gira sempre sull'architettura nativa del builder ($BUILDPLATFORM):
# dist/ è statico e identico per ogni piattaforma, e il compilatore WASM di Astro
# va in crash sotto emulazione QEMU (build linux/arm64 su runner amd64).
FROM --platform=$BUILDPLATFORM node:lts-alpine AS build
ARG APP
WORKDIR /app
COPY package*.json ./
COPY apps/net/package.json apps/net/
COPY apps/dev/package.json apps/dev/
COPY packages/content/package.json packages/content/
RUN npm ci --omit=dev -w @salvatorelaspata/${APP} -w @salvatorelaspata/content
COPY . .
RUN npm run build -w @salvatorelaspata/${APP}

FROM nginx:stable-alpine-slim AS runtime
ARG APP

# Update Alpine packages to get security patches
RUN apk update && apk upgrade --no-cache

# Create nginx user if it doesn't exist and set proper permissions
RUN addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true

# Copy configuration and built files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/apps/${APP}/dist /usr/share/nginx/html

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

# Health check. 127.0.0.1 e non localhost: nell'immagine localhost risolve prima in ::1
# e nginx ascolta solo su IPv4, quindi il controllo falliva sempre.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1
