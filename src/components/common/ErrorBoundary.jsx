import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="p-6 bg-red-50/70 border border-red-200 rounded-2xl text-center space-y-3 m-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-red-900">
              {this.props.title || 'Something went wrong displaying this view'}
            </h3>
            <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
              An error occurred while loading this section. Please try again or refresh the page.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-red-600 bg-white/80 p-2 rounded-lg border border-red-200 mt-2 max-w-lg mx-auto truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
