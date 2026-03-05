import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const apeGroupRouter = createTRPCRouter({
  getApeGroups: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.apeGroup.findMany({
      orderBy: { name: "asc" },
      include: { apes: { include: { species: true } } },
    });
  }),

  getApeGroupById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.apeGroup.findUnique({
        where: { id: input.id },
        include: {
          apes: { include: { species: true } },
          researchProjects: true,
        },
      });
    }),

  addApeGroup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.apeGroup.create({
        data: { name: input.name, notes: input.notes },
      });
    }),

  linkToResearchProject: publicProcedure
    .input(
      z.object({
        apeGroupId: z.number(),
        researchProjectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.apeGroup.update({
        where: { id: input.apeGroupId },
        data: {
          researchProjects: { connect: { id: input.researchProjectId } },
        },
      });
    }),

  unlinkFromResearchProject: publicProcedure
    .input(
      z.object({
        apeGroupId: z.number(),
        researchProjectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.apeGroup.update({
        where: { id: input.apeGroupId },
        data: {
          researchProjects: { disconnect: { id: input.researchProjectId } },
        },
      });
    }),
});
