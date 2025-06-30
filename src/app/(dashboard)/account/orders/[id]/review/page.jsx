// Fixed Review Page - app/account/orders/[orderId]/review/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { account, checkLoading } = useAuth();
  const orderId = params.id;


  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkLoading) return;
    if (!account) {
      router.push('/login');
      return;
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, account, checkLoading]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      debugger;
      console.log('Fetching order:', orderId);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
          
          // Check if order is completed and doesn't have a review
          if (data.order.status !== 'completed' || data.order.review) {
            
            router.push('/account/orders');
            return;
          }
        } else {
          setError(data.message || 'Order not found');
        }
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (comment.length > 500) {
      setError('Comment cannot exceed 500 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          companyId: order.companyId,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setRating(0);
        setComment('');
        setError('');
        // Redirect back to orders page with success message
        router.push('/account');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, disabled = false }) => {
    return (
      <div >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => setRating(star)}
           
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (checkLoading || loading) {
    return (
      <div >
        <div >
          <div ></div>
          <p >Loading...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div >
        <div >
          <h1 >Order Not Found</h1>
          <button
            onClick={() => router.push('/account')}
            
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div >
      <div >
        <div >
          

          {/* Order Info */}
          <div >
            <h3 >Order Details</h3>
            <p >Order ID: {order._id}</p>
            <p >Company: {order.companyName}</p>
            <p >
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div >
              <label >
                Rating *
              </label>
              <StarRating rating={rating} setRating={setRating} disabled={isSubmitting} />
              <p >
                {rating === 0 && 'Please select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Comment */}
            <div >
              <label htmlFor="comment" >
                Comment *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                maxLength={500}
               
                placeholder="Share your experience with this order..."
              />
              <div >
                <span>Required</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div >
                <p >{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div >
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
               
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/account')}
                disabled={isSubmitting}
                
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}