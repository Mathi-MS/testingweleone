import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { blogApi } from '../../services/blogApi';
import { LoadingSpinner } from '../../components/ui';

export default function BlogDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        blogApi.getBlogById(id)
            .then(setBlog)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;
    if (!blog) return <div className="flex items-center justify-center h-full text-gray-500">Blog not found.</div>;

    return (
        <div className="flex flex-col w-full h-full bg-white overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto pt-8 pb-32 px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Back to Blogs
                </button>

                {blog.bannerImage && (
                    <img src={blog.bannerImage} alt={blog.title} className="w-full h-[360px] object-cover rounded-2xl mb-8" />
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>{blog.category || 'Tech'}</span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-6">{blog.title}</h1>

                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                    {blog.authorImage ? (
                        <img src={blog.authorImage} alt={blog.authorName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                            {blog.authorName?.charAt(0) || 'A'}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-gray-900">{blog.authorName || 'Unknown Author'}</p>
                        <p className="text-xs text-gray-500">{blog.authorRole || 'Author'}</p>
                    </div>
                </div>

                <div
                    className="prose prose-lg max-w-none text-gray-800 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </div>
        </div>
    );
}
