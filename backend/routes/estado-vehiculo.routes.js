import{Router}from "express"
import{getServiciosActivos}from"../controllers/estado-vehiculo.controller.js"
const router=Router();
router.get("/ServiciosActivos",getServiciosActivos);
export default router;