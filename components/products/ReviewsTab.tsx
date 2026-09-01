"use client";

import React, { useState, useRef } from 'react';
import { Product, Review } from '@/data/products';
import { Star, CheckCircle, ThumbsUp, MessageSquare, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ReviewsTabProps {
  product: Product;
}

// Mock Reviews for UI
const mockReviews: Review[] = [];

export default function ReviewsTab({ product }: ReviewsTabProps) {
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Generate distribution
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = mockReviews.filter(r => r.rating === stars).length;
    const percentage = mockReviews.length > 0 ? (count / mockReviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const filteredReviews = filter === 'all' 
    ? mockReviews 
    : mockReviews.filter(r => r.rating === filter);

  return (
    <div className="py-8">
      {/* Reviews Header / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Average Rating */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-8 bg-zinc-50 border border-zinc-200 rounded-2xl">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Customer Reviews</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-5xl font-black text-zinc-900">{(product?.rating || 0).toFixed(1)}</span>
            <span className="text-lg text-zinc-500 font-medium">/ 5</span>
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'} hover:text-amber-400 transition-colors`}
                  >
                    <Star className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Review Title</label>
              <input type="text" className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Summarize your experience" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Review</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Tell us more about your experience..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Add Photos</label>
              <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} type="button" className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 border-2 border-dashed border-zinc-300 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors">
                <ImageIcon className="w-5 h-5" />
                <span>Upload Images</span>
              </button>
              {images.length > 0 && (
                <div className="flex gap-4 mt-4 flex-wrap">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 group">
                      <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="px-8 py-3 bg-[#f97316] text-white font-bold rounded-lg hover:bg-[#ea580c] transition-colors">
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">No reviews found matching your criteria.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{review.userName}</span>
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-zinc-200 text-zinc-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <h5 className="font-bold text-zinc-900 mb-2">{review.title}</h5>
              )}
              
              <p className="text-zinc-600 leading-relaxed mb-4">
                {review.reviewText}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer hover:opacity-90 transition-opacity">
                      <Image
                        src={img}
                        alt="Review attachment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes || 0})
                </button>
                <button className="text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
