import { useMutation } from "@tanstack/react-query";
import { DEPLOY_SERVICE_V2 } from "../api/mutations";
import { graphqlRequest } from "../api/graphqlClient";

interface ServiceData {
  service: {
    createdAt: string;
  };
}

export function useServiceDeploy(environmentId: string, serviceId: string) {
  return useMutation({
    mutationFn: () =>
      graphqlRequest<ServiceData>({
        query: DEPLOY_SERVICE_V2,
        variables: { environmentId, serviceId },
      }),
  });
}
