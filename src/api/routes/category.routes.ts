import { Router } from "express"

import { getAllCategory } from "../controllers/category.controller.ts"
import { getOneCategory } from "../controllers/category.controller.ts";
import { createCategory } from "../controllers/category.controller.ts";
import { updateCategory } from "../controllers/category.controller.ts";
import { deleteCategory } from "../controllers/category.controller.ts";

const router = Router();

router.get("/categories", getAllCategory);
router.get("/categories/:id", getOneCategory);

router.post("/categories", createCategory);

router.patch("/categories/:id", updateCategory)

router.delete("/categories/:id", deleteCategory)

export default router;
