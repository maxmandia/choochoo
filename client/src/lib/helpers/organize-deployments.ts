import { Deployment, ServiceData } from "@/types";

import { DeploymentStatus } from "@/types";
import { toast } from "sonner";

export function organizeDeployments(data: ServiceData) {
  if (!data) {
    throw new Error("No data received from the server");
  }

  let activeDeployments: Deployment[] = [];
  let priorDeployments: Deployment[] = [];

  if (data?.deployments?.edges) {
    for (const deployment of data.deployments.edges) {
      if (
        deployment.node.status === DeploymentStatus.SUCCESS ||
        deployment.node.status === DeploymentStatus.CRASHED ||
        deployment.node.status === DeploymentStatus.BUILDING ||
        deployment.node.status === DeploymentStatus.DEPLOYING ||
        deployment.node.status === DeploymentStatus.INITIALIZING
      ) {
        activeDeployments.push(deployment.node);
      } else {
        priorDeployments.push(deployment.node);
      }
    }
  }

  // if there is a crashed deployment, we dismiss the toast - we use this for when a deployment is stopped
  const crashedDeployment = activeDeployments.find(
    (deployment) => deployment.status === DeploymentStatus.CRASHED
  );
  if (crashedDeployment) {
    toast.dismiss();
  }

  return {
    activeDeployments,
    priorDeployments,
    pageInfo: data?.deployments?.pageInfo,
  };
}
