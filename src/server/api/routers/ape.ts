import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const apeInput = z.object({
  name: z.string().min(1),
  speciesId: z.number().nullable().optional(),
  groupId: z.number().nullable().optional(),
  sex: z.enum(["Male", "Female"]).nullable().optional(),
  ageClass: z
    .enum(["Infant", "Juvenile", "Subadult", "Adult"])
    .nullable()
    .optional(),
});

export const apeRouter = createTRPCRouter({
  getApes: publicProcedure
    .input(
      z.object({
        sortField: z.enum(["id", "name", "sex", "ageClass"]).default("name"),
        sortDir: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const apeResponse = ctx.db.ape.findMany({
        orderBy: { [input.sortField]: input.sortDir },
        include: { species: true, group: true },
      });

      const modified = await apeResponse.then((apes) =>
        apes.map((ape) => ({
          ...ape,
          fakeProperty: "Fake 123",
        })),
      );

      return modified;
    }),

  getSpecies: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.species.findMany({ orderBy: { name: "asc" } });
  }),

  addApe: publicProcedure.input(apeInput).mutation(async ({ ctx, input }) => {
    return ctx.db.ape.create({ data: input });
  }),

  updateApe: publicProcedure
    .input(apeInput.extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.ape.update({ where: { id }, data });
    }),

  deleteApe: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ape.delete({ where: { id: input.id } });
    }),

  getApeById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ape.findUnique({
        where: { id: input.id },
        include: { species: true, group: true },
      });
    }),
});
