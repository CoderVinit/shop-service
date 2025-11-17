import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

let isConfigured = false;

const configureCloudinary = () => {
    if (isConfigured) return true;
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.log('⚠️ Cloudinary credentials missing - uploads will use local storage');
        return false;
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    isConfigured = true;
    console.log('✅ Cloudinary configured');
    return true;
};

export const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        if (!configureCloudinary()) {
            throw new Error("Cloudinary credentials not configured");
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "food-delivery-app",
            resource_type: "auto",
            ...options
        });

        try {
            fs.unlinkSync(filePath);
        } catch (deleteError) {
            console.error("Error deleting local file:", deleteError.message);
        }

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (deleteError) {
            console.error("Error deleting local file:", deleteError.message);
        }

        return {
            success: false,
            error: error.message
        };
    }
};

export default cloudinary;
