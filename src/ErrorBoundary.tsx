import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Wraps the app so that if any component throws during render, we show a
// visible, readable error screen instead of React silently unmounting
// everything (which is what causes a totally blank white page).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface it in the console with full details for debugging.
    console.error('Chargeback Shield crashed:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          backgroundColor: '#0D0D0D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ maxWidth: 560, width: '100%' }}>
          <div style={{ color: '#EF4444', fontWeight: 900, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Something broke
          </div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
            The app hit an unexpected error and had to stop rendering.
          </h1>
          <pre
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f3f4f6',
              padding: 16,
              fontSize: 12,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: 20,
            }}
          >
            {error.message}
          </pre>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Open your browser's DevTools (F12) → Console tab for the full stack trace.
            If you're reporting this, copy the message above.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
