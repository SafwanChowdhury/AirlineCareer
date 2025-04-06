# API Response Standardization

This document outlines the standardized API response patterns implemented throughout the application.

## Response Format

All API responses follow a consistent structure:

```typescript
{
  success: boolean;       // Indicates if the request was successful
  data?: any;             // The response data (when success is true)
  error?: string;         // Error message (when success is false)
  details?: any;          // Additional error details (when success is false)
  message?: string;       // Optional informational message
  pagination?: {          // Optional pagination information
    totalCount: number;   // Total number of items
    currentPage: number;  // Current page number
    totalPages: number;   // Total number of pages
    limit: number;        // Number of items per page
  }
}
```

## Success Responses

Success responses should use the `successResponse()` utility function:

```typescript
return successResponse(data, {
  message: 'Optional message',
  pagination: paginationInfo,  // Optional
  status: 200                  // Optional, defaults to 200
});
```

### Special Success Response Types

For resource creation, use `createdResponse()`:

```typescript
return createdResponse(newResource, {
  message: 'Optional creation message'
});
```

For successful operations with no returned data, use `noContentResponse()`:

```typescript
return noContentResponse();
```

## Error Responses

Error responses should use the `ApiError` class and the `handleApiError()` utility:

```typescript
try {
  // API logic here
} catch (error) {
  logApiError('context-name', error);
  return handleApiError(error);
}
```

Define specific errors with the `ApiError` class:

```typescript
throw new ApiError(
  'Error message',     // Human-readable error message
  400,                 // HTTP status code
  { additionalInfo }   // Optional additional details
);
```

## Error Status Codes

Use appropriate HTTP status codes:

| Code | Description                                                                         |
|------|-------------------------------------------------------------------------------------|
| 200  | Success - Standard success response                                                 |
| 201  | Created - Resource created successfully                                             |
| 204  | No Content - Success with no response body                                          |
| 400  | Bad Request - Invalid input data, missing required fields                           |
| 404  | Not Found - Requested resource not found                                            |
| 500  | Internal Server Error - Unexpected errors                                           |

## Validation

Use these validation utilities:

```typescript
// Validate IDs
const id = validateId(params.id);

// Validate required fields
validateRequiredFields(data, ['name', 'email']);

// Use Zod for complex validation
const validationResult = mySchema.safeParse(data);
if (!validationResult.success) {
  throw new ApiError(
    'Invalid input data', 
    400, 
    validationResult.error.errors
  );
}
```

## Error Logging

Use the `logApiError` utility to consistently log errors:

```typescript
logApiError('context-name', error, { 
  operation: "GET", 
  id: params.id,
  // Additional context information
});
```

This provides consistent error logging with context information.

## API Route Patterns

API routes follow these standard patterns:

1. **Collection Routes**: `/api/[resource]`
   - `GET` - List resources with optional filtering
   - `POST` - Create a new resource

2. **Resource Routes**: `/api/[resource]/[id]`
   - `GET` - Retrieve a specific resource
   - `PUT` - Replace a resource
   - `PATCH` - Partially update a resource
   - `DELETE` - Remove a resource

3. **Sub-resource Routes**: `/api/[resource]/[id]/[subresource]`
   - Used for resources that belong to another resource

4. **Action Routes**: `/api/[resource]/[action]`
   - Used for actions that don't fit the CRUD model

## Example Implementation

```typescript
export async function GET(request: Request) {
  try {
    // Retrieve resource(s)
    const resource = await getResource();
    
    // Return success response
    return successResponse(resource, {
      message: 'Resource retrieved successfully'
    });
  } catch (error) {
    // Log error with context
    logApiError('resource-api', error, { operation: "GET" });
    
    // Return standardized error response
    return handleApiError(error);
  }
}
```

## Benefits of Standardized API Responses

1. **Consistency**: All API endpoints follow the same response format, making integration easier.
2. **Better Error Handling**: Detailed error responses help debug issues faster.
3. **Simpler Client Integration**: Frontend code can rely on consistent response structures.
4. **Documentation**: Self-documenting API responses make understanding the API easier.
5. **Maintainability**: Standardized patterns are easier to maintain and extend.

## Implementing New API Routes

When creating new API routes, follow these steps:

1. Import the standard utility functions:
   ```typescript
   import { 
     handleApiError, 
     successResponse,
     ApiError, 
     validateId,
     logApiError 
   } from '@/lib/api-utils';
   ```

2. Use try/catch blocks for all handlers:
   ```typescript
   try {
     // API logic here
   } catch (error) {
     logApiError('context-name', error, { operation: "METHOD" });
     return handleApiError(error);
   }
   ```

3. Return standardized responses:
   ```typescript
   return successResponse(data, { message: 'Success message' });
   ```

4. Validate inputs and throw appropriate errors:
   ```typescript
   if (!isValid) {
     throw new ApiError('Validation error message', 400);
   }
   ```