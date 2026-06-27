import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Public reactive query: any client subscribing to this gets live updates.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(50);
    return messages.reverse();
  },
});

// Authenticated mutation: only signed-in users may post.
export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not signed in");
    }
    const user = await ctx.db.get(userId);
    await ctx.db.insert("messages", {
      body: body.trim(),
      author: user?.email ?? user?.name ?? "anonymous",
      userId,
    });
  },
});
