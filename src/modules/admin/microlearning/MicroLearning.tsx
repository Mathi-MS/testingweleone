import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table, TableColumn, Button } from "../../../components/ui";
import { Modal } from "../../../components/ui/Modal";
import { FiltersModal } from "../../../components/ui/FiltersModal";
import {
  fetchMLBySearch,
  setFilters,
  resetList,
  deleteML,
  fetchCategories,
} from "../../../features/microlearning/mlSlice";
import {
  Eye,
  Pencil,
  Trash,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RootState, AppDispatch } from "../../../app/store";
import { toast } from "react-toastify";
import { FilterSVG } from "../../../assets/svg";
import type { FilterConfig } from "../../../types/ml";
import { useAppDispatch } from "../../../app/hook";

const LANGUAGES = [
  { id: "en", name: "English" },
  { id: "ta", name: "Tamil" },
  // { id: "hi", name: "Hindi" },
  // { id: "fr", name: "French" },
  // { id: "es", name: "Spanish" },
];

const MOCK_COURSES = [
  { id: "1", name: "Course 1", courseName: "course-1" },
  { id: "2", name: "Course 2", courseName: "course-2" },
  { id: "3", name: "Course 3", courseName: "course-3" },
  { id: "4", name: "Course 4", courseName: "course-4" },
  { id: "5", name: "Course 5", courseName: "course-5" },
  { id: "6", name: "Course 6", courseName: "course-6" },
];

const MOCK_CHAPTERS = [
  { id: "1", name: "Chapter 1", chapterName: "chapter-1" },
  { id: "2", name: "Chapter 2", chapterName: "chapter-2" },
  { id: "3", name: "Chapter 3", chapterName: "chapter-3" },
  { id: "4", name: "Chapter 4", chapterName: "chapter-4" },
  { id: "5", name: "Chapter 5", chapterName: "chapter-5" },
  { id: "6", name: "Chapter 6", chapterName: "chapter-6" },
];

const MOCK_BOOKS = [
  { id: "1", name: "Book 1", bookName: "book-1" },
  { id: "2", name: "Book 2", bookName: "book-2" },
  { id: "3", name: "Book 3", bookName: "book-3" },
  { id: "4", name: "Book 4", bookName: "book-4" },
  { id: "5", name: "Book 5", bookName: "book-5" },
  { id: "6", name: "Book 6", bookName: "book-6" },
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Category 1", categoryName: "category-1" },
  { id: "2", name: "Category 2", categoryName: "category-2" },
  { id: "3", name: "Category 3", categoryName: "category-3" },
  { id: "4", name: "Category 4", categoryName: "category-4" },
  { id: "5", name: "Category 5", categoryName: "category-5" },
];

const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: "course",
    title: "Course",
    type: "checkbox",
    dataSource: "courses",
    stateKey: "selectedCourses",
    showSelectAll: true,
    maxVisible: 4,
    renderItem: (item) => item.name,
  },
  {
    key: "chapters",
    title: "Chapters",
    type: "checkbox",
    dataSource: "chapters",
    stateKey: "selectedChapters",
    showSelectAll: true,
    maxVisible: 4,
    renderItem: (item) => item.name,
  },
  {
    key: "books",
    title: "Books",
    type: "checkbox",
    dataSource: "books",
    stateKey: "selectedBooks",
    showSelectAll: true,
    maxVisible: 4,
    renderItem: (item) => item.name,
  },
  {
    key: "duration",
    title: "Duration",
    type: "range",
    stateKey: "durationRange",
  },
  {
    key: "category",
    title: "Category",
    type: "checkbox",
    dataSource: "categories",
    stateKey: "selectedCategories",
    showSelectAll: true,
    maxVisible: 4,
    renderItem: (item) => item.name,
  },
  {
    key: "language",
    title: "Language",
    type: "checkbox",
    dataSource: "languages",
    stateKey: "selectedLanguages",
    showSelectAll: true,
    maxVisible: 4,
    renderItem: (item) => item.name,
  },
];

const DURATION_MIN = 0;
const DURATION_MAX = 10;
const DURATION_STEP = 0.5;

const formatDurationLabel = (value: number) => {
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
  return `${rounded}${rounded === 1 ? " hr" : " hrs"}`;
};

const getCategoryName = (category: any): string => {
  if (typeof category === "string") return category;
  if (category?.categoryName) return category.categoryName;
  return "N/A";
};

const getSubCategoryName = (subCategory: any): string => {
  if (typeof subCategory === "string") return subCategory;
  if (subCategory?.subCategoryName) return subCategory.subCategoryName;
  return "N/A";
};

export default function MicroLearning() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    list: mlData,
    categories,
    documentTypes,
    filters,
    loading,
    pagination,
  } = useSelector((state: RootState) => state.ml);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({
    selectedCourses: [],
    selectedChapters: [],
    selectedBooks: [],
    selectedCategories: [],
    selectedLanguages: [],
  });

  const getFilterDataSource = (config: FilterConfig) => {
    switch (config.dataSource) {
      case "courses":
        return MOCK_COURSES;
      case "chapters":
        return MOCK_CHAPTERS;
      case "books":
        return MOCK_BOOKS;
      case "categories":
        return categories.length > 0 ? categories : MOCK_CATEGORIES;
      case "languages":
        return LANGUAGES;
      default:
        return [];
    }
  };

  const getFilterValue = (config: FilterConfig) => {
    const globalValue = (filters as Record<string, any>)[config.stateKey];
    if (globalValue !== undefined) {
      return globalValue;
    }
    const localValue = localFilters[config.stateKey];
    if (localValue !== undefined) {
      return localValue;
    }
    if (config.type === "range") {
      return { from: "", to: "" };
    }
    return [];
  };

  useEffect(() => {
    dispatch(resetList());
    dispatch(fetchMLBySearch({ page: 0, limit: 10, search: filters.search?.trim() || "" }));
  }, [dispatch, filters.search]);

  const handleRowClick = (id: string) => {
    navigate(`/admin/microlearning/view/${id}`);
  };

  const handleFilterChange = (
    stateKey: string,
    value: any,
    isLocal: boolean = false
  ) => {
    if (isLocal) {
      setLocalFilters((prev) => ({ ...prev, [stateKey]: value }));
    } else {
      dispatch(setFilters({ [stateKey]: value }));
    }
    setSelectedItems([]);
  };

  const handleSelectAll = (config: FilterConfig) => {
    const dataSource = getFilterDataSource(config);
    const currentValue = getFilterValue(config);
    const allIds = dataSource.map(
      (item: any) => item.id || item.course_id || item.doc_type
    );
    const isLocal = localFilters[config.stateKey] !== undefined;

    if (currentValue.length === dataSource.length) {
      handleFilterChange(config.stateKey, [], isLocal);
    } else {
      handleFilterChange(config.stateKey, allIds, isLocal);
    }
  };

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      const nextPage = (pagination.page || 0) + 1;
      const searchText = filters.search?.trim() || "";
      dispatch(
        fetchMLBySearch({ page: nextPage, limit: 10, search: searchText })
      );
    }
  }, [dispatch, loading, pagination.hasMore, pagination.page, filters.search]);

  const handleDelete = () => {
    if (selectedItems.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Redux will automatically remove items from state
      await dispatch(deleteML(selectedItems)).unwrap();
      setSelectedItems([]);
      setIsDeleteModalOpen(false);
      toast.success(`${selectedItems.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete items");
    }
  };

  const tableColumns: TableColumn[] = useMemo(
    () => [
      {
        key: "microLearnId",
        title: "Micro Learning ID",
        sortable: true,
        width: "200px",
      },
      {
        key: "microLearnTitle",
        title: "Micro Learning Title",
        sortable: true,
        width: "300px",
        render: (_: any, row: any) => (
          <button
            onClick={() => handleRowClick(row.id)}
            className="hover:text-blue-800 underline text-left"
          >
            {row.microLearnTitle}
          </button>
        ),
      },
      {
        key: "category",
        title: "Category",
        sortable: true,
        width: "150px",
        render: (_: any, row: any) => getCategoryName(row.category),
      },
      {
        key: "subCategory",
        title: "Sub Category",
        sortable: true,
        width: "150px",
        render: (_: any, row: any) =>
          getSubCategoryName(row.subCategory || row.subCategory),
      },
      {
        key: "Duration",
        title: "Duration",
        sortable: true,
        width: "100px",
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        width: "100px",
        render: (_: any, row: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.status === "Active"
                ? "bg-green-100 text-green-800"
                : row.status === "Draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status || "Unknown"}
          </span>
        ),
      },
    ],
    []
  );

  const renderCheckboxFilter = (config: FilterConfig) => {
    const dataSource = getFilterDataSource(config);
    const currentValue = getFilterValue(config);
    const isLocal = localFilters[config.stateKey] !== undefined;
    const visibleItems = config.maxVisible
      ? dataSource.slice(0, config.maxVisible)
      : dataSource;
    const hasMore = config.maxVisible && dataSource.length > config.maxVisible;
    const selectAllChecked =
      currentValue.length > 0 && currentValue.length === dataSource.length;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-dark-gray">
            {config.title} {dataSource.length > 0 && `(${dataSource.length})`}
          </h3>
          {config.showSelectAll && (
            <div className="flex items-center">
              <label
                htmlFor={`selectall-${config.title.toLowerCase()}`}
                className={`text-sm cursor-pointer mr-2 ${
                  selectAllChecked ? "text-primary" : "text-dark-gray"
                }`}
              >
                Select all
              </label>
              <input
                type="checkbox"
                id={`selectall-${config.title.toLowerCase()}`}
                className="cursor-pointer"
                checked={selectAllChecked}
                onChange={() => handleSelectAll(config)}
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          {visibleItems.map((item: any) => {
            const itemId = item.id || item.course_id || item.doc_type;
            const itemName = config.renderItem
              ? config.renderItem(item)
              : item.name;

            return (
              <label key={itemId} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded"
                  checked={currentValue.includes(itemId)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...currentValue, itemId]
                      : currentValue.filter((id: string) => id !== itemId);
                    handleFilterChange(config.stateKey, newValue, isLocal);
                  }}
                />
                <span className="text-sm text-dark-gray">{itemName}</span>
              </label>
            );
          })}
          {hasMore && (
            <button
              className="text-sm text-primary flex justify-end w-full hover:underline"
              onClick={() => setIsFiltersModalOpen(true)}
            >
              View All 
              {/* ({dataSource.length}) */}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRangeFilter = (config: FilterConfig) => {
    const value = getFilterValue(config) as { from?: string; to?: string };
    const parsedFrom = value?.from ? parseFloat(value.from) : NaN;
    const parsedTo = value?.to ? parseFloat(value.to) : NaN;
    const currentFrom = Number.isFinite(parsedFrom) ? parsedFrom : DURATION_MIN;
    const currentTo = Number.isFinite(parsedTo) ? parsedTo : DURATION_MAX;
    const rangeStartPercent =
      ((currentFrom - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;
    const rangeWidthPercent =
      ((currentTo - currentFrom) / (DURATION_MAX - DURATION_MIN)) * 100;
    const showReset = Boolean(value?.from || value?.to);

    const handleRangeUpdate = (key: "from" | "to", nextValue: number) => {
      const limitedValue = Math.max(
        Math.min(nextValue, DURATION_MAX),
        DURATION_MIN
      );
      let nextFrom = currentFrom;
      let nextTo = currentTo;

      if (key === "from") {
        nextFrom = Math.min(limitedValue, nextTo);
      } else {
        nextTo = Math.max(limitedValue, nextFrom);
      }

      handleFilterChange(config.stateKey, {
        from: Number(nextFrom.toFixed(2)).toString(),
        to: Number(nextTo.toFixed(2)).toString(),
      });
    };

    const handleInputChange = (key: "from" | "to", inputValue: string) => {
      if (inputValue === "") {
        handleFilterChange(config.stateKey, {
          from: key === "from" ? "" : value.from || "",
          to: key === "to" ? "" : value.to || "",
        });
      } else {
        const numValue = parseFloat(inputValue);
        if (!Number.isNaN(numValue)) {
          handleRangeUpdate(key, numValue);
        }
      }
    };

    const resetRange = () => {
      handleFilterChange(config.stateKey, { from: "", to: "" });
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-dark-gray">{config.title}</h3>
          {showReset && (
            <button className="text-xs text-primary" onClick={resetRange}>
              Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-dark-gray">From</label>
            <input
              type="number"
              min={DURATION_MIN}
              max={DURATION_MAX}
              step={DURATION_STEP}
              value={value?.from || ""}
              onChange={(e) => handleInputChange("from", e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-dark-gray">To</label>
            <input
              type="number"
              min={DURATION_MIN}
              max={DURATION_MAX}
              step={DURATION_STEP}
              value={value?.to || ""}
              onChange={(e) => handleInputChange("to", e.target.value)}
              placeholder="10"
              className="w-full px-2 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="relative mt-5 h-6">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border rounded-full -translate-y-1/2" />
          <div
            className="absolute top-1/2 h-1 bg-primary rounded-full -translate-y-1/2"
            style={{
              left: `${rangeStartPercent}%`,
              width: `${rangeWidthPercent}%`,
            }}
          />
          <input
            type="range"
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={DURATION_STEP}
            value={currentTo}
            onChange={(e) =>
              handleRangeUpdate("to", parseFloat(e.target.value))
            }
            className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer"
            style={{ WebkitAppearance: "none" }}
          />
        </div>
      </div>
    );
  };

  const renderFilter = (config: FilterConfig) => {
    switch (config.type) {
      case "checkbox":
        return renderCheckboxFilter(config);
      case "range":
        return renderRangeFilter(config);
      default:
        return null;
    }
  };

  const filterGroupsForModal = useMemo(() => {
    return FILTER_CONFIGS.filter((config) => config.type === "checkbox").map(
      (config) => {
        const dataSource = getFilterDataSource(config);
        const currentValue = getFilterValue(config);

        return {
          title: config.title,
          items: dataSource.map((item: any) => ({
            id: item.id || item.course_id || item.doc_type,
            name: config.renderItem ? config.renderItem(item) : item.name,
            selected: currentValue.includes(
              item.id || item.course_id || item.doc_type
            ),
          })),
        };
      }
    );
  }, [categories, documentTypes, filters, localFilters, isFiltersModalOpen]);

  const tableData = useMemo(
    () => mlData.filter((item) => item && item.microLearnId),
    [mlData]
  );
  const totalRecords = pagination.total ?? tableData.length;
  const appliedFiltersCount = useMemo(() => {
    let count = filters.search?.trim() ? 1 : 0;

    FILTER_CONFIGS.forEach((config) => {
      const sourceValue =
        (filters as Record<string, any>)[config.stateKey] ??
        localFilters[config.stateKey];

      if (
        config.type === "checkbox" &&
        Array.isArray(sourceValue) &&
        sourceValue.length > 0
      ) {
        count += 1;
      }

      if (
        config.type === "range" &&
        sourceValue &&
        (sourceValue.from || sourceValue.to)
      ) {
        count += 1;
      }
    });

    return count;
  }, [filters, localFilters]);
  const hasAppliedFilters = appliedFiltersCount > 0;
  const filteredDataCount = tableData.length;

  return (
    <div className="p-4">
      <div className="grid items-center mb-6 gap-2 grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto]">
        {/* Left: filter button + title (keeps compact width on larger screens) */}
        <div className="flex gap-2 w-[250px] items-center">
          <button
            className="flex bg-white items-center gap-2 text-primary border border-border rounded-md px-3 py-2 text-sm"
            onClick={() => setIsFilterCollapsed((prev) => !prev)}
          >
            <FilterSVG />
            {isFilterCollapsed ? (
              <ChevronRight size={16} className="text-dark-gray" />
            ) : (
              <ChevronLeft size={16} className="text-dark-gray" />
            )}
          </button>
          <h1 className="text-[20px] font-semibold text-dark-gray">
            Mirco Learning
          </h1>
        </div>

        {/* Middle: search (will take remaining space) */}
        <div className="w-full h-full flex justify-start md:justify-end lg:justify-start">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-[350px] md:w-[350px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Mirco Learning titles..."
                value={filters.search}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange("search", value);
                }}
                className="w-full min-h-[40px] min-w-0 h-full pl-4 pr-10 py-1 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <div className="absolute right-3 top-[10px] pointer-events-none">
                <svg
                  width="19"
                  height="18"
                  viewBox="0 0 19 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.7678 16.4891L14.427 13.1752C15.7238 11.5583 16.3518 9.50594 16.1819 7.44018C16.012 5.37442 15.057 3.45226 13.5134 2.06896C11.9698 0.685653 9.95486 -0.0536608 7.88289 0.00303558C5.81093 0.0597319 3.83943 0.908129 2.37378 2.37378C0.908129 3.83943 0.059732 5.81093 0.00303558 7.88289C-0.0536608 9.95486 0.685653 11.9698 2.06896 13.5134C3.45226 15.057 5.37442 16.012 7.44018 16.1819C9.50595 16.3518 11.5583 15.7238 13.1752 14.427L16.4891 17.7408C16.5728 17.8252 16.6724 17.8922 16.7822 17.9379C16.8919 17.9837 17.0096 18.0072 17.1285 18.0072C17.2474 18.0072 17.3651 17.9837 17.4748 17.9379C17.5845 17.8922 17.6841 17.8252 17.7678 17.7408C17.9301 17.5729 18.0209 17.3485 18.0209 17.115C18.0209 16.8814 17.9301 16.657 17.7678 16.4891ZM8.1234 14.427C6.87667 14.427 5.65794 14.0573 4.62133 13.3646C3.58471 12.672 2.77677 11.6875 2.29967 10.5357C1.82257 9.38384 1.69773 8.1164 1.94096 6.89363C2.18418 5.67086 2.78454 4.54768 3.66611 3.66611C4.54768 2.78454 5.67086 2.18418 6.89363 1.94096C8.1164 1.69773 9.38384 1.82257 10.5357 2.29967C11.6875 2.77677 12.672 3.58471 13.3646 4.62133C14.0573 5.65794 14.427 6.87667 14.427 8.1234C14.427 9.7952 13.7628 11.3985 12.5807 12.5807C11.3985 13.7628 9.7952 14.427 8.1234 14.427Z"
                    fill="black"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions (Create button + count). On mobile this will stack under search */}
        <div className="flex w-full justify-end lg:justify-ende">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 items-end w-full justify-end">
            {/* meta/count box */}
            <div className="flex items-end">
              <div className="border border-black-30 bg-form-btn p-2 py-1.5 rounded-[12px]">
                <span className="text-xs text-text-gray">
                  1 - {tableData.length} of {totalRecords}
                </span>
              </div>
            </div>

            {/* primary action */}
            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                className="text-white min-w-[120px] sm:min-w-[150px] text-center"
                onClick={() => navigate("/admin/microlearning/create")}
              >
                <span className="font-thin text-xl mr-2">+</span> Create ML
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
                  <h3 className="font-medium text-dark-gray">
                    Applied Filters
                  </h3>
                  <span className="text-sm text-accent">
                    {filteredDataCount} item{filteredDataCount === 1 ? "" : "s"}
                  </span>
                </div>
                {/* <p className="text-xs text-text-gray mt-1">{filteredDataCount} item{filteredDataCount === 1 ? '' : 's'}</p> */}
              </div>
            )}
            {FILTER_CONFIGS.map((config) => (
              <React.Fragment key={config.key}>
                {renderFilter(config)}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex-1 mltable-container">
          <Table
            data={tableData}
            columns={tableColumns}
            TableWidth={isFilterCollapsed ? "10" : "290"}
            rowSelection={false}
            selectedRows={selectedItems}
            onSelectionChange={handleSelectionChange}
            rowKey="id"
            loading={loading}
            hasMore={pagination.hasMore}
            onLoadMore={loadMore}
            emptyMessage="No Micro learning found"
          />
        </div>
      </div>

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filterGroups={filterGroupsForModal}
        onSelectionChange={(groupTitle, selectedIds) => {
          const config = FILTER_CONFIGS.find((c) => c.title === groupTitle);
          if (config) {
            const isLocal = localFilters[config.stateKey] !== undefined;
            handleFilterChange(config.stateKey, selectedIds, isLocal);
          }
        }}
      />
    </div>
  );
}
