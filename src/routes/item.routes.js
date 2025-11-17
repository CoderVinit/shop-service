import express from "express";
import {
  createItem,
  EditItem,
  getItemsByShop,
  getItem,
  deleteItem,
  getAllItemsOfCity,
  getAllItems,
  updateItemRating
} from "../controllers/item.controller.js";
import { uploadSingle } from "../config/multer.js";
import { authMiddleware, authorizeRoles } from "../../../auth-service/middleware/authMiddleware.js";
import { checkRole, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/addItem", verifyToken, checkRole("owner"), uploadSingle, createItem);
router.put("/editItem/:itemId", verifyToken, checkRole("owner"), uploadSingle, EditItem);
router.get("/getItems", verifyToken, checkRole("owner"), getItemsByShop);
router.get("/getItem/:itemId", verifyToken, checkRole("owner"), getItem);
router.delete("/deleteItem/:itemId", verifyToken, checkRole("owner"), deleteItem);
router.get("/getItems/:city", verifyToken, checkRole("user"), getAllItemsOfCity);
router.get("/getAllItems", verifyToken, checkRole("user"), getAllItems);

// Internal route for updating ratings
router.patch("/:itemId/rating", updateItemRating);

export default router;
