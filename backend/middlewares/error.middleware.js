export const manejadorErrores = (err, req, res, next) => {
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: "Conflicto en la base de datos",
      errores: [
        {
          campo: "Registro",
          mensaje: "ya existe un registro con ese dato irrepetible."
        }
      ]
    });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      status: "error",
      message: "Recurso relacionado no encontrado",
      errores: [
        {
          campo: "referencia",
          mensaje: "El identificador relacionado no existe en la base de datos."
        }
      ]
    });
  }
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Error interno del servidor" : err.message;

  res.status(statusCode).json({
    status: "error",
    message,
    errores: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack, mysqlCode: err.code })
  });
};