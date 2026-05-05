import { Router } from 'express';
import {
  createGuest,
  getAllGuests,
  getGuest,
  updateGuest,
  deleteGuest,
  getEventGuestStats,
  updateRSVP,
  bulkImportGuests,
  bulkImportGuestsFromCSV
} from '../controller/guest.controller';
import { uploadCSV } from '../middleware/upload';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /guests:
 *   post:
 *     summary: Create a new guest
 *     tags:
 *       - Guests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - fullNames
 *               - phone
 *               - email
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event
 *               fullNames:
 *                 type: string
 *                 description: Full name of the guest
 *               phone:
 *                 type: string
 *                 description: Phone number of the guest
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the guest
 *               category:
 *                 type: string
 *                 enum: [VIP, STAFF, REGULAR]
 *                 default: REGULAR
 *                 description: Guest category
 *               tableNumber:
 *                 type: integer
 *                 description: Table number assigned to the guest
 *               rsvpStatus:
 *                 type: string
 *                 enum: [Pending, Confirmed, Declined]
 *                 default: Pending
 *                 description: RSVP status of the guest
 *     responses:
 *       201:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, createGuest);

/**
 * @swagger
 * /guests:
 *   get:
 *     summary: Get all guests for an event with filtering
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: query
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to get guests for
 *       - in: query
 *         name: rsvpStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Declined]
 *         description: Filter by RSVP status
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           enum: [VIP, STAFF, REGULAR]
 *         description: Filter by guest category
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of guests per page
 *     responses:
 *       200:
 *         description: Guests retrieved successfully
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
 *                     $ref: '#/components/schemas/Guest'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Missing eventId parameter
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, getAllGuests);

/**
 * @swagger
 * /guests/{id}:
 *   get:
 *     summary: Get a specific guest by ID
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID
 *     responses:
 *       200:
 *         description: Guest retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, getGuest);

/**
 * @swagger
 * /guests/{id}:
 *   put:
 *     summary: Update a guest
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullNames:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               category:
 *                 type: string
 *                 enum: [VIP, STAFF, REGULAR]
 *               tableNumber:
 *                 type: integer
 *               rsvpStatus:
 *                 type: string
 *                 enum: [Pending, Confirmed, Declined]
 *     responses:
 *       200:
 *         description: Guest updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, updateGuest);

/**
 * @swagger
 * /guests/{id}:
 *   delete:
 *     summary: Delete a guest
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID
 *     responses:
 *       200:
 *         description: Guest deleted successfully
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deleteGuest);

/**
 * @swagger
 * /guests/event/{eventId}/stats:
 *   get:
 *     summary: Get guest statistics for an event
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Guest statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGuests:
 *                       type: integer
 *                     confirmed:
 *                       type: integer
 *                     declined:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     byCategory:
 *                       type: object
 *                       properties:
 *                         vip:
 *                           type: integer
 *                         staff:
 *                           type: integer
 *                         regular:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/event/:eventId/stats', authenticate, getEventGuestStats);

/**
 * @swagger
 * /guests/{guestId}/rsvp:
 *   patch:
 *     summary: Update RSVP status of a guest
 *     tags:
 *       - Guests
 *     parameters:
 *       - in: path
 *         name: guestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rsvpStatus
 *             properties:
 *               rsvpStatus:
 *                 type: string
 *                 enum: [Pending, Confirmed, Declined]
 *                 description: New RSVP status
 *     responses:
 *       200:
 *         description: RSVP status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Invalid RSVP status
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:guestId/rsvp', authenticate, updateRSVP);

/**
 * @swagger
 * /guests/bulk/import:
 *   post:
 *     summary: Bulk import guests for an event
 *     tags:
 *       - Guests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - guests
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: Event ID
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullNames
 *                     - phone
 *                     - email
 *                   properties:
 *                     fullNames:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     category:
 *                       type: string
 *                       enum: [VIP, STAFF, REGULAR]
 *                     tableNumber:
 *                       type: integer
 *                     rsvpStatus:
 *                       type: string
 *                       enum: [Pending, Confirmed, Declined]
 *     responses:
 *       201:
 *         description: Guests imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Guest'
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           error:
 *                             type: string
 *                           data:
 *                             type: object
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/bulk/import', authenticate, bulkImportGuests);

/**
 * @swagger
 * /guests/bulk/import-csv:
 *   post:
 *     summary: Bulk import guests from CSV file
 *     tags:
 *       - Guests
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - csvFile
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event to import guests for
 *               csvFile:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing guest data
 *     responses:
 *       201:
 *         description: Guests imported successfully from CSV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CSV processed: 10 guests imported, 2 failed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Guest'
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           error:
 *                             type: string
 *                           data:
 *                             type: object
 *       400:
 *         description: Missing required fields or invalid CSV format
 *       500:
 *         description: Internal server error
 */
router.post('/bulk/import-csv', authenticate, uploadCSV, bulkImportGuestsFromCSV);

/**
 * @swagger
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique guest identifier
 *         eventId:
 *           type: string
 *           description: Associated event ID
 *         fullNames:
 *           type: string
 *           description: Full name of the guest
 *         phone:
 *           type: string
 *           description: Phone number of the guest
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the guest
 *         category:
 *           type: string
 *           enum: [VIP, STAFF, REGULAR]
 *           description: Guest category
 *         tableNumber:
 *           type: integer
 *           nullable: true
 *           description: Table number assigned to the guest
 *         rsvpStatus:
 *           type: string
 *           enum: [Pending, Confirmed, Declined]
 *           description: RSVP status of the guest
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when guest was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when guest was last updated
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalCount:
 *           type: integer
 *         totalPages:
 *           type: integer
 */

export default router;
