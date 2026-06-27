// Public entrypoint for the Convex backend, consumed by apps/web and apps/api.
//
// `api` / `internal` (the typed function references) and the data-model types
// are produced by code generation. They DO NOT EXIST until you run codegen:
//
//     bun run dev:backend        # `convex dev` — watches + regenerates
//     # or, one-off:
//     bun run codegen
//
// Until then, TypeScript will report that "./convex/_generated/*" is missing.
// That is expected on a fresh clone.
export { api, internal } from "./convex/_generated/api";
export type { Doc, Id } from "./convex/_generated/dataModel";
