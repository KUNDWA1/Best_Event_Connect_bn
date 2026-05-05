import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { LoginDto, RegisterDto, UserRole } from '../dto/auth.dto';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'change_me_in_production';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  ((process.env.JWT_EXPIRATION as unknown) || '7d') as SignOptions['expiresIn'];

const buildTokenPayload = (user: { id: string; email: string; role: string }) => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

export const register = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(RegisterDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map(e => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    if (dto.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existingPhone) {
        return res.status(409).json({ message: 'User with this phone number already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        password: hashedPassword,
        role: (dto.role || UserRole.EVENT_PLANNER) as any,
      },
    });

    const token = jwt.sign(buildTokenPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(LoginDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .map(e => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(buildTokenPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      message: 'Login successful',
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
