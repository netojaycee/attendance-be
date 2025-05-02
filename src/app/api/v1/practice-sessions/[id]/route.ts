import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { z } from 'zod';


const practiceSessionIdSchema = z.string().uuid('Practice Session ID must be a valid UUID');
const partialPracticeSessionSchema = z.object({
    date: z.string().datetime({ message: 'Date must be a valid ISO 8601 date' }).optional(),
    startTime: z.string().datetime({ message: 'Start time must be a valid ISO 8601 date' }).optional(),
    endTime: z.string().datetime({ message: 'End time must be a valid ISO 8601 date' }).optional(),
    type: z.enum(['SINGLE', 'DOUBLE'], { message: 'Type must be "Single" or "Double"' }).optional(),
});

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        practiceSessionIdSchema.parse(id);
        const practiceSession = await prisma.practiceSession.findUnique({
            where: { id },
        });

        if (!practiceSession) {
            return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
        }

        return NextResponse.json(practiceSession);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        practiceSessionIdSchema.parse(id);
        const body = await req.json();
        const data = partialPracticeSessionSchema.parse(body);

        if (data.startTime || data.endTime) {
            const practiceSession = await prisma.practiceSession.findUnique({
                where: { id },
            });

            if (!practiceSession) {
                return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
            }

            const startTime = data.startTime
                ? new Date(data.startTime)
                : new Date(practiceSession.startTime);
            const endTime = data.endTime
                ? new Date(data.endTime)
                : new Date(practiceSession.endTime);

            if (endTime <= startTime) {
                return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
            }

            data.startTime = startTime.toISOString();
            data.endTime = endTime.toISOString();
        }

        if (data.date) {
            data.date = new Date(data.date).toISOString();
        }

        const updatedPracticeSession = await prisma.practiceSession.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedPracticeSession);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        practiceSessionIdSchema.parse(id);
        const practiceSession = await prisma.practiceSession.findUnique({
            where: { id },
        });

        if (!practiceSession) {
            return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
        }

        await prisma.practiceSession.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}