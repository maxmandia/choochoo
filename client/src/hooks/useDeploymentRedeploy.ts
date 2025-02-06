import { useMutation } from "@tanstack/react-query";
import { REDEPLOY_DEPLOYMENT } from "../api/mutations";
import { graphqlRequest } from "../api/graphqlClient";

interface RedeployData {
  deploymentRedeploy: {
    id: string;
  };
}

export function useDeploymentRedeploy() {
  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<RedeployData>({
        query: REDEPLOY_DEPLOYMENT,
        variables: { id },
      }),
  });
}
