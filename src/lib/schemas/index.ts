// src/schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    instrument: z.string().min(1, 'Instrument is required'),
    voice: z.string().min(1, 'Voice is required'),
});

export const userQuerySchema = z.object({
    search: z.string().optional(),
    instrument: z.string().optional(),
    voice: z.string().optional(),
    sort: z
        .enum(['fullName:asc', 'fullName:desc', 'instrument:asc', 'instrument:desc', 'voice:asc', 'voice:desc'])
        .optional(),
});

export const attendanceSchema = z.object({
    userId: z.string().uuid('User ID must be a valid UUID'),
    practiceSessionId: z.string().uuid('Practice Session ID must be a valid UUID'),
    arrivalTime: z.string().datetime({ message: 'Arrival time must be a valid ISO 8601 date' }),
});

export const attendanceQuerySchema = z.object({
    userId: z.string().uuid('User ID must be a valid UUID').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sort: z.enum(['arrivalTime:asc', 'arrivalTime:desc', 'userId:asc', 'userId:desc']).optional(),
});

export const practiceSessionSchema = z
    .object({
        date: z.string().datetime({ message: 'Date must be a valid ISO 8601 date' }),
        startTime: z.string().datetime({ message: 'Start time must be a valid ISO 8601 date' }),
        endTime: z.string().datetime({ message: 'End time must be a valid ISO 8601 date' }),
        type: z.enum(['SINGLE', 'DOUBLE'], { message: 'Type must be "SINGLE" or "DOUBLE"' }),
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    });

export const practiceSessionQuerySchema = z.object({
    type: z.enum(['SINGLE', 'DOUBLE']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sort: z
        .enum(['date:asc', 'date:desc', 'startTime:asc', 'startTime:desc', 'type:asc', 'type:desc'])
        .optional(),
});

export const calculationsQuerySchema = z.object({
    practiceSessionId: z.string().uuid('Practice Session ID must be a valid UUID').optional(),
    userId: z.string().uuid('User ID must be a valid UUID').optional(),
});