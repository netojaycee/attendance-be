// src/types.ts
export interface User {
    id: string;
    fullName: string;
    instrument: string;
    voice: string;
}

export interface PracticeSession {
    id: string;
    date: Date; // ISO 8601
    startTime: Date; // ISO 8601
    endTime: Date; // ISO 8601
    type: 'SINGLE' | 'DOUBLE';
}

export interface Attendance {
    id: string;
    userId: string;
    practiceSessionId: string;
    arrivalTime: string; // ISO 8601
    user: User;
}

export interface CalculationResponse {
    practiceSessionId?: string;
    userId?: string;
    dailyPercentage?: number;
    overallPercentage?: number;
    attendedUsers?: number;
    totalUsers?: number;
    attendedSessions?: number;
    totalSessions?: number;
}

export interface UserCredentials {
    fullName: string;
    instrument: string;
    voice: string;
}

export interface AttendanceCredentials {
    userId: string;
    practiceSessionId: string;
    arrivalTime: string; // ISO 8601
}

export interface PracticeSessionCredentials {
    date: string; // ISO 8601
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    type: 'SINGLE' | 'DOUBLE';
}