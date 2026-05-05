import { Request, Response } from "express";
import { createBookingService } from "../services/booking.service";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { packageId, eventId, priceOffered, startDate, endDate, message } =
      req.body;

    const booking = await createBookingService(
      packageId,
      eventId,
      priceOffered,
      new Date(startDate),
      new Date(endDate),
      message,
    );

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isAdmin = req.user.role === "admin";
    const whereClause = isAdmin
      ? undefined
      : {
          OR: [
            { event: { userId: req.user.sub } },
            { package: { Vendor: { userId: req.user.sub } } },
          ],
        };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        package: true,
        event: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        event: {
          select: {
            userId: true,
          },
        },
        package: {
          select: {
            Vendor: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isAdmin = req.user.role === "admin";
    const isPlannerOwner = booking.event.userId === req.user.sub;
    const isVendorOwner = booking.package.Vendor.userId === req.user.sub;

    if (!isAdmin && !isPlannerOwner && !isVendorOwner) {
      return res.status(403).json({ message: "Forbidden: You can only view your own bookings" });
    }

    const { event, package: bookingPackage, ...bookingData } = booking;
    res.status(200).json(bookingData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        event: {
          select: {
            userId: true,
          },
        },
        package: {
          select: {
            Vendor: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isPlannerOwner = existingBooking.event.userId === req.user.sub;
    const isVendorOwner = existingBooking.package.Vendor.userId === req.user.sub;

    if (!isAdmin && !isPlannerOwner && !isVendorOwner) {
      return res.status(403).json({ message: "Forbidden: You can only update your own bookings" });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking" });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: req.params.id as string },
      include: {
        event: {
          select: {
            userId: true,
          },
        },
        package: {
          select: {
            Vendor: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isPlannerOwner = existingBooking.event.userId === req.user.sub;
    const isVendorOwner = existingBooking.package.Vendor.userId === req.user.sub;

    if (!isAdmin && !isPlannerOwner && !isVendorOwner) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own bookings" });
    }

    await prisma.booking.delete({ where: { id: req.params.id as string } });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
};
