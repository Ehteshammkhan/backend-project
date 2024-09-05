// cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Corrected key to api_secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the file on Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded on Cloudinary", result.url);

    // Delete the local file after upload
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error); // Log the error for debugging
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Ensure file is deleted even on error
    }
    return null;
  }
};

export { uploadOnCloudinary };
