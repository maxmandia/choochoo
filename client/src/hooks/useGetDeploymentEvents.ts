import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { GET_DEPLOYMENT_EVENTS } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";

interface DeploymentEvent {
  step: string;
}

export function useGetDeploymentEvents(
  deploymentId: string,
  options: Omit<
    UseQueryOptions<DeploymentEvent[], unknown, DeploymentEvent[]>,
    "queryKey" | "queryFn"
  > = {}
) {
  return useQuery({
    queryKey: ["deploymentEvents"],
    queryFn: async () => {
      const data = await graphqlRequest<{
        deploymentEvents: { edges: { node: DeploymentEvent }[] };
      }>({
        query: GET_DEPLOYMENT_EVENTS,
        variables: {
          id: deploymentId,
        },
      });

      return data.deploymentEvents.edges.map((edge) => edge.node);
    },
    staleTime: 0,
    refetchOnMount: true,
    ...options,
  });
}
