import { Box, IconButton, Typography } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil } from 'lucide-react';
import CustomButton from '../../../../components/custom/CustomButton';
import CustomTable from '../../../../components/custom/CustomTable';
import { AppDispatch } from '../../../../app/store';
import { getFaqsByBatchIdThunk } from '../../../../features/FqaSlice';
import { Faquestionmodel } from './faquestionmodel';

export const Faquestion = ({ batchId }: { batchId: string | any }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, pagination } = useSelector((state: any) => state.fqa);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    useEffect(() => {
        dispatch(getFaqsByBatchIdThunk({ batchId, page: 0, size: 10 }));
    }, [batchId]);

    const handleLoadMore = useCallback( async () => {
        if (!loading && pagination?.hasMore) {
            const nextPage = (pagination.page || 0) + 1;
            dispatch(getFaqsByBatchIdThunk({ batchId, page: nextPage, size: 10 }));
        }
    }, [dispatch, loading, pagination?.hasMore, pagination?.page, batchId]);

    const handleClose = () => {
        setOpenDrawer(false);
        setEditItem(null);
    };

    const handleSaved = () => {
        setOpenDrawer(false);
        setEditItem(null);
        dispatch(getFaqsByBatchIdThunk({ batchId, page: 0, size: 10 }));
    };


    const columns = [
        { key: 'slNo', label: 'Sl.No', width: 70 },
        { key: 'question', label: 'Question', width: 300 },
        { key: 'answer', label: 'Answer', width: 350 },
        { key: 'createdAt', label: 'Created At', width: 180 },
        {
            key: 'action',
            label: 'Action',
            width: 100,
            renderCell: (params: any) => (
                <Box sx={{ '& svg': { width: '16px !important', color: 'var(--textlight)' } }}>
                    <IconButton
                        size="small"
                        color="info"
                        onClick={() => { setEditItem(params.row ?? params); setOpenDrawer(true); }}
                    >
                        <Pencil />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const rows = (data || []).map((faq: any, index: number) => ({
        id: faq.id,
        slNo: index + 1,
        question: faq.question,
        answer: faq.answer,
        createdAt: faq.createdAt,
    }));

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '16px', fontWeight: '600', mb: 2 }}>
                    Frequently Asked Questions:
                </Typography>
                <CustomButton
                    type="button"
                    variant="contained"
                    label="Create FAQ"
                    boxSx={{ width: 'max-content' }}
                    onClick={() => { setEditItem(null); setOpenDrawer(true); }}
                />
            </Box>
            <CustomTable
                rows={rows}
                columns={columns}
                loading={loading}
                onLoadMore={handleLoadMore}
                maxHeight="400px"
            />
            <Faquestionmodel
                open={openDrawer}
                onClose={handleClose}
                onSave={handleSaved}
                batchId={batchId}
                isEdit={!!editItem}
                itemId={editItem?.id ?? editItem}
            />
        </Box>
    );
};

export default Faquestion;
