import z from "zod"
export const autoSchema= z.object({
  IdCliente: z.number({
    required_error: "El IdCliente es obligatorio",
    invalid_type_error: "El IdCliente debe ser un número entero positivo"})
    .int()
    .positive(),

    Patente: z.string({required_error: "La Patente es obligatoria"})
    .trim()
    .toUpperCase()
    .regex(/^([A-Z]{2}[0-9]{4}|[A-Z]{4}[0-9]{2})$/,{message: "La Patente debe tener el formato correcto (AA0000 o AAAA00)"}),

    Modelo: z.string({required_error: "el modelo es obligatorio"})
    .trim()
    .min(2,{message: "El modelo debe tener al menos 2 caracteres"})
    .max(50,{message: "El modelo no puede tener más de 50 caracteres"}),

    Color: z.string({required_error: "El color es obligatorio"})
    .trim()
    .min(2,{message: "El color debe tener al menos 2 caracteres"})
    .max(30,{message: "El color no puede tener más de 30 caracteres"}),

    Anio: z.number({invalid_type_error: "El año debe ser un número entero positivo"})
    .int()
    .min(1900,{message: "el año debe ser mayor o igual a 1900"})
    .max(new Date().getFullYear()+1,{message: `el año debe ser menor o igual a ${new Date().getFullYear()+1}`})
    })
