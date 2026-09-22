import{Router}from "express"
import{getServiciosActivos}from"../controllers/estado-vehiculo.controller.js"
import { verificarToken } from "../middlewares/verificarToken.middleware.js";
const router=Router();
router.get("/ServiciosActivos",verificarToken,getServiciosActivos);
export default router;