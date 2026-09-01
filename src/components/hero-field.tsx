"use client";

import dynamic from "next/dynamic";

const HeroFieldCanvas = dynamic(() => import("./hero-field-canvas"), {
  ssr: false,
});

export function HeroField() {
  return (
    <div className="hero-field" aria-hidden="true">
      <div className="hero-field-grid" />
      <div className="hero-field-glint" />
      <div className="hero-field-static" />
      <HeroFieldCanvas />
    </div>
  );
}
