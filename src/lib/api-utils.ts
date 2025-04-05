import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export function successResponse(data: any) {
  return NextResponse.json(data);
}

export function validateParams(data: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ApiError(`Missing required field: ${field}`, 400);
    }
  }
}

export function validateId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numId)) {
    throw new ApiError('Invalid ID', 400);
  }
  return numId;
} 