FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json apps/web/
RUN npm install

FROM deps AS build
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/.next .next
COPY --from=build /app/apps/web/public public
COPY --from=build /app/apps/web/package.json package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
