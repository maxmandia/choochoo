import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Deployment } from "@/types";
import { useGetDeploymentEvents } from "@/hooks/useGetDeploymentEvents";
import { DeploymentStatus } from "@/types";
import { Card } from "./primitives/card";

interface DeploymentEvent {
  step: string;
  message: string;
  timestamp: string;
}
function DeploymentEvents({ deployment }: { deployment: Deployment }) {
  const queryClient = useQueryClient();
  const deploymentEvents = queryClient.getQueryData<DeploymentEvent[]>([
    "deploymentEvents",
  ]);

  useGetDeploymentEvents(deployment.id, {
    enabled:
      Boolean(deployment.id) &&
      Boolean(deployment.status === DeploymentStatus.SUCCESS),
  });

  return (
    <Card
      className={
        "flex rounded-none items-center p-4 pl-14 gap-2 justify-start m-1 shadow-none border-none bg-green-50"
      }
    >
      <span className="text-[12px] text-green-500">
        Deployement in progress:
      </span>
      <span className="text-[12px] text-green-500">
        {deploymentEvents?.[deploymentEvents.length - 1].step}
      </span>
    </Card>
  );
}

export default DeploymentEvents;
