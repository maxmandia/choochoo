import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET_DEPLOYMENTS } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";
import { Deployment, DeploymentStatus, ServiceData } from "@/types";

export function useGetDeployments(
  serviceId: string,
  projectId: string,
  environmentId: string,
  pageSize: number = 10
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["deployments"],
    queryFn: async () => {
      const data = await graphqlRequest<ServiceData>({
        query: GET_DEPLOYMENTS,
        variables: {
          input: {
            serviceId,
            projectId,
            environmentId,
          },
          first: pageSize,
        },
      });

      let activeDeployments: Deployment[] = [];
      let priorDeployments: Deployment[] = [];

      if (data?.deployments?.edges) {
        for (const deployment of data.deployments.edges) {
          if (
            deployment.node.status === DeploymentStatus.SUCCESS ||
            deployment.node.status === DeploymentStatus.CRASHED ||
            deployment.node.status === DeploymentStatus.BUILDING ||
            deployment.node.status === DeploymentStatus.DEPLOYING ||
            deployment.node.status === DeploymentStatus.INITIALIZING
          ) {
            activeDeployments.push(deployment.node);
          } else {
            priorDeployments.push(deployment.node);
          }
        }
      }

      // when we recieve a new deployment event, we refetch deployments inside the web socket context.
      // however, deployement statuses can change after the last deployment event is recieved
      // so we need to refetch the deployments again here if either of the following are true:
      // 1. there is a deployment that is being removed
      // 2. there are more than 1 deployment that has a status of success
      setTimeout(() => {
        if (
          priorDeployments.some(
            (deployment) => deployment.status === DeploymentStatus.REMOVING
          ) ||
          activeDeployments.filter(
            (deployment) => deployment.status === DeploymentStatus.SUCCESS
          ).length > 1
        ) {
          queryClient.invalidateQueries({ queryKey: ["deployments"] });
        }
      }, 1000);

      return { activeDeployments, priorDeployments };
    },
    select: (data) => data ?? { activeDeployments: [], priorDeployments: [] },
  });
}
