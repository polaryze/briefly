import React, { useState } from "react";
import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import StickyFooter from "@/components/StickyFooter";
import NewsletterPreview from "@/components/NewsletterPreview";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <div className="min-h-screen">
      <TopNav />
      <Hero />
      <BentoGrid />
      <div className="flex flex-col items-center justify-center my-12">
        <Button
          size="lg"
          className="text-lg px-8 py-4 rounded-2xl bg-black hover:bg-gray-800 text-white shadow-xl hover:shadow-black/25 transition-all duration-300 hover:scale-105 mb-6"
          onClick={() => setShowPreview((prev) => !prev)}
        >
          {showPreview ? "Hide Example Newsletter" : "Generate Newsletter Example"}
        </Button>
        {showPreview && (
          <div className="w-full flex justify-center">
            <div className="max-w-4xl w-full">
              <NewsletterPreview />
            </div>
          </div>
        )}
      </div>
      <Testimonials />
      <footer className="w-full py-6 text-center text-gray-500 text-sm border-t border-gray-200/60 bg-white/70 backdrop-blur-md">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://briefly.ai"
          className="underline hover:text-black transition-colors"
        >
          Briefly
        </a>
        . All rights reserved.
      </footer>
      <StickyFooter />
    </div>
  );
};

export default Index;
