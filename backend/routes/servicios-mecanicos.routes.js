import { Router } from "express"
import {
  getAllServicioMecanicos,
  getMecanicosByServicio,
  assignMecanico,
  removeMecanicoFromServicio
} from "../controllers/servicios-mecanicos.controller.js"

const router = Router()

router.get("/ServicioMecanico", getAllServicioMecanicos)
router.get("/ServicioMecanico/:idServicio", getMecanicosByServicio)
router.post("/ServicioMecanico", assignMecanico)
router.delete("/ServicioMecanico/:idServicio/:idMecanico", removeMecanicoFromServicio)

export default router