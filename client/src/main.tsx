import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { WebSocketProvider } from "./context/web-socket-context.tsx";
import { Toaster } from "./components/primitives/sonner.tsx";
import { toast } from "sonner";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Request Failed`, {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Request Failed`, {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  }),
  defaultOptions: {
    queries: {
      // these defaults keep me sane when developing
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <Toaster />
        <App />
      </WebSocketProvider>
    </QueryClientProvider>
  </StrictMode>
);
