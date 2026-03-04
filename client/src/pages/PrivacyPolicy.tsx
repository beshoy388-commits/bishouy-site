/*
 * BISHOUY.COM — Privacy Policy
 * GDPR Compliant Privacy Policy
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
      <BreakingNewsTicker />

      <section className="pt-32 pb-12">
        <div className="container max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8A8880] hover:text-[#E8A020] transition-colors mb-6 font-ui text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <h1 className="font-display text-4xl md:text-5xl text-[#F2F0EB] mb-2">
            Privacy Policy
          </h1>
          <p className="font-ui text-[#8A8880] mb-8">
            Last updated: March 3, 2026
          </p>

          <div className="font-body text-[#F2F0EB] leading-relaxed space-y-6">
            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                1. Introduction
              </h2>
              <p>
                Bishouy.com ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (the "Site") and use our services.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Site.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                2. Information We Collect
              </h2>
              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2">
                2.1 Information You Provide
              </h3>
              <p>
                We collect information you voluntarily provide, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address (for newsletter subscriptions)</li>
                <li>Name (optional, for comments or inquiries)</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="font-headline text-lg font-600 text-[#E8A020] mb-2 mt-4">
                2.2 Information Collected Automatically
              </h3>
              <p>
                When you visit our Site, we automatically collect certain information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent on each page</li>
                <li>Referral source</li>
                <li>Device information (operating system, device type)</li>
              </ul>
              <p className="mt-2">
                This information is collected through analytics tools (Umami) with your consent via our cookie banner.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                3. How We Use Your Information
              </h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To deliver and improve our content and services</li>
                <li>To send you newsletters (with your consent)</li>
                <li>To analyze website usage and trends</li>
                <li>To comply with legal obligations</li>
                <li>To prevent fraud and enhance security</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                4. Legal Basis for Processing (GDPR)
              </h2>
              <p>
                Under GDPR, we process your personal data based on:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consent:</strong> For analytics and marketing cookies</li>
                <li><strong>Legitimate Interest:</strong> For website functionality and security</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                5. Data Retention
              </h2>
              <p>
                We retain your personal data for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Newsletter subscriber data: Until you unsubscribe</li>
                <li>Analytics data: Up to 12 months</li>
                <li>Server logs: Up to 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                6. Your Rights (GDPR)
              </h2>
              <p>
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right of Access:</strong> Request a copy of your data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Right to Object:</strong> Opt-out of certain processing</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us at privacy@bishouy.com.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                7. Cookies and Tracking
              </h2>
              <p>
                We use cookies to enhance your experience. You have full control over cookie preferences through our cookie consent banner. Types of cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand user behavior (Umami)</li>
                <li><strong>Marketing Cookies:</strong> Used for personalized content (optional)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                8. Third-Party Services
              </h2>
              <p>
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Umami Analytics:</strong> Privacy-focused analytics (no personal data collected)</li>
                <li><strong>Email Service Provider:</strong> For newsletter delivery</li>
              </ul>
              <p className="mt-2">
                These services are bound by confidentiality agreements and process data only as instructed.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                9. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                10. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using our Site, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                11. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-[#1C1C1A] rounded-sm p-4 mt-3">
                <p className="font-ui text-sm">
                  <strong>Bishouy.com</strong><br />
                  Email: privacy@bishouy.com<br />
                  Address: [Your Company Address]
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date above.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
