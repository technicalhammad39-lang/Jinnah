const fs = require('fs');
const file = 'components/products/ReviewsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
content = content.replace(
  /import React, \{ useState \} from 'react';/,
  `import React, { useState, useRef, useEffect } from 'react';\nimport { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';\nimport { db } from '@/lib/firebase';`
);

// 2. Mock Reviews to empty
content = content.replace(
  /const mockReviews: Review\[\] = \[[\s\S]*?\];/m,
  'const mockReviews: Review[] = [];'
);

// 3. Add state and logic
const stateLogic = `const [filter, setFilter] = useState<number | 'all'>('all');
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", product.id),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        })) as Review[];
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating.");
    if (!userName.trim()) return alert("Please enter your name.");
    if (!reviewText.trim()) return alert("Please write a review.");
    
    setIsLoading(true);
    try {
      let uploadedImageUrls: string[] = [];
      
      // Upload images one by one if they exist
      if (images.length > 0) {
        for (const file of images) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "reviews");
          
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (res.ok) {
            const data = await res.json();
            uploadedImageUrls.push(data.url);
          } else {
            console.error("Failed to upload image:", await res.text());
          }
        }
      }
      
      // Save review to Firestore
      const newReview = {
        productId: product.id,
        userId: "anonymous", // Assuming guest review
        userName,
        rating,
        title,
        reviewText,
        images: uploadedImageUrls,
        helpfulVotes: 0,
        reported: false,
        verifiedPurchase: false,
        status: 'approved',
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "reviews"), newReview);
      
      // Add to local state immediately
      setReviews([{
        ...newReview,
        id: docRef.id,
        createdAt: new Date().toISOString()
      } as Review, ...reviews]);
      
      // Reset form
      setUserName('');
      setTitle('');
      setReviewText('');
      setRating(0);
      setImages([]);
      setIsWriting(false);
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit review.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };`;

content = content.replace(
  /const \[filter, setFilter\] = useState<number \| 'all'>\('all'\);\n  const \[isWriting, setIsWriting\] = useState\(false\);/,
  stateLogic
);

// 4. Update distribution mapping
content = content.replace(
  /const count = mockReviews\.filter\(r => r\.rating === stars\)\.length;\n    const percentage = mockReviews\.length > 0 \? \(count \/ mockReviews\.length\) \* 100 : 0;/g,
  `const count = reviews.filter(r => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;`
);

content = content.replace(
  /const filteredReviews = filter === 'all' \n    \? mockReviews \n    : mockReviews\.filter\(r => r\.rating === filter\);/,
  `const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter);`
);

// 5. Update the Stars in the form
const starFormContent = `<div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={\`\${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'} hover:text-amber-400 transition-colors\`}
                  >
                    <Star className={\`w-8 h-8 \${(hoverRating || rating) >= star ? 'fill-amber-400' : ''}\`} />
                  </button>
                ))}
              </div>`;

content = content.replace(
  /<div className="flex gap-2">\n\s*\{\[1, 2, 3, 4, 5\]\.map\(\(star\) => \([\s\S]*?<Star className="w-8 h-8" \/>\n\s*<\/button>\n\s*\)\)\}\n\s*<\/div>/,
  starFormContent
);

// 6. Update the form fields (Name, Title, Text, Images, Submit)
const formFieldsContent = `<div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Your Name</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Review Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Summarize your experience" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Review</label>
              <textarea rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Tell us more about your experience..."></textarea>
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
            <button type="button" disabled={isLoading} onClick={handleSubmit} className="px-8 py-3 bg-[#f97316] text-white font-bold rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>`;

content = content.replace(
  /<div>\n\s*<label className="block text-sm font-medium text-zinc-700 mb-1">Review Title<\/label>[\s\S]*?<button type="button" className="px-8 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-orange\/90 transition-colors">\n\s*Submit Review\n\s*<\/button>/,
  formFieldsContent
);


fs.writeFileSync(file, content, 'utf8');
console.log('Finished accurately applying reviews logic.');
