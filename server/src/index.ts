import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import ws, { WebSocketServer } from "ws";
import { createClient } from "graphql-ws";

import http from "http";

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

// Create HTTP server instance
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Store active subscriptions
const activeSubscriptions = new Map();

// WebSocket connection handler
wss.on("connection", (websocket) => {
  console.log("Client connected");

  websocket.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "subscribe" && data.deploymentId) {
      // Create GraphQL WebSocket client
      const client = createClient({
        url: "wss://backboard.railway.com/graphql/v2",
        webSocketImpl: class CustomWebSocket extends ws {
          constructor(address: string, protocols: string | string[]) {
            super(address, protocols, {
              headers: {
                Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}`,
              },
            });
          }
        },
      });

      // Subscribe to deployment logs
      const subscription = client.subscribe(
        {
          query: `
            subscription deployEventsSubscription($id: String!) {
              deploymentEvents(id: $id) {
                step
              }
            }
          `,
          variables: { id: data.deploymentId },
        },
        {
          next: (data) => {
            websocket.send(JSON.stringify(data));
          },
          error: (err) => {
            console.error("Subscription error:", err);
            websocket.send(
              JSON.stringify({ error: "Subscription error occurred" })
            );
          },
          complete: () => {
            console.log(
              "Subscription ended - no more updates will be received"
            );
          },
        }
      );

      console.log(
        `Successfully subscribed to deployment events for ID: ${data.deploymentId}`
      );

      // Store cleanup function
      activeSubscriptions.set(websocket, () => {
        subscription();
      });
    }

    if (data.type === "unsubscribe") {
      const unsubscribe = activeSubscriptions.get(websocket);
      if (unsubscribe) {
        unsubscribe();
        activeSubscriptions.delete(websocket);
        console.log("Successfully unsubscribed from deployment events");
      }
    }
  });

  websocket.on("close", () => {
    console.log("Client disconnected");
    const unsubscribe = activeSubscriptions.get(websocket);
    if (unsubscribe) {
      unsubscribe();
      activeSubscriptions.delete(websocket);
    }
  });
});

app.post("/graphql", async (req, res) => {
  const graphQLEndpoint = "https://backboard.railway.com/graphql/v2";
  const { query, variables } = req.body;
  try {
    const response = await axios({
      method: "POST",
      url: graphQLEndpoint,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}`,
      },
      data: { query, variables },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error calling external GraphQL API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server (modified to use HTTP server instance)
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
