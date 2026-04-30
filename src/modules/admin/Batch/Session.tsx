import { Box, Typography, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from "@mui/material";
import { Edit, Visibility, Delete } from "@mui/icons-material";
import CustomTable from "../../../components/custom/CustomTable";
import { Eye, Pencil, Trash } from "lucide-react";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { CustomInput } from "../../../components/custom/CustomInput";
import { inputForm, inputFormNew } from "../../../components/custom/CustomStyles";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateSession, getSessionByBatchId, deleteSession } from "../../../features/sessionSlice";
import SessionModel from "./SessionModel";
import SessionEditModel from "./SessionEditModel";
import { min } from "lodash";
import { showError } from "../../../components/ui/Toast";


const Session = ({batchId}: {batchId: string | any}) => {
    const [openDrawerBatch, setOpenDrawerBatch] = useState(false);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState<any>(null);
    const [totalSessions, setTotalSessions] = useState<number>(0);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', sessionCount: 0 });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const dispatch = useDispatch();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { sessions, loading, pagination } = useSelector((state: any) => state.session);
    
    
    useEffect(() => {
        dispatch(getSessionByBatchId({ batchId, page: 0, size: 20 }) as any);
    }, [dispatch]);
    
    const handleLoadMore = useCallback(async () => {
        if (!loading && pagination?.hasMore) {
            const nextPage = (pagination.page || 0) + 1;
            await dispatch(getSessionByBatchId({ batchId, page: nextPage, size: 20 }) as any);
        }
    }, [dispatch, loading, pagination?.hasMore, pagination?.page, batchId]);

    const handleEdit = (session: any) => {
        const fullSession = sessions.find((s: any) => s.id === session.id);
        setSessionToEdit(fullSession);
        setOpenEditDrawer(true);
    };

    const handleDelete = async (session: any) => {
        setSessionToDelete(session);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (sessionToDelete) {
            setIsDeleting(true);
            await dispatch(deleteSession(sessionToDelete.id) as any);
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setSessionToDelete(null);
        }
    };

    const handleSessionChange = (value: string) => {
        const sessionCount = parseInt(value) || 0;
        setTotalSessions(sessionCount);
    };

    const handleGenerateClick = async () => {
        setUploading(true);
        if (totalSessions > 0) {
            const result = await dispatch(generateSession({
                batchId,
                totalSessions,
                confirmation: false
            }) as any);

            if (result.payload?.success === 200) { 
                setTotalSessions(0);
                setUploading(false);
            }
            if (result.payload?.success === 409) {
                setConfirmDialog({
                    open: true,
                    message: result.payload.message,
                    sessionCount: totalSessions
                });
                setUploading(false);
            } else if (result.payload?.success === 404) {
                showError(result.payload.message);
                setUploading(false);
            }
        }
    };

    const handleConfirmGeneration = async () => {
        const result =await dispatch(generateSession({
            batchId,
            totalSessions: confirmDialog.sessionCount,
            confirmation: true
        }) as any);
        if (result.payload?.success === 200) { 
            setTotalSessions(0);
        }
        dispatch(getSessionByBatchId({ batchId, page: 0, size: 20 }) as any);

        setConfirmDialog({ open: false, message: '', sessionCount: 0 });
    };

    const handleCancelGeneration = () => {
        setConfirmDialog({ open: false, message: '', sessionCount: 0 });
        setTotalSessions(0);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const columns = [
        { key: 'slNo', label: 'Sl.No', width: 80 },
        { key: 'sessionId', label: 'Session ID', width: 120 },
        { key: 'sessionName', label: 'Session Name', width: 200 },
        { key: 'sessionDescription', label: 'Session Description', width: 300 },
        { key: 'sessionDate', label: 'Date', width: 120 },
        { key: 'day', label: 'Day', width: 100 },
        {
            key: 'action',
            label: 'Action',
            width: 150,
            renderCell: (params: any) => (
                <Box sx={{ "& svg":{
                    width: "16px !important",
                    color:"var(--textlight)"
                }, }}>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(params)}>
                        <Pencil />
                    </IconButton>
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

    const rows = (sessions || []).map((session: any, index: number) => ({
        id: session.id,
        slNo: index + 1,
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        sessionDescription: session?.sessionDescription || "-",
        sessionDate:session.isRescheduled == true ? session.rescheduleDate : session.sessionDate || "",
        day: session.isRescheduled == true ? session.rescheduleDay : session.day || "",
        content: `Books: ${session.bookIds?.length || 0}, Chapters: ${session.chapterIds?.length || 0}, ML: ${session.microLearningIds?.length || 0}`
    }));
    return(
        <>
            <Box>
                <Box sx={{display:"flex", alignItems:"center",justifyContent:"space-between", gap:"10px",mb:5}}>
                    <Box sx={{display:"flex", alignItems:"center",justifyContent:"start", gap:"10px"}}>
                        <Typography sx={{fontSize:"16px", fontWeight:"600"}}>
                            Session
                        </Typography>
                        <TextField
                            name="Session"
                            type="number"
                            value={totalSessions.toString()}
                            onChange={(e) => handleSessionChange(e.target.value)}
                            inputProps={{ min: 0 }}
                            sx={{
                                ...inputFormNew,
                                '& input[type=number]': {
                                    '-moz-appearance': 'textfield'
                                },
                                '& input[type=number]::-webkit-outer-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0
                                },
                                '& input[type=number]::-webkit-inner-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0
                                }
                            }}
                        />
                        <CustomButton
                            type="button"
                            variant="contained"
                            label="Generate Sessions"
                            disabled={uploading}
                            onClick={handleGenerateClick}
                        />
                    </Box>
                    <CustomButton
                    type="button"
                    variant="outlined"
                    label="Create Session"
                    startIcon={<MdAdd />}
                    onClick={() => setOpenDrawerBatch(true)}
                    boxSx={{whiteSpace:"nowrap",px:"30px",width:"max-content"}}
                    />
                </Box>
                <Box>
                    <Typography sx={{ display: "flex", flexDirection: "column", }}>
                        Session Lists:
                    </Typography>
                     <Box  sx={{
    minHeight: "200px",   // minimum height (even if less data)
    maxHeight: "400px",   // maximum height limit
    overflowY: "auto",    // scroll after max height reached
  }}>
                    <CustomTable
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        onLoadMore={handleLoadMore}
                    />
                    </Box>
                    <SessionModel
                        open={openDrawerBatch}
                        onClose={() => setOpenDrawerBatch(false)}
                        batchId={batchId}
                    />
                    <SessionEditModel
                        open={openEditDrawer}
                        onClose={() => setOpenEditDrawer(false)}
                        sessionData={sessionToEdit}
                    />
                </Box>
                
                <Dialog 
                    open={confirmDialog.open} 
                    onClose={handleCancelGeneration}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            overflow: 'visible'
                        }
                    }}
                    sx={{ zIndex: 9999 }}
                >
                    <DialogTitle sx={{
                        textAlign: 'start',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--textPrimary)',
                        pb: 1,
                        borderBottom: '1px solid #e0e0e0'
                    }}>
                        Confirm Session Generation
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3, pb: 2,mt:2 }}>
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {confirmDialog.message}
                            </Typography>
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ 
                        justifyContent: 'end', 
                        gap: 2, 
                        pb: 3, 
                        px: 3 
                    }}>
                        <CustomButton 
                            onClick={handleCancelGeneration}
                            variant="outlined"
                            label="Cancel"
                            type="button"
                            boxSx={{width:"max-content",minWidth:"100px"}}
                        />
                        <CustomButton 
                            onClick={handleConfirmGeneration} 
                            variant="contained"
                            label="Proceed"
                            type="button"
                            boxSx={{width:"max-content",minWidth:"100px"}}
                        />
                    </DialogActions>
                </Dialog>
                
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
                                <Box component="span" sx={{ color: 'var(--primary)' }}>{sessionToDelete?.sessionId || 'Session'}</Box>
                                <Box component="span" sx={{ color: '#333' }}>: Delete this item?</Box>
                            </Typography>

                            <Typography sx={{ fontSize: 15, color: '#333', mb: 4, fontWeight: 500 }}>
                                Are you sure you want to move this <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 600 }}>{sessionToDelete?.sessionId || 'Session'}</Box> to Trash? You can restore it later from the Trash if needed.
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
        </>
    )
}
export default Session;