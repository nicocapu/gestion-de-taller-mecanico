import { Router } from "express"
import {
  getallServicios,
  getServicio,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../controllers/servicios.controller.js"
import { validarSchema } from "../middlewares/validarSchema.middleware.js"
import { servicioSchema } from "../schemas/servicios.schemas.js"
import { verificarToken } from "../middlewares/verificarToken.middleware.js"

const router = Router()

router.get("/Servicio",verificarToken, getallServicios)
router.get("/Servicio/:id",verificarToken, getServicio)
router.post("/Servicio",verificarToken, validarSchema(servicioSchema), createServicio)
router.patch("/Servicio/:id",verificarToken, validarSchema(servicioSchema.partial()), updateServicio)
router.delete("/Servicio/:id",verificarToken, deleteServicio)


export default router