import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogApi } from '../../services/blogApi';
import { toast } from 'react-toastify';
import { CloudUpload, ArrowLeft, Eye, X, Video, FileText } from 'lucide-react';

export default function CreateBlog() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingAuthor, setUploadingAuthor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [bannerPreview, setBannerPreview] = useState('');
    const [authorPreview, setAuthorPreview] = useState('');
    const quillRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        authorName: '',
        authorRole: '',
        authorImage: '',
        bannerImage: '',
        content: '',
        category: 'Tech'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerPreview(URL.createObjectURL(file));
        try {
            setUploadingBanner(true);
            const { blobUrl, objectUrl } = await blogApi.uploadImage(file);
            setBannerPreview(objectUrl);
            setFormData(prev => ({ ...prev, bannerImage: blobUrl }));
            toast.success('Banner uploaded!');
        } catch {
            toast.error('Failed to upload banner.');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleAuthorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAuthorPreview(URL.createObjectURL(file));
        try {
            setUploadingAuthor(true);
            const { blobUrl, objectUrl } = await blogApi.uploadImage(file);
            setAuthorPreview(objectUrl);
            setFormData(prev => ({ ...prev, authorImage: blobUrl }));
            toast.success('Author image uploaded!');
        } catch {
            toast.error('Failed to upload author image.');
        } finally {
            setUploadingAuthor(false);
        }
    };

    const [videoModal, setVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const videoRangeRef = useRef<number>(0);

    const handleQuillImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file || !quillRef.current) return;
            const quill = (quillRef.current as any).getEditor();
            const range = quill.getSelection(true);
            const insertIndex = range ? range.index : quill.getLength();
            quill.insertText(insertIndex, '⏳ Uploading...', 'user');
            try {
                const { blobUrl } = await blogApi.uploadImage(file);
                quill.deleteText(insertIndex, '⏳ Uploading...'.length);
                quill.insertEmbed(insertIndex, 'image', blobUrl, 'user');
                quill.setSelection(insertIndex + 1, 0);
                handleContentChange(quill.root.innerHTML);
            } catch {
                quill.deleteText(insertIndex, '⏳ Uploading...'.length);
                toast.error('Failed to upload image.');
            }
        };
        input.click();
    }, []);

    const handleQuillVideoClick = useCallback(() => {
        if (!quillRef.current) return;
        const quill = (quillRef.current as any).getEditor();
        videoRangeRef.current = quill.getSelection(true)?.index ?? 0;
        setVideoUrl('');
        setVideoModal(true);
    }, []);

    const insertVideoUrl = () => {
        if (!videoUrl.trim() || !quillRef.current) return;
        const quill = (quillRef.current as any).getEditor();
        quill.insertEmbed(videoRangeRef.current, 'video', videoUrl.trim());
        handleContentChange(quill.root.innerHTML);
        setVideoModal(false);
    };

    const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !quillRef.current) return;
        setVideoModal(false);
        const quill = (quillRef.current as any).getEditor();
        const insertIndex = videoRangeRef.current;
        quill.insertText(insertIndex, '⏳ Uploading video...', 'user');
        try {
            setUploadingVideo(true);
            const { blobUrl } = await blogApi.uploadVideo(file);
            quill.deleteText(insertIndex, '⏳ Uploading video...'.length);
            quill.insertEmbed(insertIndex, 'video', blobUrl, 'user');
            quill.setSelection(insertIndex + 1, 0);
            handleContentChange(quill.root.innerHTML);
            toast.success('Video uploaded!');
        } catch {
            quill.deleteText(insertIndex, '⏳ Uploading video...'.length);
            toast.error('Failed to upload video.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.authorName || !formData.content || !formData.bannerImage) {
            toast.error('Please fill in all required fields.');
            return;
        }
        try {
            setLoading(true);
            await blogApi.createBlog(formData);
            toast.success('Blog published successfully!');
            navigate('/blog');
        } catch {
            toast.error('Failed to publish blog.');
        } finally {
            setLoading(false);
        }
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: '#quill-toolbar',
            handlers: { image: handleQuillImageUpload, video: handleQuillVideoClick }
        },
    }), [handleQuillImageUpload, handleQuillVideoClick]);

    const ImageUploadBox = ({ label, url, uploading, onChange, required }: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl relative hover:bg-gray-50 transition-colors group cursor-pointer h-[160px]">
                {url ? (
                    <div className="absolute inset-0 w-full h-full p-2">
                        <img src={url} alt={label} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">Click to change</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <CloudUpload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload or drag & drop</p>
                    </div>
                )}
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onChange} accept="image/*" />
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BF53]" />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto pt-8 pb-28 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate('/blog')} className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Blog Post</h1>
                            <p className="text-gray-500 mt-1 text-sm">Publish a new article to the platform.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                    {/* Row 1: title + banner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter an engaging title..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BF53] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BF53] outline-none transition-all bg-white"
                                >
                                    {['Tech', 'Notion HQ', 'For Teams', 'Mall', 'Inspiration', 'Pioneers', 'First Block'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <ImageUploadBox label="Banner Image" url={bannerPreview} uploading={uploadingBanner} onChange={handleBannerUpload} required />
                    </div>

                    {/* Row 2: author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                                <input
                                    type="text"
                                    name="authorName"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BF53] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Role *</label>
                                <input
                                    type="text"
                                    name="authorRole"
                                    value={formData.authorRole}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Developer"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00BF53] outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Profile Image</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                                        {authorPreview
                                            ? <img src={authorPreview} alt="Author" className="w-full h-full object-cover" />
                                            : <span className="text-gray-400 text-xs">Photo</span>
                                        }
                                    </div>
                                    <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        {uploadingAuthor
                                            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00BF53]" />
                                            : <CloudUpload className="w-4 h-4" />
                                        }
                                        Upload
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAuthorImageUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blog Content *</label>
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                            <div id="quill-toolbar">
                                <span className="ql-formats">
                                    <select className="ql-header" title="Heading">
                                        <option value="1">H1</option>
                                        <option value="2">H2</option>
                                        <option value="3">H3</option>
                                        <option value="4">H4</option>
                                        <option value="5">H5</option>
                                        <option value="6">H6</option>
                                        <option value="">Normal</option>
                                    </select>
                                </span>
                                <span className="ql-formats">
                                    <button className="ql-bold" title="Bold" />
                                    <button className="ql-italic" title="Italic" />
                                    <button className="ql-underline" title="Underline" />
                                    <button className="ql-strike" title="Strikethrough" />
                                </span>
                                <span className="ql-formats">
                                    <button className="ql-list" value="ordered" title="Ordered List" />
                                    <button className="ql-list" value="bullet" title="Bullet List" />
                                </span>
                                <span className="ql-formats">
                                    <button className="ql-link" title="Insert Link" />
                                    <button className="ql-image" title="Upload Image" />
                                    <button className="ql-video" title="Insert / Upload Video" />
                                </span>
                                <span className="ql-formats">
                                    <select className="ql-align" title="Text Align" />
                                </span>
                                <span className="ql-formats">
                                    <button className="ql-clean" title="Remove Formatting" />
                                </span>
                            </div>
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={formData.content}
                                onChange={handleContentChange}
                                modules={modules}
                                className="h-[400px]"
                                placeholder="Start writing your amazing story..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-10">
                        <button
                            type="button"
                            onClick={() => navigate('/blog')}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploadingBanner || uploadingAuthor}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-[#00BF53] rounded-lg hover:bg-[#00a847] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading
                                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Publishing...</>
                                : <><FileText className="w-4 h-4" /> Publish Blog</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* Video Modal */}
            {videoModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Video className="w-5 h-5 text-[#00BF53]" /> Insert Video
                            </h3>
                            <button type="button" onClick={() => setVideoModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paste Video URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                        placeholder="https://youtube.com/..."
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00BF53] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={insertVideoUrl}
                                        disabled={!videoUrl.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#00BF53] rounded-lg hover:bg-[#00a847] disabled:opacity-50"
                                    >
                                        Insert
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400">or</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-colors relative">
                                {uploadingVideo
                                    ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BF53]" />
                                    : <>
                                        <CloudUpload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">Upload video file</span>
                                        <span className="text-xs text-gray-400">MP4, WebM, OGG</span>
                                    </>
                                }
                                <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleVideoFileUpload} disabled={uploadingVideo} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative">
                        <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="p-8 pb-16">
                            {bannerPreview && (
                                <img src={bannerPreview} alt="Banner" className="w-full h-[320px] object-cover rounded-2xl mb-8" />
                            )}
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6faf0] text-[#00BF53] mb-3">
                                {formData.category || 'Tech'}
                            </span>
                            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-6">{formData.title || 'Untitled'}</h1>
                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                                {authorPreview
                                    ? <img src={authorPreview} alt={formData.authorName} className="w-10 h-10 rounded-full object-cover" />
                                    : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{formData.authorName?.charAt(0) || 'A'}</div>
                                }
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{formData.authorName || 'Author'}</p>
                                    <p className="text-xs text-gray-500">{formData.authorRole || 'Role'}</p>
                                </div>
                            </div>
                            <div
                                className="prose prose-lg max-w-none text-gray-800 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4"
                                dangerouslySetInnerHTML={{ __html: formData.content }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
