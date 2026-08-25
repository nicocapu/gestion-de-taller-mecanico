import {Router} from "express";
import {getallAutos,getAuto,createAuto,updateAuto,deleteAuto} from "../controllers/autos.controller.js";
const router= Router();
router.get("/Auto", getallAutos);
router.get("/Auto/:id", getAuto);
router.post("/Auto",createAuto);
router.patch("/Auto/:id",updateAuto);
router.delete("/Auto/:Patente",deleteAuto);
export default router;