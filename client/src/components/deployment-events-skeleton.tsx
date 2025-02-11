import { Card } from "./primitives/card";
import { Skeleton } from "./primitives/skeleton";
import { DeploymentStatus } from "@/types";
import { cn } from "@/lib/utils";

function DeploymentEventsSkeleton({ status }: { status: DeploymentStatus }) {
  return (
    <Card
      className={cn(
        "flex rounded-none items-center p-3 md:p-4 pl-8 md:pl-14 gap-2 justify-start m-1 shadow-none border-none",
        status === DeploymentStatus.SUCCESS && "bg-green-50",
        (status === DeploymentStatus.REMOVED ||
          status === DeploymentStatus.REMOVING) &&
          "bg-gray-100",
        status === DeploymentStatus.CRASHED && "bg-red-50",
        (status === DeploymentStatus.BUILDING ||
          status === DeploymentStatus.DEPLOYING ||
          status === DeploymentStatus.INITIALIZING) &&
          "bg-blue-50"
      )}
    >
      <Skeleton className="h-[11px] md:h-[12px] w-[50px]" />
      <Skeleton className="h-[11px] md:h-[12px] w-[100px]" />
    </Card>
  );
}

export default DeploymentEventsSkeleton;
