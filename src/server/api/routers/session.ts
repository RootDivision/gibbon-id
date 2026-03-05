import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const sessionRouter = createTRPCRouter({
  getSessions: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.session.findMany({ orderBy: { name: "asc" } });
  }),

  getSessionById: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.session.findUnique({ where: { id: input.sessionId } });
    }),

  addSession: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.session.create({ data: { name: input.name } });
    }),

  updateSession: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.session.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),
});
