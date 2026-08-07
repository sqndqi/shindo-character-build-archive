import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Clock, Loader, XCircle } from 'lucide-react'
import { getOrder, getAccessState, ApiError, type ArchiveAccessState } from '../repositories/ArchiveAccessRepository'
import { clearStoredOrderId } from '../lib/checkoutSession'

// ------------------------------------------------------------------ polling constants

const POLL_INTERVAL_MS = 5_000
const POLL_MAX = 36 // 3 minutes at 5s intervals
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'expired', 'refunded'])

type PollPhase = 'polling' | 'completed' | 'failed' | 'expired' | 'refunded' | 'timeout' | 'session_expired'

// ------------------------------------------------------------------ CheckoutFlow component

export default function CheckoutFlow({
  orderId,
  onComplete,
  onDismiss,
}: {
  orderId: string
  onComplete: (freshState: ArchiveAccessState) => void
  onDismiss: () => void
}) {
  const [phase, setPhase] = useState<PollPhase>('polling')
  const [orderStatus, setOrderStatus] = useState<string>('pending')
  const stoppedRef = useRef(false)
  const attemptsRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    stoppedRef.current = false
    attemptsRef.current = 0
    let handle: ReturnType<typeof setTimeout>

    const poll = async () => {
      if (stoppedRef.current) return
      if (attemptsRef.current >= POLL_MAX) {
        setPhase('timeout')
        clearStoredOrderId()
        return
      }

      attemptsRef.current++
      try {
        const order = await getOrder(orderId)
        if (stoppedRef.current) return
        setOrderStatus(order.orderStatus)

        if (TERMINAL_STATUSES.has(order.orderStatus)) {
          stoppedRef.current = true
          clearStoredOrderId()
          setPhase(order.orderStatus as PollPhase)

          if (order.orderStatus === 'completed') {
            try {
              const freshState = await getAccessState()
              onCompleteRef.current(freshState)
            } catch {
              onCompleteRef.current({
                status: 'signed-out', freeCharacterIds: [], characterIds: [],
                fullArchive: false, highestPackage: null,
              })
            }
          }
        } else {
          handle = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (e) {
        if (stoppedRef.current) return
        if (e instanceof ApiError && (e.status === 401 || e.code === 'invalid_credentials')) {
          stoppedRef.current = true
          clearStoredOrderId()
          setPhase('session_expired')
        } else {
          // Network / server error — retry after interval
          handle = setTimeout(poll, POLL_INTERVAL_MS)
        }
      }
    }

    void poll()
    return () => {
      stoppedRef.current = true
      clearTimeout(handle)
    }
  // orderId is stable for one checkout session; eslint-disable suppresses spurious fnRef-style warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handleDismiss = () => {
    stoppedRef.current = true
    clearStoredOrderId()
    onDismiss()
  }

  const PHASE_CONTENT: Record<PollPhase, { icon: React.ReactNode; title: string; message: string }> = {
    polling: {
      icon: <Loader size={28} className="spin" aria-hidden="true" />,
      title: orderStatus === 'pending' ? 'Awaiting payment' : 'Processing payment',
      message: orderStatus === 'pending'
        ? 'Complete your payment in the NOWPayments window. This page checks every 5 seconds.'
        : 'Your payment is being confirmed. Blockchain confirmations can take a few minutes.',
    },
    completed: {
      icon: <CheckCircle size={28} className="checkout-flow__icon--success" aria-hidden="true" />,
      title: 'Payment confirmed',
      message: 'Your archive access has been updated. You can dismiss this and view your account.',
    },
    failed: {
      icon: <XCircle size={28} className="checkout-flow__icon--error" aria-hidden="true" />,
      title: 'Payment failed',
      message: 'The payment was not completed. No charge was made.',
    },
    expired: {
      icon: <Clock size={28} className="checkout-flow__icon--warn" aria-hidden="true" />,
      title: 'Payment expired',
      message: 'The payment window closed without a completed payment. No charge was made.',
    },
    refunded: {
      icon: <XCircle size={28} className="checkout-flow__icon--warn" aria-hidden="true" />,
      title: 'Payment reversed',
      message: 'This payment has been refunded or reversed. Your access has been updated accordingly.',
    },
    timeout: {
      icon: <Clock size={28} className="checkout-flow__icon--warn" aria-hidden="true" />,
      title: 'Check timed out',
      message: 'Stopped checking after 3 minutes. If your payment completed, visit your account again to refresh access.',
    },
    session_expired: {
      icon: <XCircle size={28} className="checkout-flow__icon--error" aria-hidden="true" />,
      title: 'Session expired',
      message: 'Your session ended. Sign in again to check your payment status.',
    },
  }

  const { icon, title, message } = PHASE_CONTENT[phase]

  return (
    <div className="checkout-flow" role="region" aria-label="Payment status">
      <div className="checkout-flow__icon">{icon}</div>
      <div className="checkout-flow__body">
        <strong className="checkout-flow__title">{title}</strong>
        <p className="checkout-flow__message">{message}</p>
      </div>
      <div className="checkout-flow__actions">
        {phase === 'polling' ? (
          <button className="button button--text" onClick={handleDismiss}>Cancel</button>
        ) : (
          <button className="button button--outline" onClick={handleDismiss}>
            {phase === 'completed' ? 'View account' : 'Dismiss'}
          </button>
        )}
      </div>
    </div>
  )
}
