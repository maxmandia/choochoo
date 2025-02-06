import { useQuery } from "@tanstack/react-query";
import { GET_DEPLOYMENTS } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";
import { Deployment, DeploymentStatus, ServiceData } from "@/types";

export function useGetDeployments(
  serviceId: string,
  projectId: string,
  environmentId: string,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ["deployments", serviceId, projectId, environmentId, pageSize],
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
            deployment.node.status === DeploymentStatus.DEPLOYING
          ) {
            activeDeployments.push(deployment.node);
          } else {
            priorDeployments.push(deployment.node);
          }
        }
      }

      return { activeDeployments, priorDeployments };
    },
    select: (data) => data ?? { activeDeployments: [], priorDeployments: [] },
  });
}
