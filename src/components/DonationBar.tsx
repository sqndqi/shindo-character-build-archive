import { Heart } from 'lucide-react'
import { DONATION_CONFIG } from '../config/monetization'
import { DiscordLink, RobloxGroupLink } from './CommunityLinks'

export function DonationBar() {
  return (
    <section className="donation-bar" aria-label="Community support">
      <div className="donation-bar__inner">
        <div className="donation-bar__label">
          <Heart size={15} aria-hidden="true" />
          <span>Support the archive</span>
        </div>
        {DONATION_CONFIG ? (
          <div className="donation-bar__progress">
            <div className="donation-bar__track">
              <div
                className="donation-bar__fill"
                style={{ width: `${Math.min(100, Math.round((DONATION_CONFIG.current / DONATION_CONFIG.target) * 100))}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="donation-bar__numbers">
              {DONATION_CONFIG.currency}{DONATION_CONFIG.current.toLocaleString()} of {DONATION_CONFIG.currency}{DONATION_CONFIG.target.toLocaleString()} {DONATION_CONFIG.label}
            </span>
          </div>
        ) : (
          <p className="donation-bar__neutral">
            Community-maintained archive. Join us to help keep it growing.
          </p>
        )}
        <div className="donation-bar__links">
          <DiscordLink />
          <RobloxGroupLink />
        </div>
      </div>
    </section>
  )
}
