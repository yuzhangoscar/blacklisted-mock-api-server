# Blacklisted Mock API Server

A simple mock API server with health check and blacklisted names functionality.

## Endpoints

### Health Check
- **GET** `/health`
- Returns server health status and uptime information

### Blacklisted Names
- **GET** `/blacklisted`
- Returns all blacklisted names when called without parameters
- **GET** `/blacklisted?name=<name>`
- Returns a boolean indicating if the specified name is blacklisted

## Installation

```bash
npm install
```

## Usage

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3000 by default (or the port specified in the PORT environment variable).

## API Examples

### Get server health
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2023-11-19T10:30:00.000Z",
  "uptime": 120.5,
  "service": "blacklisted-mock-api-server"
}
```

### Get all blacklisted names
```bash
curl http://localhost:3000/blacklisted
```

Response:
```json
{
  "blacklistedNames": [
    "John Smith",
    "Jane Doe",
    "Mike Johnson",
    ...
  ],
  "count": 10
}
```

### Check if a specific name is blacklisted
```bash
curl "http://localhost:3000/blacklisted?name=John Smith"
```

Response:
```json
{
  "name": "John Smith",
  "isBlacklisted": true
}
```

```bash
curl "http://localhost:3000/blacklisted?name=Random Person"
```

Response:
```json
{
  "name": "Random Person",
  "isBlacklisted": false
}
```

## Deployment

### Deploy to Railway

#### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [railway.app](https://railway.app)
3. Sign in with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Railway will automatically detect and deploy your Node.js app

#### Method 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize and deploy
railway init
railway up
```

### Production Endpoints

After deployment, your endpoints will be available at:
- `https://your-app-name.up.railway.app/health`
- `https://your-app-name.up.railway.app/blacklisted`
- `https://your-app-name.up.railway.app/blacklisted?name=<name>`

## Environment Variables

- `PORT` - Server port (Railway sets this automatically)

## Mock Data

The server includes 10 sample blacklisted names for testing purposes. The name matching is case-insensitive.