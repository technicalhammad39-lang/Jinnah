"use client";

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import Image from 'next/image';
import { getPublicUploadUrl } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isNew?: boolean;
}

export function ProductGallery({ images, productName, isNew }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Zoom State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ backgroundPosition: '0% 0%' });
  const [lensStyle, setLensStyle] = useState({ top: '0px', left: '0px' });
  const containerRef = useRef<HTMLDivElement>(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const activeImage = images && images.length > 0 ? images[activeIndex] : null;

  if (!activeImage) {
    return (
      <div className="relative aspect-square w-full rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
        <span className="text-gray-400 text-sm font-medium">No Image Available</span>
      </div>
    );
  }

  const imageUrl = getPublicUploadUrl(activeImage);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return; // Disable zoom on smaller screens
    
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Boundary checks for the lens (assuming lens is 150x150 for simplicity)
    const lensSize = 150;
    const halfLens = lensSize / 2;
    
    let lensX = x - halfLens;
    let lensY = y - halfLens;
    
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > width - lensSize) lensX = width - lensSize;
    if (lensY > height - lensSize) lensY = height - lensSize;

    // Calculate background position percentage based on mouse position inside the container
    // We want the background position to map 0-100% based on the mouse X/Y relative to the width/height
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setLensStyle({ top: `${lensY}px`, left: `${lensX}px` });
    setZoomStyle({ backgroundPosition: `${xPercent}% ${yPercent}%` });
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 cursor-crosshair lg:cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => window.innerWidth >= 1024 && setIsZooming(true)}
        onClick={() => {
          if (window.innerWidth < 1024) setIsLightboxOpen(true);
        }}
      >
        <Image
          src={imageUrl}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-contain p-4 mix-blend-multiply"
          priority
        />
        
        {isNew && (
          <div className="absolute top-4 left-4 z-10 rounded bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
            New Arrival
          </div>
        )}

        {/* Mobile touch hint */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white lg:hidden">
          <ZoomIn className="w-5 h-5" />
        </div>

        {/* Desktop Hover Lens */}
        {isZooming && (
          <div 
            className="absolute hidden lg:block border border-gray-300 bg-black/10 pointer-events-none"
            style={{
              width: '150px',
              height: '150px',
              ...lensStyle
            }}
          />
        )}
      </div>

      {/* Desktop Zoom Result Panel */}
      {isZooming && (
        <div className="hidden lg:block absolute top-0 left-[calc(100%+24px)] w-[500px] h-[500px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-200 z-50 overflow-hidden pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '250%', // Magnification level
              ...zoomStyle
            }}
          />
        </div>
      )}

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => window.innerWidth >= 1024 && setActiveIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-white transition-all ${
                activeIndex === idx ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={getPublicUploadUrl(img)}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-2 mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 text-white z-10">
            <span className="text-sm font-medium">{activeIndex + 1} / {images.length}</span>
            <button onClick={() => setIsLightboxOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={productName}
              fill
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 pointer-events-none">
              <button onClick={handlePrev} className="p-3 bg-black/50 text-white rounded-full pointer-events-auto backdrop-blur-md">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={handleNext} className="p-3 bg-black/50 text-white rounded-full pointer-events-auto backdrop-blur-md">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
          
          {/* Lightbox Thumbnails */}
          {images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto justify-center bg-black/50 backdrop-blur-md pb-8">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    activeIndex === idx ? "border-2 border-primary" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={getPublicUploadUrl(img)}
                    alt={`Thumb ${idx}`}
                    fill
                    sizes="64px"
                    className="object-cover bg-white"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
