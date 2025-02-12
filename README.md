# ChooChoo 🚂

A full-stack application for managing deployments on Railway.

![ChooChoo Demo](./demo.gif)

## Project Structure

The project is divided into two main components:

- `client/`: Frontend application built with React/TypeScript
- `server/`: Backend application built with Node/Express

## Client Setup

### Prerequisites

- Node.js
- npm or yarn

### Environment Variables

Create a `.env` file in the `client/` directory with the following variables:

```env
VITE_BACKEND_URL=http://localhost:9000
VITE_SERVICE_ID=your_service_id
VITE_PROJECT_ID=your_project_id
VITE_ENVIRONMENT_ID=your_environment_id
```

### Installation and Running

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The client application will be available at `http://localhost:5173` by default.

## Server Setup

### Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
RAILWAY_API_TOKEN=your_railway_api_token
```

You can obtain your Railway API token from the Railway dashboard.

### Installation and Running

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies

3. Start the server:

```bash
npm run dev
```
