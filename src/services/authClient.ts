import { createAuthClient } from "better-auth/react";
import { InferAuth } from "better-auth/client";
import type { auth } from "../../server/auth";

export const authClient = createAuthClient({
  $InferAuth: InferAuth<typeof auth>(),
});

export type AuthSession = typeof auth.$Infer.Session;

export function useAuthSession() {
  const session = authClient.useSession();
  return {
    ...session,
    data: session.data as AuthSession | null,
  };
}
