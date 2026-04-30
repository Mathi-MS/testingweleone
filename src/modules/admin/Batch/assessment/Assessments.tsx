import { Box, Typography, IconButton } from "@mui/material";
import CustomTable from "../../../../components/custom/CustomTable";
import { Eye, NotebookPen } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQuestionByBatchThunk } from "../../../../features/quizSlice";
import CustomButton from "../../../../components/custom/CustomButton";
import { Assessmentmodel } from "./Assessmentmodel";


const Assessments = ({ batchId }: { batchId: string | any }) => {
    const dispatch = useDispatch();
    const { batchQuestions, loading, batchPagination } = useSelector((state: any) => state.quiz);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [editSessionId, setEditSessionId] = useState<string | null>(null);
    const [mode, setMode] = useState<"view" | "edit" | "create">("create");

    useEffect(() => {
        dispatch(getQuestionByBatchThunk({ batchId, page: 0, size: 10 }) as any);
    }, [dispatch]);

    const handleLoadMore = useCallback(async () => {
        if (!loading && batchPagination?.hasMore) {
            const nextPage = (batchPagination.page || 0) + 1;
            await dispatch(getQuestionByBatchThunk({ batchId, page: nextPage, size: 10 }) as any);
        }
    }, [dispatch, loading, batchPagination?.hasMore, batchPagination?.page, batchId]);

    const handleClose = () => {
        setOpenDrawer(false);
        setEditSessionId(null);
        dispatch(getQuestionByBatchThunk({ batchId, page: 0, size: 10 }) as any);
    };

    const columns = [
        { key: 'slNo', label: 'Sl.No', width: 80 },
        { key: 'title', label: 'Title', width: 200 },
        // { key: 'sessionId', label: 'Session ID', width: 150 },
        { key: 'duration', label: 'Duration (min)', width: 130 },
        { key: 'passMark', label: 'Pass Mark (%)', width: 130 },
        {
            key: 'action',
            label: 'Action',
            width: 150,
            renderCell: (params: any) => (
                <Box sx={{ "& svg": { width: "16px !important", color: "var(--textlight)" } }}>
                    <IconButton size="small" color="info">
                        <Eye onClick={() => { setEditSessionId(params.id); setMode("view"); setOpenDrawer(true); }} />
                    </IconButton>
                    <IconButton size="small" color="info" onClick={() => { setEditSessionId(params.id); setMode("edit"); setOpenDrawer(true); }}>
                        <NotebookPen />
                    </IconButton>
                </Box>
            )
        }
    ];

    const rows = (batchQuestions || []).map((q: any, index: number) => ({
        id: q.sessionId,
        slNo: index + 1,
        title: q.title || "-",
        sessionId: q.sessionId || "-",
        duration: q.duration ?? "-",
        passMark: q.passMark ?? "-",
    }));

    return (
        <>
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: "600", mb: 2 }}>
                        Assessment Lists:
                    </Typography>
                    <CustomButton
                        type="button"
                        variant="contained"
                        label="Create Assessment"
                        boxSx={{ width: "max-content" }}
                        onClick={() => { setMode("create"); setEditSessionId(null); setOpenDrawer(true); }}
                    />
                </Box>
                <CustomTable
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    onLoadMore={handleLoadMore}
                    maxHeight="400px"
                />
                <Assessmentmodel
                    open={openDrawer}
                    onClose={handleClose}
                    batchId={batchId}
                    sessionId={editSessionId ?? undefined}
                    mode={mode}
                />
            </Box>
        </>
    );
};

export default Assessments;
