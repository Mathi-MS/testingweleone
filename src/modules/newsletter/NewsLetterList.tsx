import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { blogApi } from "../../services/blogApi";
import { LoadingSpinner } from "../../components/ui";
import { FileText, Mail, Calendar, Users, Plus } from "lucide-react";

export default function NewsLetterList() {
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = useSelector((state: any) => state.ar.userDetails);
  const isAdmin = userDetails?.roles?.includes("ROLE_ADMIN");

  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await blogApi.getAllNewsletters();
        setNewsletters(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="flex w-full h-full bg-white overflow-hidden max-w-[1200px] mx-auto">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00BF53] mb-1">
                Newsletter
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Sent Newsletters
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                All newsletters sent to subscribers via email & SMS.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate("/newsletter/create")}
                className="bg-[#00BF53] text-white px-5 py-2 rounded-md text-xs font-medium hover:bg-[#00a847] border border-[#00BF53] transition-colors shadow-lg shrink-0 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Newsletter
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            /* Newsletter List */
            <div className="flex flex-col gap-4">
              {newsletters.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No newsletters have been sent yet.
                </p>
              )}
              {newsletters.map((nl: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-5 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/newsletter/${nl.id}`, { state: { newsletter: nl } })}
                >
                  {nl.bannerImage && (
                    <div className="w-[120px] h-[80px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={nl.bannerImage}
                        alt={nl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                        Newsletter
                      </span>
                      {nl.category && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6faf0] text-[#00BF53]">
                          {nl.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#00BF53] transition-colors line-clamp-1 mb-1">
                      {nl.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {nl.content?.replace(/<[^>]*>/g, "").substring(0, 120) + "..."}
                    </p>
                    <div className="flex items-center gap-4 mt-auto text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {nl.createdAt
                          ? new Date(nl.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                      {nl.sentCount != null && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {nl.sentCount} sent
                        </span>
                      )}
                      <span className="flex items-center gap-1 ml-auto">
                        by {nl.authorName || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
