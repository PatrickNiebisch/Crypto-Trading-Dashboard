# Crypto Trading Dashboard

A Next.js application featuring real-time cryptocurrency trading dashboard with Redux state management and interactive charts.

## Tech Stack

- **Framework**: Next.js 15.5.3
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Deployment**: Docker

## Quick Start

### 1. Environment Setup

The app works out of the box with demo data. For real crypto data:

# Edit .env.local and replace "demo" with your API key:
# Get free key at: https://coincap.io/api-key


### 2. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 3. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

## Data Sources

- **🟡 Demo Data** (Default): Realistic 24h Bitcoin simulation - works immediately
- **🟢 Live Data**: Real-time Bitcoin prices from CoinCap API (requires free API key)

### Switching to Live Data
1. Get free API key from [CoinCap.io](https://coincap.io/api-key)
2. Edit `.env.local`: Replace `demo` with your actual API key
3. Restart: `docker-compose down && docker-compose up --build`

> **Note for Evaluators**: The app uses demo data by default for immediate evaluation without any setup required.

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

# Docker scripts
npm run docker:up    # Build and start with Docker
npm run docker:down  # Stop Docker containers
npm run docker:fresh # Fresh build without cache
```

## Development Notes

- Uses Next.js 13+ App Router
- TypeScript strict mode enabled
- ESLint configuration for Next.js and TypeScript
- Tailwind CSS for styling
- Redux Toolkit for predictable state management
- Graceful fallback to mock data for reliable demos

## Requirements

- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for containerized deployment)
- CoinCap API key (optional - app works without it)