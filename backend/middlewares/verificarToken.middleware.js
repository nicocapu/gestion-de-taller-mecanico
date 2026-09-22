import jwt from "jsonwebtoken"
import "dotenv/config"
export const verificarToken = (req, res, next) => {
try {
    const token = req.headers["x-access-token"];
    console.log("Token recibido:", token)
    if (!token) {return res.status(403).json({ message: "No se proporcionó un token" })}
    const verificar = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Token verificado:", verificar)
    req.user = verificar
    next()
}
catch (error) {
    return res.status(401).json({ message: "Token inválido" })

}
}
export const verificarRol = async (req, res, next) => {
  if (req.user?.ROL !== "admin") {
    return res.status(403).json({ 
      message: "Acceso denegado. No tiene permisos para realizar esta acción." 
    });
  }

  next();
};