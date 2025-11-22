# Plinko Casino Game

A full-stack Plinko casino game with real-time physics simulation, wallet integration, and configurable RTP (Return to Player).

## Features

- **Interactive Plinko Game**: Physics-based disc simulation using Pixi.js
- **Wallet Integration**: Seamless integration with external wallet API for balance management
- **Configurable RTP**: Adjustable return-to-player percentage with mathematical payout calculations
- **Game History**: Persistent game records stored in PostgreSQL
- **Real-time Balance Updates**: Live balance synchronization with wallet service

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Pixi.js** for game rendering
- **GSAP** for animations
- **TanStack Query** for data fetching
- **Vite** for build tooling
- **Tailwind CSS** for styling

### Backend

- **Node.js** with Express
- **TypeScript**
- **PostgreSQL** with Drizzle ORM
- **Winston** for logging
- **Zod** for validation

### Infrastructure

- **Docker Compose** for orchestration
- **PostgreSQL** database
- **External Wallet API** service

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js v24.11.0 (for local development)

### Running the Full Stack

Start all services (database, wallet server, and game server):

```bash
./run.sh
```

This will start:

- PostgreSQL database
- Wallet API service
- Game server with migrations
- All services will be built and started in detached mode

Stop all services:

```bash
./stop.sh
```

The application will be available at:

- **Frontend**: http://localhost:5173 (when running client locally)
- **Game Server**: http://localhost:8001
- **Wallet Server**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### Local Development

For local development, start all supporting services (database, wallet server) but run the game server locally:

1. Start supporting services (excludes game server):

```bash
./local.sh
```

2. Set up environment variables for the game server:

```bash
cd server
cp .env.example .env
```

3. Run the game server locally:

```bash
npm ci
npm run db:migrate  # Run migrations (only needed once or when schema changes)
npm start           # Starts server with hot reload (tsx watch)
```

4. Run the client locally:

```bash
cd client
npm ci
npm start           # Starts Vite dev server
```

## API Endpoints

### Game Configuration

```
GET /v1/plinko/init
```

Returns game configuration including payouts, probability (p), and number of rows.

### Play Game

```
POST /v1/plinko/play
Body: { walletId: string, bet: number }
```

Places a bet and returns the result including win amount, bucket, and updated balance.

### Health Check

```
GET /health
```

## Configuration

Game parameters can be configured via environment variables:

### Game Server

- `PORT`: Server port (default: 8001)
- `WALLET_URL`: Wallet API service URL (default: `http://wallet-server:8000` for Docker, `http://localhost:8000` for local development)
- `CORS_HOSTS`: Comma-separated list of allowed CORS origins (default: http://localhost:5173)

### Plinko Game

- `PLINKO_TARGET_RTP`: Target return-to-player (default: 0.95)
- `PLINKO_ROWS`: Number of rows in the board (default: 10)
- `PLINKO_P`: Probability parameter for binomial distribution (default: 0.5)
- `PLINKO_MIDDLE_PAYOUT`: Payout multiplier for middle bucket (default: 0.2)
- `PLINKO_EDGE_PAYOUT`: Payout multiplier for edge buckets (default: 100)

### Database

- `DB_HOST`: Database host (default: `db` for Docker, `localhost` for local development)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: casino)
- `DB_USERNAME`: Database username (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres)

## Project Structure

```
plinko/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── game/         # Pixi.js game implementation
│   │   ├── hooks/        # Custom React hooks
│   │   └── providers/    # Context providers
│   └── package.json
├── server/          # Node.js backend application
│   ├── src/
│   │   ├── services/     # Business logic (plinko, game)
│   │   ├── clients/      # External service clients
│   │   ├── data/         # Database layer
│   │   └── middleware/   # Express middleware
│   └── package.json
├── bruno/          # API testing collection
├── docker-compose.yml
└── README.md
```

## Game Mechanics

The Plinko game uses a binomial distribution to determine which bucket the disc lands in. The payout structure follows a parabolic curve with:

- **Edge buckets** (k=0, k=rows): Highest payouts
- **Middle bucket** (k=rows/2): Lowest payout
- **Intermediate buckets**: Scaled to achieve target RTP

The RTP is calculated mathematically and payouts are adjusted to meet the configured target RTP.

## Testing

### Server Tests

```bash
cd server
npm test
```

### RTP Testing

```bash
cd server
npm run test:rtp
```

## API Testing

Bruno API collection is available in the `bruno/` directory for testing endpoints.
