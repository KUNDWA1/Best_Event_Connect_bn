import { Router } from 'express';
import {
  createEventCategory,
  getAllEventCategories,
  getEventCategory,
  updateEventCategory,
  deleteEventCategory,
} from '../controller/event-category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /event-categories:
 *   post:
 *     summary: Create a new event category
 *     description: Create an event category. Restricted to admins.
 *     tags:
 *       - Event Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Wedding"
 *     responses:
 *       201:
 *         description: Event category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EventCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       409:
 *         description: Event category already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize('admin'), createEventCategory);

/**
 * @swagger
 * /event-categories:
 *   get:
 *     summary: Get all event categories
 *     description: Returns a list of all event categories ordered alphabetically.
 *     tags:
 *       - Event Categories
 *     responses:
 *       200:
 *         description: List of event categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventCategory'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllEventCategories);

/**
 * @swagger
 * /event-categories/{id}:
 *   get:
 *     summary: Get an event category by ID
 *     tags:
 *       - Event Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event category ID
 *     responses:
 *       200:
 *         description: Event category found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EventCategory'
 *       404:
 *         description: Event category not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getEventCategory);

/**
 * @swagger
 * /event-categories/{id}:
 *   put:
 *     summary: Update an event category
 *     description: Update an existing event category. Restricted to admins.
 *     tags:
 *       - Event Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Conference"
 *     responses:
 *       200:
 *         description: Event category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EventCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Event category not found
 *       409:
 *         description: Name already taken by another category
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize('admin'), updateEventCategory);

/**
 * @swagger
 * /event-categories/{id}:
 *   delete:
 *     summary: Delete an event category
 *     description: Permanently delete an event category. Restricted to admins.
 *     tags:
 *       - Event Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event category ID
 *     responses:
 *       200:
 *         description: Event category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Event category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize('admin'), deleteEventCategory);

export default router;
