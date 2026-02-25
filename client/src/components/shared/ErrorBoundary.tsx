import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px', color: '#f97316', background: 'rgba(15,23,42,0.9)',
          borderRadius: '10px', border: '1px solid rgba(249,115,22,0.3)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Something went wrong</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
