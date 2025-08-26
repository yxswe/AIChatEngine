import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios'

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  code?: number
}

export interface ApiError {
  message: string
  code?: number
  details?: any
}

interface RequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean
  retries?: number
}

class ApiClient {
  private instance: AxiosInstance
  private readonly maxRetries = 3
  private readonly retryDelay = 1000

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & RequestOptions) => {
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        config.headers['X-Timestamp'] = Date.now().toString()

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & RequestOptions

        if (this.shouldRetry(error) && config?.retries !== 0) {
          const retryCount = config.retries ?? this.maxRetries
          config.retries = retryCount - 1
          
          await this.delay(this.retryDelay)
          return this.instance.request(config)
        }

        // Global error handling
        if (!config?.skipErrorHandler) {
          this.handleGlobalError(error)
        }

        return Promise.reject(error)
      }
    )
  }

  // Determine if should retry
  private shouldRetry(error: AxiosError): boolean {
    // Only retry for network errors or 5xx server errors
    return !error.response ||
           error.response.status >= 500 ||
           error.code === 'NETWORK_ERROR'
  }

  // Delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Generate request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Global error handling
  private handleGlobalError(error: AxiosError) {
    console.error('API request error:', error)
    
    // Can integrate toast notifications or other error handling logic here
    if (typeof window !== 'undefined') {
      // Can integrate your notification system, such as sonner
      console.error(`Request failed: ${error.message}`)
    }
  }

  async get<T = any>(
    url: string, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(
    url: string, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async upload<T = any>(
    url: string, 
    file: File, 
    config?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  async download(url: string, filename?: string, config?: RequestOptions): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    })

    if (typeof window !== 'undefined') {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    }
  }

  createAbortController() {
    return new AbortController()
  }

  // Deprecated: Use createAbortController() instead
  createCancelToken() {
    return axios.CancelToken.source()
  }
}

export const apiClient = new ApiClient()

export type { RequestOptions }

