import { useEffect, useState } from "react";
import onboardimg from "../../../assets/image/onboardimg.svg";
import employeeman from "../../../assets/image/employeeman.svg";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Autocomplete, TextField, MenuItem } from "@mui/material";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useNavigate } from "react-router-dom";
import {
  createCareerCompass,
  Degree,
  getAllColleges,
  getAllDegrees,
  // getAllColleges,
  getAllDistricts,
  getAllSpecializations,
  getAllUniversity,
  Specialization,
} from "../../../features/postverifySlice";
import InfiniteScrollAutocomplete from "../../../components/ui/InfiniteAutocomplete";
import {
  College,
  District,
  jobseekersFormFields,
  University,
} from "../../../types/postverify";
import { useAppDispatch } from "../../../app/hook";

/* ---------------------------------------------
   COMMON INPUT STYLES (Same as your working version)
---------------------------------------------- */
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "8px",
    height: "48px",

    "& fieldset": {
      border: "1.31px solid #CED4DA",
    },
    "&:hover fieldset": {
      border: "1.31px solid #CED4DA",
    },
    "&.Mui-focused fieldset": {
      border: "1.31px solid #CED4DA !important",
    },
  },

  // 🔴 Error Border
  "& .MuiOutlinedInput-root.Mui-error fieldset": {
    borderColor: "#ff0000 !important",
  },

  // Labels
  "& .MuiFormLabel-root": {
    color: "#6B7280",
  },
  "& .MuiFormLabel-root.Mui-focused": {
    color: "#6B7280 !important",
  },

  // 🔴 Error Label
  "& .MuiFormLabel-root.Mui-error": {
    color: "#ff0000 !important",
  },

  // Input
  "& .MuiInputBase-input": {
    fontSize: "14px",
    padding: "12px 14px",
    color: "#333",
    "&::placeholder": {
      fontSize: "14px",
      color: "#0000004D",
      opacity: 1,
    },
  },

  // 🔴 Placeholder on error
  "& .MuiInputBase-input.Mui-error::placeholder": {
    color: "#ff0000 !important",
  },

  "& .MuiFormHelperText-root.Mui-error": {
    color: "#ff0000 !important",
    fontSize: "12px",
    marginLeft: "0px",
  },
};

export default function Jobseekers() {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    dob: "",
    mobile: "",
    district: "",
    institution: "",
    College: "",
    internship: false,
    internshipDetails: "",
    degree: "",
    specialization: "",
    Yearofgraduate: "",
    PreferredDomain: "",
    dreamCareer: "",
  });

  const [errors, setErrors] = useState<any>({});
  const dispatch = useAppDispatch();
  const {
    colleges,
    districts,
    loading,
    hasNext,
    degrees,
    degreeLoading,
    degreeHasNext,
  } = useSelector((state: RootState) => state.postverify);
  const {
    universities,
    universityLoading,
    universityHasNext,
    collegeLoading,
    collegeHasNext,
  } = useSelector((state: RootState) => state.postverify);

  const { specializations, specializationLoading, specializationHasNext } =
    useSelector((state: RootState) => state.postverify);
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<Specialization | null>(null);
  const { createpassword, email: googleEmail } = useSelector(
    (state: RootState) => state.ar
  );

  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedUniversities, setUniversities] = useState<University | null>(
    null
  );

  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const navigate = useNavigate();
  /* ---------------------------------------------
         Handle Change
  ---------------------------------------------- */
  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  /* ---------------------------------------------
         Validation Schema
  ---------------------------------------------- */
  const validationSchema: {
    field: jobseekersFormFields;
    label: string;
    conditional?: boolean;
  }[] = [
    { field: "fullName", label: "Full Name" },
    { field: "age", label: "Age" },
    { field: "dob", label: "Date of Birth" },
    { field: "mobile", label: "Mobile" },
    { field: "district", label: "district" },
    { field: "institution", label: "Institution Name" },
    { field: "College", label: "College Name" },
    { field: "degree", label: "Degree" },
    { field: "specialization", label: "Specialization" },
    { field: "Yearofgraduate", label: "Year of Graduation" },
    { field: "PreferredDomain", label: "Preferred Domain" },
    { field: "internship", label: "Internship Experience" },

    {
      field: "internshipDetails",
      label: "If yes, please mention details",
      conditional: true, // special condition for boolean
    },
    { field: "dreamCareer", label: "Dream Career" },
  ];

  /* ---------------------------------------------
         Validator
  ---------------------------------------------- */
  const validate = () => {
    const newErrors: any = {};
    const ageNumber = Number(form.age);
    if (!form.age.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(ageNumber)) {
      newErrors.age = "Age must be a number";
    } else if (ageNumber < 18 || ageNumber > 70) {
      newErrors.age = "Age must be between 18 and 70 years";
    }
    validationSchema.forEach((rule) => {
      const value = form[rule.field];
      if (rule.field === "degree") {
        if (!selectedDegree) {
          newErrors.degree = "Degree is required";
        }
        return;
      }
      if (rule.field === "College") {
        if (!selectedCollege) {
          newErrors.College = "College is required";
        }
        return;
      }
      // Internship field (boolean)
      if (rule.field === "internship") {
        if (value === null || value === undefined) {
          newErrors[rule.field] = `${rule.label} is required`;
        }
        return;
      }

      if (rule.field === "internshipDetails") {
        if (form.internship === true) {
          const val = value as string; // Narrow type
          if (!val.trim()) {
            newErrors[rule.field] = rule.label + " is required";
          }
        }
        return;
      }

      // Normal empty field validation
      if (!value || value.toString().trim() === "") {
        newErrors[rule.field] = `${rule.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------------------------------------
         Submit Handler
  ---------------------------------------------- */
  const handleTakeCareerCompass = async () => {
    if (!validate()) return;
    const sessionemail = sessionStorage.getItem("email");
    const email = createpassword?.email ?? googleEmail ?? sessionemail;
    const payload = {
      fullName: form.fullName,
      mobileNumber: form.mobile,
      age: Number(form.age),
      dob: form.dob,
      email: email,
      district: selectedDistrict?.id,
      // institutionName: form.institution,
      college: selectedCollege?.id,
      degree: selectedDegree?.id,
      specialization: selectedSpecialization?.id,
      academicYear: form.Yearofgraduate,
      hasInternship: form.internship,
      internshipDetails: form.internshipDetails,
      preferredDomain: form.PreferredDomain,
      userStage: "JobSeekers",
      dreamCareer: form.dreamCareer,
    };
    console.log("Final Data:", form);
    try {
      const action: any = await dispatch(createCareerCompass(payload));

      // Handle Redux Toolkit Thunk Response
      if (action.meta.requestStatus === "fulfilled") {
        const res = action.payload;

        toast.success(res.message || "Career Compass saved successfully!");

        const token = sessionStorage.getItem("accessToken");

        if (token) {
          sessionStorage.removeItem("email");
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        // error from thunk
        toast.error(action.payload || "Failed to submit");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }

    // Reset form
    setForm({
      fullName: "",
      age: "",
      dob: "",
      mobile: "",
      institution: "",
      College: "",
      degree: "",
      district: "",
      internship: false,
      internshipDetails: "",
      specialization: "",
      Yearofgraduate: "",
      PreferredDomain: "",
      dreamCareer: "",
    });
    setErrors({});

   
  };
  // useEffect(() => {
  //   if (selectedUniversities) {
  //     console.log("🎯 Selected university:", selectedUniversities);
  //   }
  // }, [selectedUniversities]);

  // useEffect(() => {
  //   console.log(
  //     "🏫 College Names:",
  //     colleges.map((c) => c.collegeName)
  //   );
  // }, [colleges]);

  // useEffect(() => {
  //   if (selectedUniversities?.colleges) {
  //     console.log("📦 Colleges options:", selectedUniversities.colleges);
  //   }
  // }, [selectedUniversities]);

  /* ---------------------------------------------
         UI
  ---------------------------------------------- */
  return (
    <div className="w-full bg-white mt-16">
      <h2 className="text-center text-[22px] font-bold italic text-gray-700 mb-12 sm:mb-10">
        Tell us a bit about you so we can personalize your learning journey!
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-10 px-6 lg:px-16 max-w-[1700px] mx-auto">
        {/* LEFT */}
        <div className="w-full bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-gray-200 rounded-2xl p-8 sm:p-10">
          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl w-fit mb-10">
            <img src={employeeman} className="w-8 h-8" />
            <span className="font-semibold text-gray-700 text-lg">
              Job Seekers
            </span>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FULL NAME */}
            <TextField
              label="Full Name"
              placeholder="Enter Full Name"
              fullWidth
              focused
              sx={inputStyle}
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              error={!!errors.fullName}
              helperText={errors.fullName}
            />

            {/* AGE */}
            <TextField
              label="Age"
              placeholder="Enter Age"
              fullWidth
              focused
              sx={inputStyle}
              value={form.age}
              error={!!errors.age}
              helperText={errors.age}
              onChange={(e) => {
                const value = e.target.value;

                // Only digits allowed AND max 2 digits
                if (/^\d*$/.test(value) && value.length <= 2) {
                  handleChange("age", value);
                }
              }}
            />

            {/* DOB */}
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              focused
              sx={inputStyle}
              InputLabelProps={{ shrink: true }}
              value={form.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
              inputProps={{
                max: new Date(Date.now() - 86400000)
                  .toISOString()
                  .split("T")[0],
              }}
              error={!!errors.dob}
              helperText={errors.dob}
            />

            {/* MOBILE */}
            <TextField
              label="Mobile"
              placeholder="Enter Mobile Number"
              fullWidth
              focused
              sx={inputStyle}
              value={form.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // allow only numbers
                if (value.length <= 10) handleChange("mobile", value);
              }}
              error={!!errors.mobile}
              helperText={errors.mobile}
            />
            {/* District AUTOCOMPLETE */}
            <InfiniteScrollAutocomplete
              label="District"
              placeholder="Select your District"
              value={selectedDistrict}
              focused
              onChange={(newValue) => {
                setSelectedDistrict(newValue as District | null);
                handleChange(
                  "district",
                  (newValue as District | null)?.districtName || ""
                );
              }}
              options={districts}
              getOptionLabel={(opt) => opt?.districtName || ""}
              fetchData={(page, size, search) => {
                dispatch(getAllDistricts({ page, size, districtName: search }));
              }}
              loading={loading}
              hasNext={hasNext}
              pageSize={10}
              error={!!errors.district}
              helperText={errors.district}
              renderOption={(props, option) => (
                <li {...props} key={option.districtName}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {option.districtName}
                    </span>
                  </div>
                </li>
              )}
            />

            {/* INSTITUTION AUTOCOMPLETE */}
            {/* UNIVERSITY AUTOCOMPLETE */}
            <InfiniteScrollAutocomplete
              label="Institution"
              placeholder="Select your institution"
              value={selectedUniversities}
              focused
              onChange={(newValue) => {
                const university = newValue as University | null;

                setUniversities(university);
                handleChange("institution", university?.universityName || "");

                setSelectedCollege(null); // Reset selected college

                if (
                  university?.universityName !==
                  selectedUniversities?.universityName
                ) {
                  // Fetch first page of colleges for this university
                  if (university?.universityName) {
                    dispatch(
                      getAllColleges({
                        universityName: university.universityName,
                        page: 1,
                        size: 25,
                      })
                    );
                  }
                }
              }}
              options={universities}
              getOptionLabel={(opt) => opt?.universityName || ""}
              fetchData={(page, size, search) => {
                dispatch(
                  getAllUniversity({ page, size, universityName: search })
                );
              }}
              loading={universityLoading}
              hasNext={universityHasNext}
              pageSize={10}
              error={!!errors.institution} // ✅
              helperText={errors.institution}
            />

            {/* COLLEGE AUTOCOMPLETE */}
            <InfiniteScrollAutocomplete
              label="College"
              placeholder={
                selectedUniversities
                  ? "Select your college"
                  : "Select institution first"
              }
              value={selectedCollege}
              focused
              onChange={(newValue) => {
                const college = newValue as College | null;
                setSelectedCollege(college);
                handleChange("College", college?.collegeName || "");
                setErrors((prev: any) => ({ ...prev, college: "" }));
              }}
              options={colleges} // Already loaded from Redux
              getOptionLabel={(opt) => opt?.collegeName || ""}
              fetchData={(page, size, search) => {
                // Only called when scrolling or searching
                if (selectedUniversities?.universityName) {
                  dispatch(
                    getAllColleges({
                      universityName: selectedUniversities.universityName,
                      page,
                      size,
                    })
                  );
                }
              }}
              loading={collegeLoading}
              hasNext={collegeHasNext}
              pageSize={10}
              disabled={!selectedUniversities}
              error={!!errors.college} // ✅
              helperText={errors.college}
            />

            {/* DEGREE */}
            <InfiniteScrollAutocomplete
              label="Degree"
              placeholder="Select your degree"
              value={selectedDegree}
              focused
              onChange={(newValue) => {
                const degree = newValue as Degree | null;

                // ✅ set degree
                setSelectedDegree(degree);
                handleChange("degree", degree?.degreeName || "");

                setErrors((prev: any) => ({ ...prev, degree: "" }));

                // ✅ reset specialization
                // setSelectedSpecialization(null);
                // handleChange("specialization", "");

                // ✅ call API immediately when degree selected
                if (degree?.degreeName) {
                  dispatch(
                    getAllSpecializations({
                      degreeName: degree.degreeName,
                      specializationName: "",
                      page: 1,
                      size: 10,
                    })
                  );
                }
              }}
              options={degrees}
              getOptionLabel={(opt) => opt?.degreeName || ""}
              fetchData={(page, size, search) => {
                dispatch(
                  getAllDegrees({
                    page,
                    size,
                    degreeName: search,
                  })
                );
              }}
              loading={degreeLoading}
              hasNext={degreeHasNext}
              pageSize={10}
              error={!!errors.degree}
              helperText={errors.degree}
            />

            {/* SPECIALIZATION */}
            <InfiniteScrollAutocomplete
              label="Specialization"
              placeholder={
                selectedDegree
                  ? "Select your specialization"
                  : "Select degree first"
              }
              value={selectedSpecialization}
              focused
              onChange={(newValue) => {
                const specialization = newValue as Specialization | null;
                setSelectedSpecialization(specialization);
                handleChange(
                  "specialization",
                  specialization?.specializationName || ""
                );
              }}
              options={specializations}
              getOptionLabel={(opt) => opt?.specializationName || ""}
              fetchData={(page, size, search) => {
                if (selectedDegree?.degreeName) {
                  dispatch(
                    getAllSpecializations({
                      degreeName: selectedDegree.degreeName,
                      specializationName: search,
                      page,
                      size,
                    })
                  );
                }
              }}
              loading={specializationLoading}
              hasNext={specializationHasNext}
              pageSize={10}
              disabled={!selectedDegree}
              error={!!errors.specialization}
              helperText={errors.specialization}
            />

            {/* CURRENT YEAR */}
            <TextField
              label="Year of Graduation"
              placeholder="Enter Current Year"
              fullWidth
              focused
              sx={inputStyle}
              value={form.Yearofgraduate}
              onChange={(e) => handleChange("Yearofgraduate", e.target.value)}
              error={!!errors.Yearofgraduate}
              helperText={errors.Yearofgraduate}
            />
            {/* INTERNSHIP */}
            <TextField
              label="Internship Experience"
              select
              fullWidth
              focused
              sx={inputStyle}
              value={form.internship}
              onChange={(e) =>
                handleChange("internship", e.target.value === "true")
              }
              error={!!errors.internship}
              helperText={errors.internship}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>

            {/* INTERNSHIP DETAILS */}

            {/* SHOW ONLY IF internship === true */}
            {form.internship === true && (
              <TextField
                label="If Yes, please mention in detail"
                placeholder="Company, Role, Duration..."
                fullWidth
                focused
                sx={inputStyle}
                value={form.internshipDetails}
                onChange={(e) =>
                  handleChange("internshipDetails", e.target.value)
                }
                error={!!errors.internshipDetails}
                helperText={errors.internshipDetails}
              />
            )}

            {/* PREFERRED DOMAIN */}
            <TextField
              label="Preferred Domain"
              placeholder="Type here..."
              fullWidth
              focused
              sx={inputStyle}
              value={form.PreferredDomain}
              onChange={(e) => handleChange("PreferredDomain", e.target.value)}
              error={!!errors.PreferredDomain}
              helperText={errors.PreferredDomain}
            />
          </div>

          <div className="mt-5">
            {/* DREAM CAREER */}
            <TextField
              label="Tell us about your Dream Job"
              placeholder="Type here..."
              fullWidth
              focused
              multiline
              minRows={4}
              sx={{
                ...inputStyle,

                "& .MuiOutlinedInput-root": {
                  ...inputStyle["& .MuiOutlinedInput-root"],
                  height: "auto", // ✅ Override fixed height for multiline
                  minHeight: "100px", // ✅ Set minimum height
                  alignItems: "flex-start",
                  padding: "14px",
                },
                "& textarea": {
                  maxHeight: "150px", // ✅ Fixed max height to force scroll
                  overflowY: "auto !important", // ✅ Always show scroll when needed
                  resize: "none",
                  boxSizing: "border-box",
                  lineHeight: "1.5",

                  // ✅ Custom scrollbar styling for better visibility
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "#555",
                    },
                  },
                },
              }}
              value={form.dreamCareer}
              onChange={(e) => handleChange("dreamCareer", e.target.value)}
              error={!!errors.dreamCareer}
              helperText={errors.dreamCareer}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center text-center px-4 h-full mt-20">
          <img src={onboardimg} className="w-72 sm:w-96 mb-6" />

          <p className="text-black-50 mb-6 text-[16px] leading-relaxed">
            Take the Career Compass – A quick and fun Self-assessment to guide
            <br />
            your learning journey.
          </p>

          <button
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            onClick={handleTakeCareerCompass}
          >
            Take Career Compass
          </button>
        </div>
      </div>
    </div>
  );
}
