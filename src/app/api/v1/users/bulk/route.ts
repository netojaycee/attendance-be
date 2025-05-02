import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import formidable from 'formidable';
import XLSX from 'xlsx';
import { promises as fs } from 'fs';
import { prisma } from '@/lib/prisma';
import { IncomingMessage } from 'http';
import { User } from '../../../../../../prisma/src/generated/prisma';


const userSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    instrument: z.string().min(1, 'Instrument is required'),
    voice: z.string().min(1, 'Voice is required'),
});

export async function POST(req: NextRequest) {
    try {
        const form = formidable({ uploadDir: './uploads', keepExtensions: true });

        const [, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
            form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const file = files.file?.[0];
        if (!file || !file.filepath) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const workbook = XLSX.readFile(file.filepath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet) as Partial<User>[];

        const validUsers: Partial<User>[] = [];
        const errors: string[] = [];

        data.forEach((row, index) => {
            try {
                const parsed = userSchema.parse(row);
                validUsers.push(parsed);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    errors.push(`Row ${index + 2}: ${error.errors.map(e => e.message).join(', ')}`);
                }
            }
        });

        if (errors.length > 0) {
            await fs.unlink(file.filepath);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const createdUsers = await prisma.user.createMany({
            data: validUsers.map(user => ({
                fullName: user.fullName!,
                instrument: user.instrument!,
                voice: user.voice!,
            })),
            skipDuplicates: true,
        });

        await fs.unlink(file.filepath);

        return NextResponse.json(
            {
                message: `Successfully created ${createdUsers.count} users`,
                createdUsers,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}