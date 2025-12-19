"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Promotion {
  id: string;
  title: string;
  url: string;
  blurb: string;
  imageUrl: string | null;
  ctaLabel: string | null;
}

export function PromotionCarousel({ promotions }: { promotions: Promotion[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  if (promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden">
        <div className="relative h-[400px] md:h-[500px]">
          {currentPromo.imageUrl && (
            <Image
              src={currentPromo.imageUrl}
              alt={currentPromo.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {currentPromo.title}
            </h2>
            <p className="text-lg md:text-xl mb-6 max-w-2xl">
              {currentPromo.blurb}
            </p>
            {currentPromo.url.startsWith("http") || currentPromo.url.startsWith("/") ? (
              <Button asChild size="lg">
                <a
                  href={currentPromo.url}
                  target={currentPromo.url.startsWith("http") ? "_blank" : "_self"}
                  rel={currentPromo.url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {currentPromo.ctaLabel || "Learn More"}
                </a>
              </Button>
            ) : (
              <Button asChild size="lg">
                <a href={currentPromo.url} download>
                  {currentPromo.ctaLabel || "Download Now"}
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

