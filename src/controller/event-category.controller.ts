import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventCategoryDto, UpdateEventCategoryDto } from '../dto/event-category.dto';
import prisma from '../utils/prisma';

/**
 * Create a new event category (admin only)
 */
export const createEventCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(CreateEventCategoryDto, req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    const existing = await prisma.eventCategory.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      return res.status(409).json({ message: 'Event category already exists' });
    }

    const category = await prisma.eventCategory.create({
      data: { name: dto.name },
    });

    return res.status(201).json({
      message: 'Event category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error creating event category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get all event categories
 */
export const getAllEventCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.eventCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      message: 'Event categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Get a single event category by ID
 */
export const getEventCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const category = await prisma.eventCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: 'Event category not found' });
    }

    return res.status(200).json({
      message: 'Event category retrieved successfully',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching event category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Update an event category by ID (admin only)
 */
export const updateEventCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const dto = plainToInstance(UpdateEventCategoryDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: errorMessages });
    }

    const existing = await prisma.eventCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Event category not found' });
    }

    if (dto.name !== existing.name) {
      const nameConflict = await prisma.eventCategory.findUnique({
        where: { name: dto.name },
      });
      if (nameConflict) {
        return res.status(409).json({ message: 'An event category with this name already exists' });
      }
    }

    const updated = await prisma.eventCategory.update({
      where: { id },
      data: { name: dto.name },
    });

    return res.status(200).json({
      message: 'Event category updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating event category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

/**
 * Delete an event category by ID (admin only)
 */
export const deleteEventCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.eventCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Event category not found' });
    }

    await prisma.eventCategory.delete({ where: { id } });

    return res.status(200).json({ message: 'Event category deleted successfully' });
  } catch (error) {
    console.error('Error deleting event category:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
