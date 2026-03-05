import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { apeGroupRouter } from "./routers/apeGroup";
import { apeRouter } from "./routers/ape";
import { logRouter } from "./routers/log";
import { methodRouter } from "./routers/method";
import { researchRouter } from "./routers/research";
import { researcherRouter } from "./routers/researcher";
import { sessionRouter } from "./routers/session";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ape: apeRouter,
  apeGroup: apeGroupRouter,
  log: logRouter,
  method: methodRouter,
  research: researchRouter,
  researcher: researcherRouter,
  session: sessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
