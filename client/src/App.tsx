import { useGetService } from "./hooks/useGetService";
import { useServiceDeploy } from "./hooks/useServiceDeploy";
import { useStopDeployment } from "./hooks/useStopDeployement";

function App() {
  const { data, refetch } = useGetService(
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutateAsync: deployService } = useServiceDeploy(
    "96fbbfd7-6939-4fc5-9022-954774f26bd9",
    "39cd327c-525b-414e-957c-3959a17486a2"
  );
  const { mutate: stopDeployment } = useStopDeployment();

  async function deployHandler() {
    await deployService();
    refetch();
  }

  return (
    <div>
      {data?.service.deployments.edges.map((deployment) => (
        <div key={deployment.node.id}>
          <p>{deployment.node.createdAt}</p>
          <button onClick={() => stopDeployment(deployment.node.id)}>
            Stop Deployment
          </button>
        </div>
      ))}
      <button onClick={deployHandler}>Deploy</button>
    </div>
  );
}

export default App;
