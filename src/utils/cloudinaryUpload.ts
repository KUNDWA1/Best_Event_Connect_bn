import cloudinary from '../configuration/cloudinary';

export const uploadBufferToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload failed with unknown error'));
        }
        return resolve(result.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadBufferToCloudinary;
