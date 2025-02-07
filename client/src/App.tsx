import { useGetService } from "./hooks/useGetService";
import { useGetDeployments } from "./hooks/useGetDeployments";
import DeploymentCard from "./components/deployment-card";
import { LucideArrowDown } from "lucide-react";
import { Button } from "./components/primitives/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "./lib/utils";
import DeploymentCardContainer from "./components/deployment-card-container";
import { Separator } from "./components/primitives/separator";
import { Deployment } from "@/types";

function App() {
  const [showHistory, setShowHistory] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data } = useGetService("39cd327c-525b-414e-957c-3959a17486a2");
  const {
    data: deployments,
    fetchNextPage,
    hasNextPage,
  } = useGetDeployments(
    "39cd327c-525b-414e-957c-3959a17486a2",
    "5601a4f4-da8e-4978-9e2f-ac476d3cb851",
    "96fbbfd7-6939-4fc5-9022-954774f26bd9"
  );
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
      <div className="flex flex-col items-start justify-start bg-white w-[50%] mx-auto p-8 my-10 border-solid border-[1px] border-gray-300 shadow-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center gap-2">
          <img
            className="w-[30px] object-contain rounded-full"
            src={data?.service.icon}
            alt="logo"
          />
          <h1 className="text-[22px] font-semibold">{data?.service.name}</h1>
        </div>
        <Separator className="my-4" />
        <DeploymentCardContainer>
          {deployments?.activeDeployments.length &&
            deployments.activeDeployments.length > 0 && (
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
            {deployments?.priorDeployments.map((deployment: Deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} />
            ))}
          </div>
        </DeploymentCardContainer>
      </div>
    </div>
  );
}

export default App;
