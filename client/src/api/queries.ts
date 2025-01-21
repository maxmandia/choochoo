export const GET_SERVICE = `
  query GetService($id: String!) {
    service(id: $id) {
      createdAt
    }
  }
`;
