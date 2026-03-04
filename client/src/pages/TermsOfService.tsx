/*
 * BISHOUY.COM — Terms of Service
 * EU Compliant Terms of Service
 */

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import Footer from "@/components/Footer";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="font-ui text-[#8A8880] mb-8">
            Last updated: March 3, 2026
          </p>

          <div className="font-body text-[#F2F0EB] leading-relaxed space-y-6">
            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing and using Bishouy.com (the "Site"), you accept and agree to be bound by and comply with these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Bishouy.com for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the Site</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Use the Site in any way that infringes upon the rights of others or restricts their use and enjoyment</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                3. Disclaimer
              </h2>
              <p>
                The materials on Bishouy.com are provided on an 'as is' basis. Bishouy.com makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                4. Limitations
              </h2>
              <p>
                In no event shall Bishouy.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Bishouy.com, even if Bishouy.com or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on Bishouy.com could include technical, typographical, or photographic errors. Bishouy.com does not warrant that any of the materials on its Site are accurate, complete, or current. Bishouy.com may make changes to the materials contained on its Site at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                6. Links
              </h2>
              <p>
                Bishouy.com has not reviewed all of the sites linked to its Site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Bishouy.com of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                7. Modifications
              </h2>
              <p>
                Bishouy.com may revise these Terms of Service for its Site at any time without notice. By using this Site, you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                8. Governing Law
              </h2>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of the European Union, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                9. User-Generated Content
              </h2>
              <p>
                If you submit, post, or display content on Bishouy.com, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                10. Prohibited Conduct
              </h2>
              <p>
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable law or regulation</li>
                <li>Infringe on any intellectual property rights</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Post spam, malware, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                11. Accessibility
              </h2>
              <p>
                Bishouy.com is committed to ensuring digital accessibility for individuals with disabilities. We strive to comply with WCAG 2.1 Level AA standards. If you experience accessibility issues, please contact us at accessibility@bishouy.com.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-2xl font-700 text-[#F2F0EB] mb-3">
                12. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-[#1C1C1A] rounded-sm p-4 mt-3">
                <p className="font-ui text-sm">
                  <strong>Bishouy.com</strong><br />
                  Email: legal@bishouy.com<br />
                  Address: [Your Company Address]
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
