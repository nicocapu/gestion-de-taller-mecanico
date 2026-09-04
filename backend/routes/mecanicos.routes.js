import { Router } from "express";
import { getallMecanicos, getMecanico, createMecanico, updateMecanico, deleteMecanico  } from "../controllers/mecanicos.controller.js";
import { validarSchema } from "../middlewares/validarSchema.middleware.js";
import { mecanicoSchema } from "../schemas/mecanicos.schemas.js";
const router= Router();
router.get("/Mecanico", getallMecanicos)
router.get("/Mecanico/:id", getMecanico)
router.post("/Mecanico", validarSchema(mecanicoSchema), createMecanico)
router.patch("/Mecanico/:id", validarSchema(mecanicoSchema.partial()), updateMecanico)
router.delete("/Mecanico/:id", deleteMecanico)
export default router;