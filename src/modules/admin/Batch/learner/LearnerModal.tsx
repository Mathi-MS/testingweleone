import { Avatar, Box, Divider, IconButton, InputAdornment, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography, Popover } from "@mui/material"
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { HiOutlineChevronDoubleRight, HiOutlineInformationCircle } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import CustomButton from "../../../../components/custom/CustomButton";
import { IoSearchOutline } from "react-icons/io5";
import { inputForm } from "../../../../components/custom/CustomStyles";
import { getModalLearners, importLearners, batchMapping } from "../../../../features/learnerSlice";
import { AppDispatch, RootState } from "../../../../app/store";
import { Download, Mail, Phone, Upload, X } from "lucide-react";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import UploadSummaryDialog from "./UploadSummaryDialog";
import excelUrl from "../../../../../public/file/sample.csv"
import { getBatchByIdThunk } from "../../../../features/batchSlice";
import { set } from "lodash";
interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string;
  onSuccess?: () => void;
}
const LearnerModel = ({ open, onClose, batchId, onSuccess }: Props) => {
    const dispatch = useDispatch<AppDispatch>();
    const { modalLearners: learners, modalLoading: loading, modalHasMore: hasMore } = useSelector((state: RootState) => state.learner);
    const [expand, setExpand] = useState(false);
    const [uploadingSingle, setUploadingSingle] = useState(false);
    const [uploadingBulk, setUploadingBulk] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [selectedLearners, setSelectedLearners] = useState<any[]>([]);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
    const [selectedLearnerInfo, setSelectedLearnerInfo] = useState<any>(null);
    const width = expand ? "80%" : "50%";
    const filteredLearners = (learners || []).filter(
        (learner: any) => !selectedLearners.find(selected => selected.id === learner.id)
    );
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 5;
        
        if (isNearBottom && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            dispatch(getModalLearners({ page: nextPage, size: 4, search: debouncedSearchTerm }));
        }
    }, [hasMore, loading, page, debouncedSearchTerm, dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (open) {
            setPage(0);
            dispatch(getModalLearners({ page: 0, size: 4, search: debouncedSearchTerm, reset: true }));
        }
    }, [open, debouncedSearchTerm, dispatch]);

    useEffect(() => {
        if (open && batchId) {
            dispatch(getBatchByIdThunk({ batchId }) as any)
                .then((result: any) => {
                    const learnerIds = result?.payload?.data?.learnerId;                    
                    if (learnerIds && learnerIds.length > 0 && learners && learners.length > 0) {
                        const preSelectedLearners = learners.filter((learner: any) => 
                            learnerIds.includes(learner.id)
                        );
                        setSelectedLearners(preSelectedLearners);
                    }
                });
        }
    }, [open, batchId, learners]);

    const handleAddLearner = (learner: any) => {
        if (!selectedLearners.find(l => l.id === learner.id)) {
            setSelectedLearners([...selectedLearners, learner]);
        }
    };    
    const handleRemoveTrainer = (learnerId: string) => {
        setSelectedLearners(selectedLearners.filter(learner => learner.id !== learnerId))
    }
    const handleClose = () => {
        onClose();
        setUploadFile(null);
        setFileError('');
        setSelectedLearners([]);
    };
    const handleLearnerInfo = (event: React.MouseEvent<HTMLElement>, learner: any) => {
        event.stopPropagation();
        setSelectedLearnerInfo(learner);
        setPopoverAnchor(event.currentTarget);
        setPopoverOpen(true);
    };

    const handlePopoverClose = () => {
        setPopoverOpen(false);
        setPopoverAnchor(null);
        setSelectedLearnerInfo(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setDebouncedSearchTerm(searchTerm);
        }
    };
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    setFileError('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed');
    setUploadFile(null);
    return;
  }

  setFileError('');
  setUploadFile(file);
};


const handleSave = async () => {
  setUploadingBulk(true);
  if (!uploadFile) return;

  try {
    const result = await dispatch(
      importLearners({
        batchId: batchId,
        file: uploadFile,
      })
    ).unwrap();

    if (result?.success === 409) {
      setSummaryData(result.data);
      onSuccess?.();
      setSummaryOpen(true);
    } 
    if (result?.success === 200 && result?.data?.alreadyMappedLearners?.length > 0) {
      setSummaryData(result.data);
      onSuccess?.();
      setSummaryOpen(true);
    } 
    else if (result?.success === 200 && result?.data?.alreadyMappedLearners?.length === 0) {
      showSuccess(result?.message || "Upload Successfully");
      setUploadFile(null);
      setFileError('');
      onSuccess?.();
      handleClose();
    } 
    else {
      showError(result?.message || "Something Went Wrong");
      setUploadFile(null);
      setFileError('');
    }
    setUploadingBulk(false);
  } catch (error) {
    showError("Failed to Upload Learners");
    setUploadFile(null);
    setFileError('');
    setUploadingBulk(false);
  }
  finally{
    setUploadingBulk(false);
  }
};
const handleSaveSingle = async () => {
  if (selectedLearners.length === 0) {
    showError("Please select at least one learner");
    return;
  }
  setUploadingSingle(true);
  try {
    const learnerIds = selectedLearners.map(learner => learner.id);
    const result = await dispatch(
      batchMapping({
        id: batchId!,
        learnerId: learnerIds,
      })
    ).unwrap();

    if (result?.success === 200) {
      showSuccess(result?.message || "Learners mapped successfully");
      onSuccess?.();
      handleClose();
      setUploadingSingle(false);
    } else {
      showError(result?.message || "Something went wrong");
      setUploadingSingle(false);
    }
  } catch (error) {
    showError("Failed to map learners");
    setUploadingSingle(false);
  }
}

  const handleCloseDialog = () =>{
    setSummaryOpen(false);
    setSummaryData(null);
    setUploadFile(null)
  }

    return(
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
              Batch / Learners / Management
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={handleClose}
            />
            {
              tabValue === 1 && (
                <CustomButton
                  type="button"
                  variant="contained"
                  label="save"
                  onClick={handleSave}
                  disabled={!uploadFile || uploadingBulk}
                  boxSx={{whiteSpace:"nowrap",px:"30px"}}
                />
              )
            }
            {
              tabValue === 0 && (
                <CustomButton
                  type="button"
                  variant="contained"
                  label="save"
                  onClick={handleSaveSingle}
                  disabled={selectedLearners.length === 0 || uploadingSingle}
                  boxSx={{whiteSpace:"nowrap",px:"30px"}}
                />
              )
            }
          </Box>
        </Box>
      </Box>
            <Divider sx={{ my: 2 }} />
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                mb: 2,
                "& .MuiTabs-indicator": {
                  backgroundColor: "var(--primary)",
                  height: "2px",
                },
                "& .MuiTab-root": {
                  textTransform: "capitalize",
                  color: "#6B7280",
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "var(--primary)",
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Single Mapping" />
              <Tab label="Bulk Mapping" />
            </Tabs>

              {tabValue === 0 && (
                <>
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

              {/* Learners List */}
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

                                {filteredLearners.map((learner: any) => (
                  <Box
                    key={learner.id}
                    onClick={() => handleAddLearner(learner)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      py: 1,
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
                        {learner.learnerName?.charAt(0).toUpperCase() || 'L'}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#111827',
                          }}
                        >
                          {learner.learnerName || 'Unknown'}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: '#6B7280',
                          }}
                        >
                          {learner.primaryEmail || 'No email'}
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
                        {learner.learnerId || 'No ID'}
                      </Typography>
                      <IconButton size="small" sx={{ color: '#6B7280' }} onClick={(e) => handleLearnerInfo(e, learner)}>
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
              {selectedLearners.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
                    Added Trainers ({selectedLearners.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Learner ID</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Learner</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Mobile</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedLearners.map((trainer) => (
                          <TableRow key={trainer.id}>
                            <TableCell sx={{ fontSize: 12 }}>
                              {trainer.learnerId || 'No ID'}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>
                                  {trainer.learnerName?.charAt(0).toUpperCase()}
                                </Avatar>
                                {trainer.learnerName}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {trainer.primaryEmail || 'No email'}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {trainer.primaryMobile || 'No ID'}
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
                </>
              )}
              {tabValue === 1 && (
                <>
                <Box
                    sx={{
                      mt: 3,
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      p: 2,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap:2,
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        Bulk Upload
                      </Typography>

                      <Box
                        component={"a"}
                        href={excelUrl} download
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: "#ECFDF3",
                          color: "var(--primary)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          "svg":{
                            width:"14px"
                          }
                        }}
                      >
                        <Download/>
                        Sample
                      </Box>
                    </Box>

                    {/* Upload Box */}
                  <Box
                    component="label"
                    sx={{
                      border: "2px dashed #D1D5DB",
                      borderRadius: "8px",
                      p: 3,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "0.3s",
                      gap: "6px",
                      "&:hover": {
                        borderColor: "#10B981",
                        backgroundColor: "#F0FDF4",
                      },
                    }}
                  >
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      hidden
                      accept=".csv,.xlsx"
                      onChange={handleFileChange}
                    />

                    <Upload size={14} color="#9CA3AF" />

                    <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                      {uploadFile ? uploadFile.name : "Upload File"}
                    </Typography>
                  </Box>

                  {fileError && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: '#EF4444',
                        mt: 1,
                        textAlign: 'center',
                      }}
                    >
                      {fileError}
                    </Typography>
                  )}

                  </Box>
                </>
              )}

      <UploadSummaryDialog
        open={summaryOpen}
        onClose={() => handleCloseDialog()}
        responseData={summaryData}
      />
      
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
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%)',
              borderRadius: '12px',
              p: 3,
              minWidth: 300,
              maxWidth: 400,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0, 191, 83, 1)',
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
            {selectedLearnerInfo && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#48BB78', fontSize: 32 }}>
                    {selectedLearnerInfo.learnerName?.charAt(0).toUpperCase() || 'L'}
                  </Avatar>
                  <Box sx={{display:"flex",alignItems:"centert",justifyContent:"start",gap:"10px"}}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2D3748' }}>
                    {selectedLearnerInfo.learnerName || 'Unknown'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#38A169', bgcolor: 'transparent', px: 2, py:0.3, borderRadius: '20px', fontWeight: 500,border: '1px solid rgba(0, 191, 83, 1)' }}>
                    {selectedLearnerInfo.learnerId || 'No ID'}
                  </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left',justifyContent:"center" }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,justifyContent:'center' }}>
                    <Typography sx={{ fontSize: 12, color: '#787774', minWidth:"max-content", fontWeight: 500,"& svg":{
                      width:"14px"
                    } }}><Mail /></Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2D3748' }}>
                      {selectedLearnerInfo.primaryEmail || 'No email'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,justifyContent:'center' }}>
                    <Typography sx={{ fontSize: 12, color: '#787774', minWidth:"max-content", fontWeight: 500,"& svg":{
                      width:"14px"
                    } }}><Phone /></Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2D3748' }}>
                      {selectedLearnerInfo.primaryMobile || 'No mobile'}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
    </Box>
    )
}
export default LearnerModel