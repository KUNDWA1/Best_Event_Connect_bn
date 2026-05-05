import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

interface VoiceCallRequest {
  callId: string;
  fromUserId: string;
  toUserId: string;
  callType: 'voice';
  status: 'pending' | 'accepted' | 'declined' | 'ended';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'vendor' | 'planner' | 'admin';
  isOnline?: boolean;
}

// Get online users for voice calls
export const getOnlineUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.sub;
    const currentUserRole = req.user?.role;

    if (!currentUserId || !currentUserRole) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Get users with opposite role (vendors can call planners and vice versa)
    const targetRole = currentUserRole === 'vendor' ? 'planner' : 'vendor';
    
    const users = await prisma.user.findMany({
      where: {
        role: targetRole === 'planner' ? 'event_planner' : 'vendor',
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    // Transform users for voice call interface
    const onlineUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
      role: user.role,
      isOnline: true // In a real app, you'd track this via WebSocket connections
    }));

    res.json({
      success: true,
      data: {
        users: onlineUsers,
        count: onlineUsers.length
      }
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get online users'
    });
  }
};

// Record a voice call
export const recordCall = async (req: AuthRequest, res: Response) => {
  try {
    const {
      callId,
      toUserId,
      status,
      startTime,
      endTime,
      duration
    } = req.body;

    const fromUserId = req.user?.sub;

    if (!fromUserId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Validate required fields
    if (!callId || !toUserId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: callId, toUserId, status'
      });
    }

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: fromUserId } }),
      prisma.user.findUnique({ where: { id: toUserId } })
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // For now, we'll store call data in a simple format
    // You can extend this to use a proper VoiceCall model later
    const callData = {
      callId,
      fromUserId,
      toUserId,
      callType: 'voice' as const,
      status,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : null,
      duration: duration || null,
      createdAt: new Date()
    };

    // Log the call for now (you can store in database later)
    console.log('Voice call recorded:', callData);

    res.status(201).json({
      success: true,
      data: callData,
      message: 'Call recorded successfully'
    });
  } catch (error) {
    console.error('Error recording call:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record call'
    });
  }
};

// Get call history for a user
export const getCallHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // For now, return mock data
    // You can implement actual database queries later
    const mockCallHistory = [
      {
        id: '1',
        callId: 'call_123',
        type: 'outgoing',
        participant: {
          id: 'user_456',
          name: 'John Doe',
          role: 'planner',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
        },
        status: 'ended',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: new Date(Date.now() - 3300000), // 55 minutes ago
        duration: 300, // 5 minutes
        createdAt: new Date(Date.now() - 3600000)
      }
    ];

    res.json({
      success: true,
      data: {
        calls: mockCallHistory,
        count: mockCallHistory.length,
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Error getting call history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call history'
    });
  }
};

// Get call analytics
export const getCallAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Return mock analytics data
    const mockAnalytics = {
      totalCalls: 15,
      completedCalls: 12,
      declinedCalls: 3,
      totalDuration: 3600, // 1 hour in seconds
      averageDuration: 300, // 5 minutes
      recentActivity: 5,
      lastCallDate: new Date()
    };

    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    console.error('Error getting call analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get call analytics'
    });
  }
};