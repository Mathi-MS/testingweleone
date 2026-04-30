import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Divider } from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin6Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { AiOutlinePlus } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import CustomButton from "../../../components/custom/CustomButton";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { CustomInfiniteAutocomplete } from "../../../components/custom/CustomInfiniteAutocomplete";
import AddAdminDialog from "./AddAdminDialog";
import {
  forminput,
  inputForm,
  inputTitle,
} from "../../../components/custom/CustomStyles";

import { AppDispatch } from "../../../app/store";
import {
  createEntity,
  updateEntity,
  clearSelectedEntity,
  fetchUniversities,
  fetchColleges,
  fetchStates,
  fetchDistricts,
  fetchCities,
} from "../../../features/entity/entitySlice";
import { RootState } from "../../../app/store";
import { showError, showSuccess } from "../../../components/ui/Toast";
import { useSelector } from "react-redux";
import debounce from "lodash/debounce";
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

const collegeTypeOptions = [
  { label: "Science", value: "SCIENCE" },
  { label: "Arts", value: "ARTS" },
  { label: "Engineering", value: "ENGINEERING" },
  { label: "Management", value: "MANAGEMENT" },
  { label: "Medical", value: "MEDICAL" },
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

const EntityModel = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedEntity, universities, universitiesHasNext, colleges, states, districts, cities } = useSelector((state: RootState) => state.entity);
  const [universityPage, setUniversityPage] = useState(0);
  const [selectedUniversity, setSelectedUniversity] = useState<{ title: string; label: string } | null>(null);
  const [expand, setExpand] = useState(false);
  const width = expand ? "80%" : "50%";
  const [adminOptions, setAdminOptions] = useState(initialAdminOptions);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

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
    try {
      console.log(data);
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

      if (selectedEntity?.id) {
        await dispatch(
          updateEntity({
            id: selectedEntity.id,
            data: payloadData,
            logo: data.entityLogo?.[0],
          })
        ).unwrap();
        showSuccess("Entity Updated Successfully");
      } else {
        await dispatch(
          createEntity({
            data: payloadData,
            logo: data.entityLogo?.[0],
          })
        ).unwrap();
        showSuccess("Entity Created Successfully");
      }

      reset({
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
      });
      dispatch(clearSelectedEntity());
      onClose();
    } catch (err: any) {
      showError(err.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    dispatch(clearSelectedEntity());
    setSelectedUniversity(null);
    reset({
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
    });
    onClose();
  };

  useEffect(() => {
    if (open) {
      setSelectedUniversity(null);
      if (selectedEntity) {
        reset({
          entityType: selectedEntity.entityType,
          entityName: selectedEntity.entityName,
          universityType:
            selectedEntity.entityType === "UNIVERSITY"
              ? selectedEntity.universityType
              : selectedEntity.collegeType, // Map based on type
          state: selectedEntity.state || null,
          district: selectedEntity.district || null,
          city: selectedEntity.city || null,
          address: selectedEntity.address || "",
          pincode: selectedEntity.pincode || "",
          contactPersonName: selectedEntity.contactPersonName || "",
          contactEmail: selectedEntity.primaryEmail || "",
          contactPhone: selectedEntity.primaryMobile || "",
          primaryAdmin: selectedEntity.adminUser
            ? [selectedEntity.adminUser]
            : [],
          degrees: selectedEntity.degrees && selectedEntity.degrees.length > 0
            ? selectedEntity.degrees
            : [{ degreeType: null, departments: [] }],
          universityName: null, // TODO: Map this if available in API
        });
      } else {
        reset({
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
        });
      }
    }
  }, [open, selectedEntity, reset]);

  const handleAddAdmin = (newAdmin: { label: string; value: string }) => {
    setAdminOptions((prev) => [...prev, newAdmin]);
  };

  const handleUniversitySearch = debounce((value: string) => {
    setUniversityPage(0);
    dispatch(fetchUniversities({ page: 0, size: 20, universityName: value }));
  }, 500);

  const handleUniversityScrollEnd = () => {
    if (universitiesHasNext) {
      const nextPage = universityPage + 1;
      setUniversityPage(nextPage);
      dispatch(fetchUniversities({ page: nextPage, size: 20, universityName: '' }));
    }
  };

  const handleCollegeSearch = debounce((value: string) => {
    const uniName = watch("universityName");
    if (!uniName) return;
    dispatch(fetchColleges({ search: value, universityName: uniName }));
  }, 500);

const handleEntityNameSearch = debounce((value: string) => {
  if (watch("entityType") === "UNIVERSITY") {
    handleUniversitySearch(value);
    // Call college API when university name is provided
    // dispatch(fetchColleges({ universityName: value }));
  } else if (watch("entityType") === "COLLEGE" && watch("universityName")) {
    handleCollegeSearch(value);
    
  }
}, 500);

  const selectedEntityName = watch("entityName");

  useEffect(() => {
    if (watch("entityType") === "UNIVERSITY" && open && selectedEntityName) {
      
      
      dispatch(fetchColleges({ universityName: selectedEntityName }));
    }
  }, [selectedEntityName, open, dispatch]); // fires for UNIVERSITY type to load mapped colleges

  useEffect(() => {
    if (watch("entityType") === "COLLEGE" && open) {
      setUniversityPage(0);
      dispatch(fetchUniversities({ page: 0, size: 20, universityName: '' }));
    } else if (watch("entityType") === "UNIVERSITY" && open) {
      setUniversityPage(0);
      dispatch(fetchUniversities({ page: 0, size: 20, universityName: '' }));
    }
     dispatch(fetchColleges({ universityName: selectedEntityName }));
    
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

  const universityOptions = universities?.map((u) => ({
    title: u.universityName,
    label: u.universityName,
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
            <IconButton onClick={onClose}>
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
              Entity Management / {selectedEntity ? "Update" : "Creation"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={onClose}
            />
            <CustomButton type="submit" variant="contained" label="Save" />
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
            />
          </Box>

          {watch("entityType") && (
            <>
              <Typography
                variant="h3"
                sx={{ mb: 2, mt: 3, fontSize: "16px", fontWeight: "600" }}
              >
                {entityTypeOptions.find(
                  (opt) => opt.value === watch("entityType")
                )?.label || "Entity"}{" "}
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
                  freeSolo={true}
                  onInputChange={handleEntityNameSearch}
                  onChange={(_event: React.SyntheticEvent, newValue: string | null) => {
    if (watch("entityType") === "UNIVERSITY" && newValue) {
      dispatch(fetchColleges({ universityName: newValue }));
    }
  }}
                  disabled={watch("entityType") === "COLLEGE" && !watch("universityName")}
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
                />
              </Box>

              {watch("entityType") === "COLLEGE" && (
                <Box sx={forminput}>
                  <Typography variant="h3">University</Typography>
                  <CustomInfiniteAutocomplete
                    name="universityName"
                    options={universityOptions}
                    errors={errors}
                    boxSx={inputForm}
                    value={selectedUniversity}
                    onChange={(val: { title: string; label: string } | null) => {
                      setSelectedUniversity(val);
                      setValue("universityName", val?.title ?? null);
                      
                      dispatch(fetchColleges({ universityName: val?.title ?? undefined }));
                    }}
                    onInputChange={handleUniversitySearch}
                    onScrollEnd={handleUniversityScrollEnd}
                    multiple={false}
                  />
                </Box>
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
                />
              </Box>

              <Box sx={forminput}>
                <Typography variant="h3">Pincode</Typography>
                <CustomInput
                  name="pincode"
                  register={register}
                  errors={errors}
                  boxSx={inputForm}
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
                />
              </Box>

              <Box sx={forminput}>
                <Typography variant="h3">Contact Phone</Typography>
                <CustomInput
                  name="contactPhone"
                  register={register}
                  errors={errors}
                  boxSx={inputForm}
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
                  multiple={true}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {watch("entityType") === "UNIVERSITY" ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h3" sx={{ fontSize: "16px", fontWeight: "600" }}>
                      Mapped Colleges
                    </Typography>
                  </Box>
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F9FAFB" }}>
                          {["College ID", "College Name", "University", "College Type", "State", "District"].map((h) => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #E4E7EC", fontWeight: 600, color: "#344054", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {colleges.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: "16px 12px", textAlign: "center", color: "#98A2B3" }}>
                              {watch("entityName") ? "No colleges found" : "Select a university name to load colleges"}
                            </td>
                          </tr>
                        ) : (
                          colleges.map((c, i) => (
                            <tr key={c.collegeCode || i} style={{ borderBottom: "1px solid #F2F4F7" }}>
                              <td style={{ padding: "8px 12px", color: "#667085" }}>{c.collegeCode || "-"}</td>
                              <td style={{ padding: "8px 12px" }}>{c.collegeName}</td>
                              <td style={{ padding: "8px 12px", color: "#667085" }}>{c.universityName || "-"}</td>
                              <td style={{ padding: "8px 12px", color: "#667085" }}>{c.collegeType || "-"}</td>
                              <td style={{ padding: "8px 12px", color: "#667085" }}>{c.state || "-"}</td>
                              <td style={{ padding: "8px 12px", color: "#667085" }}>{c.district || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{ fontSize: "16px", fontWeight: "600" }}
                    >
                      Degree & Department
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FiSearch size={20} color="#667085" />
                      <Typography
                        sx={{
                          color: "#00C853",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                        onClick={() =>
                          append({ degreeType: null, departments: [] })
                        }
                      >
                        <AiOutlinePlus /> Add
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gap: 2 }}>
                    {fields.map((field, index) => (
                      <Box
                        key={field.id}
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <Box sx={{ width: "40%" }}>
                          <CustomAutocomplete
                            name={`degrees.${index}.degreeType`}
                            control={control}
                            options={degreeTypeOptions}
                            errors={errors}
                            placeholder="Select Degree"
                            boxSx={{ ...inputForm, mb: 0 }}
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
                          />
                        </Box>
                        <IconButton onClick={() => remove(index)} color="error">
                          <RiDeleteBin6Line />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
        <AddAdminDialog
          open={isAddAdminOpen}
          onClose={() => setIsAddAdminOpen(false)}
          onAdd={handleAddAdmin}
        />
      </Box>
    </Box>
  );
};

export default EntityModel;
