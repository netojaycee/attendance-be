import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const userSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    instrument: z.string().min(1, 'Instrument is required'),
    voice: z.string().min(1, 'Voice is required'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = userSchema.parse(body);
        const user = await prisma.user.create({ data });
        return NextResponse.json(user, { status: 201 });
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
        const users = await prisma.user.findMany();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}