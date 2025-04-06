import { NextResponse } from 'next/server';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.details
    }, { status: error.status });
  }
  console.error('Unexpected error:', error);
  return NextResponse.json({
    success: false,
    error: 'An unexpected error occurred',
    details: error instanceof Error ? error.message : undefined
  }, { status: 500 });
}

export function successResponse<T>(data: T): NextResponse {
  return NextResponse.json({
    success: true,
    data
  });
}

export function validateParams(data: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    throw new ApiError(
      'Missing required fields',
      400,
      { missingFields }
    );
  }
}

export function validateId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numId)) {
    throw new ApiError('Invalid ID', 400, { providedId: id });
  }
  return numId;
} 