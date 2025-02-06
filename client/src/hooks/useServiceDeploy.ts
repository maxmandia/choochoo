import { useMutation } from "@tanstack/react-query";
import { DEPLOY_SERVICE_V2 } from "../api/mutations";
import { graphqlRequest } from "../api/graphqlClient";
import { ServiceInstanceDeployData } from "../types";
export function useServiceDeploy(environmentId: string, serviceId: string) {
  return useMutation({
    mutationFn: async () => {
      const data = await graphqlRequest<ServiceInstanceDeployData>({
        query: DEPLOY_SERVICE_V2,
        variables: { environmentId, serviceId },
      });
      return data.serviceInstanceDeployV2;
    },
  });
}
