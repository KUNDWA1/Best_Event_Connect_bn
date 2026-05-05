import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { vendorId, rating, comment } = req.body;
    const userId = req.user?.sub;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!vendorId || !rating) return res.status(400).json({ message: 'vendorId and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const feedback = await prisma.feedback.create({
      data: { vendorId, userId, rating: Number(rating), comment },
    });

    const allRatings = await prisma.feedback.findMany({
      where: { vendorId },
      select: { rating: true },
    });
    const avgRating = allRatings.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / allRatings.length;

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { averageRating: avgRating },
    });

    res.status(201).json({ message: 'Feedback submitted successfully', data: feedback, averageRating: avgRating });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getVendorFeedbacks = async (req: Request, res: Response) => {
  try {
    const vendorId = req.params.vendorId as string;
    const feedbacks = await prisma.feedback.findMany({
      where: { vendorId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ message: 'Feedbacks retrieved successfully', data: feedbacks });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
