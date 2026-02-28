import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ // configure the Cloudinary library with the necessary credentials to authenticate and interact with the Cloudinary API. These credentials are typically stored in environment variables for security reasons.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {  // this function takes the local file path of the file to be uploaded as an argument and uploads it to Cloudinary. It returns the response from Cloudinary if the upload is successful, or null if there is an error during the upload process.
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as it is no longer needed after the upload is successful
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary} // export the uploadOnCloudinary function so that it can be used in other parts of the application to handle file uploads to Cloudinary.