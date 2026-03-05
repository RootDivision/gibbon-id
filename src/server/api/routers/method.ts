import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const methodRouter = createTRPCRouter({
  getMethods: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.method.findMany({ orderBy: { name: "asc" } });
  }),

  addMethod: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.method.create({ data: { name: input.name } });
    }),

  updateMethod: publicProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.method.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  deleteMethod: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.method.delete({ where: { id: input.id } });
    }),
});
