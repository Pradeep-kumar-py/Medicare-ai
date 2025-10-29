// API Configuration for Medicare AI
// Centralized API endpoints configuration

export const API_CONFIG = {
  // Base URLs for different services - check environment variables first
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://mental-health-ai-backend-suggestion.onrender.com',
  PDF_RAG_URL: import.meta.env.VITE_PDF_RAG_URL || 'https://mental-health-ai-backend-suggestion.onrender.com',
  FALLBACK_URL: 'http://localhost:8000', // Fallback for development
  
  // Specific endpoints
  ENDPOINTS: {
    SYMPTOM_ANALYSIS: '/symptom-analysis',
    MEDICAL_QUERY: '/medical-query',
    UPLOAD_PDF: '/upload-pdf',
    HEALTH_CHECK: '/health',
    SYSTEM_INFO: '/system/info'
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout settings
  TIMEOUT: 15000, // 15 seconds (reduced for faster fallback)
  RETRY_ATTEMPTS: 2,
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, useFallback: boolean = false): string => {
  const baseUrl = useFallback ? API_CONFIG.FALLBACK_URL : API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint}`;
};

// Common API request configuration with timeout
export const getApiConfig = () => ({
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Helper function for API requests with timeout and retry
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
