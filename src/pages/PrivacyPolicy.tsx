import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy — GrounduP' }, [])
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Nav */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => nav('/')}
          className="flex items-center gap-2 text-[#F5C518] font-black text-lg tracking-tight"
        >
          <span className="w-7 h-7 rounded-lg bg-[#F5C518] flex items-center justify-center text-black text-xs font-black">G</span>
          GrounduP
        </button>
        <button
          onClick={() => nav('/')}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: May 25, 2026</p>
        </div>

        <Section title="Overview">
          GrounduP ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we
          collect, use, and safeguard information when you use the GrounduP app and website (groundupapp.com).
        </Section>

        <Section title="Information We Collect">
          <ul className="space-y-2 list-none">
            <Li><strong>Account data:</strong> Your email address, artist name, and password (stored securely via Supabase Auth).</Li>
            <Li><strong>Profile data:</strong> Music genre, career stage, goals, and platform links you provide during onboarding or in-app.</Li>
            <Li><strong>Platform statistics:</strong> Publicly available streaming numbers from Spotify, SoundCloud, and YouTube that you link to your account.</Li>
            <Li><strong>Conversation history:</strong> Messages you send to the uP AI assistant, stored to provide continuity across sessions.</Li>
            <Li><strong>Release & task data:</strong> Release dates, checklists, and tasks you create within the app.</Li>
            <Li><strong>Phone number:</strong> If you use the uP iMessage feature, your phone number is used only to send and receive AI-powered messages via our provider.</Li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="space-y-2 list-none">
            <Li>To operate the GrounduP platform and deliver AI-powered music career guidance.</Li>
            <Li>To personalize the uP AI assistant's responses with your artist context.</Li>
            <Li>To send iMessage-based career check-ins if you opt in to the uP iMessage feature.</Li>
            <Li>To display your streaming stats in the Analytics dashboard.</Li>
            <Li>We do <strong>not</strong> sell your data to third parties.</Li>
            <Li>We do <strong>not</strong> use your data for advertising targeting.</Li>
          </ul>
        </Section>

        <Section title="Third-Party Services">
          GrounduP uses the following third-party services to operate:
          <ul className="space-y-2 list-none mt-3">
            <Li><strong>Supabase</strong> — database and authentication (supabase.com/privacy)</Li>
            <Li><strong>Anthropic Claude</strong> — AI responses for the uP assistant (anthropic.com/privacy)</Li>
            <Li><strong>Blooio</strong> — iMessage delivery for the uP assistant</Li>
            <Li><strong>Stripe</strong> — payment processing for Pro/Growth subscriptions (stripe.com/privacy)</Li>
            <Li><strong>Netlify</strong> — serverless function hosting</Li>
          </ul>
        </Section>

        <Section title="Data Retention">
          Your account data and conversation history are retained for as long as your account is active.
          You may request deletion of your account and associated data at any time by emailing us at{' '}
          <a href="mailto:privacy@groundupapp.com" className="text-[#F5C518] underline">privacy@groundupapp.com</a>.
          We will process deletion requests within 30 days.
        </Section>

        <Section title="Children's Privacy">
          GrounduP is not directed to children under the age of 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with personal information,
          please contact us and we will delete it promptly.
        </Section>

        <Section title="Security">
          We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords,
          and row-level security on our database. No method of transmission over the internet is 100% secure,
          and we cannot guarantee absolute security.
        </Section>

        <Section title="Your Rights">
          You have the right to:
          <ul className="space-y-2 list-none mt-3">
            <Li>Access the personal data we hold about you.</Li>
            <Li>Request correction of inaccurate data.</Li>
            <Li>Request deletion of your account and data.</Li>
            <Li>Opt out of iMessage communications at any time by texting STOP to +1 (310) 919-9037.</Li>
          </ul>
        </Section>

        <Section title="Changes to This Policy">
          We may update this policy from time to time. We will notify you of significant changes by posting
          the new policy on this page with an updated date. Continued use of GrounduP after changes
          constitutes acceptance of the updated policy.
        </Section>

        <Section title="Contact Us">
          For privacy-related questions or requests, contact us at:{' '}
          <a href="mailto:privacy@groundupapp.com" className="text-[#F5C518] underline">privacy@groundupapp.com</a>
          <br />
          <br />
          GrounduP / 1BSTAR Agency
          <br />
          groundupapp.com
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-[#F5C518]">{title}</h2>
      <div className="text-white/60 text-sm leading-7">{children}</div>
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-[#F5C518] mt-1 flex-shrink-0">·</span>
      <span>{children}</span>
    </li>
  )
}
