import { Deployment } from "@/types";
import { useGetDeploymentEvents } from "@/hooks/useGetDeploymentEvents";
import { DeploymentStatus, DeploymentEventStep } from "@/types";
import { Card } from "@/components/primitives/card";
import { cn } from "@/lib/utils";
import DeploymentEventsSkeleton from "@/components/deployment-events-skeleton";

function DeploymentEvents({ deployment }: { deployment: Deployment }) {
  const {
    data: deploymentEvents,
    isLoading,
    isError,
  } = useGetDeploymentEvents(deployment.id, {
    enabled:
      Boolean(deployment.id) &&
      Boolean(deployment.status === DeploymentStatus.SUCCESS),
  });

  if (isLoading || isError) {
    return <DeploymentEventsSkeleton status={deployment.status} />;
  }

  return (
    <Card
      className={cn(
        "flex rounded-none items-center p-3 md:p-4 pl-8 md:pl-14 gap-2 justify-start m-1 shadow-none border-none",
        deployment.status === DeploymentStatus.SUCCESS && "bg-green-50",
        (deployment.status === DeploymentStatus.BUILDING ||
          deployment.status === DeploymentStatus.DEPLOYING ||
          deployment.status === DeploymentStatus.INITIALIZING) &&
          "bg-blue-50"
      )}
    >
      <span
        className={cn(
          "text-[11px] md:text-[12px] font-semibold",
          deployment.status === DeploymentStatus.SUCCESS && "text-green-500",
          (deployment.status === DeploymentStatus.BUILDING ||
            deployment.status === DeploymentStatus.DEPLOYING ||
            deployment.status === DeploymentStatus.INITIALIZING) &&
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
          "text-[11px] md:text-[12px]",
          deployment.status === DeploymentStatus.SUCCESS && "text-green-500",
          (deployment.status === DeploymentStatus.BUILDING ||
            deployment.status === DeploymentStatus.DEPLOYING ||
            deployment.status === DeploymentStatus.INITIALIZING) &&
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
