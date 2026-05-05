import { Prisma, Role } from '@prisma/client';
import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/user.dto';
import { prisma } from '../utils/prisma';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const toPositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', role, search } = req.query;

    const pageNumber = toPositiveInteger(page, 1);
    const pageSize = Math.min(toPositiveInteger(limit, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const where: Prisma.UserWhereInput = {};

    if (typeof role === 'string' && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    if (typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const dto = plainToInstance(UpdateUserDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({ where: { email: dto.email } });
      if (userWithEmail) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    }

    if (dto.phone && dto.phone !== existingUser.phone) {
      const userWithPhone = await prisma.user.findUnique({ where: { phone: dto.phone } });
      if (userWithPhone) {
        return res.status(409).json({ message: 'User with this phone number already exists' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName ?? existingUser.firstName,
        lastName: dto.lastName ?? existingUser.lastName,
        email: dto.email ?? existingUser.email,
        phone: dto.phone ?? existingUser.phone,
        role: (dto.role as Role | undefined) ?? existingUser.role,
        password: dto.password ? await bcrypt.hash(dto.password, 10) : existingUser.password,
      },
      select: userSelect,
    });

    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};