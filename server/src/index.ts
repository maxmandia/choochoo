import express, { RequestHandler, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import ws, { WebSocketServer } from "ws";
import { createClient } from "graphql-ws";

import http from "http";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const activeSubscriptions = new Map();

wss.on("connection", (websocket) => {
  console.log("Client connected");

  websocket.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "subscribe") {
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

      const subscription = client.subscribe(
        {
          query: data.query,
          variables: data.variables,
        },
        {
          next: (data: any) => {
            // handle errors coming from the public GraphQL API
            if (data?.data?.errors && data?.data?.errors.length > 0) {
              websocket.send(
                JSON.stringify({
                  error: data?.data?.errors[0],
                })
              );
            }

            websocket.send(
              JSON.stringify({
                data: data,
                type: Object.keys(data.data)[0], // This is to tell the frontend what type of data is being sent
              })
            );
          },
          error: (err: any) => {
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

      // Store the subscription function in the activeSubscriptions map
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

app.post("/graphql", (async (req: Request, res: Response) => {
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

    if (response.data.errors && response.data.errors.length > 0) {
      return res.status(400).json({
        errors: response.data.errors,
      });
    }

    res.json(response.data);
  } catch (error: any) {
    console.error("Error calling external GraphQL API:", error);

    // For other types of errors, send a generic error message
    res.status(500).json({
      errors: [
        {
          message:
            error?.response?.data?.errors?.[0]?.message ??
            "An unknown error occurred",
        },
      ],
    });
  }
}) as RequestHandler);

// Start server (modified to use HTTP server instance)
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
