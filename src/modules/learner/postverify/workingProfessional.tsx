import onboardimg from "../../../assets/image/onboardimg.svg";
import Professionalicon from "../../../assets/icon/Professionalicon.svg";
import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useNavigate } from "react-router-dom";
import { createCareerCompass, Degree, getAllDegrees, getAllDistricts, getAllSpecializations, Specialization } from "../../../features/postverifySlice";
import InfiniteScrollAutocomplete from "../../../components/ui/InfiniteAutocomplete";
import { District, FormType } from "../../../types/postverify";
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

export default function Graduate() {
  const dispatch = useAppDispatch();
  const { districts, loading, hasNext } = useSelector(
      (state: RootState) => state.postverify
    );
     const { createpassword,email: googleEmail } = useSelector(
      (state: RootState) => state.ar
    );
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    dob: "",
    mobile: "",
    email: "",
    degree: "",
    companyName: "",
    currentDomain: "",
    currentRole: "",
    yearsOfExperience: "",
    careerGoal: "",
    targetDomain: "",
    district: "", 
  });
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<Specialization | null>(null);
      const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
      const {
  
    degrees,
    degreeLoading,
    degreeHasNext,
    specializations,
    specializationLoading,
    specializationHasNext,
  } = useSelector((state: RootState) => state.postverify);
  const [errors, setErrors] = useState<any>({});
   const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
      null
    );
  // --------------------- HANDLE CHANGE ---------------------
  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  // -------------------- VALIDATION SCHEMA -------------------
  const validationSchema : { field: keyof FormType; label: string; conditional?: keyof FormType }[]= [
    { field: "fullName", label: "Full Name" },
    { field: "age", label: "Age" },
    { field: "dob", label: "Date of Birth" },
    { field: "mobile", label: "Mobile Number" },
    // { field: "email", label: "Email" },
    { field: "degree", label: "Highest Degree" },
    { field: "companyName", label: "Company Name" },
    { field: "currentDomain", label: "Domain / Industry" },
    { field: "currentRole", label: "Current Role" },
    { field: "yearsOfExperience", label: "Years of Experience" },
    { field: "careerGoal", label: "Career Goal" },
    { field: "specialization", label: "Specialization" },
    // Conditional
    {
      field: "targetDomain",
      label: "Switch Reason",
      conditional: "careerGoal",
    },
    { field: "district", label: "District" },
  ];

  // ------------------------ VALIDATION -----------------------
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

    validationSchema.forEach(({ field, label, conditional }) => {
      // Only validate switchReason if goal = switch
      if (conditional === "careerGoal" && form.careerGoal !== "Switch") return;

      if (field === "degree") {
        if (!selectedDegree) {
          newErrors.degree = "Degree is required";
        }
        return;
      }

      if (field === "specialization") {
        if (!selectedSpecialization) {
          newErrors.specialization = "Specialization is required";
        }
        return;
      }

      if (!form[field as keyof typeof form] || !form[field as keyof typeof form]?.trim()) {
        newErrors[field] = `${label} is required`;
      }

      // Extra validations
      if (field === "mobile") {
        if (!form.mobile.trim()) {
          newErrors.mobile = "Mobile Number is required";
        } else if (!/^[0-9]{10}$/.test(form.mobile)) {
          newErrors.mobile = "Enter a valid 10-digit mobile number";
        }
      }

      // if (field === "email" && form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      //   newErrors.email = "Enter a valid email";
      // }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------- HANDLE SUBMIT ----------------------
  const handleTakeCareerCompass = async () => {
    if (!validate()) return;
    const sessionemail = sessionStorage.getItem("email");
    const email =
      createpassword?.email ??
      googleEmail ??
      sessionemail
    const payload = {
      fullName: form.fullName,
      mobileNumber: form.mobile,
      age: Number(form.age),
      dob: form.dob,
      email:email,
      district: selectedDistrict?.id,
      degree: selectedDegree?.id,
      specialization: selectedSpecialization?.id,
      companyName: form.companyName,
      currentDomain: form.currentDomain,
      currentRole: form.currentRole,
      yearsOfExperience: form.yearsOfExperience,
      dreamCareer: form.careerGoal,
      targetDomain: form.targetDomain,
      userStage: "workingProfessionals ",
    };
    try {
      const action: any = await dispatch(createCareerCompass(payload));

      // Check Thunk Result
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
          email: "",
          degree: "",
          companyName: "",
          currentDomain: "",
          currentRole: "",
          yearsOfExperience: "",
          careerGoal: "",
          targetDomain: "",
           district: "", 
        });
      } else {
        toast.error(action.payload || "Failed to submit");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
    setForm({
      fullName: "",
      age: "",
      dob: "",
      mobile: "",
      email: "",
      degree: "",
      companyName: "",
      currentDomain: "",
      currentRole: "",
      yearsOfExperience: "",
      careerGoal: "",
      targetDomain: "",
       district: "", 
    });
    setSelectedDistrict(null);
    setSelectedDegree(null);
    setSelectedSpecialization(null);
  };

  return (
    <div className="w-full bg-white  mt-10">
      <h2 className="text-center text-[22px] font-bold italic text-gray-700 mb-1 sm:mb-10">
        Tell us a bit about you so we can personalize your learning journey!
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-10 px-6 lg:px-16 max-w-[1700px] mx-auto">
        {/* LEFT CARD */}
        <div className="w-full bg-white shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-gray-200 rounded-2xl p-8 sm:p-10">
          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl w-fit mb-10">
            <img src={Professionalicon} alt="icon" className="w-8 h-8" />
            <span className="font-semibold text-gray-700 text-lg">
              Working Professionals / Career Switchers
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
              label="Mobile Number"
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

            {/* EMAIL */}
            {/* <TextField
              label="Email"
              placeholder="Enter your Email"
              fullWidth
              focused
              sx={inputStyle}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            /> */}

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
           
                           // ✅ reset specialization
                          //  setSelectedDegree(null);
                         
           
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
                          //  setSelectedSpecialization(null);
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

            {/* COMPANY */}
            <TextField
              label="Company Name"
              placeholder="Enter Company Name"
              fullWidth
              focused
              sx={inputStyle}
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              error={!!errors.companyName}
              helperText={errors.companyName}
            />

            {/* currentDomain */}
            <TextField
              label="Domain / Industry"
              placeholder="Enter Domain / Industry"
              fullWidth
              focused
              sx={inputStyle}
              value={form.currentDomain}
              onChange={(e) => handleChange("currentDomain", e.target.value)}
              error={!!errors.currentDomain}
              helperText={errors.currentDomain}
            />

            {/* CURRENT ROLE */}
            <TextField
              label="Current Role"
              placeholder="Enter Current Role"
              fullWidth
              focused
              sx={inputStyle}
              value={form.currentRole}
              onChange={(e) => handleChange("currentRole", e.target.value)}
              error={!!errors.currentRole}
              helperText={errors.currentRole}
            />

            {/* EXPERIENCE */}
            <TextField
              label="Years of Experience"
              placeholder="Enter Years of Experience"
              fullWidth
              focused
              sx={inputStyle}
              value={form.yearsOfExperience}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only digits & max 2 digits
                if (/^\d{0,2}$/.test(value)) {
                  handleChange("yearsOfExperience", value);
                }
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: 2,
              }}
              error={!!errors.yearsOfExperience}
              helperText={errors.yearsOfExperience}
            />

            {/* CAREER GOAL */}
            <TextField
              select
              label="Career Goal"
              placeholder="Select Upskill or Switch"
              fullWidth
              focused
              sx={inputStyle}
              value={form.careerGoal}
              onChange={(e) => handleChange("careerGoal", e.target.value)}
              error={!!errors.careerGoal}
              helperText={errors.careerGoal}
            >
              <MenuItem value="Upskill">Upskill</MenuItem>
              <MenuItem value="Switch">Switch</MenuItem>
            </TextField>
          </div>

          {/* targetDomain REASON */}
          {form.careerGoal === "Switch" && (
            <div className="mt-5">
              <TextField
                label="If Switching, mention Target Domain & Reason"
                placeholder="Type here..."
                fullWidth
                multiline
                minRows={2}
                focused
                sx={{
                ...inputStyle,
               
    "& .MuiOutlinedInput-root": {
      ...inputStyle["& .MuiOutlinedInput-root"],
      height: "auto", // ✅ Override fixed height for multiline
      minHeight: "15px", // ✅ Set minimum height
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
                value={form.targetDomain}
                onChange={(e) => handleChange("targetDomain", e.target.value)}
                error={!!errors.targetDomain}
                helperText={errors.targetDomain}
              />
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <img src={onboardimg} className="w-72 sm:w-96 mb-6" />

          <p className="text-black-50 mb-6 text-[16px] leading-relaxed">
            Take the Career Compass – A quick and fun Self-assessment to guide<br />
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
