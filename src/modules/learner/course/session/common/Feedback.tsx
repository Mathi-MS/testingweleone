import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import {
  POST_SESSION_FEEDBACK,
  GET_MY_FEEDBACK_BY_SESSION,
  GET_FEEDBACK_BY_SESSION,
} from "../../../../../graphql/mutations/chatMutations";
import { communityClient } from "../../../../../graphql/client";

interface FeedbackItem {
  id: string;
  username?: string;
  userType?: string;
  userId?: string;
  profilePhotoUrl?: string;
  time: string;
  date: string;
  text: string;
  rating?: number;
}

interface FeedbackProps {
  onClose: () => void;
  sessionId: string;
  courseId?: string;
  userId: string;
  username?: string;
  userType?: string;
}

export default function Feedback({
  onClose,
  sessionId,
  courseId,
  userId,
  username,
  userType,
}: FeedbackProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const [allFeedbacks, setAllFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      try {
        const { data } = await communityClient.query({
          query: GET_FEEDBACK_BY_SESSION,
          variables: {
            sessionId,
            requesterId: userId,
            requesterRole: "trainer",
          },
          fetchPolicy: "network-only",
        });

        if (data?.getFeedbackBySession?.items) {
          const formattedFeedbacks = data.getFeedbackBySession.items.map(
            (fb: any) => ({
              id: fb.id,
              username: fb.username,
              userType: fb.userType,
              userId: fb.userId,
              profilePhotoUrl: fb.profilePhotoUrl,
              time: new Date(fb.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              date:
                new Date(fb.createdAt).toLocaleDateString() ===
                new Date().toLocaleDateString()
                  ? "Today"
                  : new Date(fb.createdAt).toLocaleDateString(),
              text: fb.content,
              rating: fb.rating
                ? parseInt(fb.rating.replace("RATING_", ""))
                : undefined,
            }),
          );
          setAllFeedbacks(formattedFeedbacks);
        }
      } catch (error) {
        console.error("Failed to fetch all feedbacks:", error);
      }
    };

    if (sessionId) {
      fetchAllFeedbacks();
    }
  }, [sessionId, userId]);

  const handleSubmit = async () => {
    if (feedbackText.trim()) {
      setLoading(true);
      try {
        const { data } = await communityClient.mutate({
          mutation: POST_SESSION_FEEDBACK,
          variables: {
            input: {
              sessionId,
              courseId,
              userId,
              username,
              userType: "student",
              content: feedbackText,
              rating: rating ? `RATING_${rating}` : null,
            },
          },
        });

        if (data?.postSessionFeedback) {
          const now = new Date();
          const newFeedback: FeedbackItem = {
            id: data.postSessionFeedback.id,
            username: username,
            userType: "student",
            userId: userId,
            profilePhotoUrl: undefined,
            time: now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: "Today",
            text: feedbackText,
            rating: rating || undefined,
          };
          setAllFeedbacks([newFeedback, ...allFeedbacks]);
          setFeedbackText("");
          setRating(0);
        }
      } catch (error) {
        console.error("Failed to submit feedback:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <h2 className="text-lg font-semibold text-[#0F0F0F] mb-4">
        Share your feedback
      </h2>

      {/* Content */}
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={`cursor-pointer transition-colors ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full h-32 p-3 border border-[#CED4DA] rounded-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-[#00000080] placeholder-gray-400"
        />

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-2 py-1 bg-white text-[14px] text-[#00BF53] border border-[#00BF53] rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Share Feedback"}
          </button>
        </div>

        {/* All Feedbacks */}
        <div className="mt-8">
          <h3 className="text-md font-semibold text-[#0F0F0F] mb-4">
            Co-Learners Feedback
          </h3>
          <div className="">
            {allFeedbacks.length === 0 ? (
              <p className="text-sm text-gray-500">No feedbacks yet</p>
            ) : (
              allFeedbacks.map((feedback) => (
                <div key={feedback.id} className="group py-2 flex gap-3">
                  <img
                    src={
                      feedback.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/notionists/svg?seed=${feedback.userId || feedback.username}`
                    }
                    alt={feedback.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 my-1">
                    <div className="flex items-center gap-2 text-sm text-[#1F2937] mb-1">
                      <span className="font-medium">{feedback.username}</span>
                      <span>|</span>
                      <span className="text-xs text-gray-500">
                        {feedback.time}
                      </span>
                      {feedback.rating && (
                        <>
                          <span>|</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= feedback.rating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-[#4B5563]">{feedback.text}</p>
                    {/* <hr className="mt-4 w-[75%]"/> */}
                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
