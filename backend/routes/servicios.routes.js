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
const router = Router()

router.get("/Servicio", getallServicios)
router.get("/Servicio/:id", getServicio)
router.post("/Servicio", validarSchema(servicioSchema), createServicio)
router.patch("/Servicio/:id", validarSchema(servicioSchema.partial()), updateServicio)
router.delete("/Servicio/:id", deleteServicio)


export default router