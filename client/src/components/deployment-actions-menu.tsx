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
function DeploymentActionsMenu({ deployment }: { deployment: Deployment }) {
  const { unsubscribeFromDeployment, subscribeToDeployment } = useWebSocket();
  const { mutate: stopDeployment } = useStopDeployment();
  const { mutate: deployService } = useServiceDeploy(
    "96fbbfd7-6939-4fc5-9022-954774f26bd9",
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutateAsync: redeployDeployment } = useDeploymentRedeploy();

  async function actionHandler(action: string) {
    switch (action) {
      case "stop":
        stopDeployment(deployment.id);
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
        deployService();
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
                  "bg-transparent border-[hsl(152_38%_80%)] text-[hsl(152_38%_42%)] hover:bg-[hsl(152_38%_91%)] hover:text-[hsl(152_38%_42%)]",
                deployment.status === DeploymentStatus.CRASHED &&
                  "bg-transparent border-[hsl(1_62%_44%)] text-[hsl(1_62%_44%)] hover:text-[hsl(1_62%_44%)] hover:bg-[hsl(1_68%_95%)]"
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
