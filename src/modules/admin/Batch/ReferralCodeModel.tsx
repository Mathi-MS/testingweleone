import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { GripVertical, X } from "lucide-react";
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
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { RiDeleteBin5Line } from "react-icons/ri";
import CustomButton from "../../../components/custom/CustomButton";
import { forminput, inputForm } from "../../../components/custom/CustomStyles";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import {
  clearSelectedReferral,
  createReferralThunk,
  deleteReferralThunk,
  getAllReferralsThunk,
  getReferralsCategoryThunk,
  updateReferralThunk,
} from "../../../features/referralcodeSlice";
import { getAllBatchThunk } from "../../../features/batchSlice";
import { showError, showSuccess } from "../../../components/ui/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

const BATCH_PAGE_SIZE = 20;

// ── Sortable Row ──────────────────────────────────────────────
interface SortableBatchRowProps {
  batch: any;
  index: number;
  onRemove: (id: string) => void;
}

const SortableBatchRow = ({ batch, index, onRemove }: SortableBatchRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: batch.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      {/* Drag */}
      <td className="w-12 px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move flex justify-center"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </td>

      {/* S.No */}
      <td className="w-16 px-4 py-3 text-center text-sm">{index + 1}</td>

      {/* Batch ID */}
      <td className="w-28 px-4 py-3 text-center text-sm font-medium">
        {batch?.batchCode || batch?.id || "-"}
      </td>

      {/* Batch Name */}
<td className="px-4 py-3 text-center text-sm max-w-[150px] relative group">
  <div className="truncate">
    {batch?.batchName || "-"}
  </div>

  {batch?.batchName && batch.batchName.length > 18 && (
    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
           hidden group-hover:block 
           bg-gray-800 text-white text-xs rounded px-2 py-1 
           whitespace-nowrap z-50 shadow-lg">
      {batch.batchName}
    </div>
  )}
</td>

      {/* Action */}
      <td className="w-20 px-4 py-3 text-center">
        <button
          onClick={() => onRemove(batch.id)}
          className="text-red-600 hover:text-red-800"
        >
          <RiDeleteBin5Line />
        </button>
      </td>
    </tr>
  );
};

// ── Main Component ────────────────────────────────────────────
export const ReferralCodeModel = ({ open, onClose, editData }: Props) => {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    category: "",
    courses: [] as string[],
    expiryDate: "",
    expiryTime: "",
    prize:""
  });

  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [expand, setExpand] = useState(false);

  // ── Batch Autocomplete state ──────────────────────────────────
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchSearch, setBatchSearch] = useState("");
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [batchHasMore, setBatchHasMore] = useState(true);
  const [batchPage, setBatchPage] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const batchSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batchListboxRef = useRef<HTMLUListElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const width = expand ? "80%" : "50%";
  
  const { categories  } = useAppSelector(
    (state) => state.referral
  );
const categorie = (categories || []).map((item: any) => ({
  label: item.name,
  value: item.id,
}));
  // ── DnD sensors ───────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = formData.courses.indexOf(active.id as string);
    const newIndex = formData.courses.indexOf(over.id as string);
    const reordered = arrayMove(formData.courses, oldIndex, newIndex);
    setFormData((prev) => ({ ...prev, courses: reordered }));
    setSelectedBatches((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleRemoveBatch = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c !== id),
    }));
    setSelectedBatches((prev) => prev.filter((b) => b.id !== id));
  };

  // ── Fetch batches ─────────────────────────────────────────────
  const fetchBatches = useCallback(
    (page: number, search: string, reset = false) => {
      setBatchLoading(true);
      dispatch(
        getAllBatchThunk({
          page,
          size: BATCH_PAGE_SIZE,
          search: search || null,
          filters: { isPublish: true },
        })
      )
        .unwrap()
        .then((result: any) => {
          const incoming = result.batches ?? [];
          setAllBatches((prev) => (reset ? incoming : [...prev, ...incoming]));
          setBatchHasMore(incoming.length === BATCH_PAGE_SIZE);
        })
        .catch(console.error)
        .finally(() => setBatchLoading(false));
    },
    [dispatch]
  );

  // ── Initial load on open ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setAllBatches([]);
      setBatchPage(0);
      setBatchHasMore(true);
      fetchBatches(0, "", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Auto-fill edit data (single effect, mirrors BookModal pattern) ──
  useEffect(() => {
    if (editData && open) {
      // Extract IDs for formData.courses
      const batchIds = (editData.batchDetails ?? []).map((b: any) => b.batchId);

      // Build full batch objects directly from batchDetails —
      // no need to wait for allBatches to load (same as BookModal's chapterData)
      const batchData = (editData.batchDetails ?? []).map((b: any) => ({
        id: b.batchId,           // used by DnD & isOptionEqualToValue
        batchCode: b.batchGenId, // shown in "Batch ID" column
        batchName: b.batchName,  // shown in "Batch Name" column
      }));

      setFormData({
        name: editData.name || "",
        mobile: editData.mobileNumber || "",
        email: editData.mailId || "",
        category: editData.category || "",
        courses: batchIds,
        expiryDate: editData.expiryDate || "",
        expiryTime: editData.expiryTime || "",
        prize:editData.discountAmount||"",
      });

      // Pre-populate immediately so the table renders without waiting for allBatches
      setSelectedBatches(batchData);
    }
  }, [editData, open]);
useEffect(() => {
  if (open) {
    dispatch(getReferralsCategoryThunk());
  }
}, [open, dispatch]);
  // ── Reset on close ────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        mobile: "",
        email: "",
        category: "",
        courses: [],
        expiryDate: "",
        expiryTime: "",
        prize:""
      });
      setErrors({});
      setBatchSearch("");
      setAllBatches([]);
      setBatchPage(0);
      setSelectedBatches([]);
    }
  }, [open]);

  // ── Debounced search ──────────────────────────────────────────
  const handleBatchSearch = (value: string) => {
    setBatchSearch(value);
    if (batchSearchTimerRef.current) clearTimeout(batchSearchTimerRef.current);
    batchSearchTimerRef.current = setTimeout(() => {
      setAllBatches([]);
      setBatchPage(0);
      setBatchHasMore(true);
      fetchBatches(0, value, true);
    }, 400);
  };

  // ── Infinite scroll ───────────────────────────────────────────
  const handleBatchScroll = useCallback(
    (e: React.SyntheticEvent) => {
      const el = e.currentTarget as HTMLUListElement;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      if (nearBottom && batchHasMore && !batchLoading) {
        const next = batchPage + 1;
        setBatchPage(next);
        fetchBatches(next, batchSearch);
      }
    },
    [batchHasMore, batchLoading, batchPage, batchSearch, fetchBatches]
  );

  // ── Form helpers ──────────────────────────────────────────────
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const updated = { ...errors };
      delete updated[field];
      setErrors(updated);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter valid 10-digit mobile number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.category) newErrors.category = "Select category";
    if (!formData.courses.length) newErrors.courses = "Select at least one batch";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.expiryTime) newErrors.expiryTime = "Expiry time is required";
    if (!formData.prize) newErrors.prize = "discount prize  is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validate()) return;
  setSaving(true);

  try {
    if (editData) {
      const res = await dispatch(
        updateReferralThunk({
          id: editData.id || editData._id,
          payload: {
            name: formData.name,
            mobileNumber: formData.mobile,
            mailId: formData.email,
            category: formData.category,
            batchId: formData.courses,
            expiryDate: formData.expiryDate,
            expiryTime: formData.expiryTime,
            discountAmount: Number(formData.prize),
          },
        })
      ).unwrap();

      const message =
        res?.message || "Referral updated successfully";

      showSuccess(message);
    } else {
      const res = await dispatch(
        createReferralThunk({
          name: formData.name,
          mobileNumber: formData.mobile,
          mailId: formData.email,
          category: formData.category,
          batchId: formData.courses,
          expiryDate: formData.expiryDate,
          expiryTime: formData.expiryTime,
          discountAmount: Number(formData.prize),
        })
      ).unwrap();

      const message =
        res?.message || "Referral created successfully";

      showSuccess(message);
    }

    await dispatch(getAllReferralsThunk({ page: 0, size: 20 }));

    onClose();
    dispatch(clearSelectedReferral());
  } catch (err: any) {
    console.error(err);

    const errorMsg =
      err || err?.message || "Something went wrong";

    showError(errorMsg);
  } finally {
    setSaving(false);
  }
};

  // ── Derive selected batch objects in order ────────────────────
  // Mirrors BookModal's getSelectedChData: prefers allBatches (live list),
  // falls back to selectedBatches (pre-populated from editData)
  const getSelectedBatchData = () =>
    formData.courses
      .map((id) => {
        const fromList = allBatches.find((b) => b.id === id);
        const fromSelected = selectedBatches.find((b) => b.id === id);
        return fromList || fromSelected;
      })
      .filter(Boolean);

  // ── Today's date for min constraint ──────────────────────────
  const todayDate = new Date().toISOString().split("T")[0];

  // ── Delete confirm ────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    const referralId = editData?.id || editData?._id;
    if (!referralId) {
      console.error("No ID found for deletion");
      return;
    }
    setDeleting(true);
    
    try {
      const res = await dispatch(deleteReferralThunk(referralId)).unwrap();

    showSuccess(res?.message || "Referral deleted successfully");

    setDeleteOpen(false);
    onClose();
      await dispatch(getAllReferralsThunk({ page: 0, size: 20 }));
    } catch (err: any) {
      showError(err || "Failed to delete referral");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width,
        height: "100vh",
        bgcolor: "#fff",
        transition: "0.3s",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 3,
        zIndex: 1300,
        overflowY: "auto",
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <IconButton onClick={onClose}>
            <HiOutlineChevronDoubleRight  size={16} color="var(--black)" />
          </IconButton>
          <IconButton onClick={() => setExpand(!expand)}>
            {expand ? (
              <RiCollapseDiagonal2Line size={18} />
            ) : (
              <CgArrowsExpandLeft size={14} />
            )}
          </IconButton>
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {editData ? "Edit Coupon code" : "Create Coupon code"}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          {editData ? (
            <CustomButton
              variant="outlined"
              label="Delete"
              onClick={() => setDeleteOpen(true)}
              type={"button"}
            />
          ) : (
            <CustomButton
              variant="outlined"
              label="Cancel"
              onClick={onClose}
              type={"button"}
            />
          )}
          <CustomButton
            variant="contained"
            label={editData ? "Update" : "Save"}
            onClick={handleSubmit}
            disabled={saving}
            type={"button"}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* FORM */}
      <Box display="flex" flexDirection="column" gap={1}>

        {/* NAME */}
        <Box sx={forminput}>
          <Typography variant="h3">Name</Typography>
          <TextField
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={inputForm}
          />
        </Box>

        {/* MOBILE */}
        <Box sx={forminput}>
          <Typography variant="h3">Mobile</Typography>
          <TextField
            value={formData.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            error={!!errors.mobile}
            helperText={errors.mobile}
            sx={inputForm}
          />
        </Box>

        {/* EMAIL */}
        <Box sx={forminput}>
          <Typography variant="h3">Email</Typography>
          <TextField
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={inputForm}
          />
        </Box>

        {/* CATEGORY */}
        <Box sx={forminput}>
          <Typography variant="h3" >Category</Typography>
          <TextField
            select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
            sx={inputForm}
          >
           {categorie.length === 0 ? (
    <MenuItem disabled>Loading...</MenuItem>
  ) : (
    categorie.map((cat) => (
      <MenuItem key={cat.value} value={cat.value}>
        {cat.label}
      </MenuItem>
    ))
  )}
          </TextField>
        </Box>

        {/* EXPIRY DATE */}
        <Box sx={forminput}>
          <Typography variant="h3" >Expiry Date</Typography>
          <TextField
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
            error={!!errors.expiryDate}
            helperText={errors.expiryDate}
            inputProps={{ min: todayDate }}
            sx={inputForm}
          />
        </Box>

        {/* EXPIRY TIME */}
        <Box sx={forminput}>
          <Typography variant="h3">Expiry Time</Typography>
          <TextField
            type="time"
            value={formData.expiryTime}
            onChange={(e) => handleChange("expiryTime", e.target.value)}
            error={!!errors.expiryTime}
            helperText={errors.expiryTime}
            sx={inputForm}
          />
        </Box>
          <Box sx={forminput}>
          <Typography variant="h3">discount prize</Typography>
          <TextField
            value={formData.prize}
            onChange={(e) => handleChange("prize", e.target.value)}
            error={!!errors.prize}
            helperText={errors.prize}
            sx={inputForm}
          />
        </Box>

        {/* BATCH — multiple Autocomplete with search + infinite scroll */}
        <Box sx={forminput}>
          <Typography variant="h3">Batch</Typography>
          <Autocomplete
            multiple
            disableCloseOnSelect
            open={batchOpen}
            onOpen={() => setBatchOpen(true)}
            onClose={() => {
              setBatchOpen(false);
              if (batchSearch) {
                setBatchSearch("");
                setAllBatches([]);
                setBatchPage(0);
                fetchBatches(0, "", true);
              }
            }}
            options={allBatches}
            loading={batchLoading}
            disabled={saving}
            value={getSelectedBatchData()}
            inputValue={batchSearch}
            getOptionLabel={(option) => option.batchName || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onChange={(_, newValue, reason) => {
              if (reason === "removeOption") return;
              const ids = newValue.map((b: any) => b.id);
              handleChange("courses", ids);
              setSelectedBatches(newValue);
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") handleBatchSearch(value);
            }}
            renderTags={() => null}
            ListboxProps={{
              ref: batchListboxRef,
              onScroll: handleBatchScroll,
              style: { maxHeight: 240, overflow: "auto" },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Batch"
                size="small"
                error={!!errors.courses}
                helperText={errors.courses}
                sx={inputForm}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {batchLoading && (
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                      )}
                      <Box
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setBatchOpen((prev) => !prev);
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

        {/* SELECTED BATCH TABLE */}
        {formData.courses.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-3">Selected Batches</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div
                style={{
                  maxHeight: "350px",
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
                      <th className="w-16 px-4 py-3 text-center text-sm">S.No</th>
                      <th className="w-28 px-4 py-3 text-center text-sm">Batch ID</th>
                      <th className="px-4 py-3 text-sm">Batch Name</th>
                      <th className="w-20 px-4 py-3 text-center text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <SortableContext
                      items={formData.courses}
                      strategy={verticalListSortingStrategy}
                    >
                      {getSelectedBatchData().map((batch: any, index) => (
                        <SortableBatchRow
                          key={batch.id}
                          batch={batch}
                          index={index}
                          onRemove={handleRemoveBatch}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </div>
            </DndContext>
          </div>
        )}

      </Box>

      {/* DELETE DIALOG */}
      {deleteOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1500,
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              width: "800px",
              maxWidth: "40%",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Close */}
            <IconButton
              sx={{ position: "absolute", right: 8, top: 8 }}
              onClick={() => setDeleteOpen(false)}
            >
              <X size={18} />
            </IconButton>

            {/* Title */}
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, mb: 3, textAlign: "left" }}
            >
              Delete this referral?
            </Typography>

            {/* Description */}
            <Typography sx={{ fontSize: 14, mb: 4 }}>
              Are you sure you want to delete this referral{" "}
              <b>{editData?.mailId}</b>? 
            </Typography>

            {/* Buttons */}
            <Box display="flex" justifyContent="center" gap={2}>
              <CustomButton
                variant="outlined"
                label="Cancel"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                type={"button"}
              />
              <CustomButton
                variant="contained"
                label={deleting ? "Deleting..." : "Delete"}
                onClick={handleDeleteConfirm}
                disabled={deleting}
                type={"button"}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};