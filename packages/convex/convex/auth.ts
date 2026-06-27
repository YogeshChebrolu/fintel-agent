import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

// Auth methods:
//  - Password: email + password sign-in/sign-up, with OTP password reset.
//  - Google:   OAuth SSO (reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET env vars).
// See https://labs.convex.dev/auth/config for the full list.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ reset: ResendOTPPasswordReset }), Google],
});
