import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createItem = async (req, res) => {
  try {
    const { name, category, price, foodType } = req.body;
    let image;

    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.path);
        if (cloudinaryResult.success) {
          image = cloudinaryResult;
        } else {
          image = {
            url: `${req.protocol}://${req.get('host')}/public/${req.file.filename}`
          };
        }
      } catch (error) {
        image = {
          url: `${req.protocol}://${req.get('host')}/public/${req.file.filename}`
        };
      }
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop does not exist" });
    }

    const item = await Item.create({
      name,
      image: image?.url || "",
      category,
      shop: shop._id,
      price,
      foodType
    });

    shop.items.push(item._id);
    await shop.save();

    const updatedShop = await Shop.findById(shop._id).populate('items');

    res.status(201).json({
      success: true,
      data: updatedShop,
      item: item
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create item"
    });
  }
};

export const EditItem = async (req, res) => {
  try {
    const { name, category, price, foodType } = req.body;
    const { itemId } = req.params;

    let image;
    if (req.file) {
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.path);
        if (cloudinaryResult.success) {
          image = cloudinaryResult;
        } else {
          image = {
            url: `${req.protocol}://${req.get('host')}/public/${req.file.filename}`
          };
        }
      } catch (error) {
        image = {
          url: `${req.protocol}://${req.get('host')}/public/${req.file.filename}`
        };
      }
    }

    let item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop || !item.shop.equals(shop._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this item"
      });
    }

    item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        price,
        foodType,
        image: image?.url || item.image
      },
      { new: true }
    );

    const updatedShop = await Shop.findById(shop._id).populate('items');

    res.status(200).json({
      success: true,
      data: updatedShop,
      item: item
    });
  } catch (error) {
    console.error("Error editing item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit item"
    });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    const items = await Item.find({ shop: shop._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items"
    });
  }
};

export const getItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId).populate('shop');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop || !item.shop.equals(shop._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this item"
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch item"
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (shop) {
      shop.items = shop.items.filter(i => !i.equals(item._id));
      await shop.populate({
        path: 'items',
        options: { sort: { updatedAt: -1 } }
      });
      await shop.save();
    }

    res.status(200).json({ success: true, message: "Item deleted successfully", data: shop });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item"
    });
  }
};

export const getAllItemsOfCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({ city: { $regex: city, $options: 'i' } });
    if (!shops || shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shops found in this city"
      });
    }

    const shopIds = shops.map(shop => shop._id);
    const allItems = await Item.find({ shop: { $in: shopIds } }).populate('shop');

    res.status(200).json({
      success: true,
      data: allItems
    });
  } catch (error) {
    console.error("Error fetching items by city:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items by city"
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    const total = await Item.countDocuments();

    const allItems = await Item.find()
      .populate('shop')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: allItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching all items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all items"
    });
  }
};

export const updateItemRating = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Initialize rating if not exists
    if (!item.rating) {
      item.rating = { average: 0, count: 0 };
    }

    const currentAverage = item.rating.average || 0;
    const currentCount = item.rating.count || 0;
    const newCount = currentCount + 1;
    const newAverage = Number(((currentAverage * currentCount + rating) / newCount).toFixed(2));

    item.rating.average = newAverage;
    item.rating.count = newCount;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
      newRating: {
        average: newAverage,
        count: newCount
      }
    });
  } catch (error) {
    console.error("Error updating item rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item rating"
    });
  }
};
