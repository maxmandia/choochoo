import { useQuery } from "@tanstack/react-query";
import { GET_SERVICE } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";

enum DeploymentStatus {
  SUCCESS = "SUCCESS",
}

interface ServiceData {
  service: {
    name: string;
    icon: string;
    createdAt: string;
    deployments: {
      edges: {
        node: {
          id: string;
          createdAt: string;
          updatedAt: string;
          meta: {
            commitMessage: string;
          };
          creator: {
            avatar: string;
          };
          status: DeploymentStatus;
        };
      }[];
    };
  };
}

export function useGetService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () =>
      graphqlRequest<ServiceData>({
        query: GET_SERVICE,
        variables: { id },
      }),
  });
}
