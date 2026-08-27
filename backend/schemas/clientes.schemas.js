import z from "zod"
export const clienteSchema= z.object({
    Rut: z.string({required_error: "El Rut es obligatorio"})
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{7,8}-[0-9K]$/,{message: "El Rut debe tener el formato correcto (12345678-9 o 1234567-K)"}),
   Nombre: z.string({required_error: "El nombre es obligatorio"})
   .toUpperCase()
   .min(3,{message: "El nombre debe tener al menos 3 caracteres"})
   .max(50,{message: "El nombre no puede tener más de 50 caracteres"})
   .regex(/^[A-ZÁÉÍÓÚÑÜ\s]+$/,{message: "El nombre solo puede contener letras y espacios"}),
   NumeroTelefonico: z.string({required_error: "El número telefónico es obligatorio"})
   .trim()
   .regex(/^(\+?56)?9[0-9]{8}$/,{message: "El número telefónico debe tener 9 dígitos"}),
    CorreoElectronico: z.email({message: "El correo electrónico debe tener un formato válido"})
    .trim()
    .toLowerCase()
    .max(50,{message: "El correo electrónico no puede tener más de 50 caracteres"}),
})