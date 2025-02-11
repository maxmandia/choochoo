import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DEPLOYMENT_SUBSCRIPTION,
  DEPLOYMENT_EVENTS_SUBSCRIPTION,
} from "../api/subscriptions";
import { DeploymentEvent } from "../types";
interface IWebSocketContext {
  ws: WebSocket | null;
  subscribeToDeployment: (deploymentId: string) => void;
  unsubscribeFromDeployment: () => void;
  subscribeToDeploymentEvents: (deploymentId: string) => void;
  unsubscribeFromDeploymentEvents: () => void;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsInstance = new WebSocket("ws://localhost:9000");
    setWs(wsInstance);

    wsInstance.onmessage = (event) => {
      const result = JSON.parse(event.data);

      switch (result.type) {
        case "deployment":
          // meta field is null for whatever reason and can't be used to update the deployment
          // since we rely on the meta field in our components so we just invalidate the deployments query
          // and refetch all of the data... odd!
          queryClient.invalidateQueries({ queryKey: ["deployments"] });
          break;

        case "deploymentEvents":
          queryClient.setQueryData<DeploymentEvent[]>(
            ["deploymentEvents"],
            (oldEvents = []) => [
              ...oldEvents,
              result.data.data.deploymentEvents,
            ]
          );
          // invalidate deployments query so we can get latest deployment status - this is preferred
          // to subscribing to the deployment itself since deploy events appear much sooner than deploy status changes and
          // the UI is delayed as a result, so we invalidate the deployments query to get the latest deployment statuses instead.
          queryClient.invalidateQueries({ queryKey: ["deployments"] });
          break;
      }
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
      ws.send(
        JSON.stringify({
          type: "subscribe",
          variables: { id: deploymentId },
          query: DEPLOYMENT_SUBSCRIPTION,
        })
      );
    }
  };

  const unsubscribeFromDeploymentEvents = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "unsubscribe",
        })
      );
    }
  };

  const subscribeToDeploymentEvents = (deploymentId: string) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          variables: { id: deploymentId },
          query: DEPLOYMENT_EVENTS_SUBSCRIPTION,
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
        subscribeToDeploymentEvents,
        unsubscribeFromDeploymentEvents,
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
