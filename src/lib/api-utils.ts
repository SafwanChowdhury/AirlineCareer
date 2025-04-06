// src/lib/api-utils.ts
import { NextResponse } from 'next/server';

/**
 * Standard API response structure with generic typing
 * All API responses will follow this format for consistency
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  pagination?: PaginationInfo;
};

/**
 * Standard pagination information structure
 * Used in responses that return paginated collections
 */
export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

/**
 * Custom API error with status code and optional details
 * Use this for all API errors to ensure consistent error handling
 */
export class ApiError extends Error {
  constructor(message: string, public status: number = 400, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Standard handler for all API errors
 * This ensures consistent error response format across all endpoints
 * 
 * @param error Error object (ApiError or any other error)
 * @returns NextResponse with standardized error format
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.details
    }, { status: error.status });
  }
  
  // For unexpected errors
  return NextResponse.json({
    success: false,
    error: 'An unexpected error occurred',
    details: error instanceof Error ? error.message : undefined
  }, { status: 500 });
}

/**
 * Creates a standardized success response
 * Use this for all successful API responses to ensure consistency
 * 
 * @param data Data to include in the response
 * @param options Optional additional response options
 * @returns NextResponse with standardized success format
 */
export function successResponse<T>(
  data: T, 
  options?: {
    message?: string,
    pagination?: PaginationInfo,
    status?: number
  }
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  
  if (options?.message) {
    response.message = options.message;
  }
  
  if (options?.pagination) {
    response.pagination = options.pagination;
  }
  
  return NextResponse.json(response, { 
    status: options?.status || 200 
  });
}

/**
 * Creates a standardized no content success response (HTTP 204)
 * Use this for successful operations that don't return data
 * 
 * @returns NextResponse with 204 status and no content
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Creates a standardized created response (HTTP 201)
 * Use this when a new resource has been created
 * 
 * @param data The created resource data
 * @param options Optional additional response options
 * @returns NextResponse with 201 status and the created resource
 */
export function createdResponse<T>(
  data: T,
  options?: {
    message?: string
  }
): NextResponse {
  return successResponse(data, {
    message: options?.message || 'Resource created successfully',
    status: 201
  });
}

/**
 * Validates that required fields are present in the input data
 * Throws an ApiError if any required fields are missing
 * 
 * @param data Input data to validate
 * @param requiredFields Array of field names that must be present
 * @throws ApiError if any required fields are missing
 */
export function validateRequiredFields(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => 
    !(field in data) || data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missingFields.length > 0) {
    throw new ApiError(
      'Missing required fields',
      400,
      { missingFields }
    );
  }
}

/**
 * Validates and converts an ID (string or number) to a number
 * Throws an ApiError if the ID is invalid
 * 
 * @param id ID to validate (string or number)
 * @returns Validated numeric ID
 * @throws ApiError if ID is invalid
 */
export function validateId(id: string | number): number {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numId) || numId <= 0) {
    throw new ApiError('Invalid ID', 400, { providedId: id });
  }
  
  return numId;
}

/**
 * Helper method for logging standardized errors from API routes
 * 
 * @param context Context identifier for the error
 * @param error The error object
 * @param additionalInfo Optional additional information to log
 */
export function logApiError(context: string, error: unknown, additionalInfo?: any): void {
  const errorInfo = {
    context,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    details: error instanceof ApiError ? error.details : undefined,
    status: error instanceof ApiError ? error.status : undefined,
    ...additionalInfo
  };
  
  console.error(`[API Error] [${context}]`, errorInfo);
}