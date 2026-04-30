import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../../../components/custom/CustomButton";
import { forminput, inputForm } from "../../../../components/custom/CustomStyles";
import { CustomAutocomplete } from "../../../../components/custom/CustomAutocomplete";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { getAllTrainer, getModalTrainers } from "../../../../features/trainerSlice";
import { batchMapping } from "../../../../features/batchSlice";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import { Mail, Phone, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string;
  onSuccess?: (trainerIds: string[]) => void;
}
const TrainerSchema = z.object({
  trainers: z.array(z.string()).optional(),
});
type FormValues = z.infer<typeof TrainerSchema>;

const TrainerModel = ({ open, onClose, batchId, onSuccess }: Props) => { 
  const dispatch = useDispatch(); 
  const [expand, setExpand] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [selectedTrainers, setSelectedTrainers] = useState<any[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedTrainerInfo, setSelectedTrainerInfo] = useState<any>(null);
  const {
      register,
      handleSubmit,
      control,
      watch,
      setValue,
      reset,
      formState: { errors },
    } = useForm<FormValues>({
      resolver: zodResolver(TrainerSchema),
      defaultValues: {
        trainers: [""],
      },
    });
    const { modalTrainers: trainersList, modalLoading: loading, modalHasMore: hasMore } = useSelector(
    (state: any) => state.trainer);
  const { mappingLoading } = useSelector((state: any) => state.batch);
  
  const filteredTrainers = (trainersList || []).filter(
    (trainer: any) => !selectedTrainers.find(selected => selected.id === trainer.id)
  );
  const width = expand ? "80%" : "50%";
  const handleSave = async () => {
    if (batchId && selectedTrainers.length > 0) {
      const trainerIds = selectedTrainers.map(trainer => trainer.id);
      const result = await dispatch(batchMapping({ id: batchId, trainerId: trainerIds }) as any);
      if (result.payload?.success === 200) {
        showSuccess("Trainer Mapping SuccessFully")
        onSuccess?.(result.payload?.data?.trainerId);
        handleClose();
      } else {
        showError(result.payload?.message || 'Something went wrong');
      }
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTrainers([]);
  };
  const handleAddTrainer = (trainer: any) => {
    if (!selectedTrainers.find(t => t.id === trainer.id)) {
      setSelectedTrainers([...selectedTrainers, trainer]);
    }
  };

  const handleRemoveTrainer = (trainerId: string) => {
    setSelectedTrainers(selectedTrainers.filter(t => t.id !== trainerId));
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 5;
    
    if (isNearBottom && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(getModalTrainers({ page: nextPage, size: 4, search: debouncedSearchTerm }) as any);
    }
  }, [hasMore, loading, page, debouncedSearchTerm, dispatch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setDebouncedSearchTerm(searchTerm);
    }
  };
  const handleTrainerInfo = (event: React.MouseEvent<HTMLElement>, trainer: any) => {
    event.stopPropagation();
    setSelectedTrainerInfo(trainer);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setSelectedTrainerInfo(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (open) {
      setPage(0);
      dispatch(getModalTrainers({ page: 0, size: 4, search: debouncedSearchTerm, reset: true }) as any);
    }
  }, [open, debouncedSearchTerm, dispatch]);
    
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
        zIndex: 9999,
        "& .ql-editor ": {
          minHeight: "max-content",
        },
      }}
    >
      <Box >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} />
            </IconButton>
            <IconButton onClick={() => setExpand(!expand)}>
                {expand ? (
                <RiCollapseDiagonal2Line size={16} />
            ) : (
                <CgArrowsExpandLeft size={16} />
                )}
             </IconButton>
            <Typography sx={{ fontSize: 14, ml: 1 }}>
              Batch / Trainer / Creation
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={handleClose}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={mappingLoading ? "Saving..." : "Save"}
              disabled={mappingLoading || selectedTrainers.length === 0}
              onClick={handleSave}
              boxSx={{whiteSpace:"nowrap",px:"30px"}}
            />
          </Box>
        </Box>
      </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                mt: 2,
                maxHeight: "calc(100vh - 160px)",
                overflowY: "auto",
                pr: 1,
              }}
            >
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search Name, Mobile no."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoSearchOutline size={20} color="#9CA3AF" />
                    </InputAdornment>
                  ),
                }}
                sx={{ ...inputForm, mb: 2 }}
              />

              {/* Trainers List */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1,
                  maxHeight: '200px', 
                  overflowY: 'auto' 
                }}
                onScroll={handleScroll}
              >
                {filteredTrainers.map((trainer: any) => (
                  <Box
                    key={trainer.id}
                    onClick={() => handleAddTrainer(trainer)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      py:1,
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAFAFA',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                        borderColor: '#10B981',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 35,
                          height: 35,
                          backgroundColor: '#E5E7EB',
                        }}
                      >
                        {trainer.trainerName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#111827',
                          }}
                        >
                          {trainer.trainerName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: '#6B7280',
                          }}
                        >
                          {trainer.primaryEmail || 'No email'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 10,
                          color: '#6B7280',
                          backgroundColor: '#F3F4F6',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                        }}
                      >
                        {trainer.trainerId || 'No ID'}
                      </Typography>
                      <IconButton size="small" sx={{ color: '#6B7280' }} onClick={(e) => handleTrainerInfo(e, trainer)}>
                        <HiOutlineInformationCircle size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Loading...</Typography>
                  </Box>
                )}
              </Box>

              {/* Selected Trainers Table */}
              {selectedTrainers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
                    Added Trainers ({selectedTrainers.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Trainer ID</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Expertise</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTrainers.map((trainer) => (
                          <TableRow key={trainer.id}>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                  {trainer.trainerName.charAt(0).toUpperCase()}
                                </Avatar>
                                {trainer.trainerName}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {trainer.primaryEmail || 'No email'}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {trainer.trainerId || 'No ID'}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {trainer.expertiseTags && trainer.expertiseTags.length > 0 ? (
                                  trainer.expertiseTags.map((tag: string, index: number) => (
                                    <Typography
                                      key={index}
                                      sx={{
                                        fontSize: 9,
                                        backgroundColor: '#E0F2FE',
                                        color: '#0369A1',
                                        px: 0.5,
                                        py: 0.25,
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {tag}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography sx={{ fontSize: 10, color: '#9CA3AF' }}>No expertise</Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemoveTrainer(trainer.id)}
                                sx={{ color: '#EF4444' }}
                              >
                                <RiDeleteBin5Line size={14} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
      
      {popoverOpen && (
        <Box 
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={handlePopoverClose}
        >
          <Box 
            sx={{ 
              bgcolor: '#E8F5E8',
              borderRadius: '12px',
              p: 3,
              minWidth: 300,
              maxWidth: 400,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #C6F6D5',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                color: '#6B7280',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
              }}
              onClick={handlePopoverClose}
            >
              <X size={14}/>
            </IconButton>
            {selectedTrainerInfo && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#48BB78', fontSize: 32 }}>
                    {selectedTrainerInfo.trainerName?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{display:"flex",alignItems:"centert",justifyContent:"start",gap:"10px"}}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2D3748' }}>
                    {selectedTrainerInfo.trainerName || 'Unknown'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#38A169', bgcolor: 'transparent', px: 2, py:0.3, borderRadius: '20px', fontWeight: 500,border: '1px solid rgba(0, 191, 83, 1)' }}>
                    {selectedTrainerInfo.trainerId || 'No ID'}
                  </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left',justifyContent:"center" }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,justifyContent:'center' }}>
                    <Typography sx={{ fontSize: 12, color: '#787774', minWidth:"max-content", fontWeight: 500,"& svg":{
                      width:"14px"
                    } }}><Mail /></Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2D3748' }}>
                      {selectedTrainerInfo.primaryEmail || 'No email'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,justifyContent:'center' }}>
                    <Typography sx={{ fontSize: 12, color: '#787774', minWidth:"max-content", fontWeight: 500,"& svg":{
                      width:"14px"
                    } }}><Phone /></Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2D3748' }}>
                      {selectedTrainerInfo.primaryMobile || 'No mobile'}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TrainerModel;
