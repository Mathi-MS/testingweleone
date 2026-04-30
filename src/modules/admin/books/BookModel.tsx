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
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import {
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
import { bookInput } from "../../../types/book";
import {
  Book,
  createBook,
  deleteBook,
  fetchAllBooks,
  fetchBookById,
  updateBook,
} from "../../../features/bookSlice";
import { IoClose } from "react-icons/io5";
interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

interface SortableRowProps {
  ch: any;
  index: number;
  // isFormReadOnly: boolean;
  onRemove: (mlId: string) => void;
}

const SortableRow = ({ ch, index, onRemove }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ch?.id || ch?.chapterId });

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
        {ch?.chapterId || "-"}
      </td>

      {/* Title */}
      <td className="px-4 py-3 text-center truncate">
        {ch?.chapterTitle || "-"}
      </td>

      {/* Description */}
      <td className="px-4 py-3 text-center truncate">
        {ch?.chapterDescription || "-"}
      </td>

      {/* Action */}
      <td className="w-20 px-4 py-3 text-center">
        <button
          onClick={() => onRemove(ch?.id)}
          className="text-red-600 hover:text-red-800"
        >
          <RiDeleteBin5Line />
        </button>
      </td>
    </tr>
  );
};

export const BookModal = ({ open, onClose, itemId }: Props) => {
  const [expand, setExpand] = useState(false);
  const width = expand ? "80%" : "50%";
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMlId, setSelectedMlId] = useState<string | null>(null);
  const [mlFileCountMap, setMlFileCountMap] = useState<Record<string, number>>(
    {}
  );
const [chapterSearch, setChapterSearch] = useState("");
const [chapterPage, setChapterPage] = useState(0);

  // const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const {
    mappedModules,
    currentChapter,
    loading,
    chapters,
    pagination,
    filteredData,
  } = useAppSelector((state) => state.chapters);
  const { currentML } = useSelector((state: RootState) => state.ml);
  const { selectedBook, singleBookLoading } = useAppSelector(
    (state) => state.book
  );

  const {
    list: mlList,
    pagination: mlPagination,
    loading: mlLoading,
  } = useAppSelector((state) => state.ml);
  const [mlOpen, setMlOpen] = useState(false);

  const [mlSearch, setMlSearch] = useState("");
  const [mlPage, setMlPage] = useState(0);
  const listboxRef = useRef<HTMLUListElement>(null);

  const [formData, setFormData] = useState<bookInput>({
    bookTitle: "",
    bookDescription: "",
    chapter: [],
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
  const [initialFormData, setInitialFormData] = useState<any | null>(null);
  const [selectedMLData, setSelectedMLData] = useState<any[]>([]);

  const isViewMode = Boolean(itemId) && !location.pathname.includes("/create");
  const isFormReadOnly = isViewMode && !isInlineEditEnabled;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // useEffect(() => {
  //   dispatch(fetchAllChapters({ page: 0, size: 20, searchtext:"" }));
  // }, []);
  useEffect(() => {
    if (itemId) {
      dispatch(fetchBookById(itemId));
      dispatch(fetchAllBooks({ page: 0, size: 20, searchText: "" }));
    } else {
      dispatch(clearCurrentChapter());
    }
  }, [dispatch, itemId]);

  useEffect(() => {
    if (selectedBook && itemId) {
      const chapterIds = Array.isArray(selectedBook.chapter)
        ? selectedBook.chapter.map((ch: any) => ch.chapterid).filter(Boolean)
        : [];
      const chapterData = Array.isArray(selectedBook.chapter)
        ? selectedBook.chapter.map((ch: any) => ({
            id: ch.chapterid, // used by DnD
            chapterId: ch.chapterid, // UI expects this
            chapterTitle: ch.chapterName,
            duration: ch.chapterDescription || 0,
            ...ch,
          }))
        : [];

      const hydratedData = {
        bookTitle: selectedBook.bookTitle || "",
        bookDescription: selectedBook.bookDescription || "",
        chapter: chapterIds,
      };
      setFormData(hydratedData);
      setInitialFormData(hydratedData);
      setSelectedMLData(chapterData);
      dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
      if (chapterIds.length > 0) {
        dispatch(resetList());
        dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
      }
    }
  }, [selectedBook, itemId, dispatch]);

  useEffect(() => {
    setIsInlineEditEnabled(false);
  }, [isViewMode, itemId]);

  useEffect(() => {
    if (!itemId) {
      dispatch(resetList());
      dispatch(fetchMLBySearch({ page: 0, limit: 10, search: mlSearch }));
    } else if (mlSearch) {
      dispatch(fetchMLBySearch({ page: 0, limit: 10, search: mlSearch }));
    }
  }, [dispatch, mlSearch, itemId]);

  const handleMLScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget as HTMLUListElement;
    const position = listboxNode.scrollTop + listboxNode.clientHeight;
    if (
      listboxNode.scrollHeight - position <= 1 &&
      mlPagination.hasMore &&
      !mlLoading
    ) {
      const nextPage = mlPage + 1;
      setMlPage(nextPage);
      dispatch(
        fetchMLBySearch({ page: nextPage, limit: 10, search: mlSearch })
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = formData.chapter || [];
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    handleInputChange("chapter", arrayMove(items, oldIndex, newIndex));
  };

  const handleRemoveML = (mlId: string) => {
    handleInputChange(
      "chapter",
      formData.chapter?.filter((id) => id !== mlId) || []
    );
  };

  const getSelectedMLData = () => {
    return (formData.chapter || [])
      .map((id) => {
        const fromList = chapters.find((ch) => ch.id === id); //|| ch.chapterName
        const fromSelected = selectedMLData.find(
          (ch) => (ch.id || ch.chapterId) === id
        );
        return fromList || fromSelected;
      })
      .filter(Boolean);
  };

  const getSelectedChData = () => {
    return (formData.chapter || [])
      .map((id) => {
        const fromList = chapters.find((ml) => (ml.id || ml.chapterId) === id);
        const fromSelected = selectedMLData.find(
          (ml) => (ml.id || ml.chapterId) === id
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

const handleChapterScroll = (event: React.SyntheticEvent) => {
  const listboxNode = event.currentTarget as HTMLUListElement;

  const scrollPosition = listboxNode.scrollTop + listboxNode.clientHeight;
  const scrollHeight = listboxNode.scrollHeight;

  // Avoid extra calls
  if (scrollHeight - scrollPosition <= 2 && pagination.hasMore && !loading) {
    const nextPage = chapterPage + 1;
    setChapterPage(nextPage);

    dispatch(
      fetchAllChapters({
        page: nextPage,
        size: 20,
        searchtext: chapterSearch,
      })
    );
  }
};

 const validateForm = (): boolean => {
  const errors: Record<string, string> = {};

  // Book Title validation
  if (!formData.bookTitle.trim()) {
    errors.bookTitle = "Book title is required";
  } else if (formData.bookTitle.trim().split(/\s+/).length > 10) {
    errors.bookTitle = "Book title must not exceed 10 words";
  }

  // Book Description validation
  if (!formData.bookDescription.trim()) {
    errors.bookDescription = "Book description is required";
  } else if (formData.bookDescription.trim().length < 10) {
    errors.bookDescription = "Description must be at least 10 characters";
  } else if (formData.bookDescription.trim().length > 250) {
    errors.bookDescription = "Description must not exceed 250 characters";
  }

  // Chapter validation
  if (!formData.chapter?.length) {
    errors.chapter = "Please select at least one Chapter";
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleInputChange = (field: keyof Book, value: any) => {
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

        await dispatch(
          updateBook({
            id: itemId,
            input: {
              ...formData,
              chapter: formData.chapter || [],
            },
          })
        ).unwrap();
        const updateres :any =await dispatch(fetchBookById(itemId));
         if(updateres?.code === 409){
          toast.error(updateres?.message || "Book already exists");
        } else if (updateres?.code === 200) {
          toast.success("Book updated successfully");
        }
        setInitialFormData({ ...formData });
        setIsInlineEditEnabled(false);
        resetForm();
      } else {
        // await dispatch(createChapter(formData)).unwrap();
        const res :any = await dispatch(
          createBook({
            ...formData,
            chapter: formData.chapter || [],
          })
        ).unwrap();
        if(res?.code === 409){
          toast.error(res?.message || "Book already exists");
        } else if (res?.code === 200) {
          toast.success("Book created successfully");
        }
        resetForm();
      }
      await dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
      await dispatch(fetchAllBooks({ page: 0, size: 20, searchText: "" }));
      onClose();
    } catch (error: any) {
      console.error("Error saving book:", error);
      toast.error(
        error?.message ||
          (itemId ? "Failed to update book" : "Failed to create book")
      );
    } finally {
      setSaving(false);
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
      bookTitle: "",
      bookDescription: "",
      chapter: [],
    });
    setSelectedMLData([]);
    setInitialFormData(null);
    setValidationErrors({});
    setMlSearch("");
    setMlPage(0);
    setIsInlineEditEnabled(false);
    dispatch(clearCurrentChapter());
    dispatch(resetList());
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
          type: "book",
        })
      );
    }
  }, [dispatch, itemId]);
  useEffect(() => {
  if (open) {
    setChapterSearch("");
    setChapterPage(0);
    dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
  }
}, [open, dispatch]);

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
            Book / {itemId ? "Edit" : "Creation"}
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
            value={formData.bookTitle}
            onChange={(e) => handleInputChange("bookTitle", e.target.value)}
            placeholder="Book Title..."
            sx={{ ...inputTitle }}
            disabled={saving}
          />
          <Box sx={{ ml: "18px" }}>
            {validationErrors.bookTitle && (
              <Typography color="error" variant="caption">
                {validationErrors.bookTitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Chapter Description */}
        <Box sx={{ ...forminput }}>
          <Typography variant="h3">Description</Typography>
          <TextField
            type="text"
            value={formData.bookDescription}
            onChange={(e) =>
              handleInputChange("bookDescription", e.target.value)
            }
            placeholder="Enter Description"
            sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" }, }}
            disabled={saving} // <- align with Chapter Title
          />
        </Box>
        <Box sx={{ ml: 34 }}>
          {validationErrors.bookDescription && (
            <Typography color="error" variant="caption">
              {validationErrors.bookDescription}
            </Typography>
          )}
        </Box>
        {/* Chapter */}
        <Box sx={{ ...forminput, ...inputForm }}>
          <Typography variant="h3" sx={{mt:1}}>
            Chapter
          </Typography>
          {/* <Autocomplete
            multiple
            disableCloseOnSelect
            options={chapters}
            loading={mlLoading}
            disabled={saving}
            value={getSelectedChData()}
            inputValue={mlSearch}
            getOptionLabel={(option) => option.chapterTitle || ""}
            isOptionEqualToValue={(opt, val) =>
              (opt.id || opt.chapterId) === (val.id || val.chapterId)
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

              const ids = newValue.map((ml) => ml.id || ml.chapterId);
              handleInputChange("chapter", ids);
              setSelectedMLData(newValue);
              setMlSearch("");

              const lastSelected = newValue[newValue.length - 1];
              const chapterId = lastSelected?.id || lastSelected?.chapterId;

              // if (chapterId) {
              //   const res = await dispatch(fetchMLById(chapterId)).unwrap();

              //   setMlFileCountMap((prev) => ({
              //     ...prev,
              //     [chapterId]: res?.trainingDocs?.length || 0,
              //   }));
              // }
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
                placeholder="Select Chapter"
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
  options={chapters}
  loading={loading}
  disabled={saving}
  value={getSelectedChData()}
  inputValue={chapterSearch}
  getOptionLabel={(option) => option.chapterTitle || ""}
  isOptionEqualToValue={(opt, val) =>
    (opt.id || opt.chapterId) === (val.id || val.chapterId)
  }
  onChange={(_, newValue, reason) => {
    if (reason === "removeOption") return;

    const ids = newValue.map((ch) => ch.id || ch.chapterId);
    handleInputChange("chapter", ids);
    setSelectedMLData(newValue);
    setChapterSearch("");
  }}
  onInputChange={(_, value, reason) => {
    if (reason === "input") {
      setChapterSearch(value);
      setChapterPage(0);

      dispatch(
        fetchAllChapters({
          page: 0,
          size: 20,
          searchtext: value,
        })
      );
    }
  }}
  ListboxProps={{
    onScroll: handleChapterScroll,
    ref: listboxRef,
  }}
  renderTags={() => null}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Select Chapter"
      size="small"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading && <CircularProgress size={18} />}
          </>
        ),
      }}
    />
  )}
  sx={{ width: "46%", mt:4,"& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" }, }}
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
        {formData.chapter && formData.chapter.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Selected Chapter</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
            <div
  style={{
    maxHeight: "350px",   // adjust height as needed
    overflowY: "auto",
    overflowX: "hidden",
    border: "1px solid #eee",
    borderRadius: "6px",
  }}
>
  <table className="w-full table-auto">
    <thead>
      <tr>
        <th className="w-12 px-4 py-3"></th>
        <th className="w-16 px-4 py-3 text-center" >S.No</th>
        <th className="w-28 px-4 py-3 text-center">ID</th>
        <th className="px-4 py-3" >Title</th>
        <th className="px-6 py-3 ">Description</th>
        <th className="w-20 px-4 py-3 text-center">Action</th>
      </tr>
    </thead>

    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={formData.chapter}
        strategy={verticalListSortingStrategy}
      >
        <tbody>
          {getSelectedChData().map((ch, index) => (
            <SortableRow
              key={ch.id || ch.chapterId}
              ch={ch}
              index={index}
              onRemove={handleRemoveML}  />
          ))}
        </tbody>
      </SortableContext>
    </DndContext>
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
        //         disabled={isDeleting}
        //         type={"button"}
        //       />

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
        //             await dispatch(deleteBook(itemId));

        //             await dispatch(
        //               fetchAllBooks({ page: 0, size: 20, searchText: "" })
        //             );
        //             toast.success("Chapter deleted successfully");
        //             setShowDeleteDialog(false);
        //             onClose();
        //           } catch (error) {
        //             toast.error("Failed to delete chapter");
        //           } finally {
        //             setIsDeleting(false);
        //           }
        //         }}
        //         type={"button"}
        //       />
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
                {selectedBook?.bookId}
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
                {selectedBook?.bookId}
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
                    // await dispatch(deleteBookThunk(itemId)).unwrap();
                    await dispatch(deleteBook(itemId));

                    await dispatch(
                      fetchAllBooks({ page: 0, size: 20, searchText: "" })
                    );
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
