import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as chatService from "../services/chat.service";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected error";

const resolveErrorStatus = (message: string) => {
  if (message === "Booking not found") {
    return 404;
  }

  if (
    message.startsWith("Forbidden:") ||
    message.includes("confirmed bookings")
  ) {
    return 403;
  }

  if (message.includes("Unauthorized")) {
    return 401;
  }

  return 400;
};

export const createChatRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { plannerId, vendorUserId } = req.body;

    const chatRoom = await chatService.createChatRoom(plannerId, vendorUserId);

    res.status(201).json(chatRoom);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { chatRoomId, content } = req.body;

    const message = await chatService.sendMessage(chatRoomId, req.user.sub, content);

    res.status(201).json(message);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { chatRoomId } = req.params as { chatRoomId: string };

    const messages = await chatService.getMessages(chatRoomId);

    res.status(200).json(messages);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const deleteChatRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { chatRoomId } = req.params as { chatRoomId: string };

    await chatService.deleteChatRoom(chatRoomId);

    res.status(200).json({ message: "Chat room deleted successfully" });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { messageId } = req.params as { messageId: string };

    await chatService.deleteMessage(messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { messageId } = req.params as { messageId: string };
    const { content } = req.body;

    const message = await chatService.updateMessage(messageId, content);

    res.status(200).json(message);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const getBookingChatThread = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bookingId } = req.params as { bookingId: string };
    const thread = await chatService.getBookingChatThread(bookingId, req.user.sub);

    res.status(200).json(thread);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};

export const sendBookingChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bookingId } = req.params as { bookingId: string };
    const { content } = req.body;

    const message = await chatService.sendBookingChatMessage(
      bookingId,
      req.user.sub,
      content,
    );

    res.status(201).json(message);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    res.status(resolveErrorStatus(message)).json({ message });
  }
};
