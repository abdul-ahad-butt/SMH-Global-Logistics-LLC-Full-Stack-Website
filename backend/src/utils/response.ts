import type { ApiResponse, PaginatedResponse } from '../types/index.js';

export function ok<T>(data: T, message?: string): Response {
  const body: ApiResponse<T> = { success: true, data, message };
  return Response.json(body, { status: 200 });
}

export function created<T>(data: T, message?: string): Response {
  const body: ApiResponse<T> = { success: true, data, message };
  return Response.json(body, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function badRequest(error: string): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 400 });
}

export function unauthorized(error = 'Unauthorized'): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 401 });
}

export function forbidden(error = 'Forbidden'): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 403 });
}

export function notFound(error = 'Not found'): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 404 });
}

export function tooManyRequests(error = 'Too many requests. Please try again later.'): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 429 });
}

export function serverError(error = 'Internal server error'): Response {
  const body: ApiResponse = { success: false, error };
  return Response.json(body, { status: 500 });
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): Response {
  const body: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  return Response.json(body, { status: 200 });
}
