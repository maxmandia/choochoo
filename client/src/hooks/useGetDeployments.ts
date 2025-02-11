import { useInfiniteQuery } from "@tanstack/react-query";
import { GET_DEPLOYMENTS } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";
import { DeploymentsQueryData, ServiceData } from "@/types";
import { organizeDeployments } from "@/lib/helpers/organize-deployments";
import { DeploymentPageInfo, Deployment } from "@/types";

export function useGetDeployments(
  serviceId: string,
  projectId: string,
  environmentId: string,
  pageSize: number = 10
) {
  return useInfiniteQuery<
    {
      activeDeployments: Deployment[];
      priorDeployments: Deployment[];
      pageInfo: DeploymentPageInfo;
    },
    Error,
    DeploymentsQueryData,
    string[],
    string | null
  >({
    queryKey: ["deployments"],
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      try {
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

        // organize the deployments into active and prior deployments
        return organizeDeployments(data);
      } catch (error) {
        // Re-throw the error to be handled by the QueryCache
        throw error instanceof Error
          ? error
          : new Error("An unknown error occurred");
      }
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
