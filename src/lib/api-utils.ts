import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}

export function successResponse<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

export function validateParams(params: unknown, requiredFields: string[]) {
  if (!params || typeof params !== 'object') {
    throw new ApiError('Invalid parameters');
  }

  for (const field of requiredFields) {
    if (!(field in params)) {
      throw new ApiError(`Missing required field: ${field}`);
    }
  }
}

export function validateId(id: string | undefined): number {
  if (!id) {
    throw new ApiError('ID is required');
  }
  
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    throw new ApiError('Invalid ID format');
  }
  
  return numId;
} 