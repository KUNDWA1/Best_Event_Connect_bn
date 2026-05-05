import prisma from "../utils/prisma";
import { CreateGuestDto, UpdateGuestDto, RSVPStatus, GuestCategory } from "../dto/guest.dto";
import { generateQRCodeDataURL } from "../utils/qrCode";
import { sendGuestInvitationEmail } from "../utils/email";

export const createGuestService = async (data: CreateGuestDto) => {
  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
    include: {
      User: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if guest with same email already exists in this event
  const existingGuest = await prisma.guest.findUnique({
    where: { eventId_email: { eventId: data.eventId, email: data.email } },
  });

  if (existingGuest) {
    throw new Error('Guest with this email already exists for this event');
  }

  // Check if seats are available
  if (event.guestCount !== null && event.guestCount <= 0) {
    throw new Error('This event is sold out');
  }

  // Create guest and decrement seat count atomically
  const [guest] = await prisma.$transaction([
    prisma.guest.create({
      data: {
        eventId: data.eventId,
        fullNames: data.fullNames,
        phone: data.phone,
        email: data.email,
        category: data.category || GuestCategory.REGULAR,
        tableNumber: data.tableNumber,
        rsvpStatus: data.rsvpStatus || RSVPStatus.Pending,
      },
    }),
    prisma.event.update({
      where: { id: data.eventId },
      data: { guestCount: { decrement: 1 } },
    }),
  ]);

  try {
    console.log('🔷 Starting QR code generation for guest:', guest.id);
    // Generate unique QR code for the guest
    const qrCodeDataURL = await generateQRCodeDataURL(data.eventId, guest.id);
    console.log('✅ QR code generated successfully');

    // Update guest with QR code
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { qrCode: qrCodeDataURL },
    });
    console.log('✅ Guest updated with QR code');

    // Send invitation email with QR code
    console.log('📧 About to call sendGuestInvitationEmail for:', data.email);
    await sendGuestInvitationEmail({
      guestName: data.fullNames,
      guestEmail: data.email,
      eventName: event.title,
      eventLocation: event.location,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      qrCodeDataURL,
    });
    console.log('✅ Email function completed');

    return updatedGuest;
  } catch (emailError: any) {
    console.error('❌ Error in guest creation flow:', emailError);
    console.error('Error details:', emailError.message);
    console.error('Stack trace:', emailError.stack);
    // Guest is already created, so we can return it even if email fails
    // In production, you might want to retry email sending or queue it
    const guestWithoutEmail = await prisma.guest.findUnique({
      where: { id: guest.id },
    });
    return guestWithoutEmail;
  }
};

export const getAllGuestsService = async (
  eventId: string,
  page: number = 1,
  limit: number = 10,
  rsvpStatus?: RSVPStatus,
  category?: GuestCategory
) => {
  const skip = (page - 1) * limit;
  const where: any = { eventId };

  if (rsvpStatus) where.rsvpStatus = rsvpStatus;
  if (category) where.category = category;

  const [guests, totalCount] = await Promise.all([
    prisma.guest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.guest.count({ where })
  ]);

  return {
    guests,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

export const getGuestService = async (guestId: string) => {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true
        }
      }
    }
  });

  if (!guest) {
    throw new Error('Guest not found');
  }

  return guest;
};

export const updateGuestService = async (guestId: string, data: UpdateGuestDto) => {
  // Verify guest exists
  const existingGuest = await prisma.guest.findUnique({
    where: { id: guestId }
  });

  if (!existingGuest) {
    throw new Error('Guest not found');
  }

  const updateData: any = {};
  if (data.fullNames) updateData.fullNames = data.fullNames;
  if (data.phone) updateData.phone = data.phone;
  if (data.email) updateData.email = data.email;
  if (data.category) updateData.category = data.category;
  if (data.tableNumber !== undefined) updateData.tableNumber = data.tableNumber;
  if (data.rsvpStatus) updateData.rsvpStatus = data.rsvpStatus;

  return await prisma.guest.update({
    where: { id: guestId },
    data: updateData,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true
        }
      }
    }
  });
};

export const deleteGuestService = async (guestId: string) => {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId }
  });

  if (!guest) {
    throw new Error('Guest not found');
  }

  return await prisma.guest.delete({
    where: { id: guestId }
  });
};

export const getEventGuestStatsService = async (eventId: string) => {
  const [totalGuests, confirmedCount, declinedCount, pendingCount, vipCount, staffCount, regularCount] = await Promise.all([
    prisma.guest.count({ where: { eventId } }),
    prisma.guest.count({ where: { eventId, rsvpStatus: RSVPStatus.Confirmed } }),
    prisma.guest.count({ where: { eventId, rsvpStatus: RSVPStatus.Declined } }),
    prisma.guest.count({ where: { eventId, rsvpStatus: RSVPStatus.Pending } }),
    prisma.guest.count({ where: { eventId, category: GuestCategory.VIP } }),
    prisma.guest.count({ where: { eventId, category: GuestCategory.STAFF } }),
    prisma.guest.count({ where: { eventId, category: GuestCategory.REGULAR } })
  ]);

  return {
    totalGuests,
    confirmed: confirmedCount,
    declined: declinedCount,
    pending: pendingCount,
    byCategory: {
      vip: vipCount,
      staff: staffCount,
      regular: regularCount
    }
  };
};

export const updateRSVPService = async (guestId: string, rsvpStatus: RSVPStatus) => {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId }
  });

  if (!guest) {
    throw new Error('Guest not found');
  }

  return await prisma.guest.update({
    where: { id: guestId },
    data: { rsvpStatus }
  });
};

export const bulkImportGuestsService = async (eventId: string, guests: CreateGuestDto[]) => {
  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error('Event not found');
  }

  const results = await Promise.all(
    guests.map(async (guestData) => {
      try {
        return await createGuestService({ ...guestData, eventId });
      } catch (error: any) {
        return { error: error.message, data: guestData } as any;
      }
    })
  );

  return {
    successful: results.filter((r: any) => r && !('error' in r)),
    failed: results.filter((r: any) => r && 'error' in r)
  };
};
