import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/statistics")({
  beforeLoad: () => {
    throw redirect({ to: "/analytics" });
  },
});
