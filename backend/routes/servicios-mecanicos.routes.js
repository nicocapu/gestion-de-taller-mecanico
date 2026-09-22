import { Router } from "express"
import {
  getAllServicioMecanicos,
  getMecanicosByServicio,
  asignarMecanico,
  removeMecanicoFromServicio,
  getServiciosByMecanico
} from "../controllers/servicios-mecanicos.controller.js"
import { validarSchema } from "../middlewares/validarSchema.middleware.js"
import { servicioMecanicoSchema } from "../schemas/servicios-mecanicos.schemas.js"
import { getTodosLosServiciosAdmin } from "../controllers/servicios-mecanicos.controller.admin.js"
import { verificarToken, verificarRol } from "../middlewares/verificarToken.middleware.js"

const router = Router()

router.get("/ServicioMecanico",verificarToken, getAllServicioMecanicos)
router.get('/ServicioMecanico/todos',verificarToken, verificarToken,verificarRol, getTodosLosServiciosAdmin);
router.get("/ServicioMecanico/:idServicio",verificarToken, getMecanicosByServicio)
router.post("/ServicioMecanico",verificarToken, validarSchema(servicioMecanicoSchema), asignarMecanico)
router.delete("/ServicioMecanico/:idServicio/:idMecanico",verificarToken, removeMecanicoFromServicio)
router.patch("/ServicioMecanico/:idServicio/:idMecanico",verificarToken, validarSchema(servicioMecanicoSchema.partial()), asignarMecanico)
router.get("/ServicioMecanico/Mecanico/:idMecanico",verificarToken, getServiciosByMecanico)

export default router