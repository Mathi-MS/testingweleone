import { Box, Typography, IconButton } from "@mui/material"
import CustomButton from "../../../../components/custom/CustomButton"
import CustomTable from "../../../../components/custom/CustomTable"
import { Edit, Trash } from "lucide-react"
import { IoClose } from "react-icons/io5"
import { useState, useEffect } from "react"
import ModuleModel from "./ModuleModel"
import ModuleModelEdit from "./ModuleModelEdit"
import { useAppDispatch, useAppSelector } from "../../../../app/hook"
import { fetchBatchModules, fetchBatchModuleById, deleteBatchModule } from "../../../../features/batch/batchModuleSlice"
import { showSuccess, showError } from "../../../../components/ui/Toast"

const ModuleMapping = ({batchId}: {batchId:string | any}) =>{
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openEditDrawer, setOpenEditDrawer] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const dispatch = useAppDispatch();
    const { modules, loading, selectedModule } = useAppSelector((state) => state.batchModule);

    useEffect(() => {
        if (batchId) {
            dispatch(fetchBatchModules(batchId));
        }
    }, [batchId, dispatch]);

    const handleEdit = (id: string) => {
        setSelectedModuleId(id);
        dispatch(fetchBatchModuleById(id));
        setOpenEditDrawer(true);
    };

    const handleDelete = (id: string) => {
        const module = modules.find(m => m.id === id);
        setModuleToDelete(module);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (moduleToDelete) {
            setIsDeleting(true);
            const result = await dispatch(deleteBatchModule(moduleToDelete.id)) as any;
            if (result.payload?.success === 200) {
                showSuccess("Module deleted successfully");
                dispatch(fetchBatchModules(batchId));
            } else {
                showError(result.payload?.message || 'Delete failed');
            }
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setModuleToDelete(null);
        }
    };

    const handleClose = () => {
        setOpenDrawer(false);
        setSelectedModuleId(null);
    };

    const handleEditClose = () => {
        setOpenEditDrawer(false);
        setSelectedModuleId(null);
    };

    const columns = [
        { key: 'slNo', label: 'Sl.No', width: 80 },
        { key: 'moduleId', label: 'Module Id', width: 150 },
        { key: 'weekName', label: 'Week', width: 100 },
        { key: 'moduleCount', label: 'Module Count', width: 120 },
        {
            key: 'action',
            label: 'Action',
            width: 100,
            renderCell: (params: any) => (
                <Box sx={{ "& svg": { width: "16px !important", color: "var(--textlight)" } }}>
                    <IconButton size="small" color="info" onClick={() => handleEdit(params.id)}>
                        <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.id)}>
                        <Trash />
                    </IconButton>
                </Box>
            )
        }
    ];
    
    const rows = modules.map((module, index) => ({
        id: module.id,
        moduleId: module.moduleId,
        slNo: index + 1,
        weekName: module.weekName,
        moduleCount: module.moduleDetails.length
    }));

    return(
        <>
            <Box>
                <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <Typography sx={{fontSize:"16px", fontWeight:"600"}}>
                        Module Lists:
                    </Typography>
                    <CustomButton
                        type="button"
                        variant="contained"
                        label="Create Module"
                        boxSx={{width:"max-content"}}
                        onClick={() => setOpenDrawer(true)}
                    />
                </Box>
                <Box>
                    <CustomTable
                        rows={rows}
                        columns={columns}
                        loading={loading}
                    />
                    <ModuleModel
                        open={openDrawer}
                        onClose={handleClose}
                        batchId={batchId}
                    />
                    <ModuleModelEdit
                        open={openEditDrawer}
                        onClose={handleEditClose}
                        moduleData={selectedModule}
                    />
                </Box>
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
                            <Box component="span" sx={{ color: 'var(--primary)' }}>{moduleToDelete?.weekName || 'Module'}</Box>
                            <Box component="span" sx={{ color: '#333' }}>: Delete this item?</Box>
                        </Typography>

                        <Typography sx={{ fontSize: 15, color: '#333', mb: 4, fontWeight: 500 }}>
                            Are you sure you want to delete this module? This action cannot be undone.
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
        </>
    )
}


export default ModuleMapping