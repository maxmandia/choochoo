import { GRAPHQL_ENDPOINT } from "../constants";

export async function graphqlRequest<T>({
  query,
  variables,
}: {
  query: string;
  variables?: any;
}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  return data.data as T;
}
