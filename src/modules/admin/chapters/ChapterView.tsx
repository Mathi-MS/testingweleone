import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchChapterById, clearCurrentChapter } from '../../../features/chapterSlice';

const ChapterView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentChapter, loading, error } = useAppSelector((state) => state.chapters);

  useEffect(() => {
    if (id) {
      dispatch(fetchChapterById(id));
    }
    return () => {
      dispatch(clearCurrentChapter());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-gray-600">Loading chapter details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-dark-gray">Chapter Details</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/chapters/edit/${currentChapter.id}`)}
          >
            Edit Chapter
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/chapters')}
          >
            Back to Chapters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter ID
            </label>
            <div className="text-gray-900">{currentChapter.chapterId}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommended Duration
            </label>
            <div className="text-gray-900">{currentChapter.recomendedDuration} minutes</div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title
            </label>
            <div className="text-gray-900 text-lg font-medium">{currentChapter.chapterTitle}</div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="text-gray-900 whitespace-pre-wrap">{currentChapter.chapterDescription}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created By
            </label>
            <div className="text-gray-900">{currentChapter.createdBy}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Updated By
            </label>
            <div className="text-gray-900">{currentChapter.updatedBy}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created At
            </label>
            <div className="text-gray-900">
              {new Date(currentChapter.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Updated At
            </label>
            <div className="text-gray-900">
              {new Date(currentChapter.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterView;