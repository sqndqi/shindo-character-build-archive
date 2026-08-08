import { useEffect, useState } from 'react'
import { Check, Lock, Package, Sparkles, Unlock, X } from 'lucide-react'
import { AUTH_ENABLED, PAYMENTS_ENABLED } from '../config/monetization'
import {
  archiveAccountApiConfigured,
  getProducts,
  getAccessState,
  type Product,
} from '../repositories/ArchiveAccessRepository'
import type { ArchiveBuildRecord } from '../types/archiveAccess'

type AccessInfo = {
  signedIn: boolean
  fullArchive: boolean
  ownedCharacterIds: string[]
}

export default function PremiumPage({
  onNavigateAccount,
  selectedForUnlock,
  onDeselect,
  builds,
}: {
  onNavigateAccount: () => void
  selectedForUnlock: string[]
  onDeselect: (id: string) => void
  builds: ArchiveBuildRecord[]
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(archiveAccountApiConfigured)
  const [access, setAccess] = useState<AccessInfo>({ signedIn: false, fullArchive: false, ownedCharacterIds: [] })

  useEffect(() => {
    if (!archiveAccountApiConfigured) { setLoading(false); return }
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
            ownedCharacterIds: state.characterIds,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const selectedBuilds = selectedForUnlock
    .map((id) => builds.find((b) => b.id === id))
    .filter((b): b is ArchiveBuildRecord => Boolean(b))

  const fullArchiveProduct = products.find((p) => p.product_type === 'full_archive' && p.active)
  const otherProducts = products.filter((p) => p.product_type !== 'full_archive' && p.active)

  if (loading) return <main className="loading-page">Loading…</main>

  return (
    <main className="premium-page">
      <header className="premium-page__hero">
        <Unlock size={28} aria-hidden="true" />
        <h1>Unlock Builds</h1>
        <p>
          Select the characters you want, then sign in and pay with cryptocurrency.
          Entitlements are server-verified — never stored in your browser.
        </p>
      </header>

      {/* Selected characters */}
      <section className="premium-page__selection">
        <h2>Selected characters</h2>
        {selectedBuilds.length === 0 ? (
          <p className="premium-selection-empty">
            No characters selected yet. Open any locked character from the archive and select it.
          </p>
        ) : (
          <>
            <ul className="premium-selection-list">
              {selectedBuilds.map((build) => (
                <li key={build.id} className="premium-selection-item">
                  <span className="premium-selection-item__name">{build.name}</span>
                  <span className="premium-selection-item__series">{build.series}</span>
                  <button
                    className="premium-selection-item__remove"
                    onClick={() => onDeselect(build.id)}
                    aria-label={`Remove ${build.name} from selection`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="premium-selection-count">
              {selectedBuilds.length} character{selectedBuilds.length !== 1 ? 's' : ''} selected
            </p>
          </>
        )}
      </section>

      {/* Access status for signed-in users */}
      {access.signedIn && (
        <section className="premium-page__access">
          <h2>Your access</h2>
          {access.fullArchive ? (
            <p className="premium-access-status premium-access-status--full">
              <Sparkles size={16} aria-hidden="true" /> Full Archive — all characters unlocked.
            </p>
          ) : (
            <p className="premium-access-status">
              <Lock size={16} aria-hidden="true" />{' '}
              {access.ownedCharacterIds.length > 0
                ? `${access.ownedCharacterIds.length} character${access.ownedCharacterIds.length !== 1 ? 's' : ''} unlocked`
                : 'No characters unlocked yet'}
            </p>
          )}
        </section>
      )}

      {/* Purchase options */}
      <section className="premium-page__products">
        <h2>Purchase options</h2>

        {/* Full Archive option — always shown */}
        <div className="premium-tier-card premium-tier-card--highlight">
          <div className="premium-tier-card__icon"><Sparkles size={20} /></div>
          <div className="premium-tier-card__body">
            <h3>Full Archive</h3>
            <p>Instant access to every character — current and future.</p>
            {fullArchiveProduct && (
              <span className="premium-tier-card__price">
                {fullArchiveProduct.price_amount} {fullArchiveProduct.price_currency.toUpperCase()}
              </span>
            )}
          </div>
          {PAYMENTS_ENABLED ? (
            <button className="button button--primary" onClick={onNavigateAccount}>
              Unlock Full Archive
            </button>
          ) : (
            <span className="premium-tier-card__soon">Coming soon</span>
          )}
        </div>

        {/* Selected characters option */}
        {selectedBuilds.length > 0 && (
          <div className="premium-tier-card">
            <div className="premium-tier-card__icon"><Check size={20} /></div>
            <div className="premium-tier-card__body">
              <h3>Selected characters</h3>
              <p>{selectedBuilds.map((b) => b.name).join(', ')}</p>
            </div>
            {PAYMENTS_ENABLED ? (
              <button className="button button--primary" onClick={onNavigateAccount}>
                Continue with selection
              </button>
            ) : (
              <span className="premium-tier-card__soon">Coming soon</span>
            )}
          </div>
        )}

        {/* Other backend-configured products */}
        {otherProducts.length > 0 && (
          <div className="premium-product-grid">
            {otherProducts.map((product) => (
              <div key={product.id} className="premium-product-card">
                <div className="premium-product-card__icon">
                  {product.product_type === 'character_pack' ? <Package size={18} /> : <Unlock size={18} />}
                </div>
                <div>
                  <h3>{product.name}</h3>
                  {product.description && <p>{product.description}</p>}
                  <span className="premium-product-card__price">
                    {product.price_amount} {product.price_currency.toUpperCase()}
                  </span>
                </div>
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

        {!PAYMENTS_ENABLED && (
          <div className="premium-unavailable">
            <p>Purchases are not available yet. When products go live, payment is cryptocurrency only.</p>
          </div>
        )}
      </section>

      {/* Sign in CTA */}
      {!access.signedIn && AUTH_ENABLED && (
        <section className="premium-page__cta">
          <p>Sign in to view your access and complete a purchase.</p>
          <button className="button button--primary" onClick={onNavigateAccount}>
            Sign in
          </button>
        </section>
      )}
    </main>
  )
}
