import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { createChapter, updateChapter, fetchChapterById, clearCurrentChapter } from '../../../features/chapterSlice';
import { ChapterInput } from '../../../types/chapter';
import TextField from '@mui/material/TextField';
import { ArrowLeft, Pencil, Trash, GripVertical, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchMLBySearch, resetList } from '../../../features/microlearning/mlSlice';
import { Autocomplete, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ChapterForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentChapter, loading, error } = useAppSelector((state) => state.chapters);
  const { list: mlList, pagination: mlPagination, loading: mlLoading } = useAppSelector((state) => state.ml);
  const [mlSearch, setMlSearch] = useState('');
  const [mlPage, setMlPage] = useState(0);
  const listboxRef = useRef<HTMLUListElement>(null);
  
  const [formData, setFormData] = useState<ChapterInput>({
    chapterTitle: '',
    chapterDescription: '',
    microLearn: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ChapterInput | null>(null);
  const [selectedMLData, setSelectedMLData] = useState<any[]>([]);

  const isViewMode = Boolean(id) && !location.pathname.includes('/create');
  const hasExistingChapter = Boolean(id);
  const isFormReadOnly = isViewMode && !isInlineEditEnabled;

  useEffect(() => {
    if (id) {
      dispatch(fetchChapterById(id));
    } else {
      dispatch(clearCurrentChapter());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentChapter && id) {
      // Extract microlearn IDs and data from the microLearn array
      const microLearnIds = Array.isArray(currentChapter.microLearn)
        ? currentChapter.microLearn.map((ml: any) => ml.microlearnId).filter(Boolean)
        : [];
      
      const microLearnData = Array.isArray(currentChapter.microLearn)
        ? currentChapter.microLearn.map((ml: any) => ({
            id: ml.microlearnId,
            microLearnId: ml.microlearnId,
            microLearnTitle: ml.microLearnTitle,
            ...ml
          }))
        : [];
      
      const hydratedData = {
        chapterTitle: currentChapter.chapterTitle || '',
        chapterDescription: currentChapter.chapterDescription || '',
        microLearn: microLearnIds,
      };
      setFormData(hydratedData);
      setInitialFormData(hydratedData);
      setSelectedMLData(microLearnData);
      
      // Fetch ML data for the selected IDs if any
      if (microLearnIds.length > 0) {
        dispatch(resetList());
        dispatch(fetchMLBySearch({ page: 0, limit: 50, search: '' }));
      }
    }
  }, [currentChapter, id, dispatch]);

  useEffect(() => {
    setIsInlineEditEnabled(false);
  }, [isViewMode, id]);

  useEffect(() => {
    if (!id) {
      dispatch(resetList());
      dispatch(fetchMLBySearch({ page: 0, limit: 10, search: mlSearch }));
    } else if (mlSearch) {
      dispatch(fetchMLBySearch({ page: 0, limit: 10, search: mlSearch }));
    }
  }, [dispatch, mlSearch, id]);

  const handleMLScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget as HTMLUListElement;
    const position = listboxNode.scrollTop + listboxNode.clientHeight;
    if (listboxNode.scrollHeight - position <= 1 && mlPagination.hasMore && !mlLoading) {
      const nextPage = mlPage + 1;
      setMlPage(nextPage);
      dispatch(fetchMLBySearch({ page: nextPage, limit: 10, search: mlSearch }));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = formData.microLearn || [];
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    handleInputChange('microLearn', arrayMove(items, oldIndex, newIndex));
  };

  const handleRemoveML = (mlId: string) => {
    handleInputChange(
      'microLearn',
      formData.microLearn?.filter((id) => id !== mlId) || []
    );
  };

  const getSelectedMLData = () => {
    return (formData.microLearn || []).map((id) => {
      const fromList = mlList.find((ml) => (ml.id || ml.microLearnId) === id);
      const fromSelected = selectedMLData.find((ml) => (ml.id || ml.microLearnId) === id);
      return fromList || fromSelected;
    }).filter(Boolean);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.chapterTitle.trim()) {
      errors.chapterTitle = 'Chapter title is required';
    }

    if (!formData.chapterDescription.trim()) {
      errors.chapterDescription = 'Chapter description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ChapterInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (id) {
        const hasChanges = initialFormData
          ? JSON.stringify(initialFormData) !== JSON.stringify(formData)
          : true;
        if (!hasChanges) {
          navigate('/admin/chapters');
          return;
        }
        await dispatch(updateChapter({ id, input: formData })).unwrap();
        await dispatch(fetchChapterById(id));
        toast.success('Chapter updated successfully');
        setInitialFormData({ ...formData });
        setIsInlineEditEnabled(false);
      } else {
        await dispatch(createChapter(formData)).unwrap();
        toast.success('Chapter created successfully');
        navigate('/admin/chapters');
      }
    } catch (error) {
      toast.error(id ? 'Failed to update chapter' : 'Failed to create chapter');
    }
  };

  const handleBack = () => {
    navigate('/admin/chapters');
  };

  const handleEnableEdit = () => {
    if (!id || !isFormReadOnly) {
      return;
    }
    setIsInlineEditEnabled(true);
  };

  const handleResetInlineEdit = () => {
    if (!isInlineEditEnabled) {
      return;
    }
    if (initialFormData) {
      setFormData(initialFormData);
    }
    setValidationErrors({});
    setIsInlineEditEnabled(false);
  };

  const handleDeleteChapter = async () => {
    // Add delete functionality if needed
    console.log('Delete chapter');
  };

  if (id && loading && !currentChapter) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] gap-2 flex items-center font-semibold text-gray-900">
              <span onClick={handleBack} className="cursor-pointer">
                <ArrowLeft />
              </span>
              {isViewMode && !isInlineEditEnabled ? 'View' : isViewMode && isInlineEditEnabled ? 'Edit' : 'Create'} Chapter
            </h1>
          </div>
          {hasExistingChapter && (
            <div className="flex">
              <Button
                className={`gap-2 flex items-center justify-center rounded-lg font-medium border border-r-0 rounded-r-none bg-form-btn text-black-30 border-black-30 hover:text-primary ${
                  isInlineEditEnabled ? 'text-primary' : ''
                }`}
                size="md"
                variant="custom"
                disabled={!hasExistingChapter || !isFormReadOnly}
                onClick={handleEnableEdit}
              >
                <Pencil size={16} />
                Edit
              </Button>
              <Button
                size="md"
                variant="custom"
                className={`gap-2 flex items-center justify-center rounded-lg font-medium border border-l-0 rounded-l-none bg-form-btn text-black-30 border-black-30 hover:text-primary`}
                disabled={!hasExistingChapter || isDeletingChapter}
                onClick={handleDeleteChapter}
              >
                {isDeletingChapter ? (
                  'Deleting...'
                ) : (
                  <>
                    <Trash size={16} />
                    Delete
                  </>
                )}
              </Button>
              {isInlineEditEnabled && (
                <Button
                  className="mx-2 flex text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  size="md"
                  variant="custom"
                  onClick={handleResetInlineEdit}
                >
                  Reset Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white flex flex-col justify-between p-6 rounded-[10px] h-[calc(100vh-200px)] overflow-y-auto">
        <div>
          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            <div className="mb-12">
              <TextField
                fullWidth
                value={formData.chapterTitle}
                onChange={(e) => handleInputChange('chapterTitle', e.target.value)}
                disabled={isFormReadOnly}
                error={!!validationErrors.chapterTitle}
                helperText={validationErrors.chapterTitle}
                variant="standard"
                placeholder="Enter Chapter Title..."
                InputProps={{
                  sx: {
                    fontSize: '30px',
                    fontWeight: '600',
                    borderStyle: 'solid',
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important',
                    },
                    '&:before': {
                      borderBottom: '1px solid black !important',
                    },
                    '&.Mui-disabled:before': {
                      borderBottom: '1px solid black !important',
                    },
                    '&:after': {
                      borderBottom: '1px solid black !important',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            <div>
              <TextField
                fullWidth
                label="Chapter Description"
                value={formData.chapterDescription}
                onChange={(e) => handleInputChange('chapterDescription', e.target.value)}
                disabled={isFormReadOnly}
                error={!!validationErrors.chapterDescription}
                helperText={validationErrors.chapterDescription}
                variant="outlined"
                size="small"
                InputProps={{
                  sx: {
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: 'black !important',
                      WebkitTextFillColor: 'black !important',
                    },
                  },
                }}
              />
            </div>
            <div>
              <Autocomplete
                multiple
                options={mlList}
                getOptionLabel={(option) => option.microLearnTitle || ''}
                value={mlList.filter((ml) => formData.microLearn?.includes(ml.id || ml.microLearnId))}
                onChange={(_, newValue) => {
                  handleInputChange(
                    'microLearn',
                    newValue.map((ml) => ml.id || ml.microLearnId)
                  );
                }}
                onInputChange={(_, value) => {
                  setMlSearch(value);
                  setMlPage(0);
                }}
                disabled={isFormReadOnly}
                loading={mlLoading}
                ListboxProps={{
                  onScroll: handleMLScroll,
                  ref: listboxRef,
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Micro Learning"
                    variant="outlined"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {mlLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      sx: {
                        '& .MuiInputBase-input.Mui-disabled': {
                          color: 'black !important',
                          WebkitTextFillColor: 'black !important',
                        },
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>

          {formData.microLearn && formData.microLearn.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Selected Micro Learning</h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Micro Learn ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Micro Learn Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">File Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext items={formData.microLearn} strategy={verticalListSortingStrategy}>
                        {getSelectedMLData().map((ml, index) => (
                          <SortableRow
                            key={ml?.id || ml?.microLearnId}
                            ml={ml}
                            index={index}
                            isFormReadOnly={isFormReadOnly}
                            onRemove={handleRemoveML}
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </div>
              </DndContext>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={handleBack}
            disabled={loading}
            className="px-6 py-2.5 min-w-[150px] text-[14px] text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 min-w-[150px] text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : id ? 'Update Chapter' : 'Create Chapter'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SortableRow: React.FC<{
  ml: any;
  index: number;
  isFormReadOnly: boolean;
  onRemove: (id: string) => void;
}> = ({ ml, index, isFormReadOnly, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ml?.id || ml?.microLearnId,
    disabled: isFormReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'bg-blue-50 opacity-50' : ''}`}
    >
      <td className="px-4 py-3">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical size={16} className="text-gray-400" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{ml?.microLearnId || ml?.id}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{ml?.microLearnTitle}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{ml?.shortDescrpition || '-'}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {ml?.trainingDocs?.length || ml?.training_docs?.length || 0}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onRemove(ml?.id || ml?.microLearnId || '')}
          disabled={isFormReadOnly}
          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={18} />
        </button>
      </td>
    </tr>
  );
};

export default ChapterForm;