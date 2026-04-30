import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Slider,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { TbFileDescription } from "react-icons/tb";
import {
  AiOutlineDelete,
  AiOutlineCheckCircle,
  AiOutlinePlus,
  AiOutlineEye,
  AiOutlineScissor,
} from "react-icons/ai";
import { MdRefresh, MdClose, MdDragIndicator } from "react-icons/md";
import { FiBook } from "react-icons/fi";
import { CircularProgress, Chip, Paper } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CustomButton from "../../../components/custom/CustomButton";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { CourseSchema } from "../../../validation/Schema";
import {
  forminput,
  inputForm,
  inputTitle,
} from "../../../components/custom/CustomStyles";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import {
  fetchAllCategories,
  fetchSubCategories,
} from "../../../features/categoriesSlice";
import { showError, showSuccess } from "../../../components/ui/Toast";
import {
  createCourse,
  getAllCourses,
  getAllCourseCategories,
} from "../../../features/course/courseSlice";
import { fetchAllBooks } from "../../../features/microlearning/bookSlice";
import { useAppSelector } from "../../../app/hook";

const SortableBookRow = ({
  book,
  index,
  onRemove,
  uploading,
}: {
  book: any;
  index: number;
  uploading: boolean;
  onRemove: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="px-4 py-3 text-start">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <MdDragIndicator size={16} className="text-gray-400" />
        </div>
      </td>
      <td className="px-4 py-3 text-start">{index + 1}</td>
      <td className="px-4 py-3 text-start">{book.bookId}</td>
      <td className="px-4 py-3 text-start">{book.bookTitle}</td>
      <td className="px-4 py-3 text-start">{book.bookDescription}</td>
      <td className="px-4 py-3 text-start">
        <button
          type="button"
          onClick={() => onRemove(book.id)}
          className="text-red-600 hover:text-red-800"
          disabled={uploading}
        >
          <RiDeleteBin5Line size={16} />
        </button>
      </td>
    </tr>
  );
};

interface FormValues {
  courseTitle: string;
  courseCategory: string | null;
  // courseType: string | null;
  // promotionalContent: string;
  // skillLevel: string | null;
  // language: string | null;
  // skillsYouGain: string[];
  // currentSkillInput?: string;
  // whatYouLearn: string;
  courseDescription: string;
  books: string[];
  courseDuration: string;
  durationType: string | null;
  // bannerImage: File | undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const CoursesModel = ({ open, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [expand, setExpand] = useState(false);
  const [activeEditorIndex, setActiveEditorIndex] = useState<number | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [createdMlId, setCreatedMlId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppingField, setCroppingField] = useState<keyof FormValues | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [cropArea, setCropArea] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const [selectedBooks, setSelectedBooks] = useState<any[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  const width = expand ? "80%" : "50%";
  const { booklist } = useAppSelector((state) => state.book);
  const { filterData } = useSelector((state: RootState) => state.ml);
  const { courseCategories } = useSelector((state: RootState) => state.course);

  const getSelectedBooks = () => {
    const selectedIds = watch("books") || [];
    // Maintain the order based on the books array
    return (
      selectedIds
        .map((id) => booklist?.find((book) => book.id === id))
        .filter(Boolean) || []
    );
  };

  const handleRemoveBook = (bookId: string) => {
    const currentBooks = watch("books") || [];
    setValue(
      "books",
      currentBooks.filter((id) => id !== bookId)
    );
    setSelectedBooks((prev) => prev.filter((book) => book.id !== bookId));
  };
  const sensors = useSensors(useSensor(PointerSensor));

  const handleBookDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentBooks = watch("books") || [];
    const oldIndex = currentBooks.findIndex((id) => id === active.id);
    const newIndex = currentBooks.findIndex((id) => id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...currentBooks];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      setValue("books", newOrder);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imageOffset.x,
      y: e.clientY - imageOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setImageOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // const handleCropSave = async () => {
  //   const field = croppingField;
  //   if (!cropImage || !field) return;

  //   const img = new Image();
  //   img.onload = () => {
  //     const imgElement = document.getElementById(
  //       "crop-preview-img"
  //     ) as HTMLImageElement;
  //     if (!imgElement) return;

  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) return;

  //     canvas.width = 1200;
  //     canvas.height = 800;

  //     const displayedWidth = imgElement.width;
  //     const displayedHeight = imgElement.height;

  //     const scaleFactor = img.width / (displayedWidth * scale);

  //     const container = document.getElementById("crop-container");
  //     if (!container) return;
  //     const containerRect = container.getBoundingClientRect();
  //     const cropRect = document
  //       .getElementById("fixed-crop-box")
  //       ?.getBoundingClientRect();
  //     if (!cropRect) return;

  //     const imgRect = imgElement.getBoundingClientRect();

  //     const sx = (cropRect.left - imgRect.left) * (img.width / imgRect.width);
  //     const sy = (cropRect.top - imgRect.top) * (img.height / imgRect.height);
  //     const sw = cropRect.width * (img.width / imgRect.width);
  //     const sh = cropRect.height * (img.height / imgRect.height);

  //     ctx.fillStyle = "white";
  //     ctx.fillRect(0, 0, 1200, 800);

  //     ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 800);

  //     canvas.toBlob((blob) => {
  //       if (blob) {
  //         const croppedFile = new File([blob], "banner_1200x800.png", {
  //           type: "image/png",
  //         });
  //         setValue(field, croppedFile, { shouldValidate: true });
  //       }
  //       setCropImage(null);
  //       setCroppingField(null);
  //       setImageOffset({ x: 0, y: 0 });
  //       setScale(1);
  //     }, "image/png");
  //   };
  //   img.src = cropImage;
  // };
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CourseSchema),
    defaultValues: {
      courseTitle: "",
      courseCategory: null,
      // courseType: null,
      // promotionalContent: "",
      // skillLevel: null,
      // language: null,
      // skillsYouGain: [],
      // currentSkillInput: "",
      // whatYouLearn: "",
      courseDescription: "",
      books: [],
      courseDuration: "",
      durationType: "month",
      // bannerImage: undefined,
    },
  });
  // const skillsYouGain = watch("skillsYouGain") || [];
  // const currentSkillInput = watch("currentSkillInput");

  // const addSkill = () => {
  //   if (currentSkillInput && currentSkillInput.trim()) {
  //     setValue("skillsYouGain", [...skillsYouGain, currentSkillInput.trim()]);
  //     setValue("currentSkillInput", "");
  //   }
  // };

  // const removeSkill = (skillToRemove: string) => {
  //   setValue(
  //     "skillsYouGain",
  //     skillsYouGain.filter((skill) => skill !== skillToRemove)
  //   );
  // };

const onSubmit = async (data: FormValues) => {
  setUploading(true);

  try {
    const payload = {
      courseTitle: data.courseTitle,
      courseCategory: data.courseCategory,
      // courseType: data.courseType,
      courseDescription: data.courseDescription,
      books: data.books,
      courseDuration: data.courseDuration,
      durationType: data.durationType,
    };
console.log(payload,'payloadpayload');

    const response = await dispatch(
      createCourse({
        course: payload,
      })
    ).unwrap();

    reset();
    onClose();
    dispatch(getAllCourses({ page: 0, size: 10 }));
    showSuccess("Course created successfully");

  } catch (error) {
    showError(typeof error === "string" ? error : "Failed to create course");
  } finally {
    setUploading(false);
  }
};

  useEffect(() => {
    if (open) {
      dispatch(fetchAllCategories());
      dispatch(fetchAllBooks({ page: 0, size: 100, searchText: "" }));
      reset();
      setUploading(false);
      setCreatedMlId(null);
    }
  }, [open, dispatch, reset]);
  // const courseTypeOptions = [
  //   { label: "AddonCourse", value: "AddonCourse" },
  //   { label: "MainCourse", value: "MainCourse" },
  // ];

  const categoryOptions =
    courseCategories?.map((category) => ({
      label: category.categoryName,
      value: category.id,
    })) || [];

  const skillLevelOptions = [
    { label: "Basic", value: "Basic" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ];

  const languageOptions = [
    // { label: "Hindi", value: "Hindi" },
    // { label: "Marathi", value: "Marathi" },
    { label: "Tamil", value: "Tamil" },
    // { label: "Telugu", value: "Telugu" },
    // { label: "Kannada", value: "Kannada" },
    // { label: "Gujarati", value: "Gujarati" },
    // { label: "Bengali", value: "Bengali" },
    // { label: "Malayalam", value: "Malayalam" },
    // { label: "Punjabi", value: "Punjabi" },
    // { label: "Sanskrit", value: "Sanskrit" },
    { label: "English", value: "English" },
  ];

  const durationOptions = [
    { label: "Month", value: "month" },
    { label: "Days", value: "days" },
  ];

  const handleClose = () => {
    clearErrors();
    reset();
    onClose();
  };
  useEffect(() => {
    if (open) {
      dispatch(getAllCourseCategories());
    }
  }, [open, dispatch]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width,
        height: "100vh",
        background: "#fff",
        transition: "0.4s",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 2,
        zIndex: 1200,
        "& .ql-editor ": {
          minHeight: "max-content",
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit as any)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose} disabled={uploading}>
              <HiOutlineChevronDoubleRight size={16} />
            </IconButton>
            <IconButton onClick={() => setExpand(!expand)} disabled={uploading}>
              {expand ? (
                <RiCollapseDiagonal2Line size={16} />
              ) : (
                <CgArrowsExpandLeft size={16} />
              )}
            </IconButton>
            <Typography
              sx={{
                fontSize: 14,
                ml: 1,
                color: "var(--black-three)",
                fontWeight: 600,
              }}
            >
              Course / Creation
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={handleClose}
              disabled={uploading}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={uploading ? "Saving..." : "Save"}
              disabled={uploading}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            mt: 2,
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
            pr: 1,
            "& h3": { color: "var(--black-text)" },
          }}
        >
          <CustomInput
            placeholder="Course Name..."
            name="courseTitle"
            register={register}
            errors={errors}
            boxSx={inputTitle}
            disabled={uploading}
          />
          <Box sx={{mt:1,...forminput}}>
            <Typography variant="h3">Course Category</Typography>
            <CustomAutocomplete
              name="courseCategory"
              control={control}
              options={categoryOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box>
          <Box sx={{mt:1,...forminput}}>
            <Typography variant="h3">Course Duration</Typography>
            <Box sx={{ display: "flex", gap: 0, ...inputForm }}>
              <CustomInput
                name="courseDuration"
                register={register}
                errors={errors}
                boxSx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                }}
                disabled={uploading}
              />
              <CustomAutocomplete
                name="durationType"
                control={control}
                options={durationOptions}
                errors={errors}
                disableClearable
                boxSx={{
                  width: "120px",
                  "& .MuiOutlinedInput-root": {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: "none",
                  },
                }}
                disabled={uploading}
              />
            </Box>
          </Box>

          <Box sx={{mt:1,...forminput}}>
            <Typography variant="h3">Course Description</Typography>
            <CustomInput
              name="courseDescription"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box>

          {/* <Box sx={{mt:1,...forminput}}>
            <Typography variant="h3">Course type</Typography>
            <CustomAutocomplete
              name="courseType"
              control={control}
              options={courseTypeOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box> */}

          {/* <Box sx={forminput}>
            <Typography variant="h3">Banner Image</Typography>
            <Box sx={{ width: "100%", mt: 1 }}>
              <Box
                sx={{
                  ...inputForm,
                  display: "flex",
                  alignItems: "start",
                  gap: 2,
                  flexDirection: "column",
                }}
              >
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Upload Image"
                  onClick={() =>
                    document.getElementById("bannerImage")?.click()
                  }
                  boxSx={{ width: "max-content" }}
                  disabled={uploading}
                />
                <input
                  id="bannerImage"
                  type="file"
                  hidden
                  onChange={(e) =>
                    setValue("bannerImage", e.target.files?.[0], {
                      shouldValidate: true,
                    })
                  }
                />
                {watch("bannerImage") &&
                  watch("bannerImage") instanceof File &&
                  watch("bannerImage")?.type.startsWith("image/") && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption">
                        {watch("bannerImage")?.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const file = watch("bannerImage");
                          if (file) {
                            setCropImage(URL.createObjectURL(file));
                            setCroppingField("bannerImage");
                          }
                        }}
                        title="Crop"
                      >
                        <AiOutlineEye size={18} />
                      </IconButton>
                    </Box>
                  )}
              </Box>
              {errors.bannerImage && (
                <Typography color="error" variant="caption">
                  {errors.bannerImage.message as string}
                </Typography>
              )}
            </Box>
          </Box> */}

          {/* <Box sx={forminput}>
            <Typography variant="h3">Short FOMO Message</Typography>
            <CustomInput
              name="promotionalContent"
              placeholder="e.g., Only 10 slots left"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box> */}

          {/* <Box sx={forminput}>
            <Typography variant="h3">Skill level</Typography>
            <CustomAutocomplete
              name="skillLevel"
              control={control}
              options={skillLevelOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box> */}

          {/* <Box sx={forminput}>
            <Typography variant="h3">Language</Typography>
            <CustomAutocomplete
              name="language"
              control={control}
              options={languageOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box> */}

          {/* <Box sx={{ ...forminput, alignItems: "center" }}>
            <Typography variant="h3">Skills you gain</Typography>
            <Box
              sx={{
                ...inputForm,
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <CustomInput
                  name="currentSkillInput"
                  register={register}
                  placeholder="Type a skill and press enter..."
                  disabled={uploading}
                  boxSx={{
                    flexGrow: 1,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "transparent",
                      border: "none",
                      "& fieldset": { border: "none" },
                    },
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <IconButton
                  onClick={addSkill}
                  sx={{ width: "30px", height: "30px", padding: "0px" }}
                >
                  <AiOutlinePlus size={16} />
                </IconButton>
              </Box>
              {errors.skillsYouGain && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.skillsYouGain.message}
                </Typography>
              )}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: skillsYouGain.length > 0 ? 1.5 : 0,
                }}
              >
                {skillsYouGain.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    onDelete={() => removeSkill(skill)}
                    deleteIcon={<MdClose style={{ fontSize: "16px" }} />}
                    sx={{
                      backgroundColor: "var(--primary)",
                      color: "var(--white)",
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": {
                        color: "primary.contrastText",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box> */}
          {/* <Box sx={{ ...forminput, alignItems: "start", mt: 2 }}>
            <Typography variant="h3" sx={{}}>
              What you learn
            </Typography>
            <Box sx={{ ...inputForm }}>
              <ReactQuill
                theme="snow"
                value={watch("whatYouLearn")}
                onChange={(content) => setValue("whatYouLearn", content)}
                readOnly={uploading}
              />
              {errors.whatYouLearn && (
                <Typography color="error" variant="caption">
                  {errors.whatYouLearn.message}
                </Typography>
              )}
            </Box>
          </Box> */}
          <Box sx={{ mt:1,...forminput, ...inputForm }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Books
            </Typography>
            <Box
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  paddingRight: "10px!important",
                },
              }}
            >
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={booklist || []}
                loading={false}
                disabled={uploading}
                value={getSelectedBooks()}
                inputValue={bookSearch}
                sx={{ width: "300px" }}
                getOptionLabel={(option) => option?.bookTitle || ""}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, newValue, reason) => {
                  if (reason === "removeOption") return;
                  const ids = newValue
                    .map((book) => book?.id)
                    .filter((id): id is string => Boolean(id));
                  setValue("books", ids, { shouldValidate: true });
                  setSelectedBooks(newValue.filter(Boolean));
                  setBookSearch("");
                }}
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    setBookSearch(value);
                  }
                }}
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Books"
                    size="small"
                    error={!!errors.books}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              color: "#bdbdbd",
                              cursor: "pointer",
                              ml: 0.5,
                            }}
                          >
                            <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                            <KeyboardArrowDownIcon
                              sx={{ fontSize: 18, mt: -1 }}
                            />
                          </Box>
                        </>
                      ),
                    }}
                  />
                )}
              />
              {errors.books && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                  {errors.books.message}
                </Typography>
              )}
            </Box>
          </Box>
          {watch("books") && watch("books").length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Selected Books</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleBookDragEnd}
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
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-4 py-3"></th>
                        <th className="w-16 px-4 py-3 text-start">S.No</th>
                        <th className="w-28 px-4 py-3 text-start">Book ID</th>
                        <th className="px-4 py-3 text-start">Book Title</th>
                        <th className="px-4 py-3 text-start">Description</th>
                        <th className="w-20 px-4 py-3 text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <SortableContext
                        items={watch("books") || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {getSelectedBooks().map(
                          (book, index) =>
                            book && (
                              <SortableBookRow
                                key={book.id}
                                book={book}
                                index={index}
                                onRemove={handleRemoveBook}
                                uploading={uploading}
                              />
                            )
                        )}
                      </SortableContext>
                    </tbody>
                  </table>
                </div>
              </DndContext>
            </div>
          )}
        </Box>
      </Box>

      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        sx={{ zIndex: 1300 }}
      >
        <DialogContent sx={{ position: "relative", p: 0 }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
            }}
          >
            <MdClose />
          </IconButton>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!cropImage}
        onClose={() => {
          setCropImage(null);
          setScale(1);
          setImageOffset({ x: 0, y: 0 });
        }}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", color: "#555", fontSize: "16px" }}
        >
          Upload background Image
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%", mt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: "text.secondary", fontWeight: 500 }}
              >
                Scale
              </Typography>
              <Slider
                value={scale}
                min={1}
                max={5}
                step={0.1}
                onChange={(_, value) => setScale(value as number)}
                sx={{ width: "100%" }}
              />
            </Box>

            <Box
              id="crop-container"
              sx={{
                position: "relative",
                width: "100%",
                height: "200px",
                overflow: "hidden",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {cropImage && (
                <img
                  id="crop-preview-img"
                  src={cropImage}
                  alt="To Crop"
                  style={{
                    position: "absolute",
                    transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${scale})`,
                    maxWidth: "none",
                    maxHeight: "none",
                    display: "block",
                    userSelect: "none",
                    pointerEvents: "none",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }}
                  draggable={false}
                />
              )}

              {/* Fixed 1200x800 Aspect Ratio Overlay (3:2) */}
              <Box
                id="fixed-crop-box"
                sx={{
                  position: "absolute",
                  width: "calc(100% - 40px)",
                  aspectRatio: "3 / 2",
                  maxHeight: "calc(100% - 40px)",
                  border: "2px dashed #fff",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                  pointerEvents: "none",
                  zIndex: 10,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: "1px solid rgba(255,255,255,0.3)",
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
            >
              Drag the image to adjust its position and use the slider to zoom.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          {/* <Button
            onClick={handleCropSave}
            variant="contained"
            sx={{
              backgroundColor: "#2e7d32",
              "&:hover": { backgroundColor: "#1b5e20" },
              px: 4,
              fontWeight: "bold",
            }}
          >
            CROP IMAGE
          </Button> */}
          <Button
            onClick={() => {
              setCropImage(null);
              setScale(1);
              setImageOffset({ x: 0, y: 0 });
            }}
            variant="contained"
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": { backgroundColor: "#c62828" },
              px: 4,
              fontWeight: "bold",
            }}
            startIcon={<MdClose />}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesModel;
