import {
  Box,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import { images } from "../../../assets/image/Images";
import { ReferralCodeModel } from "./ReferralCodeModel";
import {
  clearSelectedReferral,
  getAllReferralsThunk,
  getReferralByIdThunk,
} from "../../../features/referralcodeSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import CustomTable from "../../../components/custom/CustomTable";
import { Label } from "@mui/icons-material";
import { Ticket } from "lucide-react";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
const ReferralCode = () => {
  const dispatch = useAppDispatch();

  const { list, loading, selected ,page, hasMore  } = useAppSelector(
    (state) => state.referral
  );


  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const { userDetails } = useAppSelector((state) => state.ar);
  const sidebarContext = React.useContext(SidebarContext);
  // ✅ FIXED COLUMN KEY
  const columns = [
    { key: "referralCode", label: "Coupon code" },
    {key:"discountAmount",label:"Amount"},
    {key:"name",label:"Name"},
    { key: "mobileNumber", label: "Mobile Number" },
    { key: "mailId", label: "Email" },
    { key: "category", label: "Category" },
    { key: "batchName", label: "Batch" }, // ✅ IMPORTANT FIX
  ];
  
  const handleLoadMore = async () => {
  if (loading || !hasMore) return;
  await dispatch(
    getAllReferralsThunk({ page: page + 1, size: 20 })
  );
};
  
  // ✅ API CALL
  useEffect(() => {
    dispatch(getAllReferralsThunk({page:0,size:20}));
  }, [dispatch]);

  // ✅ MAP DATA → TABLE ROWS
  useEffect(() => {
    if (!list?.length) {
      setRows([]);
      return;
    }

    const formattedRows = list.map((item: any) => ({
      ...item,
      name:(  <Typography  sx={{
            fontSize: "12px",
          
          }}
         >{item.name || "-"}
          </Typography>),
      referralCode: (
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => handleEdit(item.id)}
        >
          {item.referralCode}
        </Typography>
      ),

      mobileNumber: item.mobileNumber || "-",

      mailId: (
        <Typography sx={{ fontSize: "12px" }}>
          {item.mailId || "-"}
        </Typography>
      ),

      category: item.category || "-",


      // ✅ CORRECT BATCH DISPLAY
    batchName: Array.isArray(item.batchDetails) && item.batchDetails.length > 0 ? (
  <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
    {item.batchDetails.map((b: any, index: number) => (
      <Box
        key={index}
        sx={{
          border: "1px solid #d0d5dd",
          borderRadius: "16px",
          padding: "4px 10px",
          fontSize: "12px",
          backgroundColor: "#f9fafb",
        }}
      >
        {/* ✅ Only show batchGenId if it exists */}
        {b.batchName || "-"}
        {b.batchGenId ? ` (${b.batchGenId})` : ""}
      </Box>
    ))}
  </Box>
) : (
  "-"
),
    }));

    setRows(formattedRows);
  }, [list]);
  const handleclose = () => {
   setOpenModal(false);
     dispatch(clearSelectedReferral());
  };
  // ✅ SEARCH FILTER
  const filteredRows = rows.filter((row: any) =>
    row.referralCode?.props?.children
      ?.toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const handleEdit = async (id: string) => {
    await dispatch(getReferralByIdThunk(id));
    setOpenModal(true);
  };

  return (
    <>
      {/* HEADER */}
      <Box
        sx={{
          padding: "10px",
          borderBottom: "solid 1px var(--greyborder)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT */}
     <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {!sidebarContext?.sidebarOpen && (
            <button
              onClick={sidebarContext?.toggleSidebar}
              className={`${userDetails?.roles?.some(role => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1`}
            >
              <HiMiniBars3BottomLeft style={{ color: "#000", fontSize: "22px" }} />
            </button>
          )}
  <Box
    sx={{
      background: "var(--textfour)",
      padding: "6px",
      borderRadius: "4px",
    }}
  >
    <Ticket size={16} />
  </Box>
  
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Coupon code
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            position: "relative",
          }}
        >
          {/* SEARCH */}
          <Box sx={{ position: "relative" }}>
              <IconButton onClick={() => setShowSearch(!showSearch)}>
                <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
              </IconButton>

              <Box sx={{
                position: "absolute", right: 0, top: "50%",
                transform: "translateY(-50%)",
                width: showSearch ? "250px" : "0px",
                overflow: "hidden", transition: "width 0.4s ease",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <Box
                  onClick={() => setShowSearch(!showSearch)}
                  sx={{ position: "absolute", left: "10px", zIndex: 100, display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
                </Box>

                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  // value={filters.search}
                  // onChange={(e) => updateFilter("search", e.target.value)}
                  sx={{
                    width: "250px",
                    
                    "& .MuiOutlinedInput-root": {
                      height: "35px",
                      background: "white",
                      borderRadius: "5px",
                      fontSize: "14px",
                      color: "var(--textlight)",
                      paddingLeft: "20px",
                      // "& fieldset": { borderColor: "transparent" },
                       "& fieldset": {
                      borderColor: "var(--greyborder)",
                      borderRadius: "4px",
                    },
                      "&:hover fieldset": {
                      borderColor: "var(--primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary) !important",
                      borderWidth: "1.5px",
                    },
                    },
                    

                    
                  }}
                />
              </Box>
            </Box>

          {/* FILTER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "80px",
              border: "1px solid var(--greyborder)",
              p: "7px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <FiFilter />
            <GoChevronLeft />
          </Box>

          {/* ADD BUTTON */}
          <CustomButton
            type="button"
            variant="contained"
            label="Coupon code"
            startIcon={<MdAdd />}
            onClick={() => setOpenModal(true)}
          />
        </Box>
      </Box>

      {/* BODY */}
      <Box sx={{ m: 2 }}>
        <CustomTable
          rows={filteredRows}
          columns={columns}
          loading={loading}
          onLoadMore={handleLoadMore}
        />

        <ReferralCodeModel
          open={openModal}
          onClose={ handleclose }
          
          editData={selected}
        />
      </Box>
    </>
  );
};

export default ReferralCode;