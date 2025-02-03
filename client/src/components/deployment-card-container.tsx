import React from "react";

function DeploymentCardContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 w-full py-4">{children}</div>;
}

export default DeploymentCardContainer;
