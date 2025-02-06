import { Badge } from "./primitives/badge";
import { Card } from "./primitives/card";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Deployment, DeploymentStatus } from "@/types";
import DeploymentActionsMenu from "./deployment-actions-menu";
import DeploymentEvents from "./deployment-events";

function DeploymentCard({
  deployment,
  isMostRecent,
}: {
  deployment: Deployment;
  isMostRecent?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "border-solid border-[1px] border-backdropBorder w-full",
          deployment.status === DeploymentStatus.SUCCESS &&
            "border-[hsl(152_38%_80%)] border-solid border-[1px]",
          deployment.status === DeploymentStatus.REMOVED && "border-gray-100",
          deployment.status === DeploymentStatus.CRASHED &&
            "border-[hsl(1_62%_44%)] border-solid border-[1px]"
        )}
      >
        <Card
          className={cn(
            "flex rounded-none items-center p-4 gap-6 justify-between m-1 shadow-none border-none",
            deployment.status === DeploymentStatus.SUCCESS && "bg-[#F4FAF8]",
            deployment.status === DeploymentStatus.REMOVED && "bg-gray-100",
            deployment.status === DeploymentStatus.CRASHED &&
              "bg-[hsl(1_55%_98%)] "
          )}
        >
          <div className="flex items-center gap-4">
            <Badge
              className={cn(
                "rounded-sm font-normal",
                deployment.status === DeploymentStatus.SUCCESS &&
                  "bg-[hsl(152_38%_91%)] text-[hsl(152_38%_42%)] hover:bg-[hsl(153,37%,81%)]",
                deployment.status === DeploymentStatus.REMOVED &&
                  "bg-gray-200 text-gray-500 hover:bg-gray-300",
                deployment.status === DeploymentStatus.CRASHED &&
                  "text-[hsl(1_62%_44%)] bg-[hsl(1_68%_95%)]"
              )}
            >
              {deployment.status}
            </Badge>
            <div className="flex items-center gap-2">
              <img
                className="h-[30px] object-contain rounded-full"
                src={deployment.creator.avatar}
                alt="avatar"
              />
              <div className="flex flex-col">
                <span>{deployment.meta.commitMessage}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(deployment.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <DeploymentActionsMenu deployment={deployment} />
        </Card>
        {/* Only show deployment events for the most recent deployment */}
        {isMostRecent && <DeploymentEvents deployment={deployment} />}
      </div>
    </>
  );
}

export default DeploymentCard;
