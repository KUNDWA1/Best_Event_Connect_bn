import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'vendor' | 'planner';
  isOnline: boolean;
  socketId: string;
}

interface CallRequest {
  callId: string;
  from: User;
  to: User;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined' | 'ended';
}

class VoiceCallSocketService {
  private io: SocketIOServer;
  private onlineUsers = new Map<string, User>(); // socketId -> user info
  private userSockets = new Map<string, string>(); // userId -> socketId
  private activeCalls = new Map<string, CallRequest>(); // callId -> call info
  private callRooms = new Map<string, string[]>(); // callId -> [socketId1, socketId2]

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:4173',
          'https://event-konnect-limited-fn.onrender.com',
          /\.onrender\.com$/,
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // User comes online
      socket.on('user-online', (userData: User) => {
        try {
          const user: User = {
            id: userData.id,
            name: userData.name,
            avatar: userData.avatar,
            role: userData.role,
            isOnline: true,
            socketId: socket.id
          };

          this.onlineUsers.set(socket.id, user);
          this.userSockets.set(userData.id, socket.id);

          console.log(`👤 User online: ${user.name} (${user.role})`);

          // Broadcast updated user list to all clients
          const allUsers = Array.from(this.onlineUsers.values());
          this.io.emit('users-online', allUsers);

          // Send current online users to the new user
          socket.emit('users-online', allUsers);
        } catch (error) {
          console.error('Error handling user-online:', error);
          socket.emit('error', 'Failed to register user online status');
        }
      });

      // User goes offline
      socket.on('user-offline', (userData: any) => {
        try {
          if (userData && userData.id) {
            this.userSockets.delete(userData.id);
          }
          this.onlineUsers.delete(socket.id);

          console.log(`👤 User offline: ${socket.id}`);

          // Broadcast updated user list
          const allUsers = Array.from(this.onlineUsers.values());
          this.io.emit('users-online', allUsers);
        } catch (error) {
          console.error('Error handling user-offline:', error);
        }
      });

      // Initiate call
      socket.on('initiate-call', (callData: CallRequest) => {
        try {
          const callRequest: CallRequest = {
            callId: callData.callId || `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from: callData.from,
            to: callData.to,
            timestamp: Date.now(),
            status: 'pending'
          };

          // Store the call
          this.activeCalls.set(callRequest.callId, callRequest);

          // Find target user's socket
          const targetSocketId = this.userSockets.get(callData.to.id);
          
          if (targetSocketId) {
            console.log(`📞 Call initiated: ${callRequest.from.name} → ${callRequest.to.name}`);
            
            // Send call request to target user
            this.io.to(targetSocketId).emit('incoming-call', callRequest);
            
            // Confirm to caller that call was sent
            socket.emit('call-initiated', { callId: callRequest.callId, status: 'sent' });
          } else {
            console.log(`❌ Target user not found: ${callData.to.id}`);
            socket.emit('error', 'Target user is not online');
          }
        } catch (error) {
          console.error('Error initiating call:', error);
          socket.emit('error', 'Failed to initiate call');
        }
      });

      // Accept call
      socket.on('accept-call', (callData: { callId: string }) => {
        try {
          const call = this.activeCalls.get(callData.callId);
          if (!call) {
            socket.emit('error', 'Call not found');
            return;
          }

          call.status = 'accepted';

          // Create call room
          const roomId = `call_${callData.callId}`;
          socket.join(roomId);
          
          // Add caller to room
          const callerSocketId = this.userSockets.get(call.from.id);
          if (callerSocketId) {
            this.io.sockets.sockets.get(callerSocketId)?.join(roomId);
            this.callRooms.set(callData.callId, [socket.id, callerSocketId]);
          }

          console.log(`✅ Call accepted: ${call.from.name} ↔ ${call.to.name}`);

          // Notify both parties
          this.io.to(roomId).emit('call-accepted', call);
          
          // Start WebRTC signaling
          socket.emit('start-webrtc-signaling', { callId: callData.callId, isInitiator: false });
          if (callerSocketId) {
            this.io.to(callerSocketId).emit('start-webrtc-signaling', { callId: callData.callId, isInitiator: true });
          }
        } catch (error) {
          console.error('Error accepting call:', error);
          socket.emit('error', 'Failed to accept call');
        }
      });

      // Decline call
      socket.on('decline-call', (callData: { callId: string }) => {
        try {
          const call = this.activeCalls.get(callData.callId);
          if (!call) {
            socket.emit('error', 'Call not found');
            return;
          }

          call.status = 'declined';

          console.log(`❌ Call declined: ${call.from.name} → ${call.to.name}`);

          // Notify caller
          const callerSocketId = this.userSockets.get(call.from.id);
          if (callerSocketId) {
            this.io.to(callerSocketId).emit('call-declined', call);
          }

          // Clean up
          this.activeCalls.delete(callData.callId);
        } catch (error) {
          console.error('Error declining call:', error);
          socket.emit('error', 'Failed to decline call');
        }
      });

      // End call
      socket.on('end-call', (callData: { callId: string }) => {
        try {
          const call = this.activeCalls.get(callData.callId);
          if (call) {
            call.status = 'ended';
            console.log(`📴 Call ended: ${call.from.name} ↔ ${call.to.name}`);
          }

          // Notify all participants
          const roomId = `call_${callData.callId}`;
          this.io.to(roomId).emit('call-ended', callData.callId);

          // Clean up room and call data
          const participants = this.callRooms.get(callData.callId);
          if (participants) {
            participants.forEach(socketId => {
              const participantSocket = this.io.sockets.sockets.get(socketId);
              if (participantSocket) {
                participantSocket.leave(roomId);
              }
            });
            this.callRooms.delete(callData.callId);
          }

          this.activeCalls.delete(callData.callId);
        } catch (error) {
          console.error('Error ending call:', error);
          socket.emit('error', 'Failed to end call');
        }
      });

      // WebRTC signaling - offer
      socket.on('webrtc-offer', (data: { offer: any, callId: string }) => {
        try {
          const roomId = `call_${data.callId}`;
          console.log(`🔄 WebRTC offer for call: ${data.callId}`);
          
          // Forward offer to other participant
          socket.to(roomId).emit('webrtc-offer', {
            offer: data.offer,
            callId: data.callId
          });
        } catch (error) {
          console.error('Error handling WebRTC offer:', error);
          socket.emit('error', 'Failed to process WebRTC offer');
        }
      });

      // WebRTC signaling - answer
      socket.on('webrtc-answer', (data: { answer: any, callId: string }) => {
        try {
          const roomId = `call_${data.callId}`;
          console.log(`🔄 WebRTC answer for call: ${data.callId}`);
          
          // Forward answer to other participant
          socket.to(roomId).emit('webrtc-answer', {
            answer: data.answer,
            callId: data.callId
          });
        } catch (error) {
          console.error('Error handling WebRTC answer:', error);
          socket.emit('error', 'Failed to process WebRTC answer');
        }
      });

      // WebRTC signaling - ICE candidate
      socket.on('webrtc-ice-candidate', (data: { candidate: any, callId: string }) => {
        try {
          const roomId = `call_${data.callId}`;
          console.log(`🧊 ICE candidate for call: ${data.callId}`);
          
          // Forward ICE candidate to other participant
          socket.to(roomId).emit('webrtc-ice-candidate', {
            candidate: data.candidate,
            callId: data.callId
          });
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
          socket.emit('error', 'Failed to process ICE candidate');
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        try {
          console.log(`🔌 User disconnected: ${socket.id} (${reason})`);

          // Find user data
          const userData = this.onlineUsers.get(socket.id);
          
          if (userData) {
            // Remove from online users
            this.onlineUsers.delete(socket.id);
            this.userSockets.delete(userData.id);

            // End any active calls involving this user
            for (const [callId, call] of this.activeCalls.entries()) {
              if (call.from.id === userData.id || call.to.id === userData.id) {
                console.log(`📴 Auto-ending call due to disconnect: ${callId}`);
                
                // Notify other participant
                const roomId = `call_${callId}`;
                socket.to(roomId).emit('call-ended', callId);
                
                // Clean up
                const participants = this.callRooms.get(callId);
                if (participants) {
                  participants.forEach(socketId => {
                    const participantSocket = this.io.sockets.sockets.get(socketId);
                    if (participantSocket) {
                      participantSocket.leave(roomId);
                    }
                  });
                  this.callRooms.delete(callId);
                }
                
                this.activeCalls.delete(callId);
              }
            }

            console.log(`👤 User removed: ${userData.name} (${userData.role})`);
          }

          // Broadcast updated user list
          const allUsers = Array.from(this.onlineUsers.values());
          this.io.emit('users-online', allUsers);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  // Get current statistics
  getStats() {
    return {
      onlineUsers: this.onlineUsers.size,
      activeCalls: this.activeCalls.size,
      callRooms: this.callRooms.size
    };
  }

  // Get online users list
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }
}

export default VoiceCallSocketService;