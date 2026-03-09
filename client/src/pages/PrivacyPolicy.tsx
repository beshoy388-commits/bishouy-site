/*
 * BISHOUY.COM — Privacy Policy
 * GDPR Compliant — Updated March 2026 to include social features
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <Navbar />

      <section className="pt-52 pb-12">
        <div className="container max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6 font-ui text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <h1 className="font-display text-4xl md:text-5xl text-[#F2F0EB] mb-2">
            Privacy Policy
          </h1>
          <p className="font-ui text-[#8A8880] mb-8">
            Last updated: March 4, 2026
          </p>

          <div className="font-body text-[#F2F0EB] leading-relaxed space-y-6">
            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                1. Introduction
              </h2>
              <p>
                Bishouy.com ("we," "us," "our," or "Company") is a news and
                community platform. We are committed to protecting your privacy
                in full compliance with the{" "}
                <strong>EU General Data Protection Regulation (GDPR)</strong>{" "}
                and applicable data protection laws.
              </p>
              <p className="mt-2">
                This Privacy Policy covers all data processing activities on our
                platform, including reading articles, user registration,
                comments, likes, public profiles, newsletter subscriptions, and
                any other features offered by our service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                2. Data Controller
              </h2>
              <div className="bg-[#1C1C1A] rounded-sm p-4">
                <p className="font-ui text-sm">
                  <strong>Bishouy.com</strong>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:privacy@bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    privacy@bishouy.com
                  </a>
                  <br />
                  Website:{" "}
                  <a
                    href="https://bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    bishouy.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                3. Information We Collect
              </h2>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2">
                3.1 Account Registration
              </h3>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>
                  Email address (required — used for account verification and
                  authentication)
                </li>
                <li>Full name (required)</li>
                <li>Username (required — visible on your public profile)</li>
                <li>
                  Hashed password (we never store your password in plain text)
                </li>
                <li>Date and time of registration and last login</li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.2 Profile Information (Optional)
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Biography / description</li>
                <li>Profile avatar / photo</li>
                <li>Website URL</li>
                <li>
                  Geographic location (city or country, as entered by you)
                </li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.3 Social Interactions
              </h3>
              <p>When you interact with content, we record:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>
                  Comments you submit on articles (stored with your user ID)
                </li>
                <li>
                  Articles you have liked (stored as a relationship between your
                  account and the article)
                </li>
                <li>Date and time of each interaction</li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.4 Newsletter Subscriptions
              </h3>
              <p>
                If you subscribe to our newsletter: your email address and the
                date of subscription are stored. You may unsubscribe at any
                time.
              </p>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.5 Automatically Collected Data
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  IP address and browser type (for security and analytics)
                </li>
                <li>
                  Pages visited and time spent (via Umami analytics, only with
                  your consent)
                </li>
                <li>Device type and operating system</li>
                <li>
                  Session cookies for authentication (essential, no consent
                  required)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                4. Legal Basis for Processing (GDPR – Art. 6)
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Performance of a Contract (Art. 6(1)(b)):</strong>{" "}
                  Processing necessary to provide account features,
                  authentication, comments, and likes
                </li>
                <li>
                  <strong>Consent (Art. 6(1)(a)):</strong> Analytics cookies,
                  marketing emails, and optional profile data
                </li>
                <li>
                  <strong>Legitimate Interest (Art. 6(1)(f)):</strong> Security
                  monitoring, fraud prevention, and operational logging
                </li>
                <li>
                  <strong>Legal Obligation (Art. 6(1)(c)):</strong> Compliance
                  with applicable EU and national laws
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                5. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To create and manage your user account</li>
                <li>To verify your identity via email confirmation</li>
                <li>
                  To enable social features: comments, likes, and public
                  profiles
                </li>
                <li>
                  To send transactional emails (verification codes, password
                  resets) via <strong>Brevo</strong>
                </li>
                <li>To send newsletters (only with your explicit consent)</li>
                <li>To analyze usage and improve the platform</li>
                <li>To ensure security and prevent abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                6. Public Data and Social Features
              </h2>
              <p className="mb-2">
                Please be aware that certain data is{" "}
                <strong>visible to other users</strong> of the platform:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Your <strong>username</strong> and{" "}
                  <strong>profile name</strong> are public
                </li>
                <li>
                  Your{" "}
                  <strong>profile photo, bio, website, and location</strong> (if
                  provided) are shown on your public profile page
                </li>
                <li>
                  Your <strong>comments</strong> on articles are public and
                  attributable to your username
                </li>
                <li>
                  The number of <strong>likes</strong> on articles is public
                  (your specific likes are not shown to other users)
                </li>
              </ul>
              <p className="mt-2 text-[#8A8880] text-sm">
                Your email address is <strong>never</strong> publicly displayed.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                7. Third-Party Services
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Brevo (Sendinblue):</strong> Transactional email
                  delivery. Data processed according to Brevo's{" "}
                  <a
                    href="https://www.brevo.com/legal/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E8A020] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong>Umami Analytics:</strong> Privacy-focused, cookie-less
                  analytics. No personal data transmitted. Optional — requires
                  your consent.
                </li>
              </ul>
              <p className="mt-2">
                No data is sold to third parties. No advertising networks have
                access to your data.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                8. Data Retention
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account data:</strong> Retained for the duration of
                  your account. Deleted within 30 days of account deletion
                  request.
                </li>
                <li>
                  <strong>Comments and likes:</strong> Retained with your
                  account. Deleted upon account deletion.
                </li>
                <li>
                  <strong>Verification codes:</strong> Automatically deleted
                  after expiration (15 minutes)
                </li>
                <li>
                  <strong>Password reset tokens:</strong> Automatically deleted
                  after expiration (1 hour)
                </li>
                <li>
                  <strong>Newsletter subscriptions:</strong> Retained until you
                  unsubscribe
                </li>
                <li>
                  <strong>Analytics data:</strong> Up to 12 months (aggregated,
                  anonymized)
                </li>
                <li>
                  <strong>Server logs:</strong> Up to 30 days
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                9. Your Rights Under GDPR
              </h2>
              <p className="mb-2">
                You have the following rights, exercisable at any time by
                contacting{" "}
                <a
                  href="mailto:privacy@bishouy.com"
                  className="text-[#E8A020] hover:underline"
                >
                  privacy@bishouy.com
                </a>
                :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Right of Access (Art. 15):</strong> Request a copy of
                  all data we hold about you
                </li>
                <li>
                  <strong>Right to Rectification (Art. 16):</strong> Correct
                  inaccurate or incomplete data (also via your profile settings)
                </li>
                <li>
                  <strong>
                    Right to Erasure / "Right to be Forgotten" (Art. 17):
                  </strong>{" "}
                  Request deletion of your account and all associated data
                </li>
                <li>
                  <strong>Right to Restrict Processing (Art. 18):</strong>{" "}
                  Request that we limit how we use your data
                </li>
                <li>
                  <strong>Right to Data Portability (Art. 20):</strong> Receive
                  your data in a machine-readable format
                </li>
                <li>
                  <strong>Right to Object (Art. 21):</strong> Opt out of
                  processing based on legitimate interest
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> You may withdraw
                  consent at any time (e.g., unsubscribe from newsletter)
                </li>
                <li>
                  <strong>Right to Lodge a Complaint:</strong> You can complain
                  to your national Data Protection Authority
                </li>
              </ul>
              <p className="mt-3 text-sm text-[#8A8880]">
                We will respond to all requests within 30 days as required by
                GDPR.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                10. Cookies and Tracking
              </h2>
              <p className="mb-2">We use the following types of cookies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Session token (JWT) for
                  authentication — strictly necessary, no consent required
                </li>
                <li>
                  <strong>Analytics Cookies (Umami):</strong> Privacy-friendly
                  analytics — require your consent via our cookie banner
                </li>
              </ul>
              <p className="mt-2">
                You can manage or withdraw your cookie consent at any time by
                using the cookie preferences button in the footer.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                11. Data Security
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Passwords are hashed using scrypt (industry-standard secure
                  hashing)
                </li>
                <li>
                  All sensitive authentication uses JWT tokens signed with a
                  secret key
                </li>
                <li>
                  Verification codes are cryptographically generated and expire
                  automatically
                </li>
                <li>
                  HTTP security headers are enforced (via Helmet middleware)
                </li>
                <li>HTTPS is enforced in production</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                12. International Data Transfers
              </h2>
              <p>
                Our infrastructure may process data outside the EU/EEA. Where
                this occurs, we ensure appropriate safeguards are in place (such
                as Standard Contractual Clauses) as required by GDPR Chapter V.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                13. Minors
              </h2>
              <p>
                Our service is not directed at users under the age of 16. We do
                not knowingly collect personal data from minors. If you believe
                we have collected data from a minor, please contact us at{" "}
                <a
                  href="mailto:privacy@bishouy.com"
                  className="text-[#E8A020] hover:underline"
                >
                  privacy@bishouy.com
                </a>{" "}
                and we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                14. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy to reflect changes in our
                services or legal requirements. We will notify registered users
                by email of any material changes. Continued use of the platform
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                15. Contact
              </h2>
              <div className="bg-[#1C1C1A] rounded-sm p-4 mt-3">
                <p className="font-ui text-sm">
                  <strong>Bishouy.com — Data Controller</strong>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:privacy@bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    privacy@bishouy.com
                  </a>
                  <br />
                  Website:{" "}
                  <a
                    href="https://bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    bishouy.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
