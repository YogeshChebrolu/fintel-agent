import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Returns the currently signed-in user document, or null if not authenticated.
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
