import { Router } from 'express';
import {
  createServiceCategory,
  getAllServiceCategories,
  getServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../controller/service-category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /service-categories:
 *   post:
 *     summary: Create a new service category
 *     description: Create a service category. Restricted to admins.
 *     tags:
 *       - Service Categories
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
 *                 example: "Photography"
 *     responses:
 *       201:
 *         description: Service category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       409:
 *         description: Service category already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize('admin'), createServiceCategory);

/**
 * @swagger
 * /service-categories:
 *   get:
 *     summary: Get all service categories
 *     description: Returns a list of all service categories ordered alphabetically.
 *     tags:
 *       - Service Categories
 *     responses:
 *       200:
 *         description: List of service categories
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
 *                     $ref: '#/components/schemas/ServiceCategory'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllServiceCategories);

/**
 * @swagger
 * /service-categories/{id}:
 *   get:
 *     summary: Get a service category by ID
 *     tags:
 *       - Service Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service category ID
 *     responses:
 *       200:
 *         description: Service category found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ServiceCategory'
 *       404:
 *         description: Service category not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getServiceCategory);

/**
 * @swagger
 * /service-categories/{id}:
 *   put:
 *     summary: Update a service category
 *     description: Update an existing service category. Restricted to admins.
 *     tags:
 *       - Service Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service category ID
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
 *                 example: "Catering"
 *     responses:
 *       200:
 *         description: Service category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ServiceCategory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Service category not found
 *       409:
 *         description: Name already taken by another category
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize('admin'), updateServiceCategory);

/**
 * @swagger
 * /service-categories/{id}:
 *   delete:
 *     summary: Delete a service category
 *     description: Permanently delete a service category. Restricted to admins.
 *     tags:
 *       - Service Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service category ID
 *     responses:
 *       200:
 *         description: Service category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Service category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize('admin'), deleteServiceCategory);

export default router;
