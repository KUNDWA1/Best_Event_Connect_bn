import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { CreateGuestDto, UpdateGuestDto, RSVPStatus, GuestCategory } from '../dto/guest.dto';
import {
  createGuestService,
  getAllGuestsService,
  getGuestService,
  updateGuestService,
  deleteGuestService,
  getEventGuestStatsService,
  updateRSVPService,
  bulkImportGuestsService
} from '../services/guest.service';

export const createGuest = async (req: Request, res: Response) => {
  try {
    const dto = plainToInstance(CreateGuestDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const guest = await createGuestService(dto);
    res.status(201).json({ message: 'Guest created successfully', data: guest });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create guest', error: error.message });
  }
};

export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const { eventId, rsvpStatus, category, page = '1', limit = '10' } = req.query;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await getAllGuestsService(
      eventId as string,
      pageNum,
      limitNum,
      rsvpStatus as RSVPStatus | undefined,
      category as GuestCategory | undefined
    );

    res.status(200).json({
      message: 'Guests retrieved successfully',
      data: result.guests,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve guests', error: error.message });
  }
};

export const getGuest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const guest = await getGuestService(id);
    res.status(200).json({ message: 'Guest retrieved successfully', data: guest });
  } catch (error: any) {
    if (error.message === 'Guest not found') {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.status(500).json({ message: 'Failed to retrieve guest', error: error.message });
  }
};

export const updateGuest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const dto = plainToInstance(UpdateGuestDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const guest = await updateGuestService(id, dto);
    res.status(200).json({ message: 'Guest updated successfully', data: guest });
  } catch (error: any) {
    if (error.message === 'Guest not found') {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.status(500).json({ message: 'Failed to update guest', error: error.message });
  }
};

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await deleteGuestService(id);
    res.status(200).json({ message: 'Guest deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Guest not found') {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.status(500).json({ message: 'Failed to delete guest', error: error.message });
  }
};

export const getEventGuestStats = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const stats = await getEventGuestStatsService(eventId);
    res.status(200).json({ message: 'Guest statistics retrieved successfully', data: stats });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve guest statistics', error: error.message });
  }
};

export const updateRSVP = async (req: Request, res: Response) => {
  try {
    const guestId = req.params.guestId as string;
    const { rsvpStatus } = req.body;

    if (!rsvpStatus || !Object.values(RSVPStatus).includes(rsvpStatus)) {
      return res.status(400).json({ message: 'Invalid RSVP status' });
    }

    const guest = await updateRSVPService(guestId, rsvpStatus);
    res.status(200).json({ message: 'RSVP status updated successfully', data: guest });
  } catch (error: any) {
    if (error.message === 'Guest not found') {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.status(500).json({ message: 'Failed to update RSVP status', error: error.message });
  }
};

export const bulkImportGuests = async (req: Request, res: Response) => {
  try {
    const { eventId, guests } = req.body;

    if (!eventId || !Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ message: 'eventId and guests array are required' });
    }

    const results = await bulkImportGuestsService(eventId, guests);
    res.status(201).json({
      message: `Imported ${results.successful.length} guests, ${results.failed.length} failed`,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to import guests', error: error.message });
  }
};

export const bulkImportGuestsFromCSV = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    // Parse CSV from buffer
    const guests: any[] = [];
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on('data', (row) => {
          // Map CSV columns to guest data
          // Expected columns: fullNames, email, phone, category (optional), tableNumber (optional), rsvpStatus (optional)
          const guestData: any = {
            fullNames: row.fullNames || row['Full Names'] || row.fullnames || row['full_names'],
            email: row.email || row.Email,
            phone: row.phone || row.Phone,
          };

          // Optional fields
          if (row.category || row.Category) {
            const category = (row.category || row.Category).toUpperCase();
            if (['VIP', 'VVIP', 'STAFF', 'REGULAR', 'FAMILY', 'FRIEND'].includes(category)) {
              guestData.category = category as GuestCategory;
            }
          }

          if (row.tableNumber || row['Table Number'] || row['table_number']) {
            guestData.tableNumber = parseInt(row.tableNumber || row['Table Number'] || row['table_number']);
          }

          if (row.rsvpStatus || row['RSVP Status'] || row['rsvp_status']) {
            const status = row.rsvpStatus || row['RSVP Status'] || row['rsvp_status'];
            if (['Pending', 'Confirmed', 'Declined'].includes(status)) {
              guestData.rsvpStatus = status as RSVPStatus;
            }
          }

          // Only add if required fields are present
          if (guestData.fullNames && guestData.email && guestData.phone) {
            guests.push(guestData);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (guests.length === 0) {
      return res.status(400).json({ 
        message: 'No valid guest data found in CSV. Please ensure columns: fullNames, email, phone are present' 
      });
    }

    // Import guests using the existing service
    const results = await bulkImportGuestsService(eventId, guests);

    res.status(201).json({
      message: `CSV processed: ${results.successful.length} guests imported, ${results.failed.length} failed`,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process CSV file', error: error.message });
  }
};
