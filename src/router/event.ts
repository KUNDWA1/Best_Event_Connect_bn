import { Router } from 'express';
import { 
  createEvent, getAllEvents, getPublicEvents, getEvent, updateEvent, uploadEventImage, deleteEvent,
  addEventService, getEventServices, updateEventService, deleteEventService
} from '../controller/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /events/public:
 *   get:
 *     summary: Get all public events (no authentication required)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [wedding, conference, birthday, corporate, concert, other]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Public events retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/public', getPublicEvents);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - eventType
 *               - startDate
 *               - endDate
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               eventType:
 *                 type: string
 *                 enum: [wedding, conference, birthday, corporate, concert, other]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *                 maxLength: 300
 *               budget:
 *                 type: number
 *                 minimum: 0
 *               guestCount:
 *                 type: integer
 *                 minimum: 1
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: private
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, uploadSingleImage, createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with filters (users see only their own, admins see all)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [wedding, conference, birthday, corporate, concert, other]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID (must be owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, getEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event (must be owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               eventType:
 *                 type: string
 *                 enum: [wedding, conference, birthday, corporate, concert, other]
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               budget:
 *                 type: number
 *               guestCount:
 *                 type: integer
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, updateEvent);

/**
 * @swagger
 * /events/{id}/image:
 *   post:
 *     summary: Upload event image (must be owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event image uploaded successfully
 *       400:
 *         description: No image file provided
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/image', authenticate, uploadSingleImage, uploadEventImage);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event (must be owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteEvent);

/**
 * @swagger
 * /events/{eventId}/services:
 *   post:
 *     summary: Add a service to an event (must be event owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               - category
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Catering"
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Buffet Service"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "8 bridesmaids dresses"
 *               budget:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Service added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.post('/:eventId/services', authenticate, addEventService);

/**
 * @swagger
 * /events/{eventId}/services:
 *   get:
 *     summary: Get all services for an event (must be owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       eventId:
 *                         type: string
 *                       category:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       budget:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get('/:eventId/services', authenticate, getEventServices);

/**
 * @swagger
 * /events/{eventId}/services/{serviceId}:
 *   put:
 *     summary: Update a service (must be event owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 100
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               budget:
 *                 type: number
 *                 minimum: 0
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.put('/:eventId/services/:serviceId', authenticate, updateEventService);

/**
 * @swagger
 * /events/{eventId}/services/{serviceId}:
 *   delete:
 *     summary: Delete a service (must be event owner or admin)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:eventId/services/:serviceId', authenticate, deleteEventService);

export default router;
