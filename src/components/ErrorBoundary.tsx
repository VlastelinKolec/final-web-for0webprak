import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

type State = { hasError: boolean; error?: Error };

class ErrorBoundaryInner extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crash caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-card border border-border rounded-xl p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Что-то пошло не так</h1>
            <p className="text-muted-foreground mb-4">Попробуйте вернуться на дашборд или перезагрузить страницу.</p>
            <a href="/dashboard">
              <Button>На дашборд</Button>
            </a>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Wrapper to use hooks if needed later (navigate etc.)
  useNavigate();
  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
};
