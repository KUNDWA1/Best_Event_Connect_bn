import { Router } from 'express';
import { createFeedback, getVendorFeedbacks } from '../controller/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create feedback for a vendor
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - userId
 *               - rating
 *             properties:
 *               vendorId:
 *                 type: string
 *               userId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, createFeedback);

/**
 * @swagger
 * /api/feedback/vendor/{vendorId}:
 *   get:
 *     summary: Get all feedbacks for a vendor
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/vendor/:vendorId', authenticate, getVendorFeedbacks);

export default router;
