import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const researcherRouter = createTRPCRouter({
  getResearchers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.researcher.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),

  addResearcher: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.researcher.create({ data: input });
    }),
});
