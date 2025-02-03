export const DEPLOY_SERVICE_V2 = `
  mutation DeployServiceV2($environmentId: String!, $serviceId: String!) {
    serviceInstanceDeployV2(environmentId: $environmentId, serviceId: $serviceId)
  }
`;

export const STOP_DEPLOYMENT = `
  mutation deploymentStop($id: String!) {
    deploymentStop(id: $id)
  }
`;
