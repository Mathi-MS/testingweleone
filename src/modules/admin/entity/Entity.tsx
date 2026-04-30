import { useEffect, useState, useContext } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import { images } from "../../../assets/image/Images";
import { FiSearch, FiFilter } from "react-icons/fi";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import EntityModel from "./EntityModel";
import EntityEditModel from "./EntityEditModel";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { useFilter } from "../../../contexts/FilterContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { fetchEntityBySearch } from "../../../features/entity/entitySlice";
import { useAppDispatch } from "../../../app/hook";

const yourFilterData = [
  {
    title: "State",
    count: 20,
    type: 'checkbox' as const,
    items: [
      { id: "1", name: "Maharashtra" },
      { id: "2", name: "Gujarat" },
      { id: "3", name: "Karnataka" },
      { id: "4", name: "Tamil Nadu" }
    ]
  },
  {
    title: "Entity Type",
    count: 15,
    type: 'checkbox' as const,
    items: [
      { id: "5", name: "University" },
      { id: "6", name: "College" },
      { id: "7", name: "School" },
      { id: "8", name: "Training Institution" }
    ]
  }
];

const Entity = () => {
  const dispatch = useAppDispatch();
  const filterContext = useContext(FilterContext);
  const { setFilterData, setFilterEnabled } = useFilter();
  const handleSendFilter = (yourFilterData: any, enabled: boolean) => {
    setFilterData(yourFilterData);
    setFilterEnabled(enabled);
  };
  const toggleFilter = filterContext?.toggleFilter || (() => { });
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pagePerData] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const {
    list: entityData,
    loading,
    pagination,
  } = useSelector((state: RootState) => state.entity);

  const columns = [
    { key: "entityId", label: "Entity ID" },
    { key: "entityType", label: "Entity Type" },
    { key: "entityName", label: "Entity Name" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "city", label: "City" },
    { key: "address", label: "Address" },
    { key: "pincode", label: "Pin code" },
  ];

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      dispatch(
        fetchEntityBySearch({
          page: pagination.page + 1,
          limit: 10,
          search: searchText,
        })
      );
    }
    return Promise.resolve();
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    dispatch(fetchEntityBySearch({ search: value }));
  };



  useEffect(() => {
    dispatch(fetchEntityBySearch({ page: 0, limit: 10, search: "" }));
    setFilterData(yourFilterData);
    setFilterEnabled(false);
  }, [dispatch]);

  useEffect(() => {
    if (!entityData?.length) {
      setRows([]);
      return;
    }
    setPage(pagination.page ?? 0);
    setTotalPages(pagination.total === 0 ? 1 : (pagination.total ?? 1));
    const formattedRows = entityData.map((item: any) => ({
      ...item,
      entityName: (
        <Typography
          sx={{
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "12px"
          }}
          onClick={() => {
            setSelectedItemId(item.id);
            setOpenEditDrawer(true);
          }}
        >
          {item.entityName}
        </Typography>
      ),
      entityType: item.entityType ? (
        <Box
          sx={{
            display: "inline-block",
            border: "1px solid #d0d5dd",
            borderRadius: "16px",
            padding: "4px 12px",
            fontSize: "12px",
            color: "#344054",
            backgroundColor: "#f9fafb"
          }}
        >
          {item.entityType}
        </Box>
      ) : "-",
      state: item.state ?? "-",
      district: item.district ?? "-",
      city: item.city ?? "-",
      address: item.address ?? "-",
      pincode: item.pincode ?? "-",
    }));
    setRows(formattedRows);
  }, [entityData]);

  return (
    <>
      <Box
        sx={{
          margin: "0px 0px 10px 0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box
            sx={{ background: "var(--textfour)", padding: "6px", borderRadius: "4px" }}
            component={"img"}
            src={images.microlearning}
          />
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Entity Management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
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
              }}
            >
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
                    background: "white",
                    borderRadius: "2px",
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
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                }}
              />
            </Box>
          </Box>

          <Box
            onClick={toggleFilter}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "solid 1px var(--greyborder)",
              padding: "6px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <FiFilter style={{ color: "var(--textlight)", fontSize: "18px" }} />
          </Box>

          <CustomButton
            variant="contained"
            label="Create Entity"
            startIcon={<MdAdd size={20} />}
            onClick={() => setOpenDrawer(true)} type={"button"}          />
        </Box>
      </Box>

      <CustomTable
        columns={columns}
        rows={rows}
        // page={page}
        // totalPages={totalPages}
        // pagePerData={pagePerData}
        onLoadMore={handleLoadMore}
        loading={loading}
      />

      <EntityModel open={openDrawer} onClose={() => setOpenDrawer(false)} />
      <EntityEditModel
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        itemId={selectedItemId}
      />
    </>
  );
};

export default Entity;
