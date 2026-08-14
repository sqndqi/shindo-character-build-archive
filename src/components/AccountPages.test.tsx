// @vitest-environment happy-dom

/**
 * Component tests for AccountPages — Clerk sign-in integration.
 *
 * StrictMode deduplication: The handshake effect stores the in-flight Promise in a
 * ref (handshakePromiseRef).  StrictMode's second mount finds the ref non-null and
 * attaches its own handlers to the SAME Promise rather than starting a second
 * network request.  The `cancelled` flag per invocation ensures only the second
 * (live) invocation applies the result.  See the StrictMode test at the bottom.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'

// ------------------------------------------------------------------ hoisted class stubs
// vi.hoisted runs before vi.mock() factory closures, making these classes available
// inside the factory AND in test bodies — necessary for `instanceof` checks to work.

const { MockApiError, MockClerkSessionError } = vi.hoisted(() => {
  class ApiError extends Error {
    code: string
    status?: number
    constructor(code: string, message: string, status?: number) {
      super(message)
      this.name = 'ApiError'
      this.code = code
      this.status = status
    }
  }
  class ClerkSessionError extends Error {
    code: string
    constructor(code: string, message: string) {
      super(message)
      this.name = 'ClerkSessionError'
      this.code = code
    }
  }
  return { MockApiError: ApiError, MockClerkSessionError: ClerkSessionError }
})

// ------------------------------------------------------------------ mocks

vi.mock('@clerk/react', () => ({
  useAuth: vi.fn(),
  // Render children directly so the "Sign in with Clerk" button is visible in tests
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('../repositories/ArchiveAccessRepository', () => ({
  archiveAccountApiConfigured: true,
  getAccessState: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getEntitlements: vi.fn().mockResolvedValue([]),
  getOrders: vi.fn().mockResolvedValue([]),
  getProducts: vi.fn().mockResolvedValue([]),
  createCheckout: vi.fn(),
  redeemCode: vi.fn(),
  establishClerkSession: vi.fn(),
  ApiError: MockApiError,
  ClerkSessionError: MockClerkSessionError,
}))

vi.mock('./CheckoutFlow', () => ({
  default: () => null,
}))

// ------------------------------------------------------------------ imports (after mocks)

import { useAuth } from '@clerk/react'
import {
  getAccessState,
  establishClerkSession,
  getEntitlements,
  getOrders,
  getProducts,
} from '../repositories/ArchiveAccessRepository'
import AccountPages from './AccountPages'

const mockUseAuth = vi.mocked(useAuth)
const mockGetAccessState = vi.mocked(getAccessState)
const mockEstablishClerkSession = vi.mocked(establishClerkSession)

// ------------------------------------------------------------------ fixtures

const LOCAL_USER_ID = 'postgres-uuid-0001-local'
const CLERK_USER_ID = 'user_clerk_should_never_appear_in_state'

const signedOutArchive = {
  status: 'signed-out' as const,
  freeCharacterIds: [],
  characterIds: [],
  fullArchive: false as const,
  highestPackage: null,
}

const signedInArchive = {
  status: 'signed-in' as const,
  userId: LOCAL_USER_ID,          // local PostgreSQL UUID — never a Clerk ID
  username: 'ck_testuser',
  email: 'test@clerk.test',
  role: 'user' as const,
  entitlement: 'missing' as const,
  freeCharacterIds: [],
  characterIds: [],
  fullArchive: false,
  highestPackage: null,
}

// ---- Clerk state helpers

function clerkSignedOut() {
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    getToken: vi.fn().mockResolvedValue(null),
  } as never)
}

function clerkSignedIn() {
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: CLERK_USER_ID,
    getToken: vi.fn().mockResolvedValue('clerk.jwt.token'),
  } as never)
}

function clerkLoading() {
  mockUseAuth.mockReturnValue({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    getToken: vi.fn().mockResolvedValue(null),
  } as never)
}

// ------------------------------------------------------------------ setup

beforeEach(() => {
  vi.resetAllMocks()
  // Re-apply defaults after reset (resetAllMocks clears all implementations)
  mockGetAccessState.mockResolvedValue(signedOutArchive)
  mockEstablishClerkSession.mockResolvedValue(signedInArchive)
  vi.mocked(getEntitlements).mockResolvedValue([])
  vi.mocked(getOrders).mockResolvedValue([])
  vi.mocked(getProducts).mockResolvedValue([])
  clerkSignedOut()
})

afterEach(() => {
  // Unmount all renders so DOM does not accumulate across tests.
  // Do NOT call vi.restoreAllMocks() here — it would undo vi.mock() module stubs.
  cleanup()
})

// ------------------------------------------------------------------ render helper

/** Render AccountPages and wait for the initial getAccessState() to settle. */
async function renderAndSettle(props: Parameters<typeof AccountPages>[0] = {}) {
  let result!: ReturnType<typeof render>
  await act(async () => {
    result = render(<AccountPages {...props} />)
  })
  return result
}

// ================================================================== tests

// ---- 1. Clerk signed out shows the sign-in trigger

describe('Clerk signed out', () => {
  it('shows "Sign in with Clerk" button', async () => {
    clerkSignedOut()
    await renderAndSettle()
    expect(screen.getByRole('button', { name: /sign in with clerk/i })).toBeTruthy()
  })
})

// ---- 2. Legacy form always present

describe('legacy form', () => {
  it('renders username input', async () => {
    clerkSignedOut()
    await renderAndSettle()
    expect(screen.getByRole('textbox', { name: /username/i })).toBeTruthy()
  })

  it('renders password input', async () => {
    clerkSignedOut()
    await renderAndSettle()
    expect(document.querySelector('input[name="password"]')).toBeTruthy()
  })

  it('renders a legacy sign-in submit button', async () => {
    clerkSignedOut()
    await renderAndSettle()
    const form = document.querySelector('form')!
    // The primary sign-in submit is the non-type="button" button inside the form
    const submit = form.querySelector('button:not([type="button"])')
    expect(submit).toBeTruthy()
  })
})

// ---- 3. Clerk signed in triggers establishClerkSession

describe('Clerk signed in — handshake trigger', () => {
  it('calls establishClerkSession once when Clerk is signed in and archive is not', async () => {
    clerkSignedIn()
    await renderAndSettle()
    await waitFor(() => {
      expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1)
    })
  })

  it('passes a function (getToken) to establishClerkSession', async () => {
    clerkSignedIn()
    await renderAndSettle()
    await waitFor(() => expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1))
    expect(typeof mockEstablishClerkSession.mock.calls[0][0]).toBe('function')
  })

  it('does NOT call establishClerkSession when Clerk is signed out', async () => {
    clerkSignedOut()
    await renderAndSettle()
    await new Promise((r) => setTimeout(r, 10))
    expect(mockEstablishClerkSession).not.toHaveBeenCalled()
  })
})

// ---- 4. Successful handshake updates UI

describe('successful handshake — UI', () => {
  it('shows AccountView after success', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle()
    await waitFor(() => {
      expect(screen.getByText('Your character access')).toBeTruthy()
    })
  })

  it('hides the sign-in form after success', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle()
    await waitFor(() => screen.getByText('Your character access'))
    expect(screen.queryByRole('button', { name: /sign in with clerk/i })).toBeNull()
    expect(document.querySelector('input[name="username"]')).toBeNull()
  })
})

// ---- 5. onSignedIn called with LOCAL backend role

describe('successful handshake — onSignedIn callback', () => {
  it('calls onSignedIn with the backend-returned role, not a Clerk role', async () => {
    clerkSignedIn()
    const onSignedIn = vi.fn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle({ onSignedIn })
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
    expect(onSignedIn.mock.calls[0][0].role).toBe('user')
  })

  it('calls onSignedIn exactly once per successful handshake', async () => {
    clerkSignedIn()
    const onSignedIn = vi.fn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle({ onSignedIn })
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
    // Allow microtasks to drain — should still be 1
    await new Promise((r) => setTimeout(r, 20))
    expect(onSignedIn).toHaveBeenCalledTimes(1)
  })
})

// ---- 6. LOCAL userId preserved; Clerk userId never substituted

describe('userId integrity', () => {
  it('userId in onSignedIn state is the local PostgreSQL UUID, not a Clerk ID', async () => {
    clerkSignedIn()
    const onSignedIn = vi.fn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle({ onSignedIn })
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1))
    const state = onSignedIn.mock.calls[0][0]
    expect(state.userId).toBe(LOCAL_USER_ID)
    expect(state.userId).not.toBe(CLERK_USER_ID)
    // Clerk IDs always start with "user_"
    expect(state.userId).not.toMatch(/^user_/)
  })
})

// ---- 7. ACCOUNT_LINK_REQUIRED message

describe('ACCOUNT_LINK_REQUIRED', () => {
  it('shows the account-link message', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('account_link_required', 'Email already exists.'),
    )
    await renderAndSettle()
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain(
        'An account with this email or username already exists',
      )
      expect(alert.textContent).toContain('Sign in with your existing password to link it later')
    })
  })

  it('does NOT transition to AccountView', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('account_link_required', 'Email already exists.'),
    )
    await renderAndSettle()
    await waitFor(() => screen.getByRole('alert'))
    expect(screen.queryByText('Your character access')).toBeNull()
  })
})

// ---- 8. ACCOUNT_SUSPENDED message

describe('ACCOUNT_SUSPENDED', () => {
  it('shows a suspended-account message', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('account_suspended', 'Suspended.'),
    )
    await renderAndSettle()
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('suspended')
    })
  })
})

// ---- 9. PROVISIONING_FAILED message

describe('PROVISIONING_FAILED', () => {
  it('shows a temporary setup error', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('provisioning_failed', 'Retry.'),
    )
    await renderAndSettle()
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('temporarily unavailable')
    })
  })
})

// ---- 10. Failed handshake leaves legacy login usable

describe('failed handshake — legacy form stays', () => {
  it('keeps username/password inputs after Clerk error', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('provisioning_failed', 'Retry.'),
    )
    await renderAndSettle()
    await waitFor(() => screen.getByRole('alert'))
    expect(document.querySelector('input[name="username"]')).toBeTruthy()
    expect(document.querySelector('input[name="password"]')).toBeTruthy()
  })

  it('does not show AccountView after a failed handshake', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockRejectedValue(
      new MockClerkSessionError('account_suspended', 'Suspended.'),
    )
    await renderAndSettle()
    await waitFor(() => screen.getByRole('alert'))
    expect(screen.queryByText('Your character access')).toBeNull()
  })
})

// ---- 11. Concurrent handshake guard (re-render, not StrictMode)

describe('concurrent handshake guard', () => {
  it('does not start a second handshake when one is already pending', async () => {
    clerkSignedIn()

    // Never resolves — keeps the handshake permanently pending
    let settle!: (v: typeof signedInArchive) => void
    mockEstablishClerkSession.mockReturnValue(
      new Promise<typeof signedInArchive>((res) => { settle = res }),
    )

    const { rerender } = await renderAndSettle()

    // First call must have started
    await waitFor(() => expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1))

    // Simulate a parent re-render (e.g. authRole prop change) while handshake is in-flight
    await act(async () => {
      rerender(<AccountPages initialPage="signin" />)
    })

    // Guard must have blocked a second call
    expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1)

    // Cleanup — settle so the component can unmount cleanly
    settle(signedInArchive)
  })
})

// ---- 12. Completed handshake not immediately repeated

describe('no repeated handshake after success', () => {
  it('does not call establishClerkSession again after a successful handshake', async () => {
    clerkSignedIn()
    mockEstablishClerkSession.mockResolvedValue(signedInArchive)
    await renderAndSettle()

    await waitFor(() => screen.getByText('Your character access'))

    // Let timers drain — no second call should have fired
    await new Promise((r) => setTimeout(r, 20))
    expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1)
  })
})

// ---- Clerk still loading — no trigger, no flicker

describe('Clerk loading state', () => {
  it('does not call establishClerkSession while Clerk is loading', async () => {
    clerkLoading()
    await renderAndSettle()
    await new Promise((r) => setTimeout(r, 10))
    expect(mockEstablishClerkSession).not.toHaveBeenCalled()
  })

  it('hides the Clerk button while loading to prevent flicker', async () => {
    clerkLoading()
    await renderAndSettle()
    expect(screen.queryByRole('button', { name: /sign in with clerk/i })).toBeNull()
  })
})

// ---- 13. StrictMode: exactly ONE network request, result applied by second mount

describe('StrictMode deduplication', () => {
  it('produces exactly one establishClerkSession call; resolving it updates UI and calls onSignedIn once with local userId', async () => {
    clerkSignedIn()

    let resolveHandshake!: (v: typeof signedInArchive) => void
    const deferred = new Promise<typeof signedInArchive>((res) => { resolveHandshake = res })
    mockEstablishClerkSession.mockReturnValue(deferred)

    const onSignedIn = vi.fn()

    // Render inside StrictMode — effect will be invoked twice
    await act(async () => {
      render(
        <StrictMode>
          <AccountPages onSignedIn={onSignedIn} />
        </StrictMode>,
      )
    })

    // Both StrictMode mounts have fired; promise still pending
    expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1)
    expect(onSignedIn).not.toHaveBeenCalled()

    // Settle the single promise
    await act(async () => {
      resolveHandshake(signedInArchive)
    })

    // Second mount's handler applied the result
    expect(screen.getByText('Your character access')).toBeTruthy()
    expect(onSignedIn).toHaveBeenCalledTimes(1)
    // userId is local PostgreSQL UUID — not a Clerk "user_*" id
    expect(onSignedIn.mock.calls[0][0].userId).toBe(LOCAL_USER_ID)
    expect(onSignedIn.mock.calls[0][0].userId).not.toMatch(/^user_/)
    // Still exactly one request after success
    expect(mockEstablishClerkSession).toHaveBeenCalledTimes(1)
  })
})
