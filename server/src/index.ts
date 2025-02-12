import express, { RequestHandler, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import ws, { WebSocketServer, WebSocket as WSWebSocket } from "ws";
import { createClient } from "graphql-ws";

import http from "http";

dotenv.config();

export const app = express();
const port = process.env.PORT || 9000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const activeSubscriptions = new Map<WSWebSocket, Map<string, () => void>>();

wss.on("connection", (websocket) => {
  console.log("Client connected");

  websocket.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "subscribe") {
      if (!data.subscriptionId) {
        console.error("Missing subscriptionId");
        return;
      }

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
          next: (result: any) => {
            if (result?.data?.errors && result?.data?.errors.length > 0) {
              websocket.send(
                JSON.stringify({
                  error: result?.data?.errors[0],
                })
              );
            }

            websocket.send(
              JSON.stringify({
                data: result,
                type: Object.keys(result.data)[0], // this is to inform the client of the type of data to be recieved
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

      // Get or create the subscription map for this websocket connection
      const subscriptions =
        activeSubscriptions.get(websocket) || new Map<string, () => void>();
      subscriptions.set(data.subscriptionId, subscription);
      activeSubscriptions.set(websocket, subscriptions);
    }

    if (data.type === "unsubscribe") {
      if (!data.subscriptionId) {
        console.error("Missing subscriptionId in unsubscribe action");
        return;
      }

      const subscriptions = activeSubscriptions.get(websocket);
      if (subscriptions && subscriptions.has(data.subscriptionId)) {
        console.log("current subscriptions", subscriptions);
        subscriptions.get(data.subscriptionId)!();
        subscriptions.delete(data.subscriptionId);
        console.log(`Unsubscribed from subscription: ${data.subscriptionId}`);
        console.log("current subscriptions after removal", subscriptions);
      } else {
        console.log("no subscription found");
      }
    }
  });

  websocket.on("close", () => {
    console.log("Client disconnected");
    const subscriptions = activeSubscriptions.get(websocket);
    if (subscriptions) {
      subscriptions.forEach((unsubscribe) => unsubscribe());
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

    // handle errors coming from the public GraphQL API
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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
