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
  getApes: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ape.findMany({
      orderBy: { name: "asc" },
      include: { species: true, group: true },
    });
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
});
