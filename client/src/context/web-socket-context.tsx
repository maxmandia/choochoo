import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

interface IWebSocketContext {
  ws: WebSocket | null;
  subscribeToDeployment: (deploymentId: string) => void;
  unsubscribeFromDeployment: () => void;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(
  undefined
);

interface DeploymentEvent {
  step: string;
  message: string;
  timestamp: string;
  // add other properties as needed
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsInstance = new WebSocket("ws://localhost:9000");
    setWs(wsInstance);

    wsInstance.onmessage = (event) => {
      const result = JSON.parse(event.data);

      if (!queryClient.getQueryData(["deploymentEvents"])) {
        queryClient.setQueryData(["deploymentEvents"], []);
      }

      queryClient.setQueryData<DeploymentEvent[]>(
        ["deploymentEvents"],
        (oldEvents = []) => [...oldEvents, result.data.deploymentEvents]
      );

      // invalidate deployments query to refetch the latest data on every new event that comes in
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    };

    wsInstance.onopen = () => {
      console.log("WebSocket connected");
    };

    wsInstance.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      wsInstance.close();
    };
  }, [queryClient]);

  const subscribeToDeployment = (deploymentId: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      console.info("Subscribing to deployment", deploymentId);
      ws.send(
        JSON.stringify({
          type: "subscribe",
          deploymentId,
          filter: "",
          limit: 100,
        })
      );
    }
  };

  const unsubscribeFromDeployment = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "unsubscribe",
        })
      );
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        ws,
        subscribeToDeployment,
        unsubscribeFromDeployment,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
