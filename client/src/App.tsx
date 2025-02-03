import { useGetService } from "./hooks/useGetService";
import { useGetDeployments } from "./hooks/useGetDeployments";
import { useServiceDeploy } from "./hooks/useServiceDeploy";
import { useStopDeployment } from "./hooks/useStopDeployement";
import DeploymentCard from "./components/deployment-card";
import { LucideArrowDown } from "lucide-react";
import { Button } from "./components/primitives/button";
import { useState } from "react";
import { cn } from "./lib/utils";
import DeploymentCardContainer from "./components/deployment-card-container";

function App() {
  const [showHistory, setShowHistory] = useState(true);
  const { data, refetch } = useGetService(
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutateAsync: deployService } = useServiceDeploy(
    "96fbbfd7-6939-4fc5-9022-954774f26bd9",
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutate: stopDeployment } = useStopDeployment();
  const { data: deployments } = useGetDeployments(
    "39cd327c-525b-414e-957c-3959a17486a2",
    "5601a4f4-da8e-4978-9e2f-ac476d3cb851",
    "96fbbfd7-6939-4fc5-9022-954774f26bd9"
  );

  async function deployHandler() {
    await deployService();
    refetch();
  }

  return (
    <div className="bg-backdrop h-screen w-screen flex items-center justify-center font-sans">
      <div className="flex flex-col items-start justify-start bg-white w-[50%] h-[90%] p-8 border-solid border-[1px] border-backdropBorder  shadow-lg">
        <div className="flex items-center gap-2">
          <img
            className="w-[30px] object-contain rounded-full"
            src={data?.service.icon}
            alt="logo"
          />
          <h1 className="text-[22px] font-semibold">{data?.service.name}</h1>
        </div>

        <DeploymentCardContainer>
          {deployments?.activeDeployment && (
            <DeploymentCard
              key={deployments?.activeDeployment.id}
              deployment={deployments?.activeDeployment}
            />
          )}
        </DeploymentCardContainer>

        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="ghost"
          className="flex items-center gap-2 w-fit py-1"
        >
          <LucideArrowDown
            className={cn(
              "w-4 h-4 transition-transform duration-250",
              !showHistory && "-rotate-90"
            )}
          />
          <span>History</span>
        </Button>
        <DeploymentCardContainer>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300",
              showHistory ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden">
              {deployments?.priorDeployments.map((deployment) => (
                <DeploymentCard key={deployment.id} deployment={deployment} />
              ))}
            </div>
          </div>
        </DeploymentCardContainer>
      </div>
    </div>
  );
}

export default App;
