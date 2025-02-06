import { DeploymentStatus } from "@/types";
import { Deployment } from "@/types";
import { DropdownMenuTrigger } from "./primitives/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./primitives/dropdown-menu";
import { DropdownMenu } from "./primitives/dropdown-menu";
import { Button } from "./primitives/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServiceDeploy } from "@/hooks/useServiceDeploy";
import { useStopDeployment } from "@/hooks/useStopDeployement";
import { useDeploymentRedeploy } from "@/hooks/useDeploymentRedeploy";
import { useWebSocket } from "@/context/web-socket-context";
import { useQueryClient } from "@tanstack/react-query";

function DeploymentActionsMenu({ deployment }: { deployment: Deployment }) {
  const queryClient = useQueryClient();
  const { unsubscribeFromDeployment, subscribeToDeployment } = useWebSocket();
  const { mutateAsync: stopDeployment } = useStopDeployment();
  const { mutateAsync: deployService } = useServiceDeploy(
    "96fbbfd7-6939-4fc5-9022-954774f26bd9",
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutateAsync: redeployDeployment } = useDeploymentRedeploy();

  async function actionHandler(action: string) {
    switch (action) {
      case "stop":
        await stopDeployment(deployment.id);
        // invalidate the deployments query after 5 seconds to fetch crashed status
        // this is a hack to get the deployment status to update (ideally we would use a websocket)
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["deployments"] });
        }, 5000);
        break;
      case "redeploy":
        unsubscribeFromDeployment();
        const {
          deploymentRedeploy: { id },
        } = await redeployDeployment(deployment.id);
        // subscribe to the redeployed deployment
        subscribeToDeployment(id);
        break;
      case "deploy":
        const deployedId = await deployService();
        // subscribe to the recently deployed deployment
        subscribeToDeployment(deployedId);
        break;
    }
  }

  // If the deployment is not success or crashed, don't render the menu
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
          <DropdownMenuTrigger>
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
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {deployment.status === DeploymentStatus.SUCCESS && (
              <>
                <DropdownMenuItem onClick={() => actionHandler("stop")}>
                  Stop
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actionHandler("redeploy")}>
                  Redeploy
                </DropdownMenuItem>
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
