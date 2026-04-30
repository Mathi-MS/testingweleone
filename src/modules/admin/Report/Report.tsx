import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import React, { useContext, useState } from "react";
import icon from '../../../assets/icon/report.svg';

import MasterclassReport from "./MasterclassReport";
import CareerCompassReport from "./CareerCompassReport";
import { GoChevronLeft } from "react-icons/go";
import { FiFilter, FiSearch } from "react-icons/fi";
import CoursesReport from "./CoursesReport ";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { useFilter } from "../../../contexts/FilterContext";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Report = () => {
  const [value, setValue] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const filterContext = useContext(FilterContext);
    const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();
    const handleSendFilter = (yourFilterData: any, enabled: boolean) => {
      setFilterData(yourFilterData);
      setFilterEnabled(enabled);
    };
    const toggleFilter = filterContext?.toggleFilter || (() => {});
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT TITLE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            component="img"
            src={icon}
            sx={{
              background: "var(--textfour)",
              padding: "6px",
              borderRadius: "4px",
              width: "28px",
            }}
          />

          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Reports
          </Typography>
        </Box>

        {/* RIGHT ACTIONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {/* SEARCH */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch
                style={{ color: "var(--textlight)", fontSize: "18px" }}
              />
            </IconButton>

            <Box
              sx={{
                width: showSearch ? "220px" : "0px",
                overflow: "hidden",
                transition: "width 0.3s ease",
              }}
            >
              <TextField
                size="small"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  width: "220px",
                  "& .MuiOutlinedInput-root": {
                    height: "35px",
                    background: "#fff",
                    "& fieldset": {
                      borderColor: "var(--greyborder)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary)",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* FILTER */}
          <Box
             onClick={toggleFilter}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid var(--greyborder)",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <FiFilter style={{ color: "var(--primary)" }} />
            <Typography sx={{ fontSize: "13px" }}>Filter</Typography>
            <GoChevronLeft />
          </Box>
        </Box>
      </Box>

      {/* TABS */}
      <Tabs
        value={value}
        onChange={handleChange}
        sx={{
          mt: 4,
          "& button": {
            textTransform: "capitalize",
          },
          "& .Mui-selected": {
            fontWeight: "bold",
            color: "var(--primary)",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--primary)",
          },
        }}
      >
        <Tab label="Courses" />
        <Tab label="Masterclass" />
        {/* <Tab label="Career Compass" /> */}
      </Tabs>

      {/* TAB CONTENT */}
      <TabPanel value={value} index={0}>
        <CoursesReport />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <MasterclassReport />
      </TabPanel>

      {/* <TabPanel value={value} index={2}>
        <CareerCompassReport />
      </TabPanel> */}
    </Box>
  );
};

export default Report;