import { Badge } from "@/components/primitives/badge";
import { Card } from "@/components/primitives/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Deployment, DeploymentStatus } from "@/types";
import DeploymentActionsMenu from "@/components/deployment-actions-menu";
import DeploymentEvents from "@/components/deployment-events";

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
            "border-green-200 border-solid border-[1px]",
          (deployment.status === DeploymentStatus.REMOVED ||
            deployment.status === DeploymentStatus.REMOVING) &&
            "border-gray-100",
          deployment.status === DeploymentStatus.CRASHED &&
            "border-red-500 border-solid border-[1px]",
          (deployment.status === DeploymentStatus.BUILDING ||
            deployment.status === DeploymentStatus.DEPLOYING ||
            deployment.status === DeploymentStatus.INITIALIZING) &&
            "border-blue-200 border-solid border-[1px]"
        )}
      >
        <Card
          className={cn(
            "flex md:flex-row rounded-none items-start md:items-center p-3 md:p-4 gap-3 md:gap-6 justify-between m-1 shadow-none border-none",
            deployment.status === DeploymentStatus.SUCCESS && "bg-green-50",
            (deployment.status === DeploymentStatus.REMOVED ||
              deployment.status === DeploymentStatus.REMOVING) &&
              "bg-gray-100",
            deployment.status === DeploymentStatus.CRASHED && "bg-red-50",
            (deployment.status === DeploymentStatus.BUILDING ||
              deployment.status === DeploymentStatus.DEPLOYING ||
              deployment.status === DeploymentStatus.INITIALIZING) &&
              "bg-blue-50"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <Badge
              className={cn(
                "rounded-sm font-normal w-fit",
                deployment.status === DeploymentStatus.SUCCESS &&
                  "bg-green-100 text-green-500 hover:bg-green-200",
                (deployment.status === DeploymentStatus.REMOVED ||
                  deployment.status === DeploymentStatus.REMOVING) &&
                  "bg-gray-200 text-gray-500 hover:bg-gray-300",
                deployment.status === DeploymentStatus.CRASHED &&
                  "text-red-500 bg-red-100",
                (deployment.status === DeploymentStatus.BUILDING ||
                  deployment.status === DeploymentStatus.DEPLOYING ||
                  deployment.status === DeploymentStatus.INITIALIZING) &&
                  "bg-blue-100 text-blue-500 hover:bg-blue-200"
              )}
            >
              {deployment.status}
            </Badge>
            <div className="flex items-center gap-2">
              <img
                className="h-[25px] md:h-[30px] object-contain rounded-full"
                src={deployment.creator.avatar}
                alt="avatar"
              />
              <div className="flex flex-col">
                <span className="text-sm md:text-base">
                  {deployment.meta.commitMessage}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(deployment.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <DeploymentActionsMenu deployment={deployment} />
        </Card>
        {/* Only show deployment events for the most recent deployment (except crashed deployments) */}
        {isMostRecent && deployment.status !== DeploymentStatus.CRASHED && (
          <DeploymentEvents deployment={deployment} />
        )}
      </div>
    </>
  );
}

export default DeploymentCard;
