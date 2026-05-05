import { Router } from 'express';
import { 
  getOnlineUsers, 
  recordCall, 
  getCallHistory, 
  getCallAnalytics 
} from '../controller/voice-call.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     VoiceCallUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           description: User full name
 *         avatar:
 *           type: string
 *           description: User avatar URL
 *         role:
 *           type: string
 *           enum: [vendor, planner]
 *           description: User role
 *         isOnline:
 *           type: boolean
 *           description: Online status
 *     
 *     VoiceCallRecord:
 *       type: object
 *       properties:
 *         callId:
 *           type: string
 *           description: Unique call identifier
 *         toUserId:
 *           type: string
 *           description: Target user ID
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined, ended]
 *           description: Call status
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Call start time
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Call end time
 *         duration:
 *           type: integer
 *           description: Call duration in seconds
 */

/**
 * @swagger
 * /api/voice-calls/online-users:
 *   get:
 *     summary: Get online users available for voice calls
 *     tags: [Voice Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of online users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VoiceCallUser'
 *                     count:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/online-users', authenticate, getOnlineUsers);

/**
 * @swagger
 * /api/voice-calls/record:
 *   post:
 *     summary: Record a voice call
 *     tags: [Voice Calls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoiceCallRecord'
 *     responses:
 *       201:
 *         description: Call recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/record', authenticate, recordCall);

/**
 * @swagger
 * /api/voice-calls/history:
 *   get:
 *     summary: Get call history for current user
 *     tags: [Voice Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of calls to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of calls to skip
 *     responses:
 *       200:
 *         description: Call history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     calls:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/history', authenticate, getCallHistory);

/**
 * @swagger
 * /api/voice-calls/analytics:
 *   get:
 *     summary: Get call analytics for current user
 *     tags: [Voice Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCalls:
 *                       type: integer
 *                     completedCalls:
 *                       type: integer
 *                     declinedCalls:
 *                       type: integer
 *                     totalDuration:
 *                       type: integer
 *                     averageDuration:
 *                       type: integer
 *                     recentActivity:
 *                       type: integer
 *                     lastCallDate:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get('/analytics', authenticate, getCallAnalytics);

export default router;