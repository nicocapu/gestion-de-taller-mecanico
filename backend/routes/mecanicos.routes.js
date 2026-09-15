import { Router } from "express";
import { getallMecanicos, getMecanico, createMecanico, updateMecanico, deleteMecanico  } from "../controllers/mecanicos.controller.js";
import { validarSchema } from "../middlewares/validarSchema.middleware.js";
import { verificarToken, verificarRol } from "../middlewares/verificarToken.middleware.js";
import { mecanicoSchema } from "../schemas/mecanicos.schemas.js";
const router= Router();
router.get("/Mecanico", getallMecanicos)
router.get("/Mecanico/:id", getMecanico)
router.post("/Mecanico", verificarToken,verificarRol, validarSchema(mecanicoSchema), createMecanico)
router.patch("/Mecanico/:id", verificarToken, verificarRol, validarSchema(mecanicoSchema.partial()), updateMecanico)
router.delete("/Mecanico/:id", verificarToken, verificarRol, deleteMecanico)
export default router;