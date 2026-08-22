import type { Metadata } from "next"
import Link from "next/link"
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RememberQuran collects, uses, and protects your information.",
}

const SITE = "https://rememberquran.com"
const CONTACT = "privacy@rememberquran.com"

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="23 July 2026">
      <LegalSection title="1. Who we are">
        <p>
          <strong>RememberQuran</strong> (“we”, “us”, or “our”) is a free,
          public-benefit web application that helps people read, listen to, and
          study the Quran. This Privacy Policy explains what information we
          collect, how we use it, and the choices you have.
        </p>
        <p>
          Website:{" "}
          <a href={SITE} rel="noopener noreferrer">
            {SITE}
          </a>
        </p>
        <p>
          Contact for privacy questions:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong>Account information.</strong> If you create an account or sign
          in (including with Google), we may store your name, email address, and
          a unique account identifier provided by the sign-in provider.
        </p>
        <p>
          <strong>Content you save.</strong> When signed in, we store data you
          choose to save on our service, such as bookmarks, private notes,
          reading progress, goals, and memorisation (hifz) marks. We store ayah
          references (for example <code>2:255</code>), not copies of the Quran
          text itself in those records.
        </p>
        <p>
          <strong>Usage and technical data.</strong> Like most websites, our
          hosting provider may automatically receive basic technical data such
          as IP address, browser type, device information, and pages visited.
          We use this to operate, secure, and improve the service.
        </p>
        <p>
          <strong>Preferences on your device.</strong> Some settings (for
          example theme, reader preferences, or audio preferences) may be stored
          in your browser’s local storage so they work without an account.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul>
          <li>To provide and maintain RememberQuran features</li>
          <li>To authenticate you and keep your account secure</li>
          <li>
            To sync bookmarks, notes, progress, goals, and hifz across devices
          </li>
          <li>To respond to support or privacy requests</li>
          <li>To detect abuse, prevent fraud, and protect the service</li>
          <li>To improve reliability and user experience</li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information. We do{" "}
          <strong>not</strong> show third-party advertising on RememberQuran.
        </p>
      </LegalSection>

      <LegalSection title="4. Google sign-in and third parties">
        <p>
          If you choose <strong>Sign in with Google</strong>, Google shares
          basic profile information (such as your name and email) with us
          according to your Google account settings and Google’s policies. We
          use that information only to create and manage your RememberQuran
          account.
        </p>
        <p>
          Quran text, translations, tafsir, and audio may be loaded from trusted
          open data providers (for example Quran Foundation / Quran.com API and
          related CDNs). Those providers process requests needed to deliver
          content to your browser. Their own privacy policies apply to their
          services.
        </p>
        <p>
          Our app may be hosted on infrastructure providers such as Vercel and
          may store account data in a database provider (for example MongoDB
          Atlas). They process data only to host and run the service.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and similar technologies">
        <p>
          We use cookies or similar technologies that are necessary for sign-in
          sessions and security. Preference storage in your browser is used to
          remember settings such as theme. We do not use advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We keep your account and saved content while your account remains
          active. If you ask us to delete your account, we will delete or
          anonymise personal data associated with it within a reasonable time,
          except where we must retain limited information for security, legal,
          or operational reasons.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices and rights">
        <ul>
          <li>
            Access or update account details from{" "}
            <Link href="/account/settings">Account → Settings</Link>
          </li>
          <li>
            Request deletion of your account and associated personal data by
            emailing <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </li>
          <li>
            Stop using the service at any time; guests can read without an
            account
          </li>
          <li>
            Revoke Google access from your Google Account permissions at any
            time
          </li>
        </ul>
        <p>
          Depending on where you live, you may have additional rights under
          applicable privacy laws. Contact us to exercise them.
        </p>
      </LegalSection>

      <LegalSection title="8. Children’s privacy">
        <p>
          RememberQuran is intended for a general audience learning and reading
          the Quran. We do not knowingly collect personal information from
          children under 13 without appropriate consent. If you believe a child
          has provided personal information, contact us and we will take
          appropriate steps.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use reasonable technical and organisational measures to protect
          personal data. No method of transmission or storage is completely
          secure; please use a strong password and protect your sign-in
          methods.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          Our service and providers may process data in countries other than
          your own. Where required, we rely on appropriate safeguards offered by
          those providers.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will change
          the “Last updated” date at the top of this page. Continued use of the
          service after changes means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Privacy questions or deletion requests:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
        <p>
          Also see our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  )
}
