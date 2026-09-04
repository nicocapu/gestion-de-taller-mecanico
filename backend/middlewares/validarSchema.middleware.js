
export const validarSchema=(schema)=>(req,res,next)=>{
    const result= schema.safeParse(req.body)
    if (!result.success) {
    return res.status(400).json({
      status: "error",
      message: "Error de validación en los datos",
      errores: result.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensaje: issue.message
      }))
    });
  }
req.body = result.data;
  next();
}