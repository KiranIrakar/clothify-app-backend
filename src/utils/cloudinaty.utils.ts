import cloudinary from "../config/cloudinary"; 

export const uploadToCloudinary = (buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

export const deleteFromCloudinary = (public_id: string) => {
    return cloudinary.uploader.destroy(public_id);
};