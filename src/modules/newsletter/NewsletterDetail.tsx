import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users } from "lucide-react";

export default function NewsletterDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const nl = state?.newsletter;

  if (!nl)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Newsletter not found.
      </div>
    );

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto pt-8 pb-32 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/newsletter")}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Newsletters
        </button>

        {nl.bannerImage && (
          <img
            src={nl.bannerImage}
            alt={nl.title}
            className="w-full h-[360px] object-cover rounded-2xl mb-8"
          />
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            Newsletter
          </span>
          {nl.category && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#e6faf0] text-[#00BF53]">
              {nl.category}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">{nl.title}</h1>

        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
          {nl.authorImage ? (
            <img
              src={nl.authorImage}
              alt={nl.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {nl.authorName?.charAt(0) || "A"}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {nl.authorName || "Unknown Author"}
            </p>
            <p className="text-xs text-gray-500">{nl.authorRole || "Author"}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {nl.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(nl.createdAt).toLocaleDateString()}
              </span>
            )}
            {nl.sentCount != null && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {nl.sentCount} sent
              </span>
            )}
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none text-gray-800 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4"
          dangerouslySetInnerHTML={{ __html: nl.content }}
        />
      </div>
    </div>
  );
}
