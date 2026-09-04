import { Router } from "express"
import {
  getAllServicioMecanicos,
  getMecanicosByServicio,
  asignarMecanico,
  removeMecanicoFromServicio
} from "../controllers/servicios-mecanicos.controller.js"
import { validarSchema } from "../middlewares/validarSchema.middleware.js"
import { servicioMecanicoSchema } from "../schemas/servicios-mecanicos.schemas.js"

const router = Router()

router.get("/ServicioMecanico", getAllServicioMecanicos)
router.get("/ServicioMecanico/:idServicio", getMecanicosByServicio)
router.post("/ServicioMecanico", validarSchema(servicioMecanicoSchema), asignarMecanico)
router.delete("/ServicioMecanico/:idServicio/:idMecanico", removeMecanicoFromServicio)
router.patch("/ServicioMecanico/:idServicio/:idMecanico", validarSchema(servicioMecanicoSchema.partial()), asignarMecanico)
export default router