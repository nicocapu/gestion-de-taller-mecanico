import { Router } from "express";
import { getallMecanicos, getMecanico, createMecanico, updateMecanico, deleteMecanico  } from "../controllers/mecanicos.controller.js";
const router= Router();
router.get("/Mecanico", getallMecanicos)
router.get("/Mecanico/:id", getMecanico)
router.post("/Mecanico", createMecanico)
router.patch("/Mecanico/:id", updateMecanico)
router.delete("/Mecanico/:id", deleteMecanico)
export default router;