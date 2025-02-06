export enum DeploymentStatus {
  SUCCESS = "SUCCESS",
  REMOVED = "REMOVED",
  CRASHED = "CRASHED",
  BUILDING = "BUILDING",
  DEPLOYING = "DEPLOYING",
  REMOVING = "REMOVING",
}

export enum DeploymentEventStep {
  BUILD_IMAGE = "BUILD_IMAGE",
  CREATE_CONTAINER = "CREATE_CONTAINER",
  DRAIN_INSTANCES = "DRAIN_INSTANCES",
  HEALTHCHECK = "HEALTHCHECK",
  MIGRATE_VOLUMES = "MIGRATE_VOLUMES",
  PRE_DEPLOY_COMMAND = "PRE_DEPLOY_COMMAND",
  PUBLISH_IMAGE = "PUBLISH_IMAGE",
  SNAPSHOT_CODE = "SNAPSHOT_CODE",
  WAIT_FOR_DEPENDENCIES = "WAIT_FOR_DEPENDENCIES",
}

export interface Deployment {
  id: string;
  status: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  serviceId: string;
  url: string;
  staticUrl: string;
  canRollback: boolean;
  canRedeploy: boolean;
  creator: {
    avatar: string;
    id: string;
    name: string;
  };
  sockets: {
    port: number;
    ipv6: string;
    processName: string;
  }[];
  meta: {
    commitMessage: string;
  };
  environmentId: string;
  suggestAddServiceDomain: boolean;
  deploymentStopped: boolean;
}

export interface ServiceData {
  deployments: {
    edges: {
      node: Deployment;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

export interface ServiceInstanceDeployData {
  serviceInstanceDeployV2: string;
}
