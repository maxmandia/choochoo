import { useMutation } from "@tanstack/react-query";
import { REDEPLOY_DEPLOYMENT } from "../api/mutations";
import { graphqlRequest } from "../api/graphqlClient";

interface ServiceData {
  service: {
    createdAt: string;
  };
}

export function useDeploymentRedeploy() {
  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<ServiceData>({
        query: REDEPLOY_DEPLOYMENT,
        variables: { id },
      }),
  });
}
