import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const logRouter = createTRPCRouter({
  getLogs: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.log.findMany({
      include: {
        ape: { include: { species: true } },
        researchProject: { include: { locations: true } },
        session: true,
        method: true,
        researcher: true,
      },
      orderBy: { id: "desc" },
    });
  }),

  getLogsBySessionId: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.log.findMany({
        where: { sessionId: input.sessionId },
        include: { ape: true, method: true, researcher: true },
        orderBy: { id: "asc" },
      });
    }),

  addLog: publicProcedure
    .input(
      z.object({
        behaviour: z.string().min(1),
        startDatetime: z.string(),
        endDatetime: z.string(),
        notes: z.string().optional(),
        apeId: z.number(),
        methodId: z.number(),
        researchProjectId: z.number(),
        sessionId: z.number(),
        researcherId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.log.create({
        data: {
          behaviour: input.behaviour,
          startDatetime: new Date(input.startDatetime),
          endDatetime: new Date(input.endDatetime),
          notes: input.notes,
          apeId: input.apeId,
          methodId: input.methodId,
          researchProjectId: input.researchProjectId,
          sessionId: input.sessionId,
          researcherId: input.researcherId,
        },
      });
    }),

  getLogsByApeId: publicProcedure
    .input(
      z.object({
        apeId: z.number(),
        sortField: z
          .enum(["id", "startDatetime", "endDatetime", "behaviour"])
          .default("startDatetime"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
        behaviour: z.string().optional(),
        researchProjectId: z.number().optional(),
        sessionId: z.number().optional(),
        methodId: z.number().optional(),
        researcherId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        apeId: input.apeId,
        ...(input.behaviour
          ? {
              behaviour: {
                contains: input.behaviour,
                mode: "insensitive" as const,
              },
            }
          : {}),
        ...(input.researchProjectId != null
          ? { researchProjectId: input.researchProjectId }
          : {}),
        ...(input.sessionId != null ? { sessionId: input.sessionId } : {}),
        ...(input.methodId != null ? { methodId: input.methodId } : {}),
        ...(input.researcherId != null
          ? { researcherId: input.researcherId }
          : {}),
      };

      return ctx.db.log.findMany({
        where,
        include: {
          researchProject: true,
          session: true,
          method: true,
          researcher: true,
        },
        orderBy: { [input.sortField]: input.sortDir },
      });
    }),
});
