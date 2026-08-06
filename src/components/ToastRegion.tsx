export interface ToastMessage {
  id: number
  text: string
}

export function ToastRegion({ message }: { message: ToastMessage | null }) {
  return <div className="toast-region" aria-live="polite" aria-atomic="true">{message && <div key={message.id} className="toast-message">{message.text}</div>}</div>
}
