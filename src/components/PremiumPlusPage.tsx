import { Sparkles } from 'lucide-react'
import { AUTH_ENABLED, PREMIUM_PLUS_ENABLED } from '../config/monetization'
import { DiscordLink } from './CommunityLinks'

export default function PremiumPlusPage({ onNavigateAccount }: { onNavigateAccount: () => void }) {
  return (
    <main className="premium-page">
      <header className="premium-page__hero">
        <Sparkles size={28} aria-hidden="true" />
        <h1>Premium+</h1>
        <p>
          An upcoming membership tier with additional benefits beyond character build access.
          Details, pricing, and exact benefits will be configured by the archive owner before launch.
        </p>
      </header>

      <section className="premium-page__products">
        {PREMIUM_PLUS_ENABLED ? (
          <div className="premium-unavailable">
            <p>Premium+ details are loading…</p>
          </div>
        ) : (
          <div className="premium-unavailable">
            <div className="premium-plus-placeholder__header">
              <Sparkles size={16} aria-hidden="true" />
              <span className="premium-plus-badge">Coming Soon</span>
            </div>
            <p>
              Premium+ is not yet launched. Benefits and pricing will appear here once the
              owner configures and opens the tier. Join the Discord for updates.
            </p>
            <DiscordLink />
          </div>
        )}
      </section>

      {AUTH_ENABLED && (
        <section className="premium-page__cta">
          <p>Sign in to be notified when Premium+ becomes available.</p>
          <button className="button button--outline" onClick={onNavigateAccount}>
            Sign in
          </button>
        </section>
      )}
    </main>
  )
}
