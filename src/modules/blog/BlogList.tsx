import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { blogApi } from "../../services/blogApi";
import { LoadingSpinner } from "../../components/ui";
import { FileText, Mail, Calendar, Users, Plus } from "lucide-react";

export default function BlogList() {
  const navigate = useNavigate();
  const location = useLocation();
  const userDetails = useSelector((state: any) => state.ar.userDetails);
  const isAdmin = userDetails?.roles?.includes("ROLE_ADMIN");

  const initSection =
    new URLSearchParams(location.search).get("section") === "newsletter"
      ? "newsletter"
      : "blog";
  const [section, setSection] = useState<"blog" | "newsletter">(initSection);

  const [blogs, setBlogs] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Tech",
    "Notion HQ",
    "For Teams",
    "Mall",
    "Inspiration",
    "Pioneers",
    "First Block",
  ];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (section === "blog") {
          const data = await blogApi.getAllBlogs();
          setBlogs(data || []);
        } else {
          const data = await blogApi.getAllNewsletters();
          setNewsletters(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [section]);

  const displayedBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b: any) => b.category === selectedCategory);

  return (
    <div className="flex w-full h-full bg-white overflow-hidden max-w-[1200px] mx-auto">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00BF53] mb-1">
                {section === "blog" ? "Our Blog" : "Newsletter"}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {section === "blog" ? "Latest Articles" : "Sent Newsletters"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {section === "blog"
                  ? "Stories, ideas and insights from our team."
                  : "All newsletters sent to subscribers via email & SMS."}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate("/blog/create")}
                className="bg-[#00BF53] text-white px-5 py-2 rounded-md text-xs font-medium hover:bg-[#00a847] border border-[#00BF53] transition-colors shadow-lg shrink-0 flex items-center gap-2"
              >
                <Plus className="w-4 h-4"/> New Blog
              </button>
            )}
          </div>

          {/* Category pills — blog only */}
          {section === "blog" && (
            <div className="flex flex-wrap gap-2 mt-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#00BF53] text-white border-[#00BF53]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#00BF53] hover:text-[#00BF53]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 pb-24">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            /* Blog Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedBlogs.length === 0 && (
                <p className="text-gray-400 col-span-3 text-sm">
                  No blogs found in this category.
                </p>
              )}
              {displayedBlogs.map((blog: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col cursor-pointer group bg-white overflow-hidden"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  <div className="h-[280px] w-full overflow-hidden bg-gray-100 rounded-2xl">
                    <img
                      src={blog.bannerImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="py-4 flex flex-col flex-1">
                    <span className="inline-block self-start py-0.5 rounded-full text-xs font-medium text-[#00BF53] mb-2">
                      {blog.category}
                    </span>
                    <h3 className="text-sm font-bold mb-2 text-gray-900 group-hover:text-[#00BF53] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                      {blog.content?.replace(/<[^>]*>/g, "").substring(0, 70) +
                        "..."}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      {blog.authorImage ? (
                        <img
                          src={blog.authorImage}
                          alt={blog.authorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {blog.authorName?.charAt(0) || "A"}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs text-black-500 font-bold">
                          {blog.authorName || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {blog.authorRole || "Unknown"}
                        </span>
                      </div>
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
