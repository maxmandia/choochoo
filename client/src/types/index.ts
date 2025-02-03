export enum DeploymentStatus {
  SUCCESS = "SUCCESS",
  REMOVED = "REMOVED",
  CRASHED = "CRASHED",
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
