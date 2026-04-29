import { Router } from "express";
import { getMe, updateMe, deleteMe } from "../controllers/user.controller.js";

const router = Router()


// TODO : ajouter le middleware authMidlleware devant chaque route une fois le JWT en place
//  ex: router.get("/:id", authMiddleware, getMe);

router.get("/:id", getMe);
router.patch("/:id", updateMe);
router.delete("/:id", deleteMe);

export default router;