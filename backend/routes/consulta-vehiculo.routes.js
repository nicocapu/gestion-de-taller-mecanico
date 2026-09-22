import {Router} from "express";
import{getEstadoPublicoVehiculo}from"../controllers/consulta-vehiculo.controller.js";
import { verificarToken, verificarRol } from "../middlewares/verificarToken.middleware.js";
const router=Router();
router.get("/ConsultaVehiculo",verificarToken,getEstadoPublicoVehiculo);
export default router;