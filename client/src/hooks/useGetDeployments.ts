import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

  return useInfiniteQuery<any, Error, any, string[], string | null>({
    queryKey: ["deployments"],
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      const data = await graphqlRequest<ServiceData>({
        query: GET_DEPLOYMENTS,
        variables: {
          input: {
            serviceId,
            projectId,
            environmentId,
          },
          first: pageSize,
          after: pageParam,
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

      return {
        activeDeployments,
        priorDeployments,
        pageInfo: data?.deployments?.pageInfo,
      };
    },
    getNextPageParam: (lastPage) => lastPage.pageInfo?.endCursor,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      activeDeployments: data.pages[0].activeDeployments,
      priorDeployments: data.pages.flatMap((page) => page.priorDeployments),
    }),
  });
}
