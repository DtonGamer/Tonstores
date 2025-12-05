 /**
 * Shared utilities for API responses
 * This provides consistent response formatting across both API routes and Netlify functions
 */

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
    status: number;
  }
  
  /**
   * Format a successful API response
   */
  export function formatSuccessResponse<T>(data: T, status = 200): ApiResponse<T> {
    return {
      success: true,
      data,
      status
    };
  }
  
  /**
   * Format an error API response
   */
  export function formatErrorResponse(message: string, details?: any, status = 500): ApiResponse {
    return {
      success: false,
      error: message,
      details,
      status
    };
  }
  
  /**
   * Create a standardized JSON response for Netlify functions
   */
  export function createNetlifyResponse(response: ApiResponse): {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  } {
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
      },
      body: JSON.stringify(response)
    };
  }
  
  /**
   * Create a standardized response for Next.js API routes
   */
  export function sendApiResponse(res: any, response: ApiResponse): void {
    res.status(response.status).json(response);
  }
  
  /**
   * Handle CORS preflight requests for Netlify functions
   */
  export function handleCorsForNetlify(event: any): { statusCode: number; headers: Record<string, string>; body: string } | null {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
      };
    }
    return null;
  }