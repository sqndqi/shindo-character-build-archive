import { useEffect, useState } from 'react'
import { Crown, Lock, Package, Sparkles, Star, Unlock } from 'lucide-react'
import { AUTH_ENABLED, PAYMENTS_ENABLED } from '../config/monetization'
import { getProducts, getAccessState, type Product } from '../repositories/ArchiveAccessRepository'

type AccessInfo = {
  signedIn: boolean
  fullArchive: boolean
  characterCount: number
  freeCount: number
}

export default function PremiumPage({ onNavigateAccount }: { onNavigateAccount: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [access, setAccess] = useState<AccessInfo>({ signedIn: false, fullArchive: false, characterCount: 0, freeCount: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [productList, state] = await Promise.all([
          getProducts().catch(() => [] as Product[]),
          getAccessState().catch(() => null),
        ])
        if (cancelled) return
        setProducts(productList)
        if (state && state.status === 'signed-in') {
          setAccess({
            signedIn: true,
            fullArchive: state.fullArchive,
            characterCount: state.characterIds.length,
            freeCount: state.freeCharacterIds.length,
          })
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <main className="loading-page">Loading premium…</main>

  return (
    <main className="premium-page">
      <header className="premium-page__hero">
        <Crown size={28} aria-hidden="true" />
        <h1>Premium</h1>
        <p>
          Unlock researched character builds with full Bloodline loadouts,
          equipment, move ratings, and variant breakdowns.
        </p>
      </header>

      <section className="premium-page__tiers">
        <div className="premium-tier">
          <div className="premium-tier__icon"><Unlock size={20} /></div>
          <h3>Free Builds</h3>
          <p>5 characters with complete builds — no account needed.</p>
          <span className="premium-tier__tag">Included</span>
        </div>
        <div className="premium-tier premium-tier--highlight">
          <div className="premium-tier__icon"><Star size={20} /></div>
          <h3>Individual Characters</h3>
          <p>Purchase access to specific characters you want.</p>
          <span className="premium-tier__tag">Per character</span>
        </div>
        <div className="premium-tier">
          <div className="premium-tier__icon"><Package size={20} /></div>
          <h3>Character Packs</h3>
          <p>Bundles of characters at a reduced per-character price.</p>
          <span className="premium-tier__tag">Bundle</span>
        </div>
        <div className="premium-tier premium-tier--highlight">
          <div className="premium-tier__icon"><Sparkles size={20} /></div>
          <h3>Full Archive</h3>
          <p>Instant access to every character — current and future.</p>
          <span className="premium-tier__tag">All access</span>
        </div>
      </section>

      {access.signedIn && (
        <section className="premium-page__access">
          <h2>Your access</h2>
          {access.fullArchive ? (
            <p className="premium-access-status premium-access-status--full">
              <Sparkles size={16} /> Full Archive — all characters unlocked.
            </p>
          ) : (
            <p className="premium-access-status">
              <Lock size={16} /> {access.freeCount + access.characterCount} characters accessible
              ({access.freeCount} free, {access.characterCount} premium).
            </p>
          )}
        </section>
      )}

      <section className="premium-page__products">
        <h2>Available products</h2>
        {error ? (
          <div className="premium-unavailable">
            <p>Premium products could not be loaded right now. Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="premium-unavailable">
            <p>Purchases are not available yet.</p>
            <p>When products go live, you will be able to pay with cryptocurrency.</p>
          </div>
        ) : (
          <div className="premium-product-grid">
            {products.map((product) => (
              <div key={product.id} className="premium-product-card">
                <h3>{product.name}</h3>
                {product.description && <p>{product.description}</p>}
                <span className="premium-product-card__price">
                  ${product.price_amount} {product.price_currency.toUpperCase()}
                </span>
                {PAYMENTS_ENABLED ? (
                  <button className="button button--primary" onClick={onNavigateAccount}>
                    Crypto checkout
                  </button>
                ) : (
                  <span className="premium-product-card__soon">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {!access.signedIn && AUTH_ENABLED && (
        <section className="premium-page__cta">
          <p>Sign in to view your access and manage purchases.</p>
          <button className="button button--primary" onClick={onNavigateAccount}>
            Sign in
          </button>
        </section>
      )}
    </main>
  )
}
