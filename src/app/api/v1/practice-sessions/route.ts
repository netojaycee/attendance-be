import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const practiceSessionSchema = z.object({
    date: z.string().datetime({ message: 'Date must be a valid ISO 8601 date' }),
    startTime: z.string().datetime({ message: 'Start time must be a valid ISO 8601 date' }),
    endTime: z.string().datetime({ message: 'End time must be a valid ISO 8601 date' }),
    type: z.enum(['SINGLE', 'DOUBLE'], { message: 'Type must be "Single" or "Double"' }),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = practiceSessionSchema.parse(body);

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        if (endTime <= startTime) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        const practiceSession = await prisma.practiceSession.create({
            data: {
                date: new Date(data.date),
                startTime,
                endTime,
                type: data.type,
            },
        });

        return NextResponse.json(practiceSession, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const practiceSessions = await prisma.practiceSession.findMany();
        return NextResponse.json(practiceSessions, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}