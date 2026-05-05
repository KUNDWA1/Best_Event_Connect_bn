import { Router } from "express";
import { createBooking, getAllBookings, getBooking, updateBooking, deleteBooking } from "../controller/booking.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *               - eventId
 *               - priceOffered
 *               - startDate
 *               - endDate
 *             properties:
 *               packageId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               priceOffered:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       500:
 *         description: Failed to create booking
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of all bookings
 *       500:
 *         description: Failed to fetch bookings
 */
router.post("/", authenticate, createBooking);
router.get("/", authenticate, getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to fetch booking
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceOffered:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, cancelled, completed]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       500:
 *         description: Failed to update booking
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       500:
 *         description: Failed to delete booking
 */
router.get("/:id", authenticate, getBooking);
router.put("/:id", authenticate, updateBooking);
router.delete("/:id", authenticate, deleteBooking);

export default router;
