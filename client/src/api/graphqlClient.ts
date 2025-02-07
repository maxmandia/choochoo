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

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.message ||
        "An error occurred while processing your request"
    );
  }

  if (data.errors) {
    const errorMessage =
      data?.errors?.[0]?.message ||
      "An error occurred while processing your request";
    throw new Error(errorMessage);
  }
  return data.data as T;
}
