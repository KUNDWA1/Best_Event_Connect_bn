import { Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto, UpdateEventDto, CreateEventServiceDto, UpdateEventServiceDto, EventVisibility } from '../dto/event.dto';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import uploadBufferToCloudinary from '../utils/cloudinaryUpload';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const payload = {
      ...req.body,
      budget: req.body?.budget !== undefined && req.body?.budget !== '' ? Number(req.body.budget) : undefined,
      guestCount: req.body?.guestCount !== undefined && req.body?.guestCount !== '' ? Number(req.body.guestCount) : undefined,
      status: req.body?.status || undefined,
    };

    const dto = plainToInstance(CreateEventDto, payload);
    const userId = req.user!.sub;
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    let imageUrl: string | undefined;
    if (req.file?.buffer) {
      imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'events/images');
    }

    const event = await prisma.event.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        eventType: dto.eventType,
        status: (dto.status ?? 'draft') as any,
        visibility: dto.visibility ?? EventVisibility.PRIVATE,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        budget: dto.budget,
        guestCount: dto.guestCount,
        imageUrl,
      },
      include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    res.status(201).json({ message: 'Event created successfully', data: event });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

export const getPublicEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { visibility: 'public', status: 'published' };
    if (eventType) where.eventType = eventType;

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          eventType: true,
          startDate: true,
          endDate: true,
          location: true,
          guestCount: true,
          imageUrl: true,
          status: true,
          visibility: true,
          createdAt: true,
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.status(200).json({
      message: 'Public events retrieved successfully',
      data: events,
      pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve public events', error: error.message });
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { status, eventType, userId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;

    // Authorization: Non-admin users can only see their own events
    if (req.user?.role !== 'admin') {
      where.userId = req.user?.sub;
    } else if (userId) {
      // Admin can filter by specific userId if provided
      where.userId = userId;
    }

    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { startDate: 'asc' },
        include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } }
      }),
      prisma.event.count({ where })
    ]);

    res.status(200).json({
      message: 'Events retrieved successfully',
      data: events,
      pagination: { page: pageNum, limit: limitNum, totalCount, totalPages: Math.ceil(totalCount / limitNum) }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve events', error: error.message });
  }
};

export const getEvent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only view own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own events' });
    }

    res.status(200).json({ message: 'Event retrieved successfully', data: event });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve event', error: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const payload = {
      ...req.body,
      budget: req.body?.budget !== undefined && req.body?.budget !== '' ? Number(req.body.budget) : undefined,
      guestCount: req.body?.guestCount !== undefined && req.body?.guestCount !== '' ? Number(req.body.guestCount) : undefined,
    };
    const dto = plainToInstance(UpdateEventDto, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only update own events unless admin
    if (req.user?.role !== 'admin' && existingEvent.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own events' });
    }

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.eventType) updateData.eventType = dto.eventType;
    if (dto.status) updateData.status = dto.status;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.location) updateData.location = dto.location;
    if (dto.budget !== undefined) updateData.budget = dto.budget;
    if (dto.guestCount !== undefined) updateData.guestCount = dto.guestCount;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.visibility) updateData.visibility = dto.visibility;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    res.status(200).json({ message: 'Event updated successfully', data: event });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

export const uploadEventImage = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only upload image for own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own events' });
    }

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'events/images');

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { imageUrl },
      include: { User: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });

    return res.status(200).json({
      message: 'Event image uploaded successfully',
      data: updatedEvent,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to upload event image', error: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only delete own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own events' });
    }

    await prisma.event.delete({ where: { id } });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

export const addEventService = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const dto = plainToInstance(CreateEventServiceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only add services to own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only manage services for your own events' });
    }

    const service = await prisma.eventService.create({
      data: {
        eventId,
        category: dto.category,
        title: dto.title || null,
        description: dto.description || null,
        budget: dto.budget || null,
        quantity: dto.quantity || 1,
      },
    });

    res.status(201).json({ message: 'Service added successfully', data: service });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add service', error: error.message });
  }
};

export const getEventServices = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only view services for own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only view services for your own events' });
    }

    const services = await prisma.eventService.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Services retrieved successfully',
      data: services,
      total: services.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve services', error: error.message });
  }
};

export const updateEventService = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const serviceId = req.params.serviceId as string;
    const dto = plainToInstance(UpdateEventServiceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only update services for own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only update services for your own events' });
    }

    // Check if service exists and belongs to event
    const service = await prisma.eventService.findUnique({ where: { id: serviceId } });
    if (!service || service.eventId !== eventId) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updateData: any = {};
    if (dto.category) updateData.category = dto.category;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.budget !== undefined) updateData.budget = dto.budget;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;

    const updatedService = await prisma.eventService.update({
      where: { id: serviceId },
      data: updateData,
    });

    res.status(200).json({ message: 'Service updated successfully', data: updatedService });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
};

export const deleteEventService = async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const serviceId = req.params.serviceId as string;

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Can only delete services from own events unless admin
    if (req.user?.role !== 'admin' && event.userId !== req.user?.sub) {
      return res.status(403).json({ message: 'Forbidden: You can only delete services from your own events' });
    }

    // Check if service exists and belongs to event
    const service = await prisma.eventService.findUnique({ where: { id: serviceId } });
    if (!service || service.eventId !== eventId) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await prisma.eventService.delete({ where: { id: serviceId } });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};
