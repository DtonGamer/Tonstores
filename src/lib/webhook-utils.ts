/**
 * Returns a standardized JSON response for webhook handlers
 * 
 * @param statusCode HTTP status code
 * @param body Response body
 * @returns Formatted response object
 */
export const jsonResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
};

/**
 * Standardized error response helper
 * 
 * @param statusCode HTTP status code
 * @param message Error message
 * @returns Formatted error response
 */
export const errorResponse = (statusCode: number, message: string) => {
  return jsonResponse(statusCode, { error: message });
};

/**
 * Standardized success response helper
 * 
 * @param data Optional data to include in response
 * @returns Formatted success response
 */
export const successResponse = (data: any = {}) => {
  return jsonResponse(200, { 
    success: true,
    ...data
  });
}; 