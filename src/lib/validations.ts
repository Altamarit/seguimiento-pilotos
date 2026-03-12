import { z } from "zod";

export const pilotSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio").trim(),
    objective: z.string().optional(),
    status: z.enum(["planificado", "en_marcha", "finalizado", "cancelado"]),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    trained_people_count: z.coerce.number().min(0).default(0),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["end_date"],
    }
  );

export const impactEventSchema = z
  .object({
    event_type: z.enum(["formacion", "productividad", "otro"]),
    event_date: z.string().min(1, "La fecha es obligatoria"),
    description: z.string().min(1, "La descripción es obligatoria").trim(),
    trained_people_event: z.coerce.number().min(0).nullable().optional(),
    productivity_improvement_pct: z.coerce
      .number()
      .min(-100)
      .max(999.99)
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.event_type === "formacion") {
        return (
          data.trained_people_event !== null &&
          data.trained_people_event !== undefined
        );
      }
      return true;
    },
    {
      message: "Indica el número de personas formadas",
      path: ["trained_people_event"],
    }
  )
  .refine(
    (data) => {
      if (data.event_type === "productividad") {
        return (
          data.productivity_improvement_pct !== null &&
          data.productivity_improvement_pct !== undefined
        );
      }
      return true;
    },
    {
      message: "Indica el porcentaje de mejora de productividad",
      path: ["productivity_improvement_pct"],
    }
  );

export type PilotFormData = z.infer<typeof pilotSchema>;
export type ImpactEventFormData = z.infer<typeof impactEventSchema>;
