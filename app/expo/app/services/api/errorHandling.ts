import type { AxiosError } from "axios"

import type { HttpValidationError } from "@/client/types.gen"

/**
 * Extracts error message from API error response
 * Handles 422 validation errors by extracting field-specific messages
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return "An unexpected error occurred"

  // Handle AxiosError with validation errors
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<HttpValidationError>

    if (axiosError.response?.data?.detail) {
      const errorDetail = axiosError.response.data.detail

      if (Array.isArray(errorDetail)) {
        // Return the first validation error message
        const firstError = errorDetail[0]
        if (firstError?.msg) {
          return firstError.msg
        }
      } else {
        return errorDetail
      }
    }

    // Handle other HTTP errors
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return "Bad request"
        case 401:
          return "Invalid credentials"
        case 403:
          return "Access denied"
        case 404:
          return "Resource not found"
        case 409:
          return "Resource already exists"
        case 500:
          return "Server error"
        default:
          return `Error ${axiosError.response.status}`
      }
    }

    // Return the error message if available
    if (axiosError.message) {
      return axiosError.message
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === "string") {
    return error
  }

  return "An unexpected error occurred"
}
