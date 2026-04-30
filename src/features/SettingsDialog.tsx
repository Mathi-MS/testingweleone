import { Dialog, DialogContent, Box, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { User, Palette, Bell, CreditCard, ShoppingBag, ChevronDown, Video, GraduationCap } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { images } from "../assets/image/Images";
import CustomButton from "../components/custom/CustomButton";
import { getOnboardDetails } from "./authSlice";
import { getSuccessfulPaymentsByUser, resetPayments } from "./batch/paymentSlice";
import { RootState } from "../app/store";
import AccountTab from "./AccountTab";
import { useNavigate } from "react-router-dom";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  userDetails: any;
}

const SettingsDialog = ({ open, onClose, userDetails }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState("Account");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const { onboardDetails, loading } = useSelector((state: RootState) => state.ar);
  const { successfulPayments, successfulPaymentsLoading, hasNext } = useSelector((state: RootState) => state.payment);
  const observer = useRef<IntersectionObserver>();
  const navigate = useNavigate();
  useEffect(() => {
    if (open && userDetails) {
      const emailOrMobile = userDetails.userType === "googleUser" 
        ? userDetails.id 
        : userDetails.id;
      if (userDetails.id ) {
        dispatch(getOnboardDetails(userDetails.id) as any);
      }
      if (userDetails.id) {
        dispatch(resetPayments() as any);
        setPage(1);
        dispatch(getSuccessfulPaymentsByUser({ userId:userDetails.id, page: 1, size: 4 }) as any);
      }
    }
  }, [open, dispatch, userDetails]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (successfulPaymentsLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [successfulPaymentsLoading, hasNext]);

  useEffect(() => {
    if (page > 1 && userDetails?.id) {
      dispatch(getSuccessfulPaymentsByUser({ userId:userDetails.id , page, size: 4 }) as any);
    }
  }, [page]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const tabs = [
    { label: "Account", icon: User },
    // { label: "My Journey", icon: GraduationCap },
    { label: "My Purchase", icon: ShoppingBag },
  ];

  const handleTabChange = (tabLabel: string) => {
    setActiveTab(tabLabel);
    if (tabLabel === "My Purchase" && userDetails?.id) {
      dispatch(resetPayments() as any);
      setPage(1);
      dispatch(getSuccessfulPaymentsByUser({ userId:userDetails.id, page: 1, size: 4 }) as any);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: {  sm: "16px" },
          maxHeight: {sm: "600px" },
          minHeight: {sm: "600px" },
          overflow: "hidden",
          m: { xs: 0, sm: 2 },
          width: { xs: "95%", sm: "md" },
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2.5, borderBottom: "1px solid #E5E7EB" }}>
        <Box sx={{ fontSize: "18px", fontWeight: 600 }}>Settings</Box>
        <IconButton onClick={onClose} size="small">
          <IoClose size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: { xs: "column", sm: "row" }, minHeight: "200px" }}>
        {/* Sidebar */}
        <Box sx={{ 
          width: { xs: "100%", sm: "200px" }, 
          borderRight: { xs: "none", sm: "1px solid #E5E7EB" },
          borderBottom: { xs: "1px solid #E5E7EB", sm: "none" },
          p: 2,
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          gap: { xs: 1, sm: 0 },
          overflowX: { xs: "auto", sm: "visible" }
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Box
                key={tab.label}
                onClick={() => handleTabChange(tab.label)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: { xs: 1, sm: 1.5 },
                  mb: { xs: 0, sm: 0.5 },
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: activeTab === tab.label ? "#F0FDF4" : "transparent",
                  color: activeTab === tab.label ? "#16A34A" : "#6B7280",
                  "&:hover": { backgroundColor: activeTab === tab.label ? "#F0FDF4" : "#F9FAFB" },
                  whiteSpace: "nowrap",
                  minWidth: { xs: "auto", sm: "unset" }
                }}
              >
                <Icon size={18} />
                <Box sx={{ fontSize: { xs: "13px", sm: "14px" }, display: { xs: "none", sm: "block" } }}>{tab.label}</Box>
              </Box>
            );
          })}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflowY: "auto" }}>
          {activeTab === "Account" && (
            loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>Loading...</Box>
            ) : onboardDetails ? (
              <AccountTab userDetails={userDetails} onboardDetails={onboardDetails} onClose={onClose} />
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Box sx={{ fontSize: "16px", fontWeight: 500, mb: 2, color: "#374151" }}>No account details found.</Box>
                <Box sx={{ fontSize: "14px", color: "#6B7280", mb: 3 }}>Please complete your onboarding details first.</Box>
                <CustomButton 
                  variant="contained" 
                  type="button"
                  label="Go to Career Page"
                  onClick={() => {
                    navigate("/career");
                    onClose();
                  }}
                  sx={{ 
                    backgroundColor: "#16A34A", 
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#15803D" }
                  }}
                />
              </Box>
            )
          )}

          {activeTab === "My Journey" && (
            <Box>
              {[
                { title: "School", fields: [
                  { label: "School Name", value: onboardDetails?.schoolName || "N/A" },
                  { label: "Board", value: onboardDetails?.schoolBoard || "N/A" },
                  { label: "Year of Passing", value: onboardDetails?.schoolYear || "N/A" },
                ]},
                { title: "College", fields: [
                  { label: "College Name", value: onboardDetails?.collegeName || "N/A" },
                  { label: "Location", value: onboardDetails?.collegeLocation || "N/A" },
                ]},
                { title: "UG (Under Graduate)", fields: [
                  { label: "Degree", value: onboardDetails?.ugDegree || "N/A" },
                  { label: "Specialization", value: onboardDetails?.ugSpecialization || "N/A" },
                  { label: "Year of Passing", value: onboardDetails?.ugYear || "N/A" },
                ]},
                { title: "PG (Post Graduate)", fields: [
                  { label: "Degree", value: onboardDetails?.pgDegree || "N/A" },
                  { label: "Specialization", value: onboardDetails?.pgSpecialization || "N/A" },
                  { label: "Year of Passing", value: onboardDetails?.pgYear || "N/A" },
                ]},
                { title: "Work Experience", fields: [
                  { label: "Company", value: onboardDetails?.company || "N/A" },
                  { label: "Position", value: onboardDetails?.position || "N/A" },
                  { label: "Years", value: onboardDetails?.workYears || "N/A" },
                ]},
              ].map((section) => (
                <Box key={section.title} sx={{ mb: 3 }}>
                  <Box sx={{ fontSize: "16px", fontWeight: 600, mb: 2, color: "#16A34A" }}>{section.title}</Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {section.fields.map((field) => (
                      <Box key={field.label}>
                        <Box sx={{ fontSize: "13px", color: "#6B7280", mb: 0.5 }}>{field.label}</Box>
                        <Box sx={{ fontSize: "14px", fontWeight: 500 }}>{field.value}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {activeTab === "My Purchase" && (
            <Box sx={{maxHeight:"300px",overflow:"auto"}}>
              {!successfulPayments || successfulPayments.length === 0 ? (
                successfulPaymentsLoading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>Loading...</Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, color: "#6B7280" }}>No purchases found</Box>
                )
              ) : (
                <>
                {successfulPayments.map((purchase, index) => (
                <Accordion
                  key={purchase.id}
                  ref={index === successfulPayments.length - 1 ? lastElementRef : null}
                  expanded={expanded === purchase.id}
                  onChange={handleAccordionChange(purchase.id)}
                  sx={{
                    mb: 2,
                    borderRadius: "8px !important",
                    border: "1px solid #E5E7EB",
                    boxShadow: "none",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": { margin: "0 0 16px 0" },

                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown size={20} />}
                    sx={{
                      "& .MuiAccordionSummary-content": { my: 1.5 },
                      "&.Mui-expanded": { minHeight: "48px" }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                      <Video size={20} />
                      <Box sx={{ fontSize: "14px", fontWeight: 500 }}>{purchase.batchName}</Box>
                    </Box>

                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Box sx={{ fontSize: "14px", fontWeight: 500, mb: 2, color: "#374151" }}>Course Details:</Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      {[
                        { label: "Transaction ID", value: purchase.paymentId || "N/A" },
                        { label: "Price (₹)", value: purchase.price || "N/A" },
                        { label: "Payment Date & Time", value: `${formatDate(purchase.createdAt)} | ${formatTime(purchase.createdAt)} ` },
                        { label: "Discount Type", value: purchase.discountType || "N/A" },
                        { label: "Discount Value", value: purchase.discountValue || "N/A" },
                        { label: "Payment method", value: purchase.method },
                        { label: "Payment Gateway", value: "Razorpay" },
                        { label: "payment Status", value: purchase.status, color: "#16A34A" }
                      ].map((field) => (
                        <Box key={field.label}>
                          <Box sx={{ fontSize: "13px", color: "#6B7280", mb: 0.5 }}>{field.label}</Box>
                          <Box sx={{ fontSize: "14px", fontWeight: 500, color: field.color || "inherit" }}>{field.value}</Box>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
                ))}
                {successfulPaymentsLoading && <Box sx={{ textAlign: "center", py: 2 }}>Loading more...</Box>}
                </>
              )}
            </Box>
          )}

          {activeTab !== "Account" && activeTab !== "My Journey" && activeTab !== "My Purchase" && (
            <Box sx={{ textAlign: "center", py: 8, color: "#9CA3AF" }}>
              {activeTab} settings coming soon...
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, p: 2.5, borderTop: "1px solid #E5E7EB" }}>
        <CustomButton
          type="button"
          variant="outlined"
          label="Back"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            borderColor: "#D0D5DD",
            color: "#344054",
            textTransform: "none",
            px: 3,
            width:"max-content"
          }}
        />
        <CustomButton
          type="button"
          variant="contained"
          label="Save"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            background: "#16A34A",
            "&:hover": { background: "#15803D" },
            textTransform: "none",
            px: 3,
            width:"max-content"
          }}
        />
      </Box> */}
    </Dialog>
  );
};

export default SettingsDialog;

