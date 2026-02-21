import type { ApiError } from '@/types'

export class ApiClientError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiClientError) {
    return { error: error.message, statusCode: error.statusCode }
  }
  if (error instanceof Error) {
    return { error: error.message }
  }
  return { error: 'Si è verificato un errore sconosciuto' }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Si è verificato un errore'
}
