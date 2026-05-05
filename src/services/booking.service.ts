import prisma from "../utils/prisma";

export const createBookingService = async (
  packageId: string,
  eventId: string,
  priceOffered: number,
  startDate: Date,
  endDate: Date,
  message?: string,
) => {
  return await prisma.booking.create({
    data: {
      packageId,
      eventId,
      priceOffered,
      startDate,
      endDate,
      message,
    },
  });
};
