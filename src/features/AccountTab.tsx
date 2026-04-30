  import { Avatar, Box, Button, IconButton, Snackbar, Alert, CircularProgress, Tooltip, Typography } from "@mui/material";
  import { Edit } from "@mui/icons-material";
  import { images } from "../assets/image/Images";
  import { CustomInput } from "../components/custom/CustomInput";
  import { CustomInfiniteAutocomplete } from "../components/custom/CustomInfiniteAutocomplete";
  import { CustomTextarea } from "../components/custom/CustomTextarea";
  import { AccountBoxStyle, inputForm, labelStyle } from "../components/custom/CustomStyles";
  import { useForm, useWatch } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { useState, useCallback, useEffect, useRef } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { AppDispatch, RootState } from "../app/store";
  import {
    getAllDistricts,
    getAllSchools,
    getAllUniversity,
    getAllColleges,
    getAllDegrees,
    getAllSpecializations,
    createOnboardDetails
  } from "../features/postverifySlice";
  import { updateProfileImg } from "../features/profileSlice";
  import debounce from "lodash/debounce";
  import { ImageCropDialog } from "../components/ImageCropDialog";
  import CustomButton from "../components/custom/CustomButton";
  import { showError, showSuccess } from "../components/ui/Toast";

  const formSchema = z.object({
    fullname: z.string().min(1, "Full Name is required"),
    age: z.string().min(1, "Age is required"),
    dob: z.string().min(1, "Date of Birth is required"),
    mobile: z.string().min(1, "Mobile is required"),
    district: z.string().min(1, "District is required"),
    onboardingtype: z.string().min(1, "Onboarding Type is required"),
    schoolname: z.string().optional(),
    currentclass: z.string().optional(),
    dreamcareer: z.string().optional(),
    collegeuniversity: z.string().optional(),
    collegeinstitutionname: z.string().optional(),
    customcollegename: z.string().optional(),
    collegedegree: z.string().optional(),
    collegespecialization: z.string().optional(),
    collegecurrentyear: z.string().optional(),
    collegeinternshipexperience: z.string().optional(),
    collegedreamjob: z.string().optional(),
    jobseekersdegree: z.string().optional(),
    jobseekersspecialization: z.string().optional(),
    jobseekersinstitutionname: z.string().optional(),
    customjobseekerscollegename: z.string().optional(),
    jobseekersyearofgraduation: z.string().optional(),
    jobseekerspreferreddomain: z.string().optional(),
    jobseekersdreamjob: z.string().optional(),
    companyname: z.string().optional(),
    domain: z.string().optional(),
    currentrole: z.string().optional(),
    yearsofexperience: z.string().optional(),
    highestdegree: z.string().optional(),
    careergoal: z.string().optional(),
    targetdomain: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.onboardingtype === "school") {
      if (!data.schoolname) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "School Name is required", path: ["schoolname"] });
      if (!data.currentclass) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current Class is required", path: ["currentclass"] });
      // if (!data.dreamcareer) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dream Career is required", path: ["dreamcareer"] });
    } else if (data.onboardingtype === "college") {
      // if (!data.collegeuniversity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "University is required", path: ["collegeuniversity"] });
      if (!data.collegeinstitutionname) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Institution Name is required", path: ["collegeinstitutionname"] });
      if (data.collegeinstitutionname === "others" && !data.customcollegename) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "College Name is required", path: ["customcollegename"] });
      if (!data.collegedegree) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Degree is required", path: ["collegedegree"] });
      if (!data.collegespecialization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specialization is required", path: ["collegespecialization"] });
      if (!data.collegecurrentyear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current Year is required", path: ["collegecurrentyear"] });
      if (!data.collegeinternshipexperience) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Internship Experience is required", path: ["collegeinternshipexperience"] });
      // if (!data.collegedreamjob) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dream Job is required", path: ["collegedreamjob"] });
    } else if (data.onboardingtype === "jobseekers") {
      if (!data.jobseekersdegree) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Degree is required", path: ["jobseekersdegree"] });
      if (!data.jobseekersspecialization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specialization is required", path: ["jobseekersspecialization"] });
      if (!data.jobseekersinstitutionname) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Institution Name is required", path: ["jobseekersinstitutionname"] });
      if (data.jobseekersinstitutionname === "others" && !data.customjobseekerscollegename) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "College Name is required", path: ["customjobseekerscollegename"] });
      if (!data.jobseekersyearofgraduation) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Year of Graduation is required", path: ["jobseekersyearofgraduation"] });
      if (!data.jobseekerspreferreddomain) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Preferred Domain is required", path: ["jobseekerspreferreddomain"] });
      // if (!data.jobseekersdreamjob) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dream Job is required", path: ["jobseekersdreamjob"] });
    } else if (data.onboardingtype === "professionals") {
      if (!data.companyname) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company Name is required", path: ["companyname"] });
      if (!data.domain) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Domain/Industry is required", path: ["domain"] });
      if (!data.currentrole) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current Role is required", path: ["currentrole"] });
      if (!data.yearsofexperience) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Years of Experience is required", path: ["yearsofexperience"] });
      if (!data.highestdegree) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Highest Degree is required", path: ["highestdegree"] });
      // if (!data.careergoal) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Career Goal is required", path: ["careergoal"] });
    }
  });

  type AccountFormData = z.infer<typeof formSchema>;

  interface AccountTabProps {
    userDetails: any;
    onboardDetails: any;
    onClose: () => void;
  }

  const AccountTab = ({ userDetails, onboardDetails,onClose }: AccountTabProps) => {  
    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState(onboardDetails?.profileImg || "");
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
    const {
      districts,
      schools,
      universities,
      colleges,
      degrees,
      specializations,
      districtHasNext, districtLoading,
      schoolHasNext, schoolLoading,
      universityHasNext, universityLoading,
      collegeHasNext, collegeLoading,
      degreeHasNext, degreeLoading,
      specializationHasNext, specializationLoading
    } = useSelector((state: RootState) => state.postverify);

    const mapUserStageToOnboardingType = (userStage: string) => {
      const mapping: Record<string, string> = {
        SCHOOL: "school",
        COLLEGE: "college",
        JOB_SEEKER: "jobseekers",
        WORKING_PROFESSIONAL: "professionals"
      };
      return mapping[userStage] || "";
    };

    const { register, control, handleSubmit, watch, getValues, reset, setValue, formState: { errors } } = useForm<AccountFormData>({
      resolver: zodResolver(formSchema),
      mode: "onBlur",
      defaultValues: {
        fullname: onboardDetails?.fullName || "",
        age: onboardDetails?.age?.toString() || "",
        dob: onboardDetails?.dob || "",
        mobile: onboardDetails?.mobileNumber || "",
        district: onboardDetails?.district?.id || "",
        onboardingtype: mapUserStageToOnboardingType(onboardDetails?.userStage || ""),
        // School fields
        schoolname: onboardDetails?.schoolDetails?.school?.id || "",
        currentclass: onboardDetails?.schoolDetails?.schoolStandard || "",
        dreamcareer: onboardDetails?.schoolDetails?.dreamCareer || "",
        // College fields
        // collegeuniversity: onboardDetails?.collegeDetails?.college?.universityName || "",
        collegeinstitutionname: onboardDetails?.collegeDetails?.college?.id || "",
        customcollegename: "",
        collegedegree: onboardDetails?.collegeDetails?.degree?.id || "",
        collegespecialization: onboardDetails?.collegeDetails?.specialization?.id || "",
        collegecurrentyear: onboardDetails?.collegeDetails?.academicYear || "",
        collegeinternshipexperience: onboardDetails?.collegeDetails?.hasInternship ? "yes" : "no",
        collegedreamjob: onboardDetails?.collegeDetails?.dreamCareer || "",
        // Job Seeker fields
        jobseekersdegree: onboardDetails?.jobSeekerDetails?.degree?.id || "",
        jobseekersspecialization: onboardDetails?.jobSeekerDetails?.specialization?.id || "",
        jobseekersinstitutionname: onboardDetails?.jobSeekerDetails?.college?.id || "",
        customjobseekerscollegename: "",
        jobseekersyearofgraduation: onboardDetails?.jobSeekerDetails?.yearOfGraduation || "",
        jobseekerspreferreddomain: onboardDetails?.jobSeekerDetails?.preferredDomain || "",
        jobseekersdreamjob: onboardDetails?.jobSeekerDetails?.dreamCareer || "",
        // Professional fields
        companyname: onboardDetails?.professionalDetails?.companyName || "",
        domain: onboardDetails?.professionalDetails?.currentDomain || "",
        currentrole: onboardDetails?.professionalDetails?.currentRole || "",
        yearsofexperience: onboardDetails?.professionalDetails?.yearsOfExperience?.toString() || "",
        highestdegree: onboardDetails?.professionalDetails?.degree?.id || "",
        careergoal: onboardDetails?.professionalDetails?.dreamCareer || "",
        targetdomain: onboardDetails?.professionalDetails?.targetDomain || "",
      },
    });
    
    const onboardingType = useWatch({ control, name: "onboardingtype" });
    const watchedDob = watch("dob");
    const watchedCollegeDegree = watch("collegedegree");
    const watchedCollegeUniversity = watch("collegeuniversity");
    const watchedCollege = watch("collegeinstitutionname");
    const watchedJobseekersDegree = watch("jobseekersdegree");

    useEffect(() => {
      if (watchedDob) {
        const birth = new Date(watchedDob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age > 0) setValue("age", String(age));
      }
    }, [watchedDob, setValue]);

    // Pagination & Search State
    const [districtParams, setDistrictParams] = useState({ page: 1, search: "" });
    const [schoolParams, setSchoolParams] = useState({ page: 1, search: "" });
    const [universityParams, setUniversityParams] = useState({ page: 1, search: "" });
    const [collegeParams, setCollegeParams] = useState({ page: 1, search: "" });
    const [degreeParams, setDegreeParams] = useState({ page: 1, search: "" });
    const [specializationParams, setSpecializationParams] = useState({ page: 1, search: "" });

    // Options mapping
    const districtOptions = districts.map((d: any) => ({ label: d.districtName, title: d.id }));
    const schoolOptions = schools.map((s: any) => ({ label: s.schoolName, title: s.id }));
    const universityOptions = universities.map((u: any) => ({ label: u.universityName, title: u.universityName }));
    const collegeOptions = [{ label: "Others", title: "others" }, ...colleges.map((c: any) => ({ label: c.collegeName, title: c.id }))];
    const degreeOptions = degrees.map((d: any) => ({ label: d.degreeName, title: d.id }));
    const specializationOptions = specializations.map((s: any) => ({ label: s.specializationName, title: s.id }));

    const onboardingOptions = [
      { label: "School", title: "school" },
      { label: "College", title: "college" },
      { label: "Job Seekers", title: "jobseekers" },
      { label: "Working Professionals / Career Switchers", title: "professionals" },
    ];

    const internshipOptions = [
      { label: "Yes", title: "yes" },
      { label: "No", title: "no" },
    ];

    // Scroll handlers
    const handleDistrictScroll = () => {
      if (districtHasNext && !districtLoading) {
        const nextPage = districtParams.page + 1;
        setDistrictParams(prev => ({ ...prev, page: nextPage }));
        dispatch(getAllDistricts({ page: nextPage, size: 20, districtName: districtParams.search }));
      }
    };

    const handleSchoolScroll = () => {
      if (schoolHasNext && !schoolLoading) {
        const nextPage = schoolParams.page + 1;
        setSchoolParams(prev => ({ ...prev, page: nextPage }));
        dispatch(getAllSchools({ page: nextPage, size: 20, schoolName: schoolParams.search }));
      }
    };

    const handleUniversityScroll = () => {
      if (universityHasNext && !universityLoading) {
        const nextPage = universityParams.page + 1;
        setUniversityParams(prev => ({ ...prev, page: nextPage }));
        dispatch(getAllUniversity({ page: nextPage, size: 20, universityName: universityParams.search }));
      }
    };

    const handleCollegeScroll = () => {
      if (collegeHasNext && !collegeLoading) {
        const nextPage = collegeParams.page + 1;
        setCollegeParams(prev => ({ ...prev, page: nextPage }));
        // if (onboardingType === "jobseekers") {
          dispatch(getAllColleges({ page: nextPage, size: 20, collegeName: collegeParams.search }));
          
        // } else if (watchedCollegeUniversity) {
        //   dispatch(getAllColleges({ universityName: watchedCollegeUniversity, collegeName: collegeParams.search, page: nextPage, size: 20 }));
        // }
      }
    };

    const handleDegreeScroll = () => {
      if (degreeHasNext && !degreeLoading) {
        const nextPage = degreeParams.page + 1;
        setDegreeParams(prev => ({ ...prev, page: nextPage }));
        dispatch(getAllDegrees({ page: nextPage, size: 20, degreeName: degreeParams.search }));
      }
    };

    const handleSpecializationScroll = () => {
      if (specializationHasNext && !specializationLoading) {
        const degreeToUse = onboardingType === "college" ? watchedCollegeDegree : watchedJobseekersDegree;
        if (degreeToUse) {
          const degreeObj = degrees.find((d: any) => d.id === degreeToUse);
          if (degreeObj) {
            const nextPage = specializationParams.page + 1;
            setSpecializationParams(prev => ({ ...prev, page: nextPage }));
            dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, specializationName: specializationParams.search, page: nextPage, size: 20 }));
          }
        }
      }
    };

    // Search handlers
    const handleDistrictSearch = useCallback(
      debounce((value: string) => {
        setDistrictParams({ page: 1, search: value });
        dispatch(getAllDistricts({ page: 1, size: 20, districtName: value }));
      }, 500),
      [dispatch]
    );

    const handleSchoolSearch = useCallback(
      debounce((value: string) => {
        setSchoolParams({ page: 1, search: value });
        dispatch(getAllSchools({ page: 1, size: 20, schoolName: value }));
      }, 500),
      [dispatch]
    );

    const handleUniversitySearch = useCallback(
      debounce((value: string) => {
        setUniversityParams({ page: 1, search: value });
        dispatch(getAllUniversity({ page: 1, size: 20, universityName: value }));
      }, 500),
      [dispatch]
    );

    const handleCollegeSearch = useCallback(
      debounce((value: string) => {
        setCollegeParams({ page: 1, search: value });
        dispatch(getAllColleges({ page: 1, size: 20, collegeName: value }));
      }, 500),
      [dispatch]
    );

    const handleDegreeSearch = useCallback(
      debounce((value: string) => {
        setDegreeParams({ page: 1, search: value });
        dispatch(getAllDegrees({ page: 1, size: 20, degreeName: value }));
      }, 500),
      [dispatch]
    );

    const handleSpecializationSearch = useCallback(
      debounce((value: string) => {
        const degreeToUse = onboardingType === "college" ? watchedCollegeDegree : watchedJobseekersDegree;
        if (degreeToUse) {
          const degreeObj = degrees.find((d: any) => d.id === degreeToUse);
          if (degreeObj) {
            setSpecializationParams({ page: 1, search: value });
            dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, specializationName: value, page: 1, size: 20 }));
          }
        }
      }, 500),
      [dispatch, watchedCollegeDegree, watchedJobseekersDegree, degrees, onboardingType]
    );

    // Effects
    useEffect(() => {
      if (onboardDetails?.district?.id) {
        dispatch(getAllDistricts({ page: 1, size: 20, districtName: onboardDetails.district.districtName }));
      } else {
        dispatch(getAllDistricts({ page: 1, size: 20 }));
      }
      if (onboardDetails?.schoolDetails?.school?.id) {
        dispatch(getAllSchools({ page: 1, size: 20, schoolName: onboardDetails.schoolDetails.school.schoolName }));
      } else {
        dispatch(getAllSchools({ page: 1, size: 20 }));
      }
      if (onboardDetails?.collegeDetails?.college?.universityName) {
        dispatch(getAllUniversity({ page: 1, size: 20, universityName: onboardDetails.collegeDetails.college.universityName }));
      } else {
        dispatch(getAllUniversity({ page: 1, size: 20 }));
      }    
      if (onboardDetails?.professionalDetails?.degree?.degreeName) {
        dispatch(getAllDegrees({ page: 1, size: 20, degreeName: onboardDetails.professionalDetails.degree.degreeName }));
      } else {
        dispatch(getAllDegrees({ page: 1, size: 20 }));
      }
    }, [dispatch, onboardDetails?.district?.id, onboardDetails?.district?.districtName, onboardDetails?.professionalDetails?.degree?.degreeName]);

    useEffect(() => {    
      dispatch(getAllColleges({ page: 1, size: 20, collegeName: onboardDetails.collegeDetails?.college?.collegeName  }));
    }, [onboardingType, dispatch]);

    useEffect(() => {
      const degreeToUse = onboardingType === "college" ? watchedCollegeDegree : watchedJobseekersDegree;
      if (degreeToUse) {
        const degreeObj = degrees.find((d: any) => d.id === degreeToUse);
        if (degreeObj) {
          setSpecializationParams({ page: 1, search: "" });
          dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, page: 1, size: 20 }));
        }
      }
    }, [watchedCollegeDegree, watchedJobseekersDegree, dispatch, degrees, onboardingType]);


    const renderConditionalFields = () => {
      switch (onboardingType) {
        case "school":
          return [
            { label: "School Name", name: "schoolname", type: "autocomplete", options: schoolOptions, onScroll: handleSchoolScroll, onSearch: handleSchoolSearch },
            { label: "Current Class", name: "currentclass", type: "input" },
            { label: "Dream career you're excited about", name: "dreamcareer", type: "input" },
          ];
        case "college":
          return [
            { label: "Institution Name", name: "collegeinstitutionname", type: "autocomplete", options: collegeOptions, onScroll: handleCollegeScroll, onSearch: handleCollegeSearch },
            ...(watchedCollege === "others" ? [{ label: "Enter College Name", name: "customcollegename", type: "input" }] : []),
            { label: "Degree", name: "collegedegree", type: "autocomplete", options: degreeOptions, onScroll: handleDegreeScroll, onSearch: handleDegreeSearch },
            { label: "Specialization", name: "collegespecialization", type: "autocomplete", options: specializationOptions, onScroll: handleSpecializationScroll, onSearch: handleSpecializationSearch, disabled: !watchedCollegeDegree },
            { label: "Current Year", name: "collegecurrentyear", type: "input" },
            { label: "Internship Experience", name: "collegeinternshipexperience", type: "simple-autocomplete", options: internshipOptions },
            { label: "Your Dream Job or Company?", name: "collegedreamjob", type: "input" },
          ];
        case "jobseekers":
          return [
            { label: "Degree", name: "jobseekersdegree", type: "autocomplete", options: degreeOptions, onScroll: handleDegreeScroll, onSearch: handleDegreeSearch },
            { label: "Specialization", name: "jobseekersspecialization", type: "autocomplete", options: specializationOptions, onScroll: handleSpecializationScroll, onSearch: handleSpecializationSearch, disabled: !watchedJobseekersDegree },
            { label: "Institution Name", name: "jobseekersinstitutionname", type: "autocomplete", options: collegeOptions, onScroll: handleCollegeScroll, onSearch: handleCollegeSearch },
            ...(watch("jobseekersinstitutionname") === "others" ? [{ label: "Enter College Name", name: "customjobseekerscollegename", type: "input" }] : []),
            { label: "Year of Graduation", name: "jobseekersyearofgraduation", type: "input" },
            { label: "Preferred Domain", name: "jobseekerspreferreddomain", type: "input" },
            { label: "Dream Job", name: "jobseekersdreamjob", type: "input" },
          ];
        case "professionals":
          return [
            { label: "Company Name", name: "companyname", type: "input" },
            { label: "Domain/Industry", name: "domain", type: "input" },
            { label: "Current Role", name: "currentrole", type: "input" },
            { label: "Years of Experience", name: "yearsofexperience", type: "input" },
            { label: "Highest Degree", name: "highestdegree", type: "autocomplete", options: degreeOptions, onScroll: handleDegreeScroll, onSearch: handleDegreeSearch },
            { label: "Career Goal", name: "careergoal", type: "input" },
            { label: "Target Domain & Reason", name: "targetdomain", type: "input" },
          ];
        default:
          return [];
      }
    };

    const handleAvatarClick = () => {
      setImageToCrop(profileImage || "");
      setCropDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
          showError("Please select a valid image format (.jpg, .jpeg, .png, .svg)");
          return;
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          showError("File size must be less than 5MB");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setImageToCrop(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleChangeImage = () => {
      fileInputRef.current?.click();
    };

    const handleCropSave = async (croppedImage: string) => {
      setProfileImage(croppedImage);
      setCropDialogOpen(false);
      
      try {
        const blob = await fetch(croppedImage).then(r => r.blob());
        const formData = new FormData();
        formData.append("file", blob, "profile.jpg");
        formData.append("userId", userDetails?.id);
        
        const result = await dispatch(updateProfileImg(formData)).unwrap();
        if(result?.statusCode === 200){
            showSuccess( result?.statusMessage || "Profile image updated successfully!");
        }
        else{
          showError( result?.statusMessage || "Somethink Went Wrong!");
        }
        
      } catch (error) {
        showError("Failed to update profile image");
      }
    };

    const onSubmit = async (data: AccountFormData) => {
      setLoading(true);
      const userStageMap: Record<string, string> = {
        school: "SCHOOL",
        college: "COLLEGE",
        jobseekers: "JOB_SEEKER",
        professionals: "WORKING_PROFESSIONAL"
      };

      const payload: any = {
        fullName: data.fullname,
        mobileNumber: data.mobile,
        age: parseInt(data.age),
        dob: data.dob,
        email: onboardDetails?.email,
        userId: userDetails?.id,
        district: data.district,
        userStage: userStageMap[data.onboardingtype]
      };

      if (data.onboardingtype === "school") {
        payload.school = {
          school: data.schoolname,
          schoolStandard: data.currentclass,
          dreamCareer: data.dreamcareer
        };
      } else if (data.onboardingtype === "college") {
        payload.college = {
          college: data.collegeinstitutionname === "others" ? null : data.collegeinstitutionname,
          collegeName: data.collegeinstitutionname === "others" ? data.customcollegename : null,
          degree: data.collegedegree,
          specialization: data.collegespecialization,
          academicYear: data.collegecurrentyear,
          hasInternship: data.collegeinternshipexperience === "yes",
          internshipDetails: data.collegeinternshipexperience === "yes" ? "" : null,
          dreamCareer: data.collegedreamjob
        };
      } else if (data.onboardingtype === "jobseekers") {
        payload.jobSeeker = {
          degree: data.jobseekersdegree || "",
          specialization: data.jobseekersspecialization || "",
          college: data.jobseekersinstitutionname === "others" ? null : data.jobseekersinstitutionname || "",
          collegeName: data.jobseekersinstitutionname === "others" ? data.customjobseekerscollegename : null,
          yearOfGraduation: data.jobseekersyearofgraduation || "",
          preferredDomain: data.jobseekerspreferreddomain || "",
          dreamCareer: data.jobseekersdreamjob || ""
        };
      } else if (data.onboardingtype === "professionals") {
        payload.professional = {
          companyName: data.companyname,
          currentDomain: data.domain,
          currentRole: data.currentrole,
          yearsOfExperience: data.yearsofexperience ? parseInt(data.yearsofexperience) : 0,
          degree: data.highestdegree,
          dreamCareer: data.careergoal,
          targetDomain: data.targetdomain
        };
      }
        const result = await dispatch(createOnboardDetails(payload)).unwrap();
        if(result.statusCode == 200){
          showSuccess(result.statusMessage || "Profile updated successfully!");
          setLoading(false);
          onClose();
        }
        else{
          showError(result.statusMessage || "Failed to update profile");
          setLoading(false);
          onClose();
        }
    };

    return (
      <Box>
        <Box >
          <Box sx={{ background: "linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)", borderRadius: "12px", p: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 2,border:"solid 1px #00BF53" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.svg"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={profileImage}
                alt="Avatar"
                onClick={handleAvatarClick}
                sx={{ width: 64, height: 64, cursor: "pointer" }}
              />
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  backgroundColor: "white",
                  border: "2px solid #E5E7EB",
                  width: 20,
                  height: 20,
                  "&:hover": { backgroundColor: "#F9FAFB" }
                }}
              >
                <Edit sx={{ fontSize: 12, color: "#6B7280" }} />
              </IconButton>
            </Box>
            <Box>
              <Box sx={{ fontSize: "18px", fontWeight: 600, mb: 0.5 }}>{onboardDetails?.fullName?.split(/[.@]/)[0] || "-"}</Box>
              <Box sx={{ fontSize: "14px", color: "#6B7280" }}>{onboardDetails?.email || "-"}</Box>
            </Box>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)} style={{maxHeight:"310px",overflowY:"scroll"}}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr" }, gap:1, mb: 3,width:"40%" }}>
              {/* Base Fields */}
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"Full Name"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    Full Name
                  </Typography>
                </Tooltip>
                <CustomInput name="fullname" required register={register} errors={errors} boxSx={inputForm} />
              </Box>
              
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"Age"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    Age
                  </Typography>
                </Tooltip>
                <CustomInput name="age" required register={register} errors={errors} boxSx={inputForm} disabled />
              </Box>
              
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"Date of Birth"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    Date of Birth
                  </Typography>
                </Tooltip>
                <CustomInput name="dob" type="date" required register={register} errors={errors} boxSx={inputForm} />
              </Box>
              
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"Mobile"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    Mobile
                  </Typography>
                </Tooltip>
                <CustomInput name="mobile" required register={register} errors={errors} boxSx={inputForm} />
              </Box>
              
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"District"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    District
                  </Typography>
                </Tooltip>
                <CustomInfiniteAutocomplete
                  name="district"
                  control={control}
                  options={districtOptions}
                  errors={errors}
                  boxSx={inputForm}
                  placeholder="Select District"
                  onScrollEnd={handleDistrictScroll}
                  onInputChange={handleDistrictSearch}
                />
              </Box>
              
              <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                <Tooltip title={"Current Stage"} arrow>
                  <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                    Current Stage
                  </Typography>
                </Tooltip>
                <CustomInfiniteAutocomplete
                  name="onboardingtype"
                  control={control}
                  placeholder="Select Current Stage"
                  options={onboardingOptions}
                  errors={errors}
                  boxSx={inputForm}
                />
              </Box>
              
              {/* Conditional Fields */}
              {renderConditionalFields().map((field) => {
                if (field.type === "autocomplete") {
                  return (
                  <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <Tooltip title={field.label} arrow>
                      <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                        {field.label}
                      </Typography>
                    </Tooltip>
                    <CustomInfiniteAutocomplete
                      key={field.label}
                      name={field.name}
                      control={control}
                      placeholder={`Select ${field.label}`}
                      options={field.options || []}
                      errors={errors}
                      boxSx={inputForm}
                      onScrollEnd={field.onScroll}
                      onInputChange={field.onSearch}
                      disabled={field.disabled}
                    />
                  </Box>
                  );
                } else if (field.type === "simple-autocomplete") {
                  return (
                  <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <Tooltip title={field.label} arrow>
                      <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                        {field.label}
                      </Typography>
                    </Tooltip>
                    <CustomInfiniteAutocomplete
                      key={field.label}
                      name={field.name}
                      control={control}
                      placeholder={`Select ${field.label}`}
                      options={field.options || []}
                      errors={errors}
                      boxSx={inputForm}
                    />
                    </Box>
                  );
                } else if (field.type === "textarea") {
                  return (
                  <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <Tooltip title={field.label} arrow>
                      <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                        {field.label}
                      </Typography>
                    </Tooltip>
                    <CustomTextarea
                      key={field.label}
                      name={field.name}
                      register={register}
                      errors={errors}
                      boxSx={inputForm}
                      rows={2}
                    />
                    </Box>
                  );
                } else {
                  return (
                  <Box sx={{...AccountBoxStyle, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" } }}>
                    <Tooltip title={field.label} arrow>
                      <Typography sx={{ ...labelStyle, minWidth: { xs: "unset", sm: "200px" }, mb: { xs: 0.5, sm: 0 } }} component={"span"}>
                        {field.label}
                      </Typography>
                    </Tooltip>
                    <CustomInput
                      key={field.label}
                      name={field.name}
                      register={register}
                      errors={errors}
                      boxSx={inputForm}
                    />
                  </Box>
                  );
                }
              })}
            </Box>
            
          </form>
          <Box sx={{ display: "flex", justifyContent: "flex-end",  backgroundColor: "white", borderTop: "1px solid #E5E7EB",pt:1,gap:2 }}>
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
              type="submit"
              variant="contained"
              label={loading ? "Updating..." : "Update"}
              disabled={loading}
              boxSx={{width:"max-content"}}
              onClick={handleSubmit(onSubmit)}
            />
          </Box>
        </Box>
        <ImageCropDialog
          open={cropDialogOpen}
          imageSrc={imageToCrop}
          onClose={() => setCropDialogOpen(false)}
          onSave={handleCropSave}
          onChangeImage={handleChangeImage}
        />
      </Box>
    );
  };

  export default AccountTab;