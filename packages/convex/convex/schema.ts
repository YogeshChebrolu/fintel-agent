import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Tables required by Convex Auth: users, authSessions, authAccounts, etc.
  ...authTables,

  // Demo table — a tiny message board used to prove the stack end-to-end.
  messages: defineTable({
    body: v.string(),
    author: v.string(),
    userId: v.optional(v.id("users")),
  }).index("by_user", ["userId"]),
});
