import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Smile,
  Pin,
} from "lucide-react";
import { useSelector } from "react-redux";
import { sessionClient } from "../../../../graphql/client";
import {
  CREATE_COMMENT,
  REPLY_COMMENT,
  EDIT_COMMENT,
  DELETE_COMMENT,
  REACT_TO_COMMENT,
} from "../../../../graphql/mutations/commentMutations";
import { GET_COMMENTS_BY_SESSION } from "../../../../graphql/queries/commentQueries";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { gql } from "@apollo/client";

const GET_REPLIED_COMMENTS = gql`
  query GetRepliedcommentByParentID($parentId: ID!) {
    GetRepliedcommentByParentID(parentId: $parentId) {
      id
      content
      username
      userId
      userAvatar
      createdAt
      reactions {
        emoji
        reaction {
          count
        }
      }
    }
  }
`;

const PIN_COMMENT = gql`
  mutation PinComment($commentId: ID!, $userId: String!, $userRole: String!) {
    pinComment(commentId: $commentId, userId: $userId, userRole: $userRole) {
      id
      isPinned
    }
  }
`;

const UNPIN_COMMENT = gql`
  mutation UnpinComment($commentId: ID!, $userId: String!, $userRole: String!) {
    unpinComment(commentId: $commentId, userId: $userId, userRole: $userRole) {
      id
      isPinned
    }
  }
`;

interface Reaction {
  emoji: string;
  reaction: {
    count: number;
  };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isPinned?: boolean;
  replies?: Comment[];
  reactions?: Reaction[];
  repliesCount?: number;
}

interface CommentsProps {
  sessionId: string;
}

export function Comments({ sessionId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<
    "comment" | "reply" | "edit" | null
  >(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { userDetails } = useSelector((state: any) => state.ar);
  const [repliesMap, setRepliesMap] = useState<{ [key: string]: Comment[] }>(
    {},
  );
     const ROLE_TRAINER = userDetails?.roles?.some(
    (role: string) => role.toUpperCase() === "ROLE_TRAINER",
  );


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchComments();
    }
  }, [sessionId]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    // After 24 hours → show full date & time
    return past.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchComments = async () => {
    if (!sessionId) return;
    try {
      const { data } = await sessionClient.query({
        query: GET_COMMENTS_BY_SESSION,
        variables: {
          sessionId,
          sort: "NEW",
        },
        fetchPolicy: "network-only",
      });

      const items = data.getCommentsBySession.items || [];
      const mappedComments = items.map((item: any) => ({
        id: item.id,
        userId: item.userId || "",
        userName: item.username,
        userAvatar:
          item.userAvatar ||
          "https://api.dicebear.com/9.x/notionists/svg?seed=default",
        content: item.content,
        timestamp: item.createdAt,
        likes: 0,
        isPinned: item.isPinned || false,
        reactions: item.reactions || [],
        repliesCount: item.repliesCount || 0,
      }));
      setComments(mappedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSendComment = async () => {
    if (newComment.trim() && sessionId) {
      const username = userDetails?.name || "User";

      try {
        const { data } = await sessionClient.mutate({
          mutation: CREATE_COMMENT,
          variables: {
            input: {
              sessionId,
              content: newComment,
              userId: userDetails?.id,
              username,
              userType: "LEARNER",
              userAvatar:
                userDetails?.avatar ||
                "https://api.dicebear.com/9.x/notionists/svg?seed=default",
              mentions: [],
              attachments: [],
            },
          },
        });

        await fetchComments();
        setNewComment("");
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    }
  };

  const handleReply = async (commentId: string, commentUserName: string) => {
    if (replyContent.trim() && sessionId) {
      const username = userDetails?.name || "User";
      const contentWithMention = `@${commentUserName} ${replyContent}`;

      try {
        await sessionClient.mutate({
          mutation: REPLY_COMMENT,
          variables: {
            input: {
              sessionId,
              parentCommentId: commentId,
              content: contentWithMention,
              userId: userDetails?.id,
              username,
              userType: "LEARNER",
              userAvatar:
                userDetails?.avatar ||
                "https://api.dicebear.com/9.x/notionists/svg?seed=default",
            },
          },
        });

        await fetchComments();
        await fetchReplies(commentId);
        setReplyContent("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Error replying to comment:", error);
      }
    }
  };

  const fetchReplies = async (parentId: string) => {
    try {
      const { data } = await sessionClient.query({
        query: GET_REPLIED_COMMENTS,
        variables: { parentId },
        fetchPolicy: "network-only",
      });
      const replies = data.GetRepliedcommentByParentID || [];
      const mappedReplies = replies.map((item: any) => ({
        id: item.id,
        userId: item.userId || "",
        userName: item.username,
        userAvatar:
          item.userAvatar ||
          "https://api.dicebear.com/9.x/notionists/svg?seed=default",
        content: item.content,
        timestamp: item.createdAt,
        likes: 0,
        isPinned: false,
        reactions: item.reactions || [],
      }));
      setRepliesMap((prev) => ({ ...prev, [parentId]: mappedReplies }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (editContent.trim()) {
      try {
        await sessionClient.mutate({
          mutation: EDIT_COMMENT,
          variables: {
            input: {
              commentId,
              userId: userDetails?.id,
              content: editContent,
            },
          },
        });
        await fetchComments();
        setEditingId(null);
        setEditContent("");
      } catch (error) {
        console.error("Error editing comment:", error);
      }
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await sessionClient.mutate({
        mutation: DELETE_COMMENT,
        variables: {
          commentId,
          userId: userDetails?.id,
          userRole: "LEARNER",
          reason: "User deleted",
        },
      });
      await fetchComments();
      setMenuOpen(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReact = async (
    commentId: string,
    reactionType: string = "LIKE",
    parentId?: string,
  ) => {
    try {
      await sessionClient.mutate({
        mutation: REACT_TO_COMMENT,
        variables: {
          commentId,
          userId: userDetails?.id,
          reactionType,
        },
      });
      await fetchComments();
      if (parentId) {
        await fetchReplies(parentId);
      }
    } catch (error) {
      console.error("Error reacting to comment:", error);
    }
  };

  const handleEmojiSelect = (
    emoji: any,
    type: "comment" | "reply" | "edit",
  ) => {
    if (type === "comment") {
      setNewComment((prev) => prev + emoji.native);
    } else if (type === "reply") {
      setReplyContent((prev) => prev + emoji.native);
    } else {
      setEditContent((prev) => prev + emoji.native);
    }
    setShowEmojiPicker(null);
  };

  const handlePin = async (commentId: string, isPinned: boolean) => {
    const userRole = userDetails?.roles?.includes("ROLE_ADMIN")
      ? "admin"
      : userDetails?.roles?.includes("ROLE_MENTOR")
        ? "mentor"
        : "learner";
    try {
      await sessionClient.mutate({
        mutation: isPinned ? UNPIN_COMMENT : PIN_COMMENT,
        variables: {
          commentId,
          userId: userDetails?.id,
          userRole,
        },
      });
      await fetchComments();
      setMenuOpen(null);
    } catch (error) {
      console.error("Error pinning/unpinning comment:", error);
    }
  };

  const isAdmin = userDetails?.roles?.includes("ROLE_ADMIN");

  return (
    <div className="my-8 ">
      <div className="mb-6">
        <div className="flex gap-2">
          <img
            src={
              userDetails?.avatar ||
              "https://api.dicebear.com/9.x/notionists/svg?seed=default"
            }
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 flex gap-2 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm border-b border-gray-300 focus:outline-none focus:border-[#00BF53]"
            />
            <button
              onClick={() =>
                setShowEmojiPicker(
                  showEmojiPicker === "comment" ? null : "comment",
                )
              }
              className="px-2 text-gray-600 hover:text-[#00BF53] transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendComment}
              className="px-3 bg-[#00BF53] text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
            {showEmojiPicker === "comment" && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) =>
                    handleEmojiSelect(emoji, "comment")
                  }
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.userName}
                  </span>
                  {ROLE_TRAINER && (
  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">
    Trainer
  </span>
)}
                  {comment.isPinned && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                {(comment.userId === userDetails?.id || isAdmin) && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === comment.id ? null : comment.id)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    {menuOpen === comment.id && (
                      <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10">
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handlePin(comment.id, comment.isPinned || false)
                            }
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                          >
                            {comment.isPinned ? "Unpin" : "Pin"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                            setMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="mb-2 relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border-b border-gray-300 focus:outline-none focus:border-[#00BF53]"
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        setShowEmojiPicker(
                          showEmojiPicker === "edit" ? null : "edit",
                        )
                      }
                      className="px-2 text-gray-600 hover:text-[#00BF53] transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  {showEmojiPicker === "edit" && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full right-0 mb-2 z-50"
                    >
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) =>
                          handleEmojiSelect(emoji, "edit")
                        }
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 mb-4 mt-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="text-sm text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim()}
                      className="text-sm font-medium disabled:text-gray-400 text-[#00BF53] disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {comment.content}
                </p>
              )}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleReact(comment.id, "LIKE")}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#00BF53] transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>
                    {comment.reactions?.find((r) => r.emoji === "LIKE")
                      ?.reaction.count ?? 0}
                  </span>
                </button>
                <button
                  onClick={() => handleReact(comment.id, "DISLIKE")}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition-colors"
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>
                    {comment.reactions?.find((r) => r.emoji === "DISLIKE")
                      ?.reaction.count ?? 0}
                  </span>
                </button>

                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-gray-600 hover:text-[#00BF53] transition-colors"
                >
                  Reply
                </button>
                {repliesMap[comment.id] &&
                  repliesMap[comment.id].length > 0 && (
                    <button
                      onClick={() =>
                        setRepliesMap((prev) => ({ ...prev, [comment.id]: [] }))
                      }
                      className="text-xs text-gray-600 hover:text-[#00BF53] transition-colors"
                    >
                      Hide {repliesMap[comment.id].length}{" "}
                      {repliesMap[comment.id].length === 1
                        ? "reply"
                        : "replies"}
                    </button>
                  )}
                {(!repliesMap[comment.id] ||
                  repliesMap[comment.id].length === 0) &&
                  (comment.repliesCount ?? 0) > 0 && (
                    <button
                      onClick={() => fetchReplies(comment.id)}
                      className="text-xs text-gray-600 hover:text-[#00BF53] transition-colors"
                    >
                      View {comment.repliesCount}{" "}
                      {comment.repliesCount === 1 ? "reply" : "replies"}
                    </button>
                  )}
              </div>
              {/* {comment.reactions && comment.reactions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {comment.reactions.map((reaction) => (
                    <span
                      key={reaction.emoji}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      <span>
                        {reaction.emoji === "LIKE" ? "👍" : reaction.emoji}
                      </span>
                      <span className="text-gray-600">
                        {reaction.reaction.count}
                      </span>
                    </span>
                  ))}
                </div>
              )} */}
              {repliesMap[comment.id] && repliesMap[comment.id].length > 0 && (
                <div className="mt-4 ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
                  {repliesMap[comment.id].map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <img
                        src={reply.userAvatar}
                        alt={reply.userName}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs text-gray-900">
                            {reply.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            onClick={() =>
                              handleReact(reply.id, "LIKE", comment.id)
                            }
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#00BF53] transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>
                              {reply.reactions?.find((r) => r.emoji === "LIKE")
                                ?.reaction.count ?? 0}
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleReact(reply.id, "DISLIKE", comment.id)
                            }
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>
                              {reply.reactions?.find(
                                (r) => r.emoji === "DISLIKE",
                              )?.reaction.count ?? 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {replyingTo === comment.id && (
                <div className="mt-3 relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        replyContent.trim() &&
                        handleReply(comment.id, comment.userName)
                      }
                      placeholder={`Way to go @${comment.userName}`}
                      className="flex-1 px-3 py-2 text-sm border-b border-gray-300 focus:outline-none focus:border-[#00BF53]"
                      autoFocus
                    />
                    <button
                      onClick={() =>
                        setShowEmojiPicker(
                          showEmojiPicker === "reply" ? null : "reply",
                        )
                      }
                      className="px-2 text-gray-600 hover:text-[#00BF53] transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  {showEmojiPicker === "reply" && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full right-0 mb-2 z-50"
                    >
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) =>
                          handleEmojiSelect(emoji, "reply")
                        }
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 my-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="text-sm text-gray-900 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(comment.id, comment.userName)}
                      disabled={!replyContent.trim()}
                      className="text-sm font-medium disabled:text-gray-400 text-[#00BF53] disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
