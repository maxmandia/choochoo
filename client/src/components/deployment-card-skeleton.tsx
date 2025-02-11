import { Skeleton } from "./primitives/skeleton";
import { Card } from "./primitives/card";

function DeploymentCardSkeleton() {
  return (
    <div className="border-solid border-[1px] border-gray-100 w-full">
      <Card className="flex md:flex-row rounded-none items-start md:items-center p-3 md:p-6 gap-3 md:gap-6 justify-between m-1 shadow-none border-none bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
          <Skeleton className="h-6 w-20 bg-gray-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-[25px] md:h-[30px] w-[25px] md:w-[30px] rounded-full bg-gray-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-40 bg-gray-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200" />
              <Skeleton className="h-3 w-24 bg-gray-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-8 bg-gray-200 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200" />
      </Card>
    </div>
  );
}

export default DeploymentCardSkeleton;
