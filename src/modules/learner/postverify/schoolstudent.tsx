import { TextField, MenuItem, Autocomplete } from "@mui/material";
import { useEffect, useRef, useMemo, useState } from "react";
import onboardimg from "../../../assets/image/onboardimg.svg";
import prefinalicon from "../../../assets/icon/prefinalicon.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  createCareerCompass,
  getAllDistricts,
  getAllSchools,
} from "../../../features/postverifySlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import InfiniteScrollAutocomplete from "../../../components/ui/InfiniteAutocomplete";
import { District, schoolsFormFields } from "../../../types/postverify";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppDispatch } from "../../../app/hook";

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

  // 🔴 ERROR BORDER
  "& .MuiOutlinedInput-root.Mui-error fieldset": {
    borderColor: "#ff0000 !important",
  },

  "& .MuiFormLabel-root": {
    color: "#6B7280",
    // fontSize: "14px",
  },

  "& .MuiFormLabel-root.Mui-focused": {
    color: "#6B7280 !important",
  },

  // 🔴 ERROR LABEL COLOR
  "& .MuiFormLabel-root.Mui-error": {
    color: "#ff0000 !important",
  },
  "&::placeholder": {
    fontSize: "14px",
    color: "#0000004D",
    opacity: 1,
  },
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

  // 🔴 Placeholder when error
  "& .MuiInputBase-input.Mui-error::placeholder": {
    color: "#ff0000 !important",
  },

  "& .MuiFormHelperText-root.Mui-error": {
    color: "#ff0000  !important",
    fontSize: "12px",
    marginLeft: "0px",
  },
};

const schoolOptions = [
  "Govt School",
  "Private School",
  "International School",
  "High School ABC",
  "XYZ Academy",
];

type FormFields =
  | "fullName"
  | "age"
  | "dob"
  | "mobile"
  | "district"
  | "school"
  | "classStd"
  | "career";

export default function SchoolStudentForm() {
  const classStandards = [
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
  ];

  const dispatch = useAppDispatch();
  const {
    districts,
    schoolLoading,
    districtLoading,
    hasNext,
    schools,
    schoolHasNext,
  } = useSelector((state: RootState) => state.postverify);
  const { createpassword, email: googleEmail ,accessToken} = useSelector((state: RootState) => state.ar);
  
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    dob: "",
    mobile: "",
    school: "",
    district: "",
    classStd: "",
    career: "",
  });

  const [errors, setErrors] = useState<any>({});
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  // -------------------- VALIDATION SCHEMA -------------------
  const validationSchema: { field: schoolsFormFields; label: string }[] = [
    { field: "fullName", label: "Full Name" },
    { field: "age", label: "Age" },
    { field: "dob", label: "Date of Birth" },
    { field: "mobile", label: "Mobile Number" },
    { field: "district", label: "district Name" },
    { field: "school", label: "School Name" },
    { field: "classStd", label: "Class Standard" },
    { field: "career", label: "Dream career" },
  ];
  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  // ------------------------ VALIDATION -----------------------
  // const validate = () => {
  //   const newErrors: any = {};

  //   validationSchema.forEach(({ field, label }) => {
  //     // Only validate switchReason if goal = switch

  //     if (!form[field] || !form[field].trim()) {
  //       newErrors[field] = `${label} is required`;
  //     }

  //     // Extra validations
  //     if (field === "mobile") {
  //       if (!form.mobile.trim()) {
  //         newErrors.mobile = "Mobile Number is required";
  //       } else if (!/^[0-9]{10}$/.test(form.mobile)) {
  //         newErrors.mobile = "Enter a valid 10-digit mobile number";
  //       }
  //     }

  //     // if (field === "email" && form.email && !/\S+@\S+\.\S+/.test(form.email)) {
  //     //   newErrors.email = "Enter a valid email";
  //     // }
  //   });

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const validate = () => {
    const newErrors: any = {};

    // TEXT FIELD VALIDATIONS
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    const ageNumber = Number(form.age);
    if (!form.age.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(ageNumber)) {
      newErrors.age = "Age must be a number";
    } else if (ageNumber < 9 || ageNumber > 18) {
      newErrors.age = "Age must be between 9 and 18 years";
    }

    if (!form.dob.trim()) newErrors.dob = "Date of Birth is required";

    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!form.classStd.trim())
      newErrors.classStd = "Class Standard is required";
    if (!form.career.trim()) newErrors.career = "Dream career is required";

    // ✅ OBJECT VALIDATION (FIX)
    if (!selectedDistrict) {
      newErrors.district = "District is required";
    }

    if (!selectedSchool) {
      newErrors.school = "School is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------- HANDLE SUBMIT ----------------------
  const handleTakeCareerCompass = async () => {
      const sessionemail = sessionStorage.getItem("email");
    const email =
      createpassword?.email ??
      googleEmail ??
      sessionemail;
    if (!validate()) return;
    const payload = {
      fullName: form.fullName,
      mobileNumber: form.mobile,
      email: email ,
      age: Number(form.age),
      dob: form.dob,
      district: selectedDistrict?.id,
      school: selectedSchool.id,
      schoolStandard: form.classStd,
      dreamCareer: form.career,
    };

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

        // Reset form
        setForm({
          fullName: "",
          age: "",
          dob: "",
          mobile: "",
          district: "",
          school: "",
          classStd: "",
          career: "",
        });
      } else {
        // error from thunk
        toast.error(action.payload || "Failed to submit");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full bg-white py-10 sm:py-14">
      {/* TITLE */}
      <h2 className="text-center text-[22px]  font-bold italic text-gray-700 mb-12 sm:mb-16">
        Tell us a bit about you so we can personalize your learning journey!
      </h2>

      {/* Tell us a bit about you so we can personalize your learning journey!
      </h2> */}

      {/* FULL WIDTH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-10 lg:gap-14 px-6 lg:px-16 max-w-[1700px] mx-auto">
        {/* LEFT CARD */}
        <div className="w-full bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-gray-200 rounded-2xl p-8 sm:p-10">
          {/* Tag */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl w-fit mb-8 sm:mb-10">
            <img src={prefinalicon} alt="school icon" className="w-8 h-8" />
            <span className="font-semibold text-gray-700 text-lg">
              School Students
            </span>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FULL NAME */}
            <div className="md:col-span-1">
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
            </div>

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
              placeholder="Enter your Mobile No."
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

            <InfiniteScrollAutocomplete
              label="District"
              placeholder="Select your District"
              value={selectedDistrict}
              focused
              onChange={(newValue) => {
                setSelectedDistrict(newValue as District | null);
                setErrors((prev: any) => ({ ...prev, district: "" }));
              }}
              options={districts}
              getOptionLabel={(opt) => opt?.districtName || ""}
              fetchData={(page, size, search) => {
                dispatch(getAllDistricts({ page, size, districtName: search }));
              }}
              loading={districtLoading}
              hasNext={hasNext}
              pageSize={10}
              error={!!errors.district}
              helperText={errors.district}
            />

            {/* SCHOOL */}
            <InfiniteScrollAutocomplete
              label="School Name"
              placeholder="Enter or search your School"
              value={selectedSchool}
              focused
              onChange={(newValue) => {
                setSelectedSchool(newValue);
                setErrors((prev: any) => ({ ...prev, school: "" }));
              }}
              options={schools}
              getOptionLabel={(opt) => opt?.schoolName || ""}
              fetchData={(page, size, search) => {
                dispatch(
                  getAllSchools({
                    page,
                    size,
                    schoolName: search || "",
                    // districtId: selectedDistrict?.id, // ✅ optional if backend supports
                  })
                );
              }}
              loading={schoolLoading}
              hasNext={schoolHasNext}
              pageSize={10}
              error={!!errors.school}
              helperText={errors.school}
            />

            {/* CLASS */}
            <TextField
              label="Class Standard"
              select
              fullWidth
              focused
              sx={inputStyle}
              value={form.classStd}
              onChange={(e) => handleChange("classStd", e.target.value)}
              error={!!errors.classStd}
              helperText={errors.classStd}
              SelectProps={{
                displayEmpty: true,
                IconComponent: ExpandMoreIcon,
              }}
            >
              {/* Placeholder */}

              {/* ✅ Placeholder via MenuItem */}
              <MenuItem value="" disabled>
                <span style={{ color: "#9CA3AF" }}>
                  Select your Class Standard
                </span>
              </MenuItem>
              {classStandards.map((std) => (
                <MenuItem key={std} value={std}>
                  {std}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* TEXTAREA */}
          <TextField
            label="Dream career you're excited about"
            placeholder="Type Here..."
            fullWidth
            focused
            multiline
            minRows={4}
            className="mt-6 sm:mt-8"
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
            value={form.career}
            onChange={(e) => handleChange("career", e.target.value)}
            error={!!errors.career}
            helperText={errors.career}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <img src={onboardimg} className="w-72 sm:w-96 mb-6 sm:mb-8" />

          <p className="text-black-50 mb-6 text-[16px] leading-relaxed">
            Take the Career Compass – A quick and fun Self-assessment to guide
            <br />
            your learning journey.
          </p>

          <button
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
            onClick={handleTakeCareerCompass}
          >
            Take Career Compass
          </button>
        </div>
      </div>
    </div>
  );
}
