import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const calculationsSchema = z.object({
    practiceSessionId: z.string().uuid('Practice Session ID must be a valid UUID').optional(),
    userId: z.string().uuid('User ID must be a valid UUID').optional(),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const params = calculationsSchema.parse({
            practiceSessionId: searchParams.get('practiceSessionId'),
            userId: searchParams.get('userId'),
        });

        if (params.practiceSessionId) {
            // Daily attendance percentage for a practice session
            const session = await prisma.practiceSession.findUnique({
                where: { id: params.practiceSessionId },
            });

            if (!session) {
                return NextResponse.json({ error: 'Practice session not found' }, { status: 404 });
            }

            const totalUsers = await prisma.user.count();
            const attendedUsers = await prisma.attendance.count({
                where: { practiceSessionId: params.practiceSessionId },
            });

            const dailyPercentage = totalUsers > 0 ? (attendedUsers / totalUsers) * 100 : 0;

            return NextResponse.json({
                practiceSessionId: params.practiceSessionId,
                dailyPercentage: Number(dailyPercentage.toFixed(2)),
                attendedUsers,
                totalUsers,
            });
        } else if (params.userId) {
            // Overall attendance percentage for a user
            const user = await prisma.user.findUnique({
                where: { id: params.userId },
            });

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const totalSessions = await prisma.practiceSession.count();
            const attendedSessions = await prisma.attendance.count({
                where: { userId: params.userId },
            });

            const overallPercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

            return NextResponse.json({
                userId: params.userId,
                overallPercentage: Number(overallPercentage.toFixed(2)),
                attendedSessions,
                totalSessions,
            });
        } else {
            return NextResponse.json({ error: 'Provide either practiceSessionId or userId' }, { status: 400 });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}