import z from "zod"
export const mecanicoSchema= z.object({
    Nombre: z.string({required_error: "El nombre es obligatorio"})
       .toUpperCase()
       .min(3,{message: "El nombre debe tener al menos 3 caracteres"})
       .max(50,{message: "El nombre no puede tener más de 50 caracteres"})
       .regex(/^[A-ZÁÉÍÓÚÑÜ\s]+$/,{message: "El nombre solo puede contener letras y espacios"}),
    Especialidad: z.string({required_error: "La especialidad es obligatoria"})
       .toUpperCase()
       .min(3,{message: "La especialidad debe tener al menos 3 caracteres"})
       .max(50,{message: "La especialidad no puede tener más de 50 caracteres"}),
    Correo: z.email({message: "El correo electrónico debe tener un formato válido"})
        .trim()
        .toLowerCase()
        .max(50,{message: "El correo electrónico no puede tener más de 50 caracteres"}),
        
    Contrasenia: z.string({required_error: "La contraseña es obligatoria"})
        .min(8,{message: "La contraseña debe tener al menos 8 caracteres"})
        .max(50,{message: "La contraseña no puede tener más de 50 caracteres"})
        .regex(/[A-Z]/, { message: "Debe contener al menos una letra mayúscula" })
        .regex(/[a-z]/, { message: "Debe contener al menos una letra minúscula" })
        .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    ROL: z.enum(['Mecanico', 'Administrador']).default('Mecanico')
})