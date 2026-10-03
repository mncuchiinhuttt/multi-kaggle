import { z } from "zod";

export interface ModelListItem {
  ref: string;
  title: string;
}

export const ModelsListResponseSchema = z.object({
  models: z
    .array(
      z.object({
        ref: z.string().optional(),
        title: z.string().optional(),
      })
    )
    .optional(),
});
