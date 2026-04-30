import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Divider, Avatar } from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin6Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { AiOutlinePlus } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import CustomButton from "../../../components/custom/CustomButton";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { forminput, inputForm } from "../../../components/custom/CustomStyles";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  fetchEntityById,
  updateEntity,
  deleteEntity,
  clearSelectedEntity,
  fetchUniversities,
  fetchColleges,
  fetchStates,
  fetchDistricts,
  fetchCities,
} from "../../../features/entity/entitySlice";
import { showError, showSuccess } from "../../../components/ui/Toast";
import AddAdminDialog from "./AddAdminDialog";
import debounce from "lodash/debounce";
import ConfirmDialog from "../../../components/custom/ConfirmDialog";
import { useAppDispatch } from "../../../app/hook";

interface FormValues {
  entityType: string | null;
  entityLogo: FileList;
  entityName: string;
  universityType: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  address: string;
  pincode: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  primaryAdmin: string[];
  degrees: { degreeType: string | null; departments: string[] }[];
  universityName?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

const entityTypeOptions = [
  { label: "University", value: "UNIVERSITY" },
  { label: "College", value: "COLLEGE" },
  { label: "School", value: "SCHOOL" },
  { label: "Institute", value: "INSTITUTE" },
  { label: "Other", value: "OTHER" },
];

const universityTypeOptions = [
  { label: "Private", value: "PRIVATE" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Deemed", value: "DEEMED" },
  { label: "Autonomous", value: "AUTONOMOUS" },
];

const degreeTypeOptions = [
  { label: "UG (Undergraduate)", value: "UNDERGRADUATE" },
  { label: "PG (Postgraduate)", value: "POSTGRADUATE" },
  { label: "Diploma", value: "DIPLOMA" },
  { label: "PhD", value: "PHD" },
  { label: "Certificate", value: "CERTIFICATE" },
];

const departmentTypeOptions = [
  { label: "B.Sc. Computer Science", value: "BSC_CS" },
  { label: "B.A. English", value: "BA_ENG" },
  { label: "B.E. Mechanical", value: "BE_MECH" },
  { label: "MBA", value: "MBA" },
  { label: "MBBS", value: "MBBS" },
  { label: "B.Com", value: "BCOM" },
  { label: "M.Tech", value: "MTECH" },
];


const initialAdminOptions = [
  { label: "Admin 1", value: "admin1" },
  { label: "Admin 2", value: "admin2" },
];

const EntityEditModel = ({ open, onClose, itemId }: Props) => {
  const dispatch = useAppDispatch();
  const [expand, setExpand] = useState(false);
  const [isViewMode, setIsViewMode] = useState(true);
  const width = expand ? "80%" : "50%";
  const [adminOptions, setAdminOptions] = useState(initialAdminOptions);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { selectedEntity, universities, colleges, states, districts, cities, loading } = useSelector(
    (state: RootState) => state.entity
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      entityType: null,
      entityName: "",
      universityType: null,
      state: null,
      district: null,
      city: null,
      address: "",
      pincode: "",
      contactPersonName: "",
      contactEmail: "",
      contactPhone: "",
      primaryAdmin: [],
      degrees: [{ degreeType: null, departments: [] }],
      universityName: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "degrees",
  });

  const onSubmit = async (data: FormValues) => {
    if (!itemId) return;

    try {
      const payloadData = {
        entityType: data.entityType,
        entityName: data.entityName,
        universityType: data.universityType,
        state: data.state,
        district: data.district,
        city: data.city,
        address: data.address,
        pincode: data.pincode,
        contactPersonName: data.contactPersonName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        primaryAdmin: data.primaryAdmin,
        degrees: data.degrees,
      };

      await dispatch(
        updateEntity({
          id: itemId,
          data: payloadData,
          logo: data.entityLogo?.[0],
        })
      ).unwrap();

      showSuccess("Entity Updated Successfully");
      setIsViewMode(true);
    } catch (err: any) {
      showError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (open && itemId) {
      dispatch(fetchEntityById(itemId));
      setIsViewMode(true);
    }
  }, [open, itemId, dispatch]);

  useEffect(() => {
    if (selectedEntity && open) {
      reset({
        entityType: selectedEntity.entityType || null,
        entityName: selectedEntity.entityName || "",
        universityType: selectedEntity.entityType === 'UNIVERSITY'
          ? selectedEntity.universityType
          : selectedEntity.collegeType,
        state: selectedEntity.state || null,
        district: selectedEntity.district || null,
        city: selectedEntity.city || null,
        address: selectedEntity.address || "",
        pincode: selectedEntity.pincode || "",
        contactPersonName: selectedEntity.contactPersonName || "",
        contactEmail: selectedEntity.primaryEmail || "", // Map from primaryEmail
        contactPhone: selectedEntity.primaryMobile || "", // Map from primaryMobile
        primaryAdmin: selectedEntity.adminUser ? [selectedEntity.adminUser] : [],
        degrees: selectedEntity.degrees && selectedEntity.degrees.length > 0
          ? selectedEntity.degrees
          : [{ degreeType: null, departments: [] }],
        universityName: null, // TODO: Map this if available in API
      });
    }
  }, [selectedEntity, reset, open]);

  const handleClose = () => {
    setIsViewMode(true);
    dispatch(clearSelectedEntity());
    onClose();
  };

  const handleAddAdmin = (newAdmin: { label: string; value: string }) => {
    setAdminOptions((prev) => [...prev, newAdmin]);
  };

  const handleDelete = async () => {
    if (!itemId) return;
    try {
      await dispatch(deleteEntity(itemId)).unwrap();
      showSuccess("Entity deleted successfully");
      setIsDeleteConfirmOpen(false);
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to delete entity");
    }
  };

  const handleUniversitySearch = debounce((value: string) => {
    dispatch(fetchUniversities({ universityName: value }));
  }, 500);

  const handleCollegeSearch = debounce((value: string) => {
    dispatch(fetchColleges({ search: value }));
  }, 500);

  const handleEntityNameSearch = (value: string) => {
    if (watch("entityType") === "UNIVERSITY") {
      handleUniversitySearch(value);
    } else if (watch("entityType") === "COLLEGE") {
      handleCollegeSearch(value);
    }
  };

  useEffect(() => {
    if (watch("entityType") === "COLLEGE" && open) {
      dispatch(fetchUniversities({}));
      dispatch(fetchColleges({}));
    } else if (watch("entityType") === "UNIVERSITY" && open) {
      dispatch(fetchUniversities({}));
    }
  }, [watch("entityType"), open, dispatch]);
  // useEffect(() => {
  //   if (open) {
  //     dispatch(fetchStates());
  //   }
  // }, [open, dispatch]);

  const selectedState = watch("state");
  const selectedDistrict = watch("district");

  const handleStateSearch = debounce((value: string) => {
    dispatch(fetchStates(value));
  }, 500);

  const handleDistrictSearch = debounce((value: string) => {
    const currentState = watch("state");
    if (currentState) {
      dispatch(fetchDistricts({ stateName: currentState, search: value }));
    }
  }, 500);

  const handleCitySearch = debounce((value: string) => {
    const currentDistrict = watch("district");
    if (currentDistrict) {
      dispatch(fetchCities({ districtName: currentDistrict, search: value }));
    }
  }, 500);

  useEffect(() => {
    if (selectedState) {
      dispatch(fetchDistricts({ stateName: selectedState as string }));
    }
  }, [selectedState, dispatch]);

  useEffect(() => {
    if (selectedDistrict) {
      dispatch(fetchCities({ districtName: selectedDistrict as string }));
    }
  }, [selectedDistrict, dispatch]);

  const stateOptions = states.map((s) => ({
    label: s.stateName,
    value: s.stateName,
  }));

  const districtOptions = districts.map((d) => ({
    label: d.districtName,
    value: d.districtName,
  }));

  const cityOptions = cities.map((c) => ({
    label: c.cityName,
    value: c.cityName,
  }));

  const universityOptions = universities.map((u) => ({
    label: u.universityName,
    value: u.universityName,
  }));

  const collegeOptions = colleges.map((c) => ({
    label: c.collegeName,
    value: c.collegeName,
  }));

  const entityNameOptions = watch("entityType") === "UNIVERSITY" ? universityOptions : watch("entityType") === "COLLEGE" ? collegeOptions : [];

  return (
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
        zIndex: 1200,
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit as any)}>
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
              Entity Management / {isViewMode ? "View" : "Edit"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isViewMode ? (
              <>
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Edit"
                  onClick={() => setIsViewMode(false)}
                />
                <IconButton onClick={() => setIsDeleteConfirmOpen(true)} color="error" sx={{ border: '1px solid currentColor', borderRadius: '4px', p: '5px' }}>
                  <RiDeleteBin6Line size={18} />
                </IconButton>
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Close"
                  onClick={handleClose}
                />
              </>
            ) : (
              <>
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Cancel"
                  onClick={() => setIsViewMode(true)}
                />
                <CustomButton type="submit" variant="contained" label="Save" />
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            mt: 2,
            maxHeight: "calc(100vh - 160px)",
            overflowY: "auto",
            pr: 1,
            // Hide scrollbar for cleaner look
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: "4px",
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{ mb: 2, fontSize: "16px", fontWeight: "600" }}
          >
            Entity Type
          </Typography>
          <Box sx={forminput}>
            <CustomAutocomplete
              name="entityType"
              control={control}
              options={entityTypeOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          {watch("entityType") && (
            <>
              <Typography
                variant="h3"
                sx={{ mb: 2, mt: 3, fontSize: "16px", fontWeight: "600" }}
              >
                {entityTypeOptions.find((opt) => opt.value === watch("entityType"))
                  ?.label || "Entity"}{" "}
                Information
              </Typography>

              <Box sx={{ ...forminput, alignItems: 'center', gridTemplateColumns: '200px 1fr' }}>
                <Typography variant="h3">
                  {entityTypeOptions.find((opt) => opt.value === watch("entityType"))?.label || "Entity"} Logo
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5'
                  }}>
                    {(selectedEntity?.logoUrl || (watch("entityLogo") && watch("entityLogo").length > 0)) ? (
                      <img
                        src={
                          watch("entityLogo") && watch("entityLogo").length > 0
                            ? URL.createObjectURL(watch("entityLogo")[0])
                            : selectedEntity?.logoUrl
                        }
                        alt="Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">Logo</Typography>
                    )}
                  </Box>

                  {!isViewMode && (
                    <Box sx={{ position: 'relative' }}>
                      <Typography
                        sx={{
                          color: '#98A2B3',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Click to change logo
                      </Typography>
                      <input
                        {...register("entityLogo")}
                        type="file"
                        accept="image/*"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={forminput}>
                <Typography variant="h3">
                  {entityTypeOptions.find(
                    (opt) => opt.value === watch("entityType")
                  )?.label || "Entity"}{" "}
                  Name
                </Typography>
                <CustomAutocomplete
                  name="entityName"
                  control={control}
                  options={entityNameOptions}
                  errors={errors}
                  boxSx={inputForm}
                  disabled={isViewMode}
                  freeSolo={true}
                  onInputChange={handleEntityNameSearch}
                />
              </Box>

              <Box sx={forminput}>
                <Typography variant="h3">
                  {entityTypeOptions.find(
                    (opt) => opt.value === watch("entityType")
                  )?.label || "Entity"}{" "}
                  Type
                </Typography>
                <CustomAutocomplete
                  name="universityType"
                  control={control}
                  options={universityTypeOptions}
                  errors={errors}
                  boxSx={inputForm}
                  disabled={isViewMode}
                />
              </Box>

              {watch("entityType") === "COLLEGE" && (
                <Box sx={forminput}>
                  <Typography variant="h3">University</Typography>
                  <CustomAutocomplete
                    name="universityName"
                    control={control}
                    options={universityOptions}
                    errors={errors}
                    boxSx={inputForm}
                    disabled={isViewMode}
                    onInputChange={handleUniversitySearch}
                    freeSolo={true}
                  />
                </Box>
              )}
            </>
          )}

          <Typography
            variant="h3"
            sx={{ mb: 2, mt: 3, fontSize: "16px", fontWeight: "600" }}
          >
            Location
          </Typography>

          <Box sx={forminput}>
            <Typography variant="h3">State</Typography>
            <CustomAutocomplete
              name="state"
              control={control}
              options={stateOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
              onInputChange={handleStateSearch}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">District</Typography>
            <CustomAutocomplete
              name="district"
              control={control}
              options={districtOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
              onInputChange={handleDistrictSearch}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">City</Typography>
            <CustomAutocomplete
              name="city"
              control={control}
              options={cityOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
              onInputChange={handleCitySearch}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Full Address</Typography>
            <CustomInput
              name="address"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Pincode</Typography>
            <CustomInput
              name="pincode"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          <Typography
            variant="h3"
            sx={{ mb: 2, mt: 3, fontSize: "16px", fontWeight: "600" }}
          >
            Contact Information
          </Typography>

          <Box sx={forminput}>
            <Typography variant="h3">Contact Person Name</Typography>
            <CustomInput
              name="contactPersonName"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Contact Email</Typography>
            <CustomInput
              name="contactEmail"
              type="email"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Contact Phone</Typography>
            <CustomInput
              name="contactPhone"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              mb: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontSize: "16px", fontWeight: "600" }}
            >
              Assign Admin
            </Typography>
            <div>
              {!isViewMode && (
                <CustomButton
                  type="button"
                  variant="contained"
                  label="+ Add New"
                  onClick={() => setIsAddAdminOpen(true)}
                  sx={{
                    background: "#00C853",
                    "&:hover": { background: "#009624" },
                    fontSize: "12px",
                    py: 0.5,
                    px: 2,
                    textTransform: "none",
                    borderRadius: "6px",
                  }}
                />
              )}
            </div>
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Primary Admin</Typography>
            <CustomAutocomplete
              name="primaryAdmin"
              control={control}
              options={adminOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={isViewMode}
              multiple={true}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontSize: "16px", fontWeight: "600" }}>
              Degree & Department
            </Typography>
            {!isViewMode && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FiSearch size={20} color="#667085" />
                <Typography
                  sx={{
                    color: "#00C853",
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                  onClick={() => append({ degreeType: null, departments: [] })}
                >
                  <AiOutlinePlus /> Add
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: '40%' }}>
                  <CustomAutocomplete
                    name={`degrees.${index}.degreeType`}
                    control={control}
                    options={degreeTypeOptions}
                    errors={errors}
                    placeholder="Select Degree"
                    boxSx={{ ...inputForm, mb: 0 }}
                    disabled={isViewMode}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomAutocomplete
                    name={`degrees.${index}.departments`}
                    control={control}
                    options={departmentTypeOptions}
                    errors={errors}
                    placeholder="Select or Add Department"
                    boxSx={{ ...inputForm, mb: 0 }}
                    multiple={true}
                    disabled={isViewMode}
                  />
                </Box>
                {!isViewMode && (
                  <IconButton onClick={() => remove(index)} color="error">
                    <RiDeleteBin6Line />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

        </Box>
        <AddAdminDialog
          open={isAddAdminOpen}
          onClose={() => setIsAddAdminOpen(false)}
          onAdd={handleAddAdmin}
        />
        <ConfirmDialog
          open={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Entity"
          message="Are you sure you want to delete this entity? This action cannot be undone."
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default EntityEditModel;
