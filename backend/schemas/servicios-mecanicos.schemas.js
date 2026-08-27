import z from "zod"
export const servicioSchema= z.object({
    IdServicio: z.number({
      required_error: "El IdServicio es obligatorio",
      invalid_type_error: "El IdServicio debe ser un número entero",
    })
    .int({ message: "El IdServicio debe ser un número entero" })
    .positive({ message: "El IdServicio debe ser un número positivo" }),

  IdMecanico: z
    .number({
      required_error: "El IdAuto es obligatorio",
      invalid_type_error: "El IdAuto debe ser un número entero",
    })
    .int({ message: "El IdAuto debe ser un número entero" })
    .positive({ message: "El IdAuto debe ser un número positivo" }),

    FechaInicio: z.date({message: "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)"})
    
})