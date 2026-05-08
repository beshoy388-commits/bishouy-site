/*
 * BISHOUY.COM — Terms of Service
 * EU Compliant — Updated March 2026 to include social and community features
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0F0F0E]">
      <SEO title="Terms of Service" description="Read our Terms of Service for using Bishouy.com." />
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
            Terms of Service
          </h1>
          <p className="font-ui text-[#8A8880] mb-8">
            Last updated: March 4, 2026
          </p>

          <div className="font-body text-[#F2F0EB] leading-relaxed space-y-6">
            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing or using Bishouy.com (the "Platform"), you agree to
                be bound by these Terms of Service ("Terms"). These Terms apply
                to all visitors, registered users, and contributors of content.
                If you do not agree, you must not use the Platform.
              </p>
              <p className="mt-2">
                These Terms are governed by the laws of the{" "}
                <strong>European Union</strong> and applicable member state law.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                2. The Platform
              </h2>
              <p>Bishouy.com is a news and community platform that offers:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Publication and reading of news articles</li>
                <li>User accounts with public profiles</li>
                <li>Comment sections on articles</li>
                <li>Article like/reaction system</li>
                <li>Newsletter subscription service</li>
                <li>AI editorial assistant</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                3. User Accounts
              </h2>
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2">
                3.1 Registration
              </h3>
              <p>
                To access social features, you must create an account by
                providing a valid email address, name, and password. You agree
                to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Be at least 16 years of age (or the legal age of majority in your jurisdiction)</li>
                <li>Provide accurate and truthful information</li>
                <li>Verify your email address using the code we send</li>
                <li>Maintain the security of your password</li>
                <li>
                  Immediately notify us of any unauthorized access to your
                  account
                </li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.2 Account Responsibility
              </h3>
              <p>
                You are solely responsible for all activity that occurs under
                your account. We are not liable for any loss or damage arising
                from unauthorized use of your account due to your failure to
                maintain password security.
              </p>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                3.3 Account Deletion
              </h3>
              <p>
                You may request deletion of your account at any time by
                contacting{" "}
                <a
                  href="mailto:privacy@bishouy.com"
                  className="text-[#E8A020] hover:underline"
                >
                  privacy@bishouy.com
                </a>
                . Account deletion will result in permanent removal of your
                profile data, comments, and likes within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                4. Public Profile
              </h2>
              <p>
                By creating an account, you acknowledge that the following
                information may be visible to all visitors of the Platform:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Your username and display name</li>
                <li>
                  Your profile biography, photo, website, and location (if
                  provided)
                </li>
                <li>Your published comments</li>
              </ul>
              <p className="mt-2">
                Your email address is <strong>never</strong> publicly visible.
                You are responsible for what optional information you choose to
                add to your public profile.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                5. User-Generated Content
              </h2>
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2">
                5.1 Comments and Interactions
              </h3>
              <p>
                When you submit a comment or interact with content, you grant
                Bishouy.com a non-exclusive, royalty-free, worldwide license to
                store, display, and moderate that content on the Platform.
              </p>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                5.2 Content Standards
              </h3>
              <p>
                All content you submit must comply with the following standards.
                Content must not:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>
                  Be defamatory, abusive, threatening, harassing, or hateful
                </li>
                <li>Infringe any intellectual property rights</li>
                <li>Contain spam, malware, or phishing content</li>
                <li>Promote illegal activities</li>
                <li>Contain sexual content involving minors</li>
                <li>Constitute misinformation or deliberately false claims</li>
                <li>Violate the privacy of others</li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                5.3 Moderation
              </h3>
              <p>
                All comments are subject to moderation. We reserve the right to
                remove any content that violates these Terms without prior
                notice. Accounts that repeatedly violate these standards may be
                suspended or permanently banned.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                6. Intellectual Property
              </h2>
              <p>
                All articles, images, designs, and original content published on
                Bishouy.com are the intellectual property of Bishouy.com or
                their respective authors. You may not reproduce, distribute, or
                use our editorial content without prior written permission.
              </p>
              <p className="mt-2">
                You retain ownership of your original comments and profile
                content. By submitting it, you grant us a license to display it
                as described in Section 5.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                7. Newsletter
              </h2>
              <p>
                By subscribing to our newsletter, you consent to receiving
                periodic email communications from Bishouy.com. You may
                unsubscribe at any time by clicking the unsubscribe link in any
                newsletter email or by contacting us directly. We use{" "}
                <strong>Brevo</strong> as our email delivery provider.
              </p>
            </section>
            
            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                8. Premium Subscriptions
              </h2>
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2">
                8.1 Membership Tiers
              </h3>
              <p>
                BISHOUY offers premium subscription tiers ("Premium" and "Founder") that provide access to restricted intelligence segments, deep-dive analyses, and advanced features.
              </p>
              
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                8.2 Payments and Billing
              </h3>
              <p>
                Subscriptions are billed via <strong>Stripe</strong>. By subscribing, you authorize us to charge your provided payment method on a recurring basis. All fees are non-refundable unless required by EU consumer law.
              </p>
              
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                8.3 Free Trials and Promo Codes
              </h3>
              <p>
                We may offer free trials or promotional discounts (e.g., "FREE100"). Free trials will automatically convert to a paid subscription at the end of the trial period unless cancelled at least 24 hours before expiration. Promo codes are valid for a limited time and subject to the specific terms of the promotion.
              </p>
              
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                8.4 Cancellation
              </h3>
              <p>
                You may cancel your subscription at any time via the Customer Portal in your User Profile. Upon cancellation, you will retain access until the end of your current billing cycle.
              </p>
              
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                8.5 Right of Withdrawal
              </h3>
              <p>
                As a provider of digital content, we inform you that by subscribing and accessing our premium content, you expressly consent to the immediate start of the performance and acknowledge that you lose your 14-day right of withdrawal provided under EU consumer law once the digital content has been accessed or the service has begun.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                9. Prohibited Conduct
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>
                  Attempt to gain unauthorized access to our systems or other
                  users' accounts
                </li>
                <li>
                  Use automated scripts, bots, or scrapers to access content
                </li>
                <li>Attack, destabilize, or overload our infrastructure</li>
                <li>Create multiple accounts to evade a ban</li>
                <li>Impersonate another user, person, or entity</li>
                <li>
                  Engage in any activity that violates applicable EU or national
                  laws
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                10. Disclaimer of Warranties
              </h2>
              <p>
                The Platform is provided on an "as is" and "as available" basis.
                We make no warranties, express or implied, regarding the
                accuracy, completeness, or reliability of any content. 
              </p>
              <p className="mt-2">
                <strong>AI-Generated Content:</strong> Some analytical segments are generated or assisted by artificial intelligence ("Neural Nexus"). These insights are for informational purposes only and do not constitute professional, legal, financial, or medical advice. You use such information at your own risk.
              </p>
              <p className="mt-2">
                News articles represent the editorial opinion of the authors and do
                not constitute professional advice.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                11. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by EU law, Bishouy.com, its founder, and its affiliates shall not
                be liable for any indirect, incidental, special, or
                consequential damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the Platform. Our
                total liability for any claim shall not exceed the amount paid by you (if any)
                to access the Platform in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                12. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Bishouy.com and its staff from and against any and all claims, liabilities, damages, losses, or expenses, including legal fees, arising out of or in any way connected with your access to or use of the Platform, your violation of these Terms, or your infringement of any intellectual property or other right of any person or entity.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                13. Links to External Sites
              </h2>
              <p>
                Our Platform may contain links to third-party websites. We are
                not responsible for the content or privacy practices of those
                sites. Links do not constitute endorsement by Bishouy.com.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                14. Accessibility
              </h2>
              <p>
                Bishouy.com is committed to ensuring digital accessibility in
                compliance with WCAG 2.1 Level AA standards. If you experience
                accessibility issues, please contact us at{" "}
                <a
                  href="mailto:accessibility@bishouy.com"
                  className="text-[#E8A020] hover:underline"
                >
                  accessibility@bishouy.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                15. Termination
              </h2>
              <p>
                We reserve the right, without notice and in our sole discretion, to terminate or suspend your account and your access to the Platform for any reason, including without limitation if we believe you have violated these Terms. We shall not be liable to you or any third party for any termination of your access to the Platform.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                16. Modifications to the Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify registered users by email of material changes. Continued
                use of the Platform after changes are posted constitutes your
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                17. Governing Law and Disputes
              </h2>
              <p>
                These Terms are governed by the laws of the European Union. Any
                disputes shall be subject to the exclusive jurisdiction of the
                competent EU courts. If you are an EU consumer, you may also use
                the{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8A020] hover:underline"
                >
                  EU Online Dispute Resolution platform
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                18. Severability and Entire Agreement
              </h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect. These Terms constitute the entire agreement between you and Bishouy.com regarding the Platform.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-bold text-[#F2F0EB] mb-3">
                19. Contact
              </h2>
              <div className="bg-[#1C1C1A] rounded-sm p-4 mt-3">
                <p className="font-ui text-sm">
                  <strong>Bishouy.com</strong>
                  <br />
                  General inquiries:{" "}
                  <a
                    href="mailto:info@bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    info@bishouy.com
                  </a>
                  <br />
                  Legal matters:{" "}
                  <a
                    href="mailto:legal@bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    legal@bishouy.com
                  </a>
                  <br />
                  Privacy:{" "}
                  <a
                    href="mailto:privacy@bishouy.com"
                    className="text-[#E8A020] hover:underline"
                  >
                    privacy@bishouy.com
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
