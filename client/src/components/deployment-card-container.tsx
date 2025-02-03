import { cn } from "@/lib/utils";
import React from "react";

function DeploymentCardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 w-full py-4", className)}>
      {children}
    </div>
  );
}

export default DeploymentCardContainer;
