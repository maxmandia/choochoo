import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DEPLOYMENT_SUBSCRIPTION,
  DEPLOYMENT_EVENTS_SUBSCRIPTION,
} from "../api/subscriptions";
import {
  Deployment,
  DeploymentEvent,
  DeploymentEventStep,
  DeploymentsQueryData,
  DeploymentStatus,
} from "../types";

interface IWebSocketContext {
  ws: WebSocket | null;
  subscribeToDeployment: (deploymentId: string) => void;
  unsubscribeFromDeployment: (subscriptionId: string) => void;
  subscribeToDeploymentEvents: (deploymentId: string) => void;
  unsubscribeFromDeploymentEvents: (deploymentId: string) => void;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsInstance = new WebSocket(
      "wss://server-production-9c05.up.railway.app"
    );
    wsRef.current = wsInstance;

    wsInstance.onmessage = async (event) => {
      const result = JSON.parse(event.data);

      switch (result.type) {
        case "deployment":
          // meta field is null for whatever reason and can't be used to update the deployment
          // since we rely on the meta field in our components so we just invalidate the deployments query
          // and refetch all of the data... odd!
          await queryClient.invalidateQueries({ queryKey: ["deployments"] });

          // once a deployment is removed, we unsubscribe from the deployment subscription
          if (result.data.data.deployment.status === DeploymentStatus.REMOVED) {
            unsubscribeFromDeployment(result.data.data.deployment.id);
          }
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
          // the UI is delayed. Instead we invalidate the deployments query to get the latest deployment statuses.
          await queryClient.invalidateQueries({ queryKey: ["deployments"] });

          // if the last event is a deployment status change, unsubscribe from the deployment events
          if (
            result.data.data.deploymentEvents.step ===
            DeploymentEventStep.DRAIN_INSTANCES
          ) {
            const queryData = queryClient.getQueryData<DeploymentsQueryData>([
              "deployments",
            ]);

            const successfulDeployments: Deployment[] = [];

            // Get the last deployment from active deployments
            queryData?.pages[0].activeDeployments?.forEach((deployment) => {
              if (deployment.status === DeploymentStatus.SUCCESS) {
                successfulDeployments.push(deployment);
              }
            });

            // Sort the successful deployments by createdAt
            successfulDeployments.sort((a, b) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });

            if (successfulDeployments.length === 0) {
              return;
            }

            // Unsubscribe from the deployment events for the last successful deployment
            // since there might be two successful deployments at once before the old one is removed
            unsubscribeFromDeploymentEvents(successfulDeployments[0].id);
          }

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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "subscribe",
          subscriptionId: `deployment-${deploymentId}`,
          variables: { id: deploymentId },
          query: DEPLOYMENT_SUBSCRIPTION,
        })
      );
    }
  };

  const unsubscribeFromDeploymentEvents = (deploymentId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "unsubscribe",
          subscriptionId: `deployment-events-${deploymentId}`,
        })
      );
    }
  };

  const subscribeToDeploymentEvents = (deploymentId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "subscribe",
          variables: { id: deploymentId },
          query: DEPLOYMENT_EVENTS_SUBSCRIPTION,
          subscriptionId: `deployment-events-${deploymentId}`,
        })
      );
    }
  };

  const unsubscribeFromDeployment = (subscriptionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        JSON.stringify({
          type: "unsubscribe",
          subscriptionId: `deployment-${subscriptionId}`,
        })
      );
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
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
