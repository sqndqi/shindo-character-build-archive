import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode; section?: string }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Recovered ${this.props.section ?? 'application'} error`, error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="recovery-page" role="alert">
        <span>ARCHIVE RECOVERY</span>
        <h1>This section hit a corrupted record.</h1>
        <p>Your personal preferences have not been erased. Reload this section and try again.</p>
        <button className="button button--primary" onClick={() => this.setState({ error: null })}>Try again</button>
      </main>
    )
  }
}
