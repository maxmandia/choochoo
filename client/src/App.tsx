import { useGetService } from "@/hooks/useGetService";
import { useGetDeployments } from "@/hooks/useGetDeployments";
import DeploymentCard from "@/components/deployment-card";
import { LucideArrowDown } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import DeploymentCardContainer from "@/components/deployment-card-container";
import { Separator } from "@/components/primitives/separator";
import { Deployment } from "@/types";
import DeploymentCardSkeleton from "@/components/deployment-card-skeleton";
import { Skeleton } from "@/components/primitives/skeleton";
import { SERVICE_ID, PROJECT_ID, ENVIRONMENT_ID } from "@/constants";

function App() {
  const [showHistory, setShowHistory] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data, isLoading: isServiceLoading } = useGetService(SERVICE_ID);
  const {
    data: deployments,
    fetchNextPage,
    hasNextPage,
    isLoading: isDeploymentsLoading,
  } = useGetDeployments(SERVICE_ID, PROJECT_ID, ENVIRONMENT_ID);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          try {
            setIsLoadingMore(true);
            await fetchNextPage();
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      { threshold: 0 }
    );

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && showHistory) {
      const lastChild = scrollContainer.lastElementChild;
      if (lastChild) {
        observer.observe(lastChild);
      }
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, showHistory, isLoadingMore]);

  return (
    <div className="bg-gray-100 w-screen min-h-screen flex font-sans">
      <div className="flex flex-col items-start justify-start bg-white w-full min-h-screen mx-auto p-4 border-solid border-0 md:border-[1px] md:border-gray-300 md:shadow-lg md:max-h-[90vh] md:min-h-0 overflow-hidden md:w-[75%] md:p-8 md:my-10 lg:w-[50%]">
        <div className="flex items-center gap-2 w-full">
          {isServiceLoading ? (
            <>
              <Skeleton className="w-[25px] md:w-[30px] h-[25px] md:h-[30px] rounded-full" />
              <Skeleton className="h-6 w-40" />
            </>
          ) : (
            <>
              <img
                className="w-[25px] md:w-[30px] object-contain rounded-full"
                src={data?.service.icon}
                alt="logo"
              />
              <h1 className="text-[18px] md:text-[22px] font-semibold">
                {data?.service.name}
              </h1>
            </>
          )}
        </div>
        <Separator className="my-3 md:my-4" />
        <DeploymentCardContainer>
          {isDeploymentsLoading ? (
            <DeploymentCardSkeleton />
          ) : (
            deployments?.activeDeployments &&
            deployments?.activeDeployments.length > 0 && (
              <>
                {deployments.activeDeployments.map(
                  (deployment: Deployment, index: number) => (
                    <DeploymentCard
                      key={deployment.id}
                      deployment={deployment}
                      isMostRecent={index === 0}
                    />
                  )
                )}
              </>
            )
          )}
        </DeploymentCardContainer>

        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="ghost"
          className="flex-shrink-0 flex items-center gap-2 w-fit py-1"
        >
          <LucideArrowDown
            className={cn(
              "w-4 h-4 transition-transform duration-250",
              !showHistory && "-rotate-90"
            )}
          />
          <span>History</span>
        </Button>
        <DeploymentCardContainer
          className={cn(
            "grid transition-[grid-template-rows] duration-300 flex-grow max-h-[600px] min-h-0",
            showHistory ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div
            ref={scrollContainerRef}
            className="overflow-y-scroll flex flex-col gap-4 flex-grow"
          >
            {isDeploymentsLoading ? (
              <>
                <DeploymentCardSkeleton />
                <DeploymentCardSkeleton />
                <DeploymentCardSkeleton />
              </>
            ) : (
              deployments?.priorDeployments.map((deployment: Deployment) => (
                <DeploymentCard key={deployment.id} deployment={deployment} />
              ))
            )}
          </div>
        </DeploymentCardContainer>
      </div>
    </div>
  );
}

export default App;
