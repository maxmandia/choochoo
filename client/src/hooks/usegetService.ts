import { useQuery } from "@tanstack/react-query";
import { GET_SERVICE } from "../api/queries";
import { graphqlRequest } from "../api/graphqlClient";

interface ServiceData {
  service: {
    createdAt: string;
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
