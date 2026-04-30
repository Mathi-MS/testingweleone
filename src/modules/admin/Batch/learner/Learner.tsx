import { Box, IconButton, Typography } from "@mui/material"
import CustomButton from "../../../../components/custom/CustomButton"
import CustomTable from "../../../../components/custom/CustomTable"
import { Eye, Trash } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import LearnerModel from "./LearnerModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getBatchById } from "../../../../features/batchSlice";
import { fetchAllLearners, deleteLearner } from "../../../../features/learnerSlice";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import { IoClose } from "react-icons/io5";

const Learner = ({batchId}: {batchId:string | any}) =>{
    const [openDrawerBatch, setOpenDrawerBatch] = useState(false);
    const [learnerIds,setlearnersIds] = useState<any[]>([]);
    const [learnerData, setLearnerData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [learnerToDelete, setLearnerToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const dispatch = useDispatch();
    const { batch, loading, error } = useSelector(
      (state: any) => state.batch
    );
    const { learners, loading: learnerLoading, hasMore } = useSelector(
      (state: any) => state.learner
    );

    const refreshLearnerData = useCallback(() => {
        if (batchId) {
            dispatch(getBatchById(batchId) as any)
                .then((result: any) => {
                    const learnerIds = result?.payload?.data?.learnerId;
                    setlearnersIds(learnerIds);
                    
                    if (learnerIds.length > 0) {
                        dispatch(fetchAllLearners({ page: 0, size: 10, filter: { learnerIds } }) as any)
                            .then((learnerResult: any) => {
                                const learners = learnerResult?.payload?.data || [];
                                const formattedData = learners.map((learner: any, index: number) => ({
                                    id: learner.id,
                                    learnerId: learner.learnerId,
                                    name: learner.learnerName,
                                    mobile: learner.primaryMobile
                                }));
                                setLearnerData(formattedData);
                                setCurrentPage(0);
                            });
                    }
                });
        }
    }, [batchId, dispatch]);
    const columns = [
        { key: 'learnerId', label: 'Learner ID', width: 100 },
        { key: 'name', label: 'Name', width: 150 },
        { key: 'mobile', label: 'Mobile', width: 120 },
        {
              key: 'action',
              label: 'Action',
              width: 100,
              renderCell: (params: any) => (
                <Box sx={{ "& svg": { width: "16px !important", color: "var(--textlight)" } }}>
                  <IconButton size="small" color="info">
                    <Eye />
                  </IconButton>
                  <IconButton size="small" color="error" 
                  onClick={() => handleDelete(params)}
                  >
                    <Trash />
                  </IconButton>
                </Box>
              )
            }
    ];
useEffect(() => {
  if (batchId) {
        dispatch(getBatchById(batchId) as any)
      .then((result:any) => {        
        if (result?.payload?.success == 200){
          const learnerIds = result?.payload?.data?.learnerId;
        setlearnersIds(learnerIds);
        
        if (learnerIds.length > 0) {
          dispatch(fetchAllLearners({ page: 0, size: 10, filter: { learnerIds } }) as any)
            .then((learnerResult: any) => {
              const learners = learnerResult?.payload?.data || [];
              const formattedData = learners.map((learner: any, index: number) => ({
                id: learner.id,
                learnerId: learner.learnerId,
                name: learner.learnerName,
                mobile: learner.primaryMobile
              }));
              setLearnerData(formattedData);
              setCurrentPage(0);
            });
        }
        }
        
        if(result?.payload?.success == 404){
          showError(result?.payload?.message || "Something Went Wronddg")
        }
      })
      .catch((error:any) => {
        // showError(error || "Something Went Wrong")
      });
  }
}, [batchId, dispatch]);

    const handleLoadMore = useCallback(async () => {
        if (!learnerLoading && learnerIds.length > 0 && hasMore) {
            const nextPage = currentPage + 1;
            await dispatch(fetchAllLearners({ 
                page: nextPage, 
                size: 10, 
                filter: { learnerIds } 
            }) as any)
            .then((learnerResult: any) => {
                const learners = learnerResult?.payload?.data || [];
                if (learners.length > 0) {
                    const formattedData = learners.map((learner: any, index: number) => ({
                        id: learner.id,
                        learnerId: learner.learnerId,
                        name: learner.learnerName,
                        mobile: learner.primaryMobile
                    }));
                    setLearnerData(prev => [...prev, ...formattedData]);
                    setCurrentPage(nextPage);
                }
            });
        }
    }, [dispatch, learnerLoading, currentPage, learnerIds, learnerData.length, hasMore]);

    const handleDelete = async (learner: any) => {
        setLearnerToDelete(learner);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!learnerToDelete) return;

  try {
    setIsDeleting(true);

    const result = await dispatch(
      deleteLearner({
        id: batchId!,
        learnerId: learnerToDelete.id,
      }) as any
    ).unwrap();
    if(result?.success === 200){
    showSuccess(result?.message || "Learner deleted successfully");
    if (batchId) {
        dispatch(getBatchById(batchId) as any)
      .then((result:any) => {
        const learnerIds = result?.payload?.data?.learnerId;
        setlearnersIds(learnerIds);
        
        if (learnerIds.length > 0) {
          dispatch(fetchAllLearners({ page: 0, size: 10, filter: { learnerIds } }) as any)
            .then((learnerResult: any) => {
              const learners = learnerResult?.payload?.data || [];
              const formattedData = learners.map((learner: any, index: number) => ({
                id: learner.id,
                learnerId: learner.learnerId,
                name: learner.learnerName,
                mobile: learner.primaryMobile
              }));
              setLearnerData(formattedData);
              setCurrentPage(0);
            });
        }
        else if (learnerIds.length <= 0){
          dispatch(fetchAllLearners({ page: 0, size: 10, filter: { learnerIds:"null" } }) as any)
            .then((learnerResult: any) => {
              const learners = learnerResult?.payload?.data || [];
              const formattedData = learners.map((learner: any, index: number) => ({
                id: learner.id,
                learnerId: learner.learnerId,
                name: learner.learnerName,
                mobile: learner.primaryMobile
              }));
              setLearnerData(formattedData);
              setCurrentPage(0);
            });
        }
        if(result?.payload?.success == 404){
          showError(result?.payload?.message || "Something Went Wrong")
        }
      })
      .catch((error:any) => {
        showError("Something Went Wrong")
      });
  }
      }
      if(result?.success === 404){
        showError(result?.message || "Something Went Wrong")
      }

  } catch (error: any) {
    showError(error || "Failed to delete learner");
  } finally {
    setIsDeleting(false);
    setShowDeleteDialog(false);
    setLearnerToDelete(null);
  }
        // if (learnerToDelete) {
        //     setIsDeleting(true);
        //     await dispatch(deleteLearner({ id: batchId,learnerId:learnerToDelete.id }) as any);
        //     setIsDeleting(false);
        //     setShowDeleteDialog(false);
        //     setLearnerToDelete(null);

        // }
    };


    return(
        <>
            <Box>
            <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <Typography sx={{fontSize:"16px", fontWeight:"600"}}>
                        Learners Lists:
                </Typography>
                <CustomButton
                    type="button"
                    variant="contained"
                    label="Add Learners"
                    boxSx={{width:"max-content"}}
                    onClick={() => setOpenDrawerBatch(true)}
                />
            </Box>
            <Box>
                <Box sx={{maxHeight:"300px"}}>
                  <CustomTable
                    rows={learnerData}
                    columns={columns}
                    loading={learnerLoading}
                    onLoadMore={handleLoadMore}
                />
                </Box>
                <LearnerModel
                    open={openDrawerBatch}
                    onClose={() => setOpenDrawerBatch(false)}
                    batchId={batchId}
                    onSuccess={refreshLearnerData}
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
                            <Box component="span" sx={{ color: 'var(--primary)' }}>{learnerToDelete?.learnerId || 'Learner'}</Box>
                            <Box component="span" sx={{ color: '#333' }}>: Delete this item?</Box>
                        </Typography>

                        <Typography sx={{ fontSize: 15, color: '#333', mb: 4, fontWeight: 500 }}>
                            Are you sure you want to move this <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 600 }}>{learnerToDelete?.learnerId || 'Learner'}</Box> to Trash? You can restore it later from the Trash if needed.
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
                                label={isDeleting ? "Moving..." : "Move to Trash"}
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
        {/* </Box> */}
        </>
    )
}
export default Learner