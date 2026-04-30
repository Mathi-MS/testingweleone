import { useState } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { CalendarCheck } from "lucide-react";
import CustomTable from "../../../../components/custom/CustomTable";
import { FiSearch } from "react-icons/fi";

const renderStatus = (status: string) => {
  const map: any = {
    INACTIVE: { label: "Inactive", color: "#D59347", bg: "#D593471A" },
    ACTIVE: { label: "Active", color: "#00B048", bg: "#00B0481A" },
  };
  const s = map[status];
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        borderRadius: "16px",
        fontSize: "12px",
        fontWeight: 600,
        color: s.color,
        backgroundColor: s.bg,
        minWidth: "80px",
      }}
    >
      {s.label}
    </Box>
  );
};

export const AllLearner = () => {
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const columns = [
    { key: "id", label: "Sl.no" },
    { key: "date", label: "Date" },
    { key: "learnerId", label: "Learner ID" },
    { key: "learnerName", label: "Learner Name" },
    { key: "contactDetails", label: "Contact Details" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  const rows = [
    {
      id: 1,
      date: "2024-01-15",
      learnerId: "LID001",
      learnerName: "John Doe",
      contactDetails: "9876543219 (john@gmail.com)",
      status: renderStatus("ACTIVE"),
      action: "View",
    },
    {
      id: 2,
      date: "2024-01-16",
      learnerId: "LID002",
      learnerName: "Jane Smith",
      contactDetails: "9898765434 (jane@gmail.com)",
      status: renderStatus("ACTIVE"),
      action: "View",
    },
    {
      id: 3,
      date: "2024-01-17",
      learnerId: "LID003",
      learnerName: "Mike Johnson",
      contactDetails: "7890987890 (mike@gmail.com)",
      status: renderStatus("INACTIVE"),
      action: "View",
    },
    {
      id: 4,
      date: "2024-01-18",
      learnerId: "LID004",
      learnerName: "Sarah Williams",
      contactDetails: "7986587890 (sarah@gmail.com)",
      status: renderStatus("ACTIVE"),
      action: "View",
    },
    {
      id: 5,
      date: "2024-01-19",
      learnerId: "LID005",
      learnerName: "David Brown",
      contactDetails: "9876543210 (david@gmail.com)",
      status: renderStatus("ACTIVE"),
      action: "View",
    },
  ];

  return (
    <div className="">
      <Box
        sx={{
          borderBottom: "solid 1px var(--greyborder)",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{
              background: "var(--textfour)",
              padding: "6px",
              borderRadius: "4px",
              svg: { fontSize: "16px !important" },
            }}
          >
            <CalendarCheck size={16} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Learners
          </Typography>
        </Box>
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
              <FiSearch
                style={{ color: "var(--textlight)", fontSize: "18px" }}
              />
            </IconButton>

            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: showSearch ? "250px" : "0px",
                overflow: "hidden",
                transition: "width 0.4s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Box
                onClick={() => setShowSearch(!showSearch)}
                sx={{
                  position: "absolute",
                  left: "0px",
                  top: "0px",
                  zIndex: 100,
                  width: "20px",
                  height: "100%",
                  marginLeft: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                  cursor: "pointer",
                }}
              >
                <FiSearch
                  style={{ color: "var(--textlight)", fontSize: "18px" }}
                />
              </Box>

              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  width: "250px",
                  "& .MuiOutlinedInput-root": {
                    height: "35px",
                    background: "var(--greythree)",
                    borderRadius: "5px",
                    fontFamily: "DM-Semibold !important",
                    fontSize: "14px",
                    color: "var(--textlight)",
                    paddingLeft: "20px",
                    "& fieldset": {
                      borderColor: "transparent",
                      borderRadius: "4px",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {/* TABLE */}
      <CustomTable rows={rows} columns={columns} />
    </div>
  );
};
