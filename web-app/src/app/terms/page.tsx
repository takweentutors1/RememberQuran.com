import type { Metadata } from "next"
import Link from "next/link"
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the RememberQuran website and services.",
}

const SITE = "https://rememberquran.com"
const CONTACT = "privacy@rememberquran.com"

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="23 July 2026">
      <LegalSection title="1. Agreement">
        <p>
          These Terms of Service (“Terms”) govern your use of{" "}
          <strong>RememberQuran</strong> at{" "}
          <a href={SITE} rel="noopener noreferrer">
            {SITE}
          </a>{" "}
          and related pages (the “Service”). By using the Service, you agree to
          these Terms. If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. What RememberQuran is">
        <p>
          RememberQuran is a free, public-benefit platform for reading,
          listening to, and studying the Quran, including translations, study
          tools, audio, and optional account features such as bookmarks, notes,
          progress, goals, and memorisation tracking.
        </p>
        <p>
          The Service is provided for educational, personal, and religious
          learning purposes.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility and accounts">
        <p>
          You may browse much of the Service without an account. Some features
          require registration or sign-in (including Google sign-in). You are
          responsible for keeping your account credentials secure and for
          activity under your account.
        </p>
        <p>
          You must provide accurate information and must not impersonate others
          or create accounts for abusive purposes.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for unlawful, harmful, or abusive purposes</li>
          <li>
            Attempt to disrupt, scrape excessively, reverse engineer, or
            compromise the Service or its infrastructure
          </li>
          <li>
            Upload content that is illegal, harassing, or infringes others’
            rights
          </li>
          <li>
            Misrepresent Quranic text, translations, or attributions in a way
            that is deceptive
          </li>
          <li>Use the Service to send spam or automated abuse</li>
        </ul>
        <p>
          We may suspend or terminate access if we reasonably believe these
          Terms have been violated.
        </p>
      </LegalSection>

      <LegalSection title="5. Your content">
        <p>
          If you save notes or other user content, you retain ownership of that
          content. You grant us a limited licence to store and display it to you
          as needed to operate the Service.
        </p>
        <p>
          Do not submit content you do not have the right to share. We may
          remove content that violates these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="6. Quran text, translations, and audio">
        <p>
          Arabic Quran text, translations, tafsir, and recitations are provided
          from third-party and open sources (including King Fahd Complex / Hafs
          text where applicable, and providers such as Quran Foundation /
          Quran.com and related CDNs). Rights in those materials belong to their
          respective owners and licensors.
        </p>
        <p>
          Translations and commentaries are human scholarly works and may differ.
          RememberQuran does not claim to be an official religious authority.
          Always verify important matters with qualified scholars and trusted
          printed or published sources when needed.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The RememberQuran name, logo, site design, and original software are
          protected by applicable intellectual property laws. You may not copy
          or reuse our branding or software except as allowed by law or with
          our written permission.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party services">
        <p>
          The Service may link to or rely on third parties (for example Google
          authentication, hosting, databases, and content APIs). Their terms and
          privacy policies apply to those services. We are not responsible for
          third-party sites or services we do not control.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimer of warranties">
        <p>
          The Service is provided <strong>“as is”</strong> and{" "}
          <strong>“as available”</strong> without warranties of any kind,
          whether express or implied, including merchantability, fitness for a
          particular purpose, and non-infringement, to the fullest extent
          permitted by law.
        </p>
        <p>
          We do not guarantee uninterrupted availability, error-free operation,
          or that content will always be complete or current.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, RememberQuran and its
          operators will not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of data, profits, or
          goodwill, arising from your use of the Service.
        </p>
        <p>
          Our total liability for any claim relating to the Service will not
          exceed the greater of (a) the amount you paid us in the 12 months
          before the claim (if any), or (b) USD $50.
        </p>
      </LegalSection>

      <LegalSection title="11. Indemnity">
        <p>
          You agree to defend and indemnify RememberQuran and its operators from
          claims arising out of your misuse of the Service or violation of these
          Terms, to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update these Terms from time to time. We will update the “Last
          updated” date on this page. Continued use after changes means you
          accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="13. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or end
          access if needed to protect the Service, users, or to comply with law.
          Provisions that should survive (including disclaimers and liability
          limits) will survive termination.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law">
        <p>
          These Terms are governed by the laws applicable in the place where the
          Service operators primarily reside, without regard to conflict-of-law
          rules, unless mandatory local consumer law says otherwise.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
        <p>
          Also see our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  )
}
