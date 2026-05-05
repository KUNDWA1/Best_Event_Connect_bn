import prisma from "../utils/prisma";

// Regex restrictions
const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phoneRegex = /\b\d{10,15}\b/;
const confirmedBookingStatuses = new Set(["accepted", "completed"]);

const getBookingRoomId = (bookingId: string) => `booking_${bookingId}`;

type BookingChatContext = {
  id: string;
  status: string;
  event: {
    id: string;
    title: string;
    userId: string;
  };
  package: {
    Vendor: {
      userId: string;
      businessName: string;
    };
  };
};

const getBookingChatContext = async (
  bookingId: string,
): Promise<BookingChatContext> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      event: {
        select: {
          id: true,
          title: true,
          userId: true,
        },
      },
      package: {
        select: {
          Vendor: {
            select: {
              userId: true,
              businessName: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking as BookingChatContext;
};

const ensureBookingChatAccess = (booking: BookingChatContext, userId: string) => {
  const isPlanner = booking.event.userId === userId;
  const isVendor = booking.package.Vendor.userId === userId;

  if (!isPlanner && !isVendor) {
    throw new Error("Forbidden: You are not part of this booking");
  }

  if (!confirmedBookingStatuses.has(booking.status)) {
    throw new Error("Chat is available only for confirmed bookings");
  }

  return {
    isPlanner,
    isVendor,
  };
};

const ensureBookingChatRoom = async (booking: BookingChatContext) => {
  const roomId = getBookingRoomId(booking.id);

  return prisma.chatRoom.upsert({
    where: { id: roomId },
    update: {
      plannerId: booking.event.userId,
      vendorUserId: booking.package.Vendor.userId,
    },
    create: {
      id: roomId,
      plannerId: booking.event.userId,
      vendorUserId: booking.package.Vendor.userId,
    },
  });
};

export interface BookingChatRoomSummary {
  id: string;
  bookingId: string;
  eventId: string;
  eventName: string;
  vendorBusinessName: string;
  counterpartName: string;
  viewerRole: "planner" | "vendor";
}

export interface BookingChatThread {
  room: BookingChatRoomSummary;
  messages: Array<{
    id: string;
    chatRoomId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
}

const buildRoomSummary = (
  booking: BookingChatContext,
  isPlanner: boolean,
): BookingChatRoomSummary => {
  const vendorBusinessName = booking.package.Vendor.businessName || "Vendor";

  return {
    id: getBookingRoomId(booking.id),
    bookingId: booking.id,
    eventId: booking.event.id,
    eventName: booking.event.title,
    vendorBusinessName,
    counterpartName: isPlanner ? vendorBusinessName : booking.event.title,
    viewerRole: isPlanner ? "planner" : "vendor",
  };
};

export const getBookingChatThread = async (
  bookingId: string,
  userId: string,
): Promise<BookingChatThread> => {
  const booking = await getBookingChatContext(bookingId);
  const access = ensureBookingChatAccess(booking, userId);

  const room = await ensureBookingChatRoom(booking);
  const messages = await prisma.message.findMany({
    where: { chatRoomId: room.id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return {
    room: buildRoomSummary(booking, access.isPlanner),
    messages,
  };
};

export const sendBookingChatMessage = async (
  bookingId: string,
  senderId: string,
  content: string,
) => {
  const sanitizedContent = content.trim();

  if (!sanitizedContent) {
    throw new Error("Message content is required");
  }

  if (emailRegex.test(sanitizedContent) || phoneRegex.test(sanitizedContent)) {
    throw new Error("Sharing phone numbers or emails is not allowed.");
  }

  const booking = await getBookingChatContext(bookingId);
  ensureBookingChatAccess(booking, senderId);

  const room = await ensureBookingChatRoom(booking);

  return prisma.message.create({
    data: {
      chatRoomId: room.id,
      senderId,
      content: sanitizedContent,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
};

export const createChatRoom = async (plannerId: string, vendorUserId: string) => {
  return prisma.chatRoom.create({
    data: {
      plannerId,
      vendorUserId,
    },
  });
};

export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  content: string,
) => {
  const sanitizedContent = content.trim();

  if (!sanitizedContent) {
    throw new Error("Message content is required");
  }

  if (emailRegex.test(sanitizedContent) || phoneRegex.test(sanitizedContent)) {
    throw new Error("Sharing phone numbers or emails is not allowed.");
  }

  return prisma.message.create({
    data: {
      chatRoomId,
      senderId,
      content: sanitizedContent,
    },
  });
};

export const getMessages = async (chatRoomId: string) => {
  return prisma.message.findMany({
    where: { chatRoomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
};

export const deleteChatRoom = async (chatRoomId: string) => {
  return prisma.chatRoom.delete({
    where: { id: chatRoomId },
  });
};

export const deleteMessage = async (messageId: string) => {
  return prisma.message.delete({
    where: { id: messageId },
  });
};

export const updateMessage = async (messageId: string, content: string) => {
  const sanitizedContent = content.trim();

  if (!sanitizedContent) {
    throw new Error("Message content is required");
  }

  if (emailRegex.test(sanitizedContent) || phoneRegex.test(sanitizedContent)) {
    throw new Error("Sharing phone numbers or emails is not allowed.");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { content: sanitizedContent },
  });
};
