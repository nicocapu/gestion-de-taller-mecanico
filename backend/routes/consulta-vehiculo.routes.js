import {Router} from "express";
import{getEstadoPublicoVehiculo}from"../controllers/consulta-vehiculo.controller.js";
const router=Router();
router.get("/ConsultaVehiculo",getEstadoPublicoVehiculo);
export default router;