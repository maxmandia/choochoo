export const DEPLOYMENT_SUBSCRIPTION = `
  subscription deployment($id: String!) {
    deployment(id: $id) {
      id
      status
    }
  }
`;

export const DEPLOYMENT_EVENTS_SUBSCRIPTION = `
  subscription deploymentEvents($id: String!) {
    deploymentEvents(id: $id) {
      id
      step
    }
  }
`;
