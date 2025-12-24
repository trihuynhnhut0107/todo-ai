# Backend

## Prerequisites

- Node.js (v16 or higher)
- Docker & Docker Compose

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   - `OPENAI_API_KEY`
   - `GOOGLE_API_KEY`
   - `MAPBOX_ACCESS_TOKEN`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

3. **Start database services**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   npm run migration:run
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

API documentation: `http://localhost:3000/api-docs`

## Stopping

```bash
docker-compose down
```
