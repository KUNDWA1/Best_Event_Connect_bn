import { Router } from "express";
import * as chatController from "../controller/chat.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/chat/create-room:
 *   post:
 *     summary: Create a chat room
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plannerId
 *               - vendorId
 *             properties:
 *               plannerId:
 *                 type: string
 *               vendorUserId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat room created successfully
 *       400:
 *         description: Bad request
 */
router.post("/create-room", authenticate, chatController.createChatRoom);

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatRoomId
 *               - senderId
 *               - content
 *             properties:
 *               chatRoomId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 */
router.post("/send", authenticate, chatController.sendMessage);

/**
 * @swagger
 * /api/chat/booking/{bookingId}:
 *   get:
 *     summary: Get booking chat room details and messages
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking chat thread retrieved successfully
 *       403:
 *         description: Chat unavailable for this booking
 *       404:
 *         description: Booking not found
 */
router.get("/booking/:bookingId", authenticate, chatController.getBookingChatThread);

/**
 * @swagger
 * /api/chat/booking/{bookingId}/messages:
 *   post:
 *     summary: Send a message in a booking chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       403:
 *         description: Chat unavailable for this booking
 *       404:
 *         description: Booking not found
 */
router.post(
	"/booking/:bookingId/messages",
	authenticate,
	chatController.sendBookingChatMessage,
);

/**
 * @swagger
 * /api/chat/{chatRoomId}:
 *   get:
 *     summary: Get messages from a chat room
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       400:
 *         description: Bad request
 *   delete:
 *     summary: Delete a chat room
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room deleted successfully
 *       400:
 *         description: Bad request
 */
router.get("/:chatRoomId", authenticate, chatController.getMessages);
router.delete("/:chatRoomId", authenticate, chatController.deleteChatRoom);

/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   put:
 *     summary: Update a message
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Bad request
 *   delete:
 *     summary: Delete a message
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Bad request
 */
router.put("/message/:messageId", authenticate, chatController.updateMessage);
router.delete("/message/:messageId", authenticate, chatController.deleteMessage);

export default router;
