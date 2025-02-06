import { useQueryClient } from "@tanstack/react-query";
import { Deployment } from "@/types";
import { useGetDeploymentEvents } from "@/hooks/useGetDeploymentEvents";
import { DeploymentStatus, DeploymentEventStep } from "@/types";
import { Card } from "./primitives/card";
import { cn } from "@/lib/utils";

interface DeploymentEvent {
  step: DeploymentEventStep;
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
      className={cn(
        "flex rounded-none items-center p-4 pl-14 gap-2 justify-start m-1 shadow-none border-none",
        deployment.status === DeploymentStatus.SUCCESS && "bg-green-50",
        (deployment.status === DeploymentStatus.BUILDING ||
          deployment.status === DeploymentStatus.DEPLOYING) &&
          "bg-blue-50"
      )}
    >
      <span
        className={cn(
          "text-[12px]",
          deployment.status === DeploymentStatus.SUCCESS && "text-green-500",
          (deployment.status === DeploymentStatus.BUILDING ||
            deployment.status === DeploymentStatus.DEPLOYING) &&
            "text-blue-500"
        )}
      >
        {deploymentEvents &&
        deploymentEvents.length > 0 &&
        deploymentEvents[deploymentEvents.length - 1].step ===
          DeploymentEventStep.DRAIN_INSTANCES
          ? "Status:"
          : "Deployment in progress:"}
      </span>
      <span
        className={cn(
          "text-[12px]",
          deployment.status === DeploymentStatus.SUCCESS && "text-green-500",
          (deployment.status === DeploymentStatus.BUILDING ||
            deployment.status === DeploymentStatus.DEPLOYING) &&
            "text-blue-500"
        )}
      >
        {deploymentEvents && deploymentEvents.length > 0
          ? deploymentEvents[deploymentEvents.length - 1].step ===
            DeploymentEventStep.DRAIN_INSTANCES
            ? "Success"
            : deploymentEvents[deploymentEvents.length - 1].step
          : "Unknown"}
      </span>
    </Card>
  );
}

export default DeploymentEvents;
