import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, FormControl, Autocomplete } from '@mui/material';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const ChapterEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [selectedMicroLearnings, setSelectedMicroLearnings] = useState<any[]>([]);

  // Mock data - replace with actual API call
  const chapter = {
    id: id,
    chapterTitle: 'Frontend Basics',
    chapterDescription: 'Testing',
    recomendedDuration: 60,
    microLearnings: [
      { id: 'ML001', title: 'HTML Basics', duration: '18 mins', mlCount: '07' },
      { id: 'ML003', title: 'CSS Basics', duration: '18 mins', mlCount: '07' },
    ]
  };
  const queryLoading = false;
  const updateLoading = false;

  // Available micro learnings
  const availableMicroLearnings = [
    { id: 'ML001', title: 'HTML Basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML003', title: 'CSS Basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML008', title: 'JavaScript Basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML002', title: 'Python basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML010', title: 'React Basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML005', title: 'Php Basics', duration: '18 mins', mlCount: '07' },
    { id: 'ML007', title: 'Angular Basics', duration: '18 mins', mlCount: '07' },
  ];

  useEffect(() => {
    if (chapter) {
      setChapterTitle(chapter.chapterTitle || '');
      setChapterDescription(chapter.chapterDescription || '');
      setSelectedMicroLearnings(chapter.microLearnings || []);
    }
  }, [chapter]);



  const columns = [
    {
      key: 'slNo',
      title: 'SL.NO',
      width: '80px',
      render: (_: any, __: any, index: number) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-4 bg-lite-gray cursor-move"></div>
          {index + 1}
        </div>
      ),
    },
    {
      key: 'id',
      title: 'Micro Learning ID',
      width: '150px',
    },
    {
      key: 'title',
      title: 'Title',
      width: '200px',
      render: (value: string) => (
        <a href="#" className="text-primary hover:underline">{value}</a>
      ),
    },
    {
      key: 'duration',
      title: 'Duration',
      width: '120px',
    },
    {
      key: 'mlCount',
      title: 'ML Count',
      width: '120px',
      render: (value: string) => (
        <span className="flex items-center gap-1">
          <span className="text-xs">📄</span> {value}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_: any, row: any, index: number) => (
        <button 
          className="text-red hover:bg-delete-lite p-1 rounded"
          onClick={() => {
            const newSelected = selectedMicroLearnings.filter((_, i) => i !== index);
            setSelectedMicroLearnings(newSelected);
          }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const handleSave = async () => {
    if (!chapterTitle.trim() || !chapterDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock API call - replace with actual implementation
    toast.success('Chapter updated successfully');
    navigate('/admin/chapters');
  };

  const handleCancel = () => {
    navigate('/admin/chapters');
  };

  const handleResetEdit = () => {
    if (chapter) {
      setChapterTitle(chapter.chapterTitle || '');
      setChapterDescription(chapter.chapterDescription || '');
      setSelectedMicroLearnings(chapter.microLearnings || []);
    }
  };

  if (queryLoading) return <div className="p-4">Loading chapter...</div>;
  if (!chapter) return <div className="p-4">Chapter not found</div>;

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/chapters')}
            className="text-dark-gray hover:text-primary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-dark-gray">Edit Chapter</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetEdit}>
            Reset Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit size={16} />
            Edit
          </Button>
          <Button variant="danger" className="flex items-center gap-2">
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TextField
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '24px',
                  fontWeight: 'normal',
                  '& fieldset': { border: 'none', borderBottom: '2px solid #CED4DA' },
                  '&:hover fieldset': { borderBottom: '2px solid #005AFF' },
                  '&.Mui-focused fieldset': { borderBottom: '2px solid #005AFF' },
                },
              }}
            />
            <Edit size={16} className="text-lite-gray" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">
              Short Description
            </label>
            <TextField
              value={chapterDescription}
              onChange={(e) => setChapterDescription(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-gray mb-2">
              Micro Learning
            </label>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                options={availableMicroLearnings}
                getOptionLabel={(option) => `${option.id} - ${option.title}`}
                value={selectedMicroLearnings}
                onChange={(_, newValue) => setSelectedMicroLearnings(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Type here to select Micro Learning"
                    variant="outlined"
                  />
                )}
              />
            </FormControl>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table
          data={selectedMicroLearnings}
          columns={columns}
          TableWidth={300}
          rowKey="id"
          emptyMessage="No micro learning modules selected"
        />
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={updateLoading}>
          {updateLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default ChapterEdit;