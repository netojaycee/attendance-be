import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextResponse, NextRequest } from 'next/server';

const markAttendanceSchema = z.object({
    userId: z.string().uuid('User ID must be a valid UUID'),
    practiceSessionId: z.string().uuid('Practice Session ID must be a valid UUID'),
    arrivalTime: z.string().datetime({ message: 'Arrival time must be a valid ISO 8601 date' }),
});



export async function POST(req: NextRequest) {
    try {
        // Validate request body with Zod
        const { userId, practiceSessionId, arrivalTime } = markAttendanceSchema.parse(req.body);

        // Validate practice session exists and is active
        const session = await prisma.practiceSession.findUnique({
            where: { id: practiceSessionId },
        });

        if (!session) {
            NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
            return;
        }

        const now = new Date();
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);

        if (now < startTime || now > endTime) {
            NextResponse.json({ error: 'Attendance marking is outside practice hours' }, { status: 400 });
            return;
        }

        // Check if user already marked attendance
        const existingAttendance = await prisma.attendance.findFirst({
            where: { userId, practiceSessionId },
        });

        if (existingAttendance) {
            NextResponse.json({ error: 'Attendance already marked' }, { status: 400 });
            return;
        }

        // Create attendance record
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                practiceSessionId,
                arrivalTime: new Date(arrivalTime),
            },
        });

        NextResponse.json(attendance, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};