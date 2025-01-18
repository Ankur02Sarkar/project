import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';

interface FeedbackFormProps {
  onClose: () => void;
  onSubmit: (feedback: unknown) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({ rating, comment });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">How was your experience?</h2>
      
      <div className="flex justify-center space-x-2 mb-8">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            className={`p-2 transition-all duration-300 transform hover:scale-110 ${
              value <= rating ? 'text-[#F7EC38]' : 'text-gray-400'
            }`}
          >
            <Star className="w-8 h-8" fill={value <= rating ? '#F7EC38' : 'none'} />
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
            Share your thoughts
          </label>
          <textarea
            id="feedback"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 bg-[#323232] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent text-white placeholder-gray-400"
            placeholder="Tell us what you think..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-[#323232] hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#a78bfa] hover:bg-[#8b5cf6] rounded-lg text-black font-semibold flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};