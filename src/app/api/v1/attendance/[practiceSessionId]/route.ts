import { prisma } from '@/lib/prisma';
import {  NextResponse } from 'next/server';
import { z } from 'zod';



export async function GET(
    _request: Request,
    { params }: { params: Promise<{ practiceSessionId: string }> }
) {
    const { practiceSessionId } = await params;

    try {
        z.string().uuid('Practice Session ID must be a valid UUID').parse(practiceSessionId);

        const attendance = await prisma.attendance.findMany({
            where: { practiceSessionId },
            include: { user: true },
        });

        return NextResponse.json(attendance, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}