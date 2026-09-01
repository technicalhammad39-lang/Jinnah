"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Review } from '@/data/products';
import { Star, CheckCircle, ThumbsUp, MessageSquare, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getPublicUploadUrl } from '@/lib/utils';

interface ReviewsTabProps {
  product: Product;
}

export default function ReviewsTab({ product }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [isWriting, setIsWriting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (!product?.id) return;
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('productId', '==', product.id));
        const snapshot = await getDocs(q);
        let fetched: Review[] = [];
        snapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() } as Review);
        });
        
        // Filter approved and sort by date descending
        fetched = fetched
          .filter(r => r.status === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
        setReviews(fetched);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product?.id]);

  // Generate distribution
  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter);

  // Calculate actual average rating from DB
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'reviews');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          setImages(prev => [...prev, data.url]);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    setIsUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }
    if (!userName.trim()) {
      alert("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId: product.id,
        userId: 'guest',
        userName,
        rating,
        title,
        reviewText,
        images,
        helpfulVotes: 0,
        reported: false,
        verifiedPurchase: false,
        status: 'pending', // Needs approval from admin
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reviews'), newReview);
      alert("Review submitted successfully! It will appear after approval by our team.");
      setIsWriting(false);
      // Reset form
      setRating(0);
      setTitle("");
      setReviewText("");
      setUserName("");
      setImages([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      {/* Reviews Header / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Average Rating */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-8 bg-zinc-50 border border-zinc-200 rounded-2xl">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Customer Reviews</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-5xl font-black text-zinc-900">{averageRating.toFixed(1)}</span>
            <span className="text-lg text-zinc-500 font-medium">/ 5</span>
          </div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-zinc-200 text-zinc-200'
                }`}
              />
            ))}
          </div>
          <p className="text-zinc-500 font-medium text-sm">Based on {reviews.length} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="space-y-3">
            {distribution.map(({ stars, count, percentage }) => (
              <button 
                key={stars}
                onClick={() => setFilter(filter === stars ? 'all' : stars)}
                className="w-full flex items-center gap-4 group"
              >
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="font-medium text-zinc-700">{stars}</span>
                  <Star className={`w-4 h-4 ${filter === stars || filter === 'all' ? 'fill-amber-400 text-amber-400' : 'fill-zinc-300 text-zinc-300 group-hover:text-amber-400 group-hover:fill-amber-400'} transition-colors`} />
                </div>
                <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${filter === stars || filter === 'all' ? 'bg-amber-400' : 'bg-zinc-300'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm text-zinc-500 shrink-0 font-medium group-hover:text-zinc-900 transition-colors">
                  {count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-zinc-200 mb-10" />

      {/* Review Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h4 className="text-2xl font-bold text-zinc-900 mb-1">Recent Reviews</h4>
          <p className="text-zinc-500 text-sm">
            {filter === 'all' ? 'Showing all reviews' : `Showing ${filter}-star reviews`}
          </p>
        </div>
        <button
          onClick={() => setIsWriting(!isWriting)}
          className="px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
        >
          {isWriting ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Write a review form */}
      {isWriting && (
        <div className="bg-zinc-50 p-6 sm:p-8 rounded-2xl border border-zinc-200 mb-10">
          <h4 className="text-xl font-bold text-zinc-900 mb-6">Write a Review</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Rating <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className={`transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 hover:text-amber-300'}`}
                  >
                    <Star className="w-8 h-8" fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">Your Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all" 
                  placeholder="John Doe" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">Review Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all" 
                  placeholder="Summarize your experience" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Review <span className="text-red-500">*</span></label>
              <textarea 
                rows={4} 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all resize-y" 
                placeholder="Tell us more about your experience with this product..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Add Photos</label>
              
              <div className="flex flex-wrap gap-4 items-center">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 group">
                    <Image src={getPublicUploadUrl(img)} alt="Upload" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer relative">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-100">
            <MessageSquare className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No reviews found matching your criteria.</p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="text-brand-orange font-semibold text-sm mt-2 hover:underline">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-lg">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-zinc-900">{review.userName}</span>
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-zinc-200 text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400 font-medium flex items-center before:content-[''] before:w-1 before:h-1 before:bg-zinc-300 before:rounded-full before:mr-3">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className="font-bold text-zinc-900 mb-2 text-lg">{review.title}</h5>
              )}
              
              <p className="text-zinc-600 leading-relaxed mb-5">
                {review.reviewText}
              </p>

              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-5">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-zinc-200 cursor-pointer hover:opacity-90 transition-opacity">
                      <Image
                        src={getPublicUploadUrl(img)}
                        alt="Review attachment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-brand-orange transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes || 0})
                </button>
                <span className="text-zinc-300 text-xs">|</span>
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
