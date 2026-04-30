import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  createChapter,
  updateChapter,
  fetchChapterById,
  clearCurrentChapter,
  fetchAllChapters,
  deleteChapterThunk,
  fetchMappedModules,
} from "../../../features/chapterSlice";
import { ChapterInput } from "../../../types/chapter";
import {
  fetchMLById,
  fetchMLBySearch,
  resetList,
} from "../../../features/microlearning/mlSlice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import CustomButton from "../../../components/custom/CustomButton";
import {
  CustomInputStyles,
  forminput,
  inputForm,
  inputTitle,
} from "../../../components/custom/CustomStyles";
import toast from "react-hot-toast";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

interface SortableRowProps {
  ml: any;
  index: number;
  isFormReadOnly: boolean;
  onRemove: (mlId: string) => void;
}

const SortableRow = ({
  ml,
  index,
  isFormReadOnly,
  onRemove,
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ml?.id || ml?.microLearnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    // <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
    //   <td className="px-4 py-3">
    //     {
    //       <div {...attributes} {...listeners} className="cursor-move">
    //         <GripVertical className="h-4 w-4 text-gray-400" />
    //       </div>
    //     }
    //   </td>
    //   <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
    //   <td className="px-4 py-3 text-sm text-gray-900">
    //     {ml?.microLearnId || ml?.microLearnId}
    //   </td>
    //   <td className="px-4 py-3 text-sm text-gray-900">{ml?.microLearnTitle}</td>
    //   <td className="px-4 py-3 text-sm text-gray-900">
    //     {ml?.shortDescription || "-"}
    //   </td>
    //   <td className="px-4 py-3 text-sm text-gray-900">{ml?.fileCount || 0}</td>
    //   <td className="px-4 py-3">
    //     {
    //       <button
    //         onClick={() => onRemove(ml?.id)}
    //         className="text-red-600 hover:text-red-800"
    //       >
    //         <X size={18} />
    //       </button>
    //     }
    //   </td>
    // </tr>
    <tr ref={setNodeRef} className="hover:bg-gray-50">
      {/* Drag */}
      <td className="w-12 px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          style={style} // ✅ move transform HERE
          className="cursor-move flex justify-center"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </td>

      {/* S.No */}
      <td className="w-16 px-4 py-3 text-center text-sm">{index + 1}</td>

      {/* ML ID */}
      <td className="w-28 px-4 py-3 text-center text-sm font-medium">
        {ml?.microLearnId || "-"}
      </td>

      {/* Title */}
      <td className="px-4 py-3 text-center truncate">
        {ml?.microLearnTitle || "-"}
      </td>

      {/* Duration */}
      <td className="px-4 py-3 text-center truncate">
        {ml?.Duration ? `${ml.Duration} mins` : "-"}
      </td>

      {/* File Count */}
      <td className="w-32 px-4 py-3 text-center text-sm">
        {ml?.fileCount ?? 0}
      </td>

      {/* Action */}
      <td className="w-20 px-4 py-3 text-center">
        <button
          onClick={() => onRemove(ml?.id)}
          className="text-red-600 hover:text-red-800"
        >
          <RiDeleteBin5Line />
        </button>
      </td>
    </tr>
  );
};

export const ChapterModel = ({ open, onClose, itemId }: Props) => {
  const [expand, setExpand] = useState(false);
  const width = expand ? "80%" : "50%";
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMlId, setSelectedMlId] = useState<string | null>(null);
  const [mlFileCountMap, setMlFileCountMap] = useState<Record<string, number>>(
    {}
  );

  // const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentChapter, loading, mappedModules } = useAppSelector(
    (state) => state.chapters
  );
  const { currentML } = useSelector((state: RootState) => state.ml);

  // Prevent duplicate loads
  const loadingMoreRef = useRef(false);
  const {
    list: mlList,
    pagination: mlPagination,
    loading: mlLoading,
  } = useAppSelector((state) => state.ml);
  const [mlOpen, setMlOpen] = useState(false);

  const [mlSearch, setMlSearch] = useState("");
  const [mlPage, setMlPage] = useState(0);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [formData, setFormData] = useState<ChapterInput>({
    chapterTitle: "",
    chapterDescription: "",
    microLearn: [],
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ChapterInput | null>(
    null
  );
  const [selectedMLData, setSelectedMLData] = useState<any[]>([]);

  const isViewMode = Boolean(itemId) && !location.pathname.includes("/create");
  const isFormReadOnly = isViewMode && !isInlineEditEnabled;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (itemId) {
      dispatch(fetchChapterById(itemId));
      dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
    } else {
      dispatch(clearCurrentChapter());
    }
  }, [dispatch, itemId]);

  useEffect(() => {
    if (currentChapter && itemId) {
      const microLearnIds = Array.isArray(currentChapter.microLearn)
        ? currentChapter.microLearn
            .map((ml: any) => ml.microlearnId)
            .filter(Boolean)
        : [];

      const microLearnData = Array.isArray(currentChapter.microLearn)
        ? currentChapter.microLearn.map((ml: any) => ({
            id: ml.microlearnId,
            microLearnId: ml.microlearnId,
            microLearnTitle: ml.microLearnTitle,
            ...ml,
          }))
        : [];

      const hydratedData = {
        chapterTitle: currentChapter.chapterTitle || "",
        chapterDescription: currentChapter.chapterDescription || "",
        microLearn: microLearnIds,
      };
      setFormData(hydratedData);
      setInitialFormData(hydratedData);
      setSelectedMLData(microLearnData);
      if (microLearnIds.length > 0) {
        dispatch(resetList());
        dispatch(fetchMLBySearch({ page: 0, limit: 8, search: "" }));
      }
    }
  }, [currentChapter, itemId, dispatch]);

  useEffect(() => {
    setIsInlineEditEnabled(false);
  }, [isViewMode, itemId]);

  useEffect(() => {
    if (!itemId) {
      dispatch(resetList());
      dispatch(fetchMLBySearch({ page: 0, limit: 8, search: mlSearch }));
    } else if (mlSearch) {
      dispatch(fetchMLBySearch({ page: 0, limit: 8, search: mlSearch }));
    }
  }, [dispatch, mlSearch, itemId]);

  // const handleMLScroll = (event: React.SyntheticEvent) => {
  //   const listboxNode = event.currentTarget as HTMLUListElement;
  //   const position = listboxNode.scrollTop + listboxNode.clientHeight;
  //   if (
  //     listboxNode.scrollHeight - position <= 1 &&
  //     mlPagination.hasMore &&
  //     !mlLoading
  //   ) {
  //     const nextPage = mlPage + 1;
  //     setMlPage(nextPage);
  //     dispatch(
  //       fetchMLBySearch({ page: nextPage, limit: 10, search: mlSearch })
  //     );
  //   }
  // };

  const handleMLScroll = (e: React.SyntheticEvent) => {
    const listboxNode = e.currentTarget as HTMLUListElement;
    const bottom =
      listboxNode.scrollTop + listboxNode.clientHeight >=
      listboxNode.scrollHeight - 10;

    if (!bottom) return;
    if (!mlPagination?.hasMore) return;
    if (mlLoading) return;

    setMlPage((prev) => prev + 1);
  };
  const handleSearchChange = (value: string) => {
    setMlSearch(value);
    setMlPage(0);
    dispatch(resetList()); // clear list before new search
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
    handleInputChange("microLearn", arrayMove(items, oldIndex, newIndex));
  };

  const handleRemoveML = (mlId: string) => {
    handleInputChange(
      "microLearn",
      formData.microLearn?.filter((id) => id !== mlId) || []
    );
  };

  // const getSelectedMLData = () => {
  //   return (formData.microLearn || [])
  //     .map((id) => {
  //       const fromList = mlList.find((ml) => (ml.id || ml.microLearnId) === id);
  //       const fromSelected = selectedMLData.find(
  //         (ml) => (ml.id || ml.microLearnId) === id
  //       );
  //       return fromList || fromSelected;
  //     })
  //     .filter(Boolean);
  // };
  useEffect(() => {
    if (loadingMoreRef.current) return;

    loadingMoreRef.current = true;

    dispatch(
      fetchMLBySearch({
        page: mlPage,
        limit: 8,
        search: mlSearch || "",
      })
    ).finally(() => {
      loadingMoreRef.current = false;
    });
  }, [mlPage, mlSearch, dispatch]);

  const getSelectedMLData = () => {
    return (formData.microLearn || [])
      .map((id) => {
        const fromList = mlList.find((ml) => (ml.id || ml.microLearnId) === id);
        const fromSelected = selectedMLData.find(
          (ml) => (ml.id || ml.microLearnId) === id
        );

        const ml = fromList || fromSelected;
        if (!ml) return null;

        return {
          ...ml,
          fileCount: mlFileCountMap[id] ?? ml.fileCount ?? 0,
        };
      })
      .filter(Boolean);
  };

 const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  // Chapter Title validation
  if (!formData.chapterTitle.trim()) {
    errors.chapterTitle = "Chapter title is required";
  } else if (formData.chapterTitle.trim().split(/\s+/).length > 10) {
    errors.chapterTitle = "Chapter title must not exceed 10 words";
  }

  // Chapter Description validation
  if (!formData.chapterDescription.trim()) {
    errors.chapterDescription = "Chapter description is required";
  } else if (formData.chapterDescription.trim().length < 10) {
    errors.chapterDescription = "Description must be at least 10 characters";
  } else if (formData.chapterDescription.trim().length > 250) {
    errors.chapterDescription = "Description must not exceed 250 characters";
  }

  // MicroLearning validation
  if (!formData.microLearn?.length) {
    errors.microLearn = "Please select at least one Micro Learning";
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
    if (saving) return;
    if (!validateForm()) {
      // toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      if (itemId) {
        const hasChanges = initialFormData
          ? JSON.stringify(initialFormData) !== JSON.stringify(formData)
          : true;
        if (!hasChanges) {
          // toast.info("No changes to save");
          console.log("No changes to save");
          setSaving(false);
          onClose();
          return;
        }

        await dispatch(updateChapter({ id: itemId, input: formData })).unwrap();
        await dispatch(fetchChapterById(itemId));
        toast.success("Chapter updated successfully");
        setInitialFormData({ ...formData });
        setIsInlineEditEnabled(false);
        resetForm();
      } else {
        await dispatch(createChapter(formData)).unwrap();
        toast.success("Chapter created successfully");
        resetForm();
      }
      await dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
      onClose();
    } catch (error: any) {
      console.error("Error saving chapter:", error);
      toast.error(
        error?.message ||
          (itemId ? "Failed to update chapter" : "Failed to create chapter")
      );
    } finally {
      setSaving(false);
      dispatch(fetchMLBySearch({ page: 0, limit: 8, search: mlSearch }));
      // re‑enable buttons after API finishes
    }
  };

  const handleBack = () => {
    navigate("/admin/chapters");
  };

  const handleCancel = () => {
    if (isInlineEditEnabled && initialFormData) {
      setFormData(initialFormData);
      setValidationErrors({});
      setIsInlineEditEnabled(false);
    }
    onClose();
    resetForm();
  };
  const resetForm = () => {
    setFormData({
      chapterTitle: "",
      chapterDescription: "",
      microLearn: [],
    });
    setSelectedMLData([]);
    setInitialFormData(null);
    setValidationErrors({});
    setMlSearch("");
    setMlPage(0);
    setIsInlineEditEnabled(false);
    dispatch(clearCurrentChapter());
    dispatch(resetList());
    dispatch(fetchMLBySearch({ page: 0, limit: 8, search: mlSearch }));
  };

  const handleDelete = async () => {
    if (!itemId) return;
    try {
      // setLoading(true);
      await dispatch(deleteChapterThunk(itemId)); // your API / thunk
      toast.success("Deleted successfully");
      onClose();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      // setLoading(false);
    }
  };
  useEffect(() => {
    if (itemId) {
      dispatch(
        fetchMappedModules({
          id: itemId,
          type: "chapter",
        })
      );
    }
  }, [dispatch, itemId]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width: width,
        height: "100vh",
        background: "#fff",
        transition: "0.4s ease",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        padding: "20px",
        zIndex: 1300,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleCancel}>
            <HiOutlineChevronDoubleRight size={16} color="var(--black)" />
          </IconButton>
          <IconButton onClick={() => setExpand(!expand)}>
            {expand ? (
              <RiCollapseDiagonal2Line size={18} color="var(--black)" />
            ) : (
              <CgArrowsExpandLeft size={14} color="var(--black)" />
            )}
          </IconButton>
          <Typography
            sx={{
              fontSize: "14px",
              fontFamily: "DM-Semibold !important",
              color: "var(--textlight)",
            }}
          >
            Chapter / {itemId ? "Edit" : "Creation"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {itemId ? (
            // EDIT MODE → DELETE
            // <CustomButton
            //   type="button"
            //   variant="outlined"
            //   label="Delete"
            //   onClick={handleDelete}
            //   disabled={loading}
            //   // sx={{ color: "error.main", borderColor: "error.main" }}
            // />
            <CustomButton
              type="button"
              variant="outlined"
              label="Delete"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
            />
          ) : (
            // CREATE MODE → CANCEL
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={handleCancel}
              disabled={loading}
            />
          )}
          <CustomButton
            type="button"
            variant="contained"
            label={loading ? "Saving..." : "Save"}
            onClick={handleSubmit}
            disabled={loading}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Form */}
      {/* <div className="bg-white flex flex-col justify-between p-6 rounded-[10px] h-[calc(100vh-200px)] overflow-y-auto"> */}
      <div>
        {/* Chapter Title */}
        {/* Chapter Title */}
        <Box>
          <TextField
            type="text"
            value={formData.chapterTitle}
            onChange={(e) => handleInputChange("chapterTitle", e.target.value)}
            placeholder="Chapter Title..."
            sx={{ ...inputTitle }}
            disabled={saving}
          />
          <Box sx={{ ml: "18px" }}>
            {validationErrors.chapterTitle && (
              <Typography color="error" variant="caption">
                {validationErrors.chapterTitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Chapter Description */}
        <Box sx={{ ...forminput }}>
          <Typography variant="h3">Description</Typography>
          <TextField
            type="text"
            value={formData.chapterDescription}
            onChange={(e) =>
              handleInputChange("chapterDescription", e.target.value)
            }
            placeholder="Enter Description"
            sx={{ ...inputForm }}
            disabled={saving} // <- align with Chapter Title
          />
        </Box>
        <Box sx={{ ml: 34 }}>
          {validationErrors.chapterDescription && (
            <Typography color="error" variant="caption">
              {validationErrors.chapterDescription}
            </Typography>
          )}
        </Box>
        {/* Micro Learning */}
        <Box sx={{ ...forminput, ...inputForm }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Micro Learning
          </Typography>
          {/* <Autocomplete
            multiple
            disableCloseOnSelect
            options={mlList}
            loading={mlLoading}
            disabled={saving}
            value={getSelectedMLData()}
            inputValue={mlSearch}
            getOptionLabel={(option) => option.microLearnTitle || ""}
            isOptionEqualToValue={(opt, val) =>
              (opt.id || opt.microLearnId) === (val.id || val.microLearnId)
            }
            // onChange={(_, newValue, reason) => {
            //   // ❌ Ignore checkbox unselect
            //   if (reason === "removeOption") return;

            //   handleInputChange(
            //     "microLearn",
            //     newValue.map((ml) => ml.id || ml.microLearnId)
            //   );
            //   setSelectedMLData(newValue);

            //   // clear search after select
            //   setMlSearch("");
            // }}

            onChange={async (_, newValue, reason) => {
              if (reason === "removeOption") return;

              const ids = newValue.map((ml) => ml.id || ml.microLearnId);
              handleInputChange("microLearn", ids);
              setSelectedMLData(newValue);
              setMlSearch("");

              const lastSelected = newValue[newValue.length - 1];
              const mlId = lastSelected?.id || lastSelected?.microLearnId;

              if (mlId) {
                const res = await dispatch(fetchMLById(mlId)).unwrap();

                setMlFileCountMap((prev) => ({
                  ...prev,
                  [mlId]: res?.trainingDocs?.length || 0,
                }));
              }
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                setMlSearch(value);
                setMlPage(0);
              }
            }}
            renderTags={() => null}
            ListboxProps={{
              onScroll: handleMLScroll,
              ref: listboxRef,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Micro Learning"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {mlLoading && <CircularProgress size={18} />}
                      <Box
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMlOpen((prev) => !prev);
                        }}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          color: "#bdbdbd",
                          cursor: "pointer",
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                        <KeyboardArrowDownIcon sx={{ fontSize: 18, mt: -1 }} />
                      </Box>
                    </>
                  ),
                }}
              />
            )}
            sx={{ width: "46%" }}
          /> */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            open={mlOpen}
            onOpen={() => setMlOpen(true)}
            onClose={() => setMlOpen(false)}
            options={mlList}
            loading={mlLoading}
            disabled={saving}
            value={getSelectedMLData()}
            inputValue={mlSearch}
            getOptionLabel={(option) => option.microLearnTitle || ""}
            isOptionEqualToValue={(opt, val) =>
              (opt.id || opt.microLearnId) === (val.id || val.microLearnId)
            }
            onChange={async (_, newValue, reason) => {
              if (reason === "removeOption") return;

              const ids = newValue.map((ml) => ml.id || ml.microLearnId);
              handleInputChange("microLearn", ids);

              // Load file count
              const last = newValue[newValue.length - 1];
              const mlId = last?.id || last?.microLearnId;

              if (mlId) {
                const res = await dispatch(fetchMLById(mlId)).unwrap();

                setMlFileCountMap((prev) => ({
                  ...prev,
                  [mlId]: res?.trainingDocs?.length || 0,
                }));
              }
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                handleSearchChange(value);
              }
            }}
            renderTags={() => null}
            ListboxProps={{
              ref: listboxRef,
              onScroll: handleMLScroll,
              style: { maxHeight: 300, overflow: "auto" },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Micro Learning"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {mlLoading && <CircularProgress size={18} />}
                      <Box
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMlOpen((prev) => !prev);
                        }}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          color: "#bdbdbd",
                          cursor: "pointer",
                          ml: 0.5,
                        }}
                      >
                        <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                        <KeyboardArrowDownIcon sx={{ fontSize: 18, mt: -1 }} />
                      </Box>
                    </>
                  ),
                }}
              />
            )}
            sx={{ width: "46%" }}
          />
        </Box>
        <Box sx={{ ml: 34 }}>
          {validationErrors.microLearn && (
            <Typography color="error" variant="caption">
              {validationErrors.microLearn}
            </Typography>
          )}
        </Box>
        {/* Selected Micro Learn Table */}
        {formData.microLearn && formData.microLearn.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Selected Micro Learning
            </h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div
                style={{
                  maxHeight: "350px", // adjust height as needed
                  overflowY: "auto",
                  overflowX: "hidden",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                }}
              >
                {/* <table className="w-full"> */}
                <table className="w-full table-auto">
                  {/* <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-12"></th>
                      <th className="px-4 py-3 w-16">S.No</th>
                      <th className="px-4 py-3">ML ID</th>
                      <th className="px-4 py-3">ML Title</th>
                      <th className="px-4 py-3">Short Description</th>
                      <th className="px-4 py-3 w-32">File Count</th>
                      <th className="px-4 py-3 w-20">Action</th>
                    </tr>
                  </thead> */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-4 py-3"></th>
                      <th className="w-16 px-4 py-3 text-center">S.No</th>
                      <th className="w-28 px-4 py-3 text-center">ML ID</th>
                      <th className="px-4 py-3">ML Title</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="w-32 px-4 py-3 text-center">File Count</th>
                      <th className="w-20 px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    <SortableContext
                      items={formData.microLearn}
                      strategy={verticalListSortingStrategy}
                    >
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

      {/* </div> */}
      {showDeleteDialog && (
        // <Box
        //   sx={{
        //     position: "fixed",
        //     inset: 0,
        //     bgcolor: "rgba(0,0,0,0.5)",
        //     display: "flex",
        //     alignItems: "center",
        //     justifyContent: "center",
        //     zIndex: 10000,
        //   }}
        // >
        //   <Box
        //     sx={{
        //       bgcolor: "white",
        //       borderRadius: 2,
        //       p: 3,
        //       minWidth: 320,
        //       textAlign: "center",
        //     }}
        //   >
        //     <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 2 }}>
        //       Delete Chapter?
        //     </Typography>

        //     <Typography sx={{ fontSize: 14, color: "#666", mb: 3 }}>
        //       Are you sure you want to delete this chapter?
        //     </Typography>

        //     <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        //       <CustomButton
        //         variant="outlined"
        //         label="Cancel"
        //         onClick={() => setShowDeleteDialog(false)}
        //         disabled={isDeleting} type={"button"}              />

        //       <CustomButton
        //         variant="contained"

        //         label={isDeleting ? "Deleting..." : "Delete"}
        //         disabled={isDeleting}
        //         boxSx={{
        //           bgcolor: "#dc2626",
        //           "&:hover": { bgcolor: "#b91c1c" },
        //         }}
        //         onClick={async () => {
        //           if (!itemId) return;

        //           try {
        //             setIsDeleting(true);
        //             await dispatch(deleteChapterThunk(itemId)).unwrap();
        //             await dispatch(
        //               fetchAllChapters({
        //                 page: 0,
        //                 size: 20,
        //                 searchtext: "",
        //               })
        //             );
        //             toast.success("Chapter deleted successfully");
        //             setShowDeleteDialog(false);
        //             onClose();
        //           } catch (error) {
        //             toast.error("Failed to delete chapter");
        //           } finally {
        //             setIsDeleting(false);
        //           }
        //         } } type={"button"}              />
        //     </Box>
        //   </Box>
        // </Box>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              width: "800px",
              maxWidth: "90%",
              textAlign: "center",
              position: "relative",
            }}
          >
            <IconButton
              sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
              onClick={() => setShowDeleteDialog(false)}
            >
              <IoClose size={20} />
            </IconButton>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                mb: 3,
                textAlign: "left",
                display: "flex",
                gap: 1,
              }}
            >
              <Box component="span" sx={{ color: "var(--primary)" }}>
                {currentChapter?.chapterId || "CH"}
              </Box>
              <Box component="span" sx={{ color: "#333" }}>
                : Delete this item?
              </Box>
            </Typography>

            <Box
              sx={{
                bgcolor: "#e8f5e9",
                p: 2,
                borderRadius: 1,
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                mb: 4,
                textAlign: "left",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#333",
                  whiteSpace: "nowrap",
                }}
              >
                Note:
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                This item is currently used in multiple modules. Deleting it
                will remove the item and may affect related data and workflows.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                px: 2,
              }}
            >
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#333", mb: 2 }}
                >
                  Books
                </Typography>
                <Box sx={{ color: "#666", fontSize: 10, lineHeight: 1.8 }}>
                  {mappedModules.book && mappedModules.book.length > 0 ? (
                    mappedModules.book.map((b: string, index: number) => (
                      <Typography key={index}>{b}</Typography>
                    ))
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, bgcolor: "#eee" }}
              />
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#333", mb: 2 }}
                >
                  Course
                </Typography>
                <Box sx={{ color: "#666", fontSize: 12, lineHeight: 1.8 }}>
                  {mappedModules.course && mappedModules.course.length > 0 ? (
                    mappedModules.course?.map((c: string, index: number) => (
                      <Typography key={index}>{c}</Typography>
                    ))
                  ) : (
                    <Typography>-</Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Typography
              sx={{ fontSize: 15, color: "#333", mb: 4, fontWeight: 500 }}
            >
              Are you sure you want to move this{" "}
              <Box
                component="span"
                sx={{ color: "var(--primary)", fontWeight: 600 }}
              >
                {currentChapter?.chapterId || "CH"}
              </Box>{" "}
              to Trash? You can restore it later from the Trash if needed.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                boxSx={{
                  bgcolor: "#f1f3f4",
                  color: "#333",
                  border: "none",
                  px: 4,
                  width: "max-content",
                  "&:hover": { bgcolor: "#e8eaed", border: "none" },
                }}
              />
              <CustomButton
                type="button"
                variant="contained"
                label={isDeleting ? "Moving..." : "Move to Trash"}
                onClick={async () => {
                  if (!itemId) return;
                  try {
                    setIsDeleting(true);
                    await dispatch(deleteChapterThunk(itemId)).unwrap();
                    await dispatch(
                      fetchAllChapters({
                        page: 0,
                        size: 20,
                        searchtext: "",
                      })
                    );
                    toast.success("Chapter deleted successfully");
                    onClose();
                  } catch (error) {
                    // showError("Failed to delete micro learning");
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteDialog(false);
                  }
                }}
                disabled={isDeleting}
                boxSx={{
                  bgcolor: "#ff7070",
                  "&:hover": { bgcolor: "#ff5252" },
                  px: 4,
                  width: "max-content",
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
