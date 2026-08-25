import { Router } from "express"
import {
  getallServicios,
  getServicio,
  createServicio,
  updateServicio,
  deleteServicio
} from "../controllers/servicios.controller.js"

const router = Router()

router.get("/Servicio", getallServicios)
router.get("/Servicio/:id", getServicio)
router.post("/Servicio", createServicio)
router.patch("/Servicio/:id", updateServicio)
router.delete("/Servicio/:id", deleteServicio)

export default router