import z from "zod"
export const servicioSchema= z.object({
    IdCliente: z.number({
      required_error: "El IdCliente es obligatorio",
      invalid_type_error: "El IdCliente debe ser un número entero",
    })
    .int({ message: "El IdCliente debe ser un número entero" })
    .positive({ message: "El IdCliente debe ser un número positivo" }),

  IdAuto: z
    .number({
      required_error: "El IdAuto es obligatorio",
      invalid_type_error: "El IdAuto debe ser un número entero",
    })
    .int({ message: "El IdAuto debe ser un número entero" })
    .positive({ message: "El IdAuto debe ser un número positivo" }),

    FechaInicio: z.coerce.date({message: "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)"}),

    FechaTermino: z.coerce.date({message: "La fecha de término debe tener un formato válido (YYYY-MM-DD)"})
    .nullable()
    .optional(),

    DescripcionProblema: z.string({required_error: "La descripción del problema es obligatoria"})
    .min(10,{message: "La descripción del problema debe tener al menos 10 caracteres"})
    .max(500,{message: "La descripción del problema no puede tener más de 500 caracteres"}),

    Diagnostico: z.string({required_error: "El diagnóstico es obligatorio"})
    .min(10,{message: "El diagnóstico debe tener al menos 10 caracteres"})
    .max(500,{message: "El diagnóstico no puede tener más de 500 caracteres"}),

   Estado: z.enum(["Pendiente", "En reparación", "Finalizado", "Cancelado"], {
    errorMap: () => ({
      message: "El estado debe ser: Pendiente, En reparación, Finalizado o Cancelado",
    }),
  }),

    Precio: z.number({required_error: "El precio es obligatorio", invalid_type_error: "El precio debe ser un número"})
    .min(0,{message: "El precio no puede ser negativo"})
})