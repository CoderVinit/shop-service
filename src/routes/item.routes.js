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
import { verifyToken, checkRole } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../config/multer.js";

const router = express.Router();

router.post("/", verifyToken, checkRole("owner"), uploadSingle, createItem);
router.put("/:itemId", verifyToken, checkRole("owner"), uploadSingle, EditItem);
router.get("/shop", verifyToken, checkRole("owner"), getItemsByShop);
router.get("/:itemId", verifyToken, checkRole("owner"), getItem);
router.delete("/:itemId", verifyToken, checkRole("owner"), deleteItem);
router.get("/city/:city", getAllItemsOfCity);
router.get("/", getAllItems);

// Internal route for updating ratings
router.patch("/:itemId/rating", updateItemRating);

export default router;
