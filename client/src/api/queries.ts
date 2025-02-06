export const GET_SERVICE = `
  query GetService($id: String!) {
    service(id: $id) {
      createdAt
      name
      icon
      deployments {
        edges {
          node {
            id
            createdAt
            updatedAt
            status
            meta
            creator {
              avatar
            }
          }
        }
      }
    }
  }
`;

export const DEPLOYMENT_FIELDS = `
  fragment DeploymentFields on Deployment {
    id
    status
    createdAt
    updatedAt
    projectId
    serviceId
    url
    staticUrl
    canRollback
    canRedeploy
    creator {
      avatar
      id
      name
    }
    sockets {
      port
      ipv6
      processName
    }
    meta
    environmentId
    suggestAddServiceDomain
    deploymentStopped
  }
`;

export const GET_DEPLOYMENTS = `
  ${DEPLOYMENT_FIELDS}
  query deployments($first: Int, $after: String, $input: DeploymentListInput!) {
    deployments(input: $input, first: $first, after: $after) {
      edges {
        node {
          ...DeploymentFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_DEPLOYMENT_EVENTS = `
  query deploymentEvents($id: String!) {
    deploymentEvents(id: $id) {
      edges {
        node {
          step
        }
      }
    }
  }
`;
