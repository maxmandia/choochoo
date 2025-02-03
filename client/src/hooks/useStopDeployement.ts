import { useMutation } from "@tanstack/react-query";
import { STOP_DEPLOYMENT } from "../api/mutations";
import { graphqlRequest } from "../api/graphqlClient";

interface ServiceData {
  service: {
    createdAt: string;
  };
}

export function useStopDeployment() {
  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<ServiceData>({
        query: STOP_DEPLOYMENT,
        variables: { id },
      }),
  });
}
