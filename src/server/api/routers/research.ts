import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const researchRouter = createTRPCRouter({
  getDashboardStats: publicProcedure.query(async ({ ctx }) => {
    const [apes, projects, sessions, logs] = await ctx.db.$transaction([
      ctx.db.ape.count(),
      ctx.db.researchProject.count(),
      ctx.db.session.count(),
      ctx.db.log.count(),
    ]);
    return { apes, projects, sessions, logs };
  }),

  getResearches: publicProcedure
    .input(
      z.object({
        sortField: z
          .enum([
            "id",
            "title",
            "description",
            "startDate",
            "endDate",
            "createdAt",
          ])
          .default("createdAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.researchProject.findMany({
        include: { locations: true },
        orderBy: { [input.sortField]: input.sortDir },
      });
    }),

  getResearchById: publicProcedure
    .input(z.object({ researchId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.researchProject.findUnique({
        where: { id: input.researchId },
        include: {
          locations: true,
          researchers: true,
          apeGroups: {
            include: {
              apes: { include: { species: true } },
            },
          },
        },
      });
    }),
  getUniqueApesByResearchId: publicProcedure
    .input(z.object({ researchId: z.number() }))
    .query(async ({ ctx, input }) => {
      const apes = await ctx.db.log.findMany({
        where: { researchProjectId: input.researchId },
        distinct: ["apeId"],
      });

      return apes;
    }),
  getLogsByResearchId: publicProcedure
    .input(z.object({ researchId: z.number() }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.log.findMany({
        where: { researchProjectId: input.researchId },
        include: { ape: true, session: true, researcher: true },
        orderBy: { startDatetime: "asc" },
      });

      return logs;
    }),
  addResearch: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startDate: z.string(),
        locationName: z.string().min(1),
        locationType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newResearch = await ctx.db.researchProject.create({
        data: {
          title: input.title,
          description: input.description ?? "",
          startDate: new Date(input.startDate),
          locations: {
            create: {
              name: input.locationName,
              type: input.locationType,
              country: "",
              xCoordinate: 0,
              yCoordinate: 0,
            },
          },
        },
      });

      return newResearch;
    }),

  addResearcherToProject: publicProcedure
    .input(
      z.object({
        researchProjectId: z.number(),
        researcherId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.researchProject.update({
        where: { id: input.researchProjectId },
        data: {
          researchers: { connect: { id: input.researcherId } },
        },
      });
    }),

  removeResearcherFromProject: publicProcedure
    .input(
      z.object({
        researchProjectId: z.number(),
        researcherId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.researchProject.update({
        where: { id: input.researchProjectId },
        data: {
          researchers: { disconnect: { id: input.researcherId } },
        },
      });
    }),
});
