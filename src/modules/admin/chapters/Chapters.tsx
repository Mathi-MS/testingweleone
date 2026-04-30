import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Chapter } from '../../../types/chapter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterSVG } from '../../../assets/svg';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { fetchAllChapters } from '../../../features/chapterSlice';

const Chapters: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    selectedCourses: [],
    selectedBooks: [],
    selectedMicroLearnings: [],
  });

  const dispatch = useAppDispatch();
  const { chapters, loading, error } = useAppSelector((state) => state.chapters);

  useEffect(() => {
    dispatch(fetchAllChapters({ page: 0, size: 10, searchtext: searchTerm}));
  }, [dispatch, searchTerm]);

  const courses = [{ id: '1', name: 'Course' }];
  const books = [{ id: '1', name: 'BK001' }, { id: '2', name: 'BK002' }];
  const microLearnings = [{ id: '1', name: 'ML001' }, { id: '2', name: 'ML002' }];

  const filteredChapters = chapters;

  const columns = [
    {
      key: 'chapterId',
      title: 'Chapter ID',
      width: '150px',
      sortable: true,
    },
    {
      key: 'chapterTitle',
      title: 'Chapter Title',
      width: '250px',
      sortable: true,
      render: (value: string, row: Chapter) => (
        <button
          onClick={() => navigate(`/admin/chapters/${row.id}`)}
          className="hover:text-blue-800 underline text-left"
        >
          {value}
        </button>
      )
    },
    {
      key: 'microLearnings',
      title: 'Micro Learnings',
      width: '200px',
      render: () => 'HTML,CSS, React +2 more...',
    },
    {
      key: 'chapterDescription',
      title: 'Short Description',
      width: '250px',
    },
  ];

  const renderCheckboxFilter = (title: string, items: any[], selectedKey: string) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-dark-gray">{title} ({items.length})</h3>
        <div className='flex items-center'>
          <label className="text-sm cursor-pointer mr-2 text-dark-gray">Select all</label>
          <input type='checkbox' className='cursor-pointer' />
        </div>
      </div>
      <div className="space-y-2">
        {items.slice(0, 4).map((item) => (
          <label key={item.id} className="flex items-center">
            <input type="checkbox" className="mr-2 rounded" />
            <span className="text-sm text-dark-gray">{item.name}</span>
          </label>
        ))}
        {items.length > 4 && (
          <button className="text-sm text-primary flex justify-end w-full">
            view all
          </button>
        )}
      </div>
    </div>
  );

  const appliedFiltersCount = searchTerm ? 1 : 0;
  const hasAppliedFilters = appliedFiltersCount > 0;

  return (
    <div className="p-4">
      <div className="flex items-center mb-6 gap-2">
        <div className='flex gap-2 max-w-[250px] w-full'>
          <button
            className="flex bg-white items-center gap-2 text-primary border border-border rounded-md px-3 py-2 text-sm"
            onClick={() => setIsFilterCollapsed(prev => !prev)}
          >
            <FilterSVG />
            {isFilterCollapsed ? <ChevronRight size={16} className='text-dark-gray' /> : <ChevronLeft size={16} className='text-dark-gray'/>}
          </button>
          <h1 className="text-[20px] font-semibold text-dark-gray">Chapters</h1>
        </div>
        <div className="flex gap-3 justify-between flex-1">
          <div className="bg-white rounded-lg shadow-sm flex w-[350px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-w-[350px] h-full pl-4 pr-10 py-1 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="absolute right-3 top-[10px]">
                <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7678 16.4891L14.427 13.1752C15.7238 11.5583 16.3518 9.50594 16.1819 7.44018C16.012 5.37442 15.057 3.45226 13.5134 2.06896C11.9698 0.685653 9.95486 -0.0536608 7.88289 0.00303558C5.81093 0.0597319 3.83943 0.908129 2.37378 2.37378C0.908129 3.83943 0.059732 5.81093 0.00303558 7.88289C-0.0536608 9.95486 0.685653 11.9698 2.06896 13.5134C3.45226 15.057 5.37442 16.012 7.44018 16.1819C9.50595 16.3518 11.5583 15.7238 13.1752 14.427L16.4891 17.7408C16.5728 17.8252 16.6724 17.8922 16.7822 17.9379C16.8919 17.9837 17.0096 18.0072 17.1285 18.0072C17.2474 18.0072 17.3651 17.9837 17.4748 17.9379C17.5845 17.8922 17.6841 17.8252 17.7678 17.7408C17.9301 17.5729 18.0209 17.3485 18.0209 17.115C18.0209 16.8814 17.9301 16.657 17.7678 16.4891ZM8.1234 14.427C6.87667 14.427 5.65794 14.0573 4.62133 13.3646C3.58471 12.672 2.77677 11.6875 2.29967 10.5357C1.82257 9.38384 1.69773 8.1164 1.94096 6.89363C2.18418 5.67086 2.78454 4.54768 3.66611 3.66611C4.54768 2.78454 5.67086 2.18418 6.89363 1.94096C8.1164 1.69773 9.38384 1.82257 10.5357 2.29967C11.6875 2.77677 12.672 3.58471 13.3646 4.62133C14.0573 5.65794 14.427 6.87667 14.427 8.1234C14.427 9.7952 13.7628 11.3985 12.5807 12.5807C11.3985 13.7628 9.7952 14.427 8.1234 14.427Z" fill="black" fillOpacity="0.8" />
                </svg>
              </div>
            </div>
          </div>
          <div className='flex gap-4'>
            <div className="flex items-end">
              <div className='border border-black-30 bg-form-btn p-2 py-1.5 mx-3 rounded-[12px]'>
                <span className="text-xs text-text-gray mb-1">1 - {filteredChapters.length} of {chapters.length}</span>
              </div>
              <Button
                variant='primary'
                size='sm'
                className="text-white min-w-[150px] text-center"
                onClick={() => navigate('/admin/chapters/create')}
              >
                <span className='font-thin text-xl mr-2'>+</span> Create Chapter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isFilterCollapsed && (
          <div className="max-w-[250px] w-full space-y-2 max-h-[calc(100vh-175px)] overflow-y-auto">
            {hasAppliedFilters && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-dark-gray">Applied Filters</h3>
                  <span className="text-sm text-accent">{filteredChapters.length} item{filteredChapters.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            )}
            {renderCheckboxFilter('Course', courses, 'selectedCourses')}
            {renderCheckboxFilter('Books', books, 'selectedBooks')}
            {renderCheckboxFilter('Micro Learnings', microLearnings, 'selectedMicroLearnings')}
          </div>
        )}

        <div className="flex-1">
          <Table
            data={filteredChapters}
            columns={columns}
            TableWidth={isFilterCollapsed ? '10' : '290'}
            rowSelection={false}
            selectedRows={selectedItems}
            onSelectionChange={setSelectedItems}
            rowKey="id"
            loading={loading}
            emptyMessage="No chapters found"
          />
        </div>
      </div>
    </div>
  );
};

export default Chapters;