import { NextResponse } from "next/server";



export async function GET() {
    try {

        return NextResponse.json(
            { message: 'Hello from attendance controller!' },
            { status: 200 }
        );
    } catch (error) {
        console.error("Fetch products error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}