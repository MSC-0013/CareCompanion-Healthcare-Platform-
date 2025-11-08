# ---- Frontend Build Stage ----
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---- Backend Stage ----
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY --from=frontend /app/frontend/build ./public
# Create the directory where the model will be mounted (singular!)
RUN mkdir -p ./model
EXPOSE 5000
CMD ["node", "server.js"]