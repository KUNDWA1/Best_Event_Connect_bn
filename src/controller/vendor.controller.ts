import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateVendorDto, UpdateVendorDto } from '../dto/vendor.dto';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import uploadBufferToCloudinary from '../utils/cloudinaryUpload';

type VendorUploadFiles = {
  profileImage?: Express.Multer.File[];
  portfolioImages?: Express.Multer.File[];
};

const parseStringArrayField = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => parseStringArrayField(item) ?? [])
      .filter((item) => item.length > 0);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return [];
  }

  if (trimmedValue.startsWith('[')) {
    try {
      const parsedValue = JSON.parse(trimmedValue) as unknown;
      if (Array.isArray(parsedValue)) {
        return parsedValue.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      // Fallback to comma-separated parsing below.
    }
  }

  return trimmedValue
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const normalizeVendorPayload = (body: Request['body']) => ({
  ...body,
  experienceYears:
    body.experienceYears !== undefined && body.experienceYears !== ''
      ? Number(body.experienceYears)
      : undefined,
  portfolioImages: parseStringArrayField(body.portfolioImages),
  certifications: parseStringArrayField(body.certifications),
  awards: parseStringArrayField(body.awards),
});

/**
 * Create a new vendor profile
 */
export const createVendor = async (req: Request, res: Response) => {
  try {
    const normalizedBody = normalizeVendorPayload(req.body);
    const { userId } = normalizedBody;
    const createVendorDto = plainToInstance(CreateVendorDto, normalizedBody);
    const files = (req.files as VendorUploadFiles | undefined) ?? {};

    // Validate the DTO
    const errors = await validate(createVendorDto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    // Check if vendor already exists for this user
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: userId }
    });

    if (existingVendor) {
      return res.status(409).json({ message: 'Vendor profile already exists for this user' });
    }

    const profileImageFile = files.profileImage?.[0];
    const portfolioImageFiles = files.portfolioImages ?? [];

    const [profileImageUrl, uploadedPortfolioImages] = await Promise.all([
      profileImageFile
        ? uploadBufferToCloudinary(profileImageFile.buffer, 'vendors/profile-images')
        : Promise.resolve(createVendorDto.profileImage ?? null),
      portfolioImageFiles.length
        ? Promise.all(
            portfolioImageFiles.map((file) =>
              uploadBufferToCloudinary(file.buffer, 'vendors/portfolio-images'),
            ),
          )
        : Promise.resolve<string[]>([]),
    ]);

    // Create vendor profile
    const vendor = await prisma.vendor.create({
      data: {
        userId: userId,
        businessName: createVendorDto.businessName,
        bio: createVendorDto.bio || null,
        experienceYears: createVendorDto.experienceYears ?? 0,
        location: createVendorDto.location || null,
        profileImage: profileImageUrl,
        portfolioImages: [...(createVendorDto.portfolioImages ?? []), ...uploadedPortfolioImages],
        certifications: createVendorDto.certifications ?? [],
        awards: createVendorDto.awards ?? [],
      }
    });

    res.status(201).json({
      message: 'Vendor profile created successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get vendor profile by ID
 */
export const getVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const vendor = await prisma.vendor.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({
      message: 'Vendor profile retrieved successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error getting vendor:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get vendor profile by User ID
 */
export const getVendorByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin && req.user?.sub !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own vendor profile' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    res.status(200).json({
      message: 'Vendor profile retrieved successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error getting vendor by user ID:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get all vendors with optional filters
 * - Admin: sees all vendors, can filter by isVerified
 * - Everyone else: sees only verified vendors
 */
export const getAllVendors = async (req: AuthRequest, res: Response) => {
  try {
    const { isVerified, page = '1', limit = '10' } = req.query;
    const isAdmin = req.user?.role === 'admin';

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const whereClause: any = {};
    if (isAdmin) {
      // Admin can optionally filter by verification status
      if (isVerified !== undefined) {
        whereClause.isVerified = isVerified === 'true';
      }
    } else {
      // Non-admins always see only verified vendors
      whereClause.isVerified = true;
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalCount = await prisma.vendor.count({ where: whereClause });

    res.status(200).json({
      message: 'Vendors retrieved successfully',
      data: vendors,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error getting vendors:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Update vendor profile
 */
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const normalizedBody = normalizeVendorPayload(req.body);
    const updateVendorDto = plainToInstance(UpdateVendorDto, normalizedBody);
    const files = (req.files as VendorUploadFiles | undefined) ?? {};

    // Validate the DTO
    const errors = await validate(updateVendorDto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const profileImageFile = files.profileImage?.[0];
    const portfolioImageFiles = files.portfolioImages ?? [];

    const [profileImageUrl, uploadedPortfolioImages] = await Promise.all([
      profileImageFile
        ? uploadBufferToCloudinary(profileImageFile.buffer, 'vendors/profile-images')
        : Promise.resolve<string | null>(null),
      portfolioImageFiles.length
        ? Promise.all(
            portfolioImageFiles.map((file) =>
              uploadBufferToCloudinary(file.buffer, 'vendors/portfolio-images'),
            ),
          )
        : Promise.resolve<string[]>([]),
    ]);

    const nextPortfolioImages =
      updateVendorDto.portfolioImages !== undefined
        ? updateVendorDto.portfolioImages
        : vendor.portfolioImages;

    // Update vendor profile
    const updatedVendor = await prisma.vendor.update({
      where: { id: id },
      data: {
        businessName: updateVendorDto.businessName || vendor.businessName,
        bio: updateVendorDto.bio !== undefined ? updateVendorDto.bio : vendor.bio,
        experienceYears: updateVendorDto.experienceYears !== undefined ? updateVendorDto.experienceYears : vendor.experienceYears,
        location: updateVendorDto.location !== undefined ? updateVendorDto.location : vendor.location,
        profileImage:
          profileImageUrl ??
          (updateVendorDto.profileImage !== undefined ? updateVendorDto.profileImage : vendor.profileImage),
        portfolioImages: [...nextPortfolioImages, ...uploadedPortfolioImages],
        certifications: updateVendorDto.certifications !== undefined ? updateVendorDto.certifications : vendor.certifications,
        awards: updateVendorDto.awards !== undefined ? updateVendorDto.awards : vendor.awards,
      }
    });

    res.status(200).json({
      message: 'Vendor profile updated successfully',
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Delete vendor profile
 */
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Delete vendor profile
    await prisma.vendor.delete({
      where: { id: id }
    });

    res.status(200).json({
      message: 'Vendor profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Upload or update vendor profile image using Cloudinary
 */
export const uploadVendorProfileImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'vendors/profile-images');

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        profileImage: imageUrl,
      },
    });

    return res.status(200).json({
      message: 'Vendor profile image updated successfully',
      data: updatedVendor,
    });
  } catch (error) {
    console.error('Error uploading vendor profile image:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Upload vendor portfolio images using Cloudinary and append them to the portfolio
 */
export const uploadVendorPortfolioImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ message: 'No portfolio image files provided' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const uploadedImageUrls = await Promise.all(
      files.map((file) => uploadBufferToCloudinary(file.buffer, 'vendors/portfolio-images')),
    );

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        portfolioImages: [...vendor.portfolioImages, ...uploadedImageUrls],
      },
    });

    return res.status(200).json({
      message: 'Vendor portfolio images uploaded successfully',
      data: updatedVendor,
    });
  } catch (error) {
    console.error('Error uploading vendor portfolio images:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Verify vendor profile (admin only)
 */
export const verifyVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { isVerified } = req.body as { isVerified?: unknown };

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: 'isVerified must be a boolean value' });
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update verification status
    const updatedVendor = await prisma.vendor.update({
      where: { id: id },
      data: {
        isVerified
      }
    });

    res.status(200).json({
      message: `Vendor verification status updated to ${isVerified}`,
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error verifying vendor:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Update vendor rating
 */
export const updateVendorRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { rating } = req.body;

    // Validate rating
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: id }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update rating (simple average calculation)
    // In production, this should be more sophisticated with review tracking
    const updatedVendor = await prisma.vendor.update({
      where: { id: id },
      data: {
        averageRating: rating
      }
    });

    res.status(200).json({
      message: 'Vendor rating updated successfully',
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor rating:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
