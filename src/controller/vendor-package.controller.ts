import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import prisma from '../utils/prisma';
import { CreateVendorServicePackageDto, UpdateVendorServicePackageDto } from '../dto/vendor-package.dto';

export const createVendorServicePackage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    // Ensure the user has a vendor profile
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const dto = plainToInstance(CreateVendorServicePackageDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const messages = errors
        .map(e => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    if (dto.maxPrice < dto.minPrice) {
      return res.status(400).json({ message: 'Maximum price must be greater than or equal to minimum price' });
    }

    const servicePackage = await prisma.vendorServicePackage.create({
      data: {
        vendorId: vendor.id,
        category: dto.category,
        title: dto.title,
        description: dto.description ?? null,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
      },
    });

    return res.status(201).json({
      message: 'Vendor service package created successfully',
      data: servicePackage,
    });
  } catch (error) {
    console.error('Error creating vendor service package:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getVendorServicePackages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const packages = await prisma.vendorServicePackage.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      message: 'Vendor service packages retrieved successfully',
      data: packages,
    });
  } catch (error) {
    console.error('Error getting vendor service packages:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getVendorServicePackage = async (req: Request, res: Response) => {
  try {
    const { userId, packageId } = req.params as { userId: string; packageId: string };

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const servicePackage = await prisma.vendorServicePackage.findFirst({
      where: { id: packageId, vendorId: vendor.id },
    });

    if (!servicePackage) {
      return res.status(404).json({ message: 'Vendor service package not found' });
    }

    return res.status(200).json({
      message: 'Vendor service package retrieved successfully',
      data: servicePackage,
    });
  } catch (error) {
    console.error('Error getting vendor service package:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const updateVendorServicePackage = async (req: Request, res: Response) => {
  try {
    const { userId, packageId } = req.params as { userId: string; packageId: string };

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const existing = await prisma.vendorServicePackage.findFirst({
      where: { id: packageId, vendorId: vendor.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Vendor service package not found' });
    }

    const dto = plainToInstance(UpdateVendorServicePackageDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const messages = errors
        .map(e => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    const minPrice = dto.minPrice ?? existing.minPrice;
    const maxPrice = dto.maxPrice ?? existing.maxPrice;
    if (maxPrice < minPrice) {
      return res.status(400).json({ message: 'Maximum price must be greater than or equal to minimum price' });
    }

    const updated = await prisma.vendorServicePackage.update({
      where: { id: existing.id },
      data: {
        category: dto.category ?? existing.category,
        title: dto.title ?? existing.title,
        description: dto.description !== undefined ? dto.description : existing.description,
        minPrice,
        maxPrice,
      },
    });

    return res.status(200).json({
      message: 'Vendor service package updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating vendor service package:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const deleteVendorServicePackage = async (req: Request, res: Response) => {
  try {
    const { userId, packageId } = req.params as { userId: string; packageId: string };

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const existing = await prisma.vendorServicePackage.findFirst({
      where: { id: packageId, vendorId: vendor.id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Vendor service package not found' });
    }

    await prisma.vendorServicePackage.delete({ where: { id: existing.id } });

    return res.status(200).json({
      message: 'Vendor service package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vendor service package:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
