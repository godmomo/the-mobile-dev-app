interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  delayMs: 1000,
};

/**
 * Retries a function with exponential backoff
 * @param fn The async function to retry
 * @param options Retry configuration options
 * @returns The result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, delayMs, onRetry } = { ...defaultOptions, ...options };
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        // Exponential backoff: delay increases with each retry
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Creates a retryable fetch function
 * @param url The URL to fetch
 * @param options Fetch options and retry options
 * @returns The fetch response
 */
export async function retryableFetch(
  url: string,
  options: Partial<RequestInit & RetryOptions> = {}
): Promise<Response> {
  const { maxRetries, delayMs, onRetry, ...fetchOptions } = options;
  
  return withRetry(
    () => fetch(url, fetchOptions),
    { maxRetries, delayMs, onRetry }
  );
}

