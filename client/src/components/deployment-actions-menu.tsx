import { DeploymentStatus } from "@/types";
import { Deployment } from "@/types";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/primitives/dropdown-menu";
import { DropdownMenu } from "@/components/primitives/dropdown-menu";
import { Button } from "@/components/primitives/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServiceDeploy } from "@/hooks/useServiceDeploy";
import { useStopDeployment } from "@/hooks/useStopDeployement";
import { useDeploymentRedeploy } from "@/hooks/useDeploymentRedeploy";
import { useWebSocket } from "@/context/web-socket-context";
import { toast } from "sonner";
import { ENVIRONMENT_ID, SERVICE_ID } from "@/constants";

function DeploymentActionsMenu({ deployment }: { deployment: Deployment }) {
  const { subscribeToDeploymentEvents, subscribeToDeployment } = useWebSocket();
  const { mutateAsync: stopDeployment } = useStopDeployment();
  const { mutateAsync: deployService } = useServiceDeploy(
    ENVIRONMENT_ID,
    SERVICE_ID
  );
  const { mutateAsync: redeployDeployment } = useDeploymentRedeploy();

  async function actionHandler(action: string) {
    switch (action) {
      case "stop": {
        toast.loading("Stopping deployment", {
          description: "This may take a few seconds",
        });
        await stopDeployment(deployment.id);
        subscribeToDeployment(deployment.id);
        break;
      }
      case "redeploy": {
        // subscribe to most recent deployment so we know when it's removed
        subscribeToDeployment(deployment.id);
        const {
          deploymentRedeploy: { id },
        } = await redeployDeployment(deployment.id);
        toast.success("Deployment in progress", {
          description: "This may take a few minutes",
        });
        // subscribe to new events for the redeployed deployment
        subscribeToDeploymentEvents(id);
        break;
      }
      case "deploy": {
        const deployedId = await deployService();
        toast.success("Deployment in progress", {
          description: "This may take a few minutes",
        });
        subscribeToDeploymentEvents(deployedId);
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  // If the deployment is not in a success or crashed state, don't render the menu
  if (
    deployment.status !== DeploymentStatus.SUCCESS &&
    deployment.status !== DeploymentStatus.CRASHED
  ) {
    return null;
  }

  return (
    <>
      {(deployment.status === DeploymentStatus.SUCCESS ||
        deployment.status === DeploymentStatus.CRASHED) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "px-3 py-1",
                deployment.status === DeploymentStatus.SUCCESS &&
                  "bg-transparent border-green-200 text-green-500 hover:bg-green-100 hover:text-green-500",
                deployment.status === DeploymentStatus.CRASHED &&
                  "bg-transparent border-red-500 text-red-500 hover:text-red-500 hover:bg-red-100"
              )}
            >
              <EllipsisVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {deployment.status === DeploymentStatus.SUCCESS && (
              <>
                <DropdownMenuItem onClick={() => actionHandler("stop")}>
                  Stop
                </DropdownMenuItem>
                {deployment.canRedeploy && (
                  <DropdownMenuItem onClick={() => actionHandler("redeploy")}>
                    Redeploy
                  </DropdownMenuItem>
                )}
              </>
            )}
            {deployment.status === DeploymentStatus.CRASHED && (
              <>
                <DropdownMenuItem onClick={() => actionHandler("deploy")}>
                  Deploy
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

export default DeploymentActionsMenu;
