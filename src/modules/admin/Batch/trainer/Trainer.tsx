import { Box, Typography, IconButton } from "@mui/material"
import CustomButton from "../../../../components/custom/CustomButton"
import CustomTable from "../../../../components/custom/CustomTable"
import { Eye, Trash } from "lucide-react"
import { IoClose } from "react-icons/io5"
import TrainerModel from "./TrainerModel"
import { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAllTrainer, deleteTrainer } from "../../../../features/trainerSlice"
import { showSuccess, showError } from "../../../../components/ui/Toast"
import { getBatchById } from "../../../../features/batchSlice"

const Trainer = ({batchId}: { batchId?:string | any}) => {
  const [openDrawerBatch, setOpenDrawerBatch] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteMessage, setIsDeleteMessage] = useState<string>("");
  const [currentTrainerIds, setCurrentTrainerIds] = useState<string[]>([]);
  const dispatch = useDispatch();
  const { trainers, loading, pagination } = useSelector((state: any) => state.trainer);

  const formatAvailability = (availabilitySlot: any[]) => {
    if (!availabilitySlot || availabilitySlot.length === 0) return '-';
    const slot = availabilitySlot[0];
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}.${minutes} ${ampm}`;
    };
    return `${formatTime(slot.fromTime)} - ${formatTime(slot.toTime)}`;
  };

  const handleDelete = async (trainer: any) => {
    if (trainer) {
      const result = await dispatch(deleteTrainer({ id:batchId,trainerId: trainer.id,confirmation:false }) as any);  
      if (result.payload?.success === 200) {
        showSuccess("Trainer deleted successfully");
        const updatedTrainerIds = result.payload?.data?.trainerId || currentTrainerIds;
        setCurrentTrainerIds(updatedTrainerIds);
        dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: updatedTrainerIds } }) as any);
      } 
      else if (result.payload?.success == 409) {        
        setShowDeleteDialog(true);
        setTrainerToDelete(trainer);
        setIsDeleteMessage(result.payload?.message || '');
      }
      else {
        showError(result.payload?.message || 'Delete failed');
      }
    }
  };

  const confirmDelete = async () => {
    if (trainerToDelete) {
      setIsDeleting(true);      
      const result = await dispatch(deleteTrainer({ id:batchId,trainerId: trainerToDelete.id,confirmation:true }) as any);      
      if (result.payload?.success === 200) {
        showSuccess("Trainer deleted successfully");
        const updatedTrainerIds = result.payload?.data?.trainerId || currentTrainerIds;
        setCurrentTrainerIds(updatedTrainerIds);
        dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: updatedTrainerIds } }) as any);
      } else {
        showError(result.payload?.message || 'Delete failed');
      }
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setTrainerToDelete(null);
    }
  };

  const handleTrainerMappingSuccess = (newTrainerIds: string[]) => {
    setCurrentTrainerIds(newTrainerIds);
    dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: newTrainerIds } }) as any);
  };

  // useEffect(() => {
  //   if (currentTrainerIds?.length > 0) {
  //     dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: currentTrainerIds } }) as any);
  //   }
  // }, [currentTrainerIds, dispatch]);


  

  const handleLoadMore = useCallback(async () => {
    if (!loading && pagination?.hasMore) {
      const nextPage = (pagination.page || 0) + 1;
      await dispatch(getAllTrainer({ page: nextPage, size: 100, filter: { trainerIds: currentTrainerIds } }) as any);
    }
  }, [dispatch, loading, pagination?.hasMore, pagination?.page, currentTrainerIds]);
  const columns = [
    { key: 'slNo', label: 'Sl.No', width: 80 },
    { key: 'trainerId', label: 'Trainer ID', width: 100 },
    { key: 'name', label: 'Name', width: 150 },
    { key: 'domain', label: 'Domain', width: 150 },
    { key: 'expertise', label: 'Expertise', width: 150 },
    { key: 'mobile', label: 'Mobile', width: 120 },
    { key: 'email', label: 'Email', width: 120 },
    { key: 'availability', label: 'Availability', width: 120 },
    {
      key: 'action',
      label: 'Action',
      width: 100,
      renderCell: (params: any) => (
        <Box sx={{ "& svg": { width: "16px !important", color: "var(--textlight)" } }}>
          <IconButton size="small" color="info">
            <Eye />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params)}>
            <Trash />
          </IconButton>
        </Box>
      )
    }
  ];

  const rows = trainers?.map((trainer: any, index: number) => ({
    slNo: index + 1,
    id : trainer.id,
    trainerId: trainer.trainerId,
    name: trainer.trainerName,
    domain: trainer.domain || '-',
    expertise: trainer.expertiseTags?.join(', ') || '-',
    mobile: trainer.primaryMobile || '-',
    email: trainer.primaryEmail || '-',
    availability: formatAvailability(trainer.availabilitySlot)
  })) || [];

  useEffect(() => {
    if (batchId) {
          dispatch(getBatchById(batchId) as any)
        .then((result:any) => {
          const trainerIds = result?.payload?.data?.trainerId;
          setCurrentTrainerIds(trainerIds);
              if (trainerIds?.length > 0) {
                dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: trainerIds } }) as any);
              }
          if(result?.payload?.success == 404){
            showError(result?.payload?.message || "Something Went Wrong")
          }
        })
        .catch((error:any) => {
          showError("Something Went Wrong")
        });
    }
  }, [batchId, dispatch]);
  return (
    <>
        <Box>
            <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <Typography sx={{fontSize:"16px", fontWeight:"600"}}>
                        Trainers Lists:
                </Typography>
                <CustomButton
                    type="button"
                    variant="contained"
                    label="Add Trainers"
                    boxSx={{width:"max-content"}}
                    onClick={() => setOpenDrawerBatch(true)}
                />
            </Box>
            <Box>
                <CustomTable
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    onLoadMore={handleLoadMore}
                />
                <TrainerModel
                    open={openDrawerBatch}
                    onClose={() => setOpenDrawerBatch(false)}
                    batchId={batchId}
                    onSuccess={handleTrainerMappingSuccess}
                />
            </Box>
            
            {showDeleteDialog && (
                <Box sx={{
                    position: 'fixed',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <Box sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        p: 4,
                        width: '800px',
                        maxWidth: '40%',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <IconButton
                            sx={{ position: 'absolute', right: 8, top: 8, color: '#666' }}
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            <IoClose size={20} />
                        </IconButton>

                        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3, textAlign: 'left', display: 'flex', gap: 1 }}>
                            <Box component="span" sx={{ color: 'var(--primary)' }}>{trainerToDelete?.trainerId || 'Trainer'}</Box>
                            <Box component="span" sx={{ color: '#333' }}>: Delete this item?</Box>
                        </Typography>

                        <Typography sx={{ fontSize: 15, color: '#333', mb: 4, fontWeight: 500 }}>
                            {isDeleteMessage}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <CustomButton
                                type="button"
                                variant="outlined"
                                label="Cancel"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                                boxSx={{ 
                                    bgcolor: '#f1f3f4', 
                                    color: '#333', 
                                    border: 'none',
                                    px: 4,
                                    width: "max-content",
                                    '&:hover': { bgcolor: '#e8eaed', border: 'none' }
                                }}
                            />
                            <CustomButton
                                type="button"
                                variant="contained"
                                label={isDeleting ? "Removing..." : "Remove"}
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                boxSx={{ 
                                    bgcolor: '#ff7070', 
                                    '&:hover': { bgcolor: '#ff5252' },
                                    px: 4,
                                    width: "max-content",
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    </>
  )
}
export default Trainer