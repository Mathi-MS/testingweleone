import {
  Box,
  Divider,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import React, { useState } from 'react';
import { CgArrowsExpandLeft } from 'react-icons/cg';
import { HiOutlineChevronDoubleRight } from 'react-icons/hi2';
import { RiCollapseDiagonal2Line } from 'react-icons/ri';
import { FiGitBranch, FiUploadCloud } from 'react-icons/fi';
import CustomButton from '../../../../../components/custom/CustomButton';

interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string | number;
  isEdit?: boolean;
  itemId?: string | number;
}

interface FormErrors {
  projectName?: string;
  projectSummary?: string;
  gitLink?: string;
  documents?: string;
}

export const LearnerProjectModel = ({ open, onClose, itemId }: Props) => {
  const [expand, setExpand] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [gitLink, setGitLink] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const width = expand ? '80%' : '50%';

  const handleClose = () => {
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocuments(files);
      if (files.length > 0) {
        setErrors((prev) => ({ ...prev, documents: undefined }));
      }
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required.';
    } else if (projectName.trim().length < 3) {
      newErrors.projectName = 'Project name must be at least 3 characters.';
    }

    if (!projectSummary.trim()) {
      newErrors.projectSummary = 'Project summary is required.';
    } else if (projectSummary.trim().length < 10) {
      newErrors.projectSummary = 'Summary must be at least 10 characters.';
    }

    if (gitLink.trim() && !isValidUrl(gitLink.trim())) {
      newErrors.gitLink = 'Please enter a valid URL (e.g. https://github.com/...).';
    }

    if (documents.length === 0) {
      newErrors.documents = 'Please upload at least one project document.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // proceed with save logic
  };

  const labelStyle = {
    fontSize: '13px',
    fontFamily: 'DM-Medium',
    color: 'var(--textlight)',
    mb: 0.5,
  };

  const inputStyle = (hasError: boolean) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'DM-Regular',
      backgroundColor: hasError ? '#fff5f5' : '#fafafa',
      '& fieldset': { borderColor: hasError ? '#e53935' : '#e0e0e0' },
      '&:hover fieldset': { borderColor: hasError ? '#e53935' : 'var(--primary)' },
      '&.Mui-focused fieldset': { borderColor: hasError ? '#e53935' : 'var(--primary)' },
    },
  });

  const ErrorText = ({ message }: { message?: string }) =>
    message ? (
      <Typography
        sx={{
          fontSize: '11.5px',
          color: '#e53935',
          fontFamily: 'DM-Regular',
          mt: 0.5,
          ml: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.4,
        }}
      >
        ⚠ {message}
      </Typography>
    ) : null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : '-100%',
          width,
          height: '100vh',
          background: '#fff',
          transition: 'width 0.3s ease, right 0.4s ease',
          boxShadow: '-4px 0px 15px rgba(0,0,0,0.15)',
          p: 2,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} color="var(--black)" />
            </IconButton>
            <IconButton onClick={() => setExpand(!expand)}>
              {expand ? (
                <RiCollapseDiagonal2Line size={18} color="var(--black)" />
              ) : (
                <CgArrowsExpandLeft size={14} color="var(--black)" />
              )}
            </IconButton>
            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: 'DM-Semibold !important',
                color: 'var(--textlight)',
              }}
            >
              Batch / Project / {itemId ? 'Edit' : 'Creation'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {itemId ? (
              <CustomButton type="button" variant="outlined" label="Delete" />
            ) : (
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                onClick={handleClose}
              />
            )}
            <CustomButton
              type="button"
              variant="contained"
              label={loading ? 'Saving...' : itemId ? 'Update' : 'Save'}
              onClick={handleSave}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Form Fields */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            pr: 1,
            pb: 3,
          }}
        >
          {/* Project Name */}
          <Box>
            <Typography sx={labelStyle}>
              Project Name <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, projectName: undefined }));
              }}
              size="small"
              sx={inputStyle(!!errors.projectName)}
            />
            <ErrorText message={errors.projectName} />
          </Box>

          {/* Project Summary */}
          <Box>
            <Typography sx={labelStyle}>
              Project Summary <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Write a brief summary about the project..."
              value={projectSummary}
              onChange={(e) => {
                setProjectSummary(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, projectSummary: undefined }));
              }}
              multiline
              rows={4}
              sx={inputStyle(!!errors.projectSummary)}
            />
            <ErrorText message={errors.projectSummary} />
          </Box>

          {/* Git Link */}
          <Box>
            <Typography sx={labelStyle}>Git Link</Typography>
            <TextField
              fullWidth
              placeholder="https://github.com/username/repository"
              value={gitLink}
              onChange={(e) => {
                setGitLink(e.target.value);
                if (!e.target.value.trim() || isValidUrl(e.target.value.trim()))
                  setErrors((prev) => ({ ...prev, gitLink: undefined }));
              }}
              size="small"
              sx={inputStyle(!!errors.gitLink)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiGitBranch size={15} color="var(--textlight)" />
                  </InputAdornment>
                ),
              }}
            />
            <ErrorText message={errors.gitLink} />
          </Box>

          {/* Project Documents */}
          <Box>
            <Typography sx={labelStyle}>
              Project Documents <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box
              component="label"
              htmlFor="project-doc-upload"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: `1.5px dashed ${errors.documents ? '#e53935' : '#d0d0d0'}`,
                borderRadius: '10px',
                p: 3,
                cursor: 'pointer',
                backgroundColor: errors.documents ? '#fff5f5' : '#fafafa',
                transition: 'border-color 0.2s, background 0.2s',
                '&:hover': {
                  borderColor: errors.documents ? '#e53935' : 'var(--primary)',
                  backgroundColor: errors.documents
                    ? '#fff0f0'
                    : 'rgba(var(--primary-rgb), 0.03)',
                },
              }}
            >
              <FiUploadCloud
                size={28}
                color={errors.documents ? '#e53935' : 'var(--textlight)'}
              />
              <Typography
                sx={{
                  fontSize: '13px',
                  fontFamily: 'DM-Medium',
                  color: errors.documents ? '#e53935' : 'var(--textlight)',
                }}
              >
                Click to upload documents
              </Typography>
              <Typography
                sx={{ fontSize: '11px', fontFamily: 'DM-Regular', color: '#aaa' }}
              >
                PDF, DOC, DOCX, PNG, JPG (Max 10MB each)
              </Typography>
              <input
                id="project-doc-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>
            <ErrorText message={errors.documents} />

            {/* Uploaded File List */}
            {documents.length > 0 && (
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {documents.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 0.8,
                      borderRadius: '6px',
                      backgroundColor: '#f4f4f4',
                      border: '1px solid #e8e8e8',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontFamily: 'DM-Regular',
                        color: 'var(--textlight)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '80%',
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: '#aaa',
                        fontFamily: 'DM-Regular',
                      }}
                    >
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};