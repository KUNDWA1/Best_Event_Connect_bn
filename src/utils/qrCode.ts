import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const generateQRCode = async (eventId: string, guestId: string): Promise<string> => {
  try {
    // Create QR code data with event and guest info
    const qrData = JSON.stringify({
      eventId,
      guestId,
      timestamp: new Date().toISOString(),
    });

    // Create uploads directory if doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `qr_${eventId}_${guestId}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);

    // Generate QR code as file
    await QRCode.toFile(filepath, qrData, {
      margin: 1,
      width: 300,
    } as any);

    // Return relative path for storage
    return `/uploads/qrcodes/${filename}`;
  } catch (error: any) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Generate QR code as data URL for email
 */
export const generateQRCodeDataURL = async (eventId: string, guestId: string): Promise<string> => {
  try {
    const qrData = JSON.stringify({
      eventId,
      guestId,
      timestamp: new Date().toISOString(),
    });

    // Generate QR code as data URL
    const dataURL = await QRCode.toDataURL(qrData);

    return dataURL;
  } catch (error: any) {
    throw new Error(`Failed to generate QR code data URL: ${error.message}`);
  }
};
