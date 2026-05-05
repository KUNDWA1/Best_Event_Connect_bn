import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from '../dto/service-category.dto';
import prisma from '../utils/prisma';

/**
 * Create a new service category (admin only)
 */
export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(CreateServiceCategoryDto, req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    const existing = await prisma.serviceCategory.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      return res.status(409).json({ message: 'Service category already exists' });
    }

    const category = await prisma.serviceCategory.create({
      data: { name: dto.name },
    });

    return res.status(201).json({
      message: 'Service category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get all service categories
 */
export const getAllServiceCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      message: 'Service categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get a single service category by ID
 */
export const getServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: 'Service category not found' });
    }

    return res.status(200).json({
      message: 'Service category retrieved successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching service category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Update a service category by ID (admin only)
 */
export const updateServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const dto = plainToInstance(UpdateServiceCategoryDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    const existing = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service category not found' });
    }

    // Check name uniqueness if name is being changed
    if (dto.name !== existing.name) {
      const nameConflict = await prisma.serviceCategory.findUnique({
        where: { name: dto.name },
      });
      if (nameConflict) {
        return res.status(409).json({ message: 'A service category with this name already exists' });
      }
    }

    const updated = await prisma.serviceCategory.update({
      where: { id },
      data: { name: dto.name },
    });

    return res.status(200).json({
      message: 'Service category updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating service category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Delete a service category by ID (admin only)
 */
export const deleteServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Service category not found' });
    }

    await prisma.serviceCategory.delete({ where: { id } });

    return res.status(200).json({ message: 'Service category deleted successfully' });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
