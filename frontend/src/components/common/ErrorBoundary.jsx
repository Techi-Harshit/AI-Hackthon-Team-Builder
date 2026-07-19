import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center p-8 text-white">
          <div className="max-w-2xl rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Something went wrong</h1>
            <p className="text-gray-300 mb-4">
              We encountered an error loading this page. Please try refreshing or contact support.
            </p>
            <details className="text-left bg-red-500/5 rounded p-4 border border-red-500/10 mb-4 text-xs text-gray-400">
              <summary className="cursor-pointer font-semibold text-red-300 mb-2">Error Details</summary>
              <pre className="whitespace-pre-wrap break-all">
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
