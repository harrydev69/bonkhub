"use client"

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChartErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => void
}

export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Chart Error</h3>
              <p className="text-gray-400 text-sm mb-4">
                There was an error rendering this chart. This might be due to data formatting issues.
              </p>
              {this.state.error && (
                <details className="text-xs text-gray-500 mb-4">
                  <summary className="cursor-pointer hover:text-gray-400">Error Details</summary>
                  <pre className="mt-2 p-2 bg-gray-900 rounded text-left overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="flex items-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
export const ChartErrorWrapper: React.FC<ChartErrorBoundaryProps> = ({ children, ...props }) => {
  return (
    <ChartErrorBoundary {...props}>
      {children}
    </ChartErrorBoundary>
  )
}
