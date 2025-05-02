
// src/lib/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  User,
  PracticeSession,
  Attendance,
  CalculationResponse,
  UserCredentials,
  AttendanceCredentials,
  PracticeSessionCredentials,
} from '@/lib/types';
import {
  userSchema,
  userQuerySchema,
  attendanceSchema,
  attendanceQuerySchema,
  practiceSessionSchema,
  practiceSessionQuerySchema,
  calculationsQuerySchema,
} from '@/lib/schemas';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_BASE_URL || 'https://your-vercel-app.vercel.app'
    : 'http://localhost:9900';

// Base query with TypeScript annotations
const baseQuery: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({
  baseUrl: `${ BASE_URL }/api/v1`,
credentials: 'include',
    prepareHeaders: (headers: Headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Define the API
export const api = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['User', 'Attendance', 'PracticeSession'],
    endpoints: (builder) => ({
        // --- Users Endpoints ---
        createUser: builder.mutation<User, UserCredentials>({
            query: (credentials) => ({
                url: '/users',
                method: 'POST',
                body: userSchema.parse(credentials),
            }),
            invalidatesTags: ['User'],
        }),

        getUsers: builder.query<User[], { search?: string; instrument?: string; voice?: string; sort?: string }>({
            query: (params) => ({
                url: '/users',
                method: 'GET',
                params: userQuerySchema.parse(params),
            }),
            providesTags: ['User'],
        }),

        getUserById: builder.query<User, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        updateUser: builder.mutation<User, { id: string; data: Partial<UserCredentials> }>({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: userSchema.partial().parse(data),
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),

        deleteUser: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
        }),

        bulkUploadUsers: builder.mutation<{ message: string; createdUsers: { count: number } }, FormData>({
            query: (formData) => ({
                url: '/users/bulk',
                method: 'POST',
                body: formData,
                headers: {
                    // Remove Content-Type to let FormData set multipart/form-data with boundary
                    'Content-Type': undefined,
                },
            }),
            invalidatesTags: ['User'],
        }),

        // --- Attendance Endpoints ---
        markAttendance: builder.mutation<Attendance, AttendanceCredentials>({
            query: (credentials) => ({
                url: '/attendance',
                method: 'POST',
                body: attendanceSchema.parse(credentials),
            }),
            invalidatesTags: ['Attendance'],
        }),

        getAttendanceHello: builder.query<{ message: string }, void>({
            query: () => ({
                url: '/attendance/hello',
                method: 'GET',
            }),
        }),

        getAttendanceByPracticeSession: builder.query<
            Attendance[],
            { practiceSessionId: string; userId?: string; startDate?: string; endDate?: string; sort?: string }
        >({
            query: ({ practiceSessionId, ...params }) => ({
                url: `/attendance/${practiceSessionId}`,
                method: 'GET',
                params: attendanceQuerySchema.parse(params),
            }),
            providesTags: (result, error, { practiceSessionId }) => [
                { type: 'Attendance', id: practiceSessionId },
                'Attendance',
            ],
        }),

        getAttendanceCalculations: builder.query<CalculationResponse, { practiceSessionId?: string; userId?: string }>({
            query: (params) => ({
                url: '/attendance/calculations',
                method: 'GET',
                params: calculationsQuerySchema.parse(params),
            }),
            providesTags: ['Attendance'],
        }),

        // --- Practice Sessions Endpoints ---
        createPracticeSession: builder.mutation<PracticeSession, PracticeSessionCredentials>({
            query: (credentials) => ({
                url: '/practice-sessions',
                method: 'POST',
                body: practiceSessionSchema.parse(credentials),
            }),
            invalidatesTags: ['PracticeSession'],
        }),

        getPracticeSessions: builder.query<
            PracticeSession[],
            { type?: 'SINGLE' | 'DOUBLE'; startDate?: string; endDate?: string; sort?: string }
        >({
            query: (params) => ({
                url: '/practice-sessions',
                method: 'GET',
                params: practiceSessionQuerySchema.parse(params),
            }),
            providesTags: ['PracticeSession'],
        }),

        getPracticeSessionById: builder.query<PracticeSession, string>({
            query: (id) => ({
                url: `/practice-sessions/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'PracticeSession', id }],
        }),

        updatePracticeSession: builder.mutation<PracticeSession, { id: string; data: Partial<PracticeSessionCredentials> }>({
            query: ({ id, data }) => ({
                url: `/practice-sessions/${id}`,
                method: 'PATCH',
                body: practiceSessionSchema._def.schema.partial().parse(data),
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'PracticeSession', id }, 'PracticeSession'],
        }),

        deletePracticeSession: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/practice-sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'PracticeSession', id }, 'PracticeSession'],
        }),
    }),
});

// Export hooks with TypeScript types
export const {
    useCreateUserMutation,
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useBulkUploadUsersMutation,
    useMarkAttendanceMutation,
    useGetAttendanceHelloQuery,
    useGetAttendanceByPracticeSessionQuery,
    useGetAttendanceCalculationsQuery,
    useCreatePracticeSessionMutation,
    useGetPracticeSessionsQuery,
    useGetPracticeSessionByIdQuery,
    useUpdatePracticeSessionMutation,
    useDeletePracticeSessionMutation,
} = api;

export type AppApi = typeof api;
