import { PolicyLayout } from "@/components/layouts/PolicyLayout";

export default function Page() {
  return (
    <PolicyLayout title="Return Policy" lastUpdated="Last Updated: October 2023">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black uppercase mb-4">1. Introduction</h2>
          <p>
            Welcome to Jinnah Hardware Store. This document contains important information regarding your rights and obligations when using our digital showroom and purchasing our premium architectural hardware.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-black uppercase mb-4">2. Premium Quality Standards</h2>
          <p>
            All products listed undergo strict quality assurance. We stand by the materials, finishes, and mechanical precision of our hardware.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
