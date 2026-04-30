import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { X, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import {
    getAllDistricts,
    getAllSchools,
    getAllUniversity,
    getAllColleges,
    getAllDegrees,
    getAllSpecializations,
    createCareerCompass,
    createOnboardDetails
} from "../../../features/postverifySlice";
import { useForm } from "react-hook-form";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomTextarea } from "../../../components/custom/CustomTextarea";
import { CustomInfiniteAutocomplete } from "../../../components/custom/CustomInfiniteAutocomplete";
import { onboardingMuiInputStyle } from "../../../components/custom/CustomStyles";
import { refreshTokenAsync } from "../../../features/authSlice";
import { showError, showSuccess } from "../../../components/ui/Toast";

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
    const [role, setRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const dispatch = useDispatch<AppDispatch>();
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

    const { userDetails } = useSelector((state: RootState) => state.ar);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: "",
            age: "",
            dob: "",
            district: null,
            schoolName: null,
            currentClass: "",
            university: null,
            institution: null,
            customInstitution: "",
            degree: null,
            specialization: null,
            currentYear: "",
            yearOfGraduation: "",
            internship: "no",
            internshipDetails: "",
            dreamCareer: "",
            companyName: "",
            domainIndustry: "",
            currentRole: "",
            yearsOfExperience: "",
            preferredDomain: "",
            careerGoal: "",
            targetDomainReason: "",
        }
    });

    const districtOptions = districts.map((d: any) => ({ label: d.districtName, title: d.id }));
    const schoolOptions = schools.map((s: any) => ({ label: s.schoolName, title: s.id }));
    const universityOptions = universities.map((u: any) => ({ label: u.universityName, title: u.universityName }));
    const collegeOptions = [{ label: "Others", title: "others" }, ...colleges.map((c: any) => ({ label: c.collegeName, title: c.id }))];
    const degreeOptions = degrees.map((d: any) => ({ label: d.degreeName, title: d.id }));
    const specializationOptions = specializations.map((s: any) => ({ label: s.specializationName, title: s.id }));
    const internshipOptions = [{ label: "Yes", title: "yes" }, { label: "No", title: "no" }];

    const watchedDegree = watch("degree");
    const watchedUniversity = watch("university");
    const watchedInstitution = watch("institution");
    
    // --- Pagination & Search State ---
    const [districtParams, setDistrictParams] = useState({ page: 1, search: "" });
    const [schoolParams, setSchoolParams] = useState({ page: 1, search: "" });
    const [universityParams, setUniversityParams] = useState({ page: 1, search: "" });
    const [collegeParams, setCollegeParams] = useState({ page: 1, search: "" });
    const [degreeParams, setDegreeParams] = useState({ page: 1, search: "" });
    const [specializationParams, setSpecializationParams] = useState({ page: 1, search: "" });

    // --- Handlers: Infinite Scroll (Next Page) ---

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
            dispatch(getAllUniversity({ page: nextPage, size: 20, universityName: null }));
        }
    };

    const handleCollegeScroll = () => {
        if (collegeHasNext && !collegeLoading) {
            const nextPage = collegeParams.page + 1;
            setCollegeParams(prev => ({ ...prev, page: nextPage }));
            dispatch(getAllColleges({ page: nextPage, size: 20, collegeName: collegeParams.search }));
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
        if (specializationHasNext && !specializationLoading && watchedDegree) {
            const degreeObj = degrees.find((d: any) => d.id === watchedDegree);
            if (degreeObj) {
                const nextPage = specializationParams.page + 1;
                setSpecializationParams(prev => ({ ...prev, page: nextPage }));
                dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, specializationName: specializationParams.search, page: nextPage, size: 20 }));
            }
        }
    };

    // --- Handlers: Search (Debounced) ---

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleDistrictSearch = useCallback(
        debounce((value: string) => {
            setDistrictParams({ page: 1, search: value });
            dispatch(getAllDistricts({ page: 1, size: 20, districtName: value }));
        }, 500),
        [dispatch]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleSchoolSearch = useCallback(
        debounce((value: string) => {
            setSchoolParams({ page: 1, search: value });
            dispatch(getAllSchools({ page: 1, size: 20, schoolName: value }));
        }, 500),
        [dispatch]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUniversitySearch = useCallback(
        debounce((value: string) => {
            setUniversityParams({ page: 1, search: value });
            dispatch(getAllUniversity({ page: 1, size: 20, universityName: null }));
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
            if (watchedDegree) {
                const degreeObj = degrees.find((d: any) => d.id === watchedDegree);
                if (degreeObj) {
                    setSpecializationParams({ page: 1, search: value });
                    dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, specializationName: value, page: 1, size: 20 }));
                }
            }
        }, 500),
        [dispatch, watchedDegree, degrees]
    );

    useEffect(() => {
        if (isOpen) {
            setDistrictParams({ page: 1, search: "" });
            setSchoolParams({ page: 1, search: "" });
            setUniversityParams({ page: 1, search: "" });
            setDegreeParams({ page: 1, search: "" });
            dispatch(getAllDistricts({ page: 1, size: 20 }));
            dispatch(getAllSchools({ page: 1, size: 20 }));
            dispatch(getAllUniversity({ page: 1, size: 20 }));
            dispatch(getAllDegrees({ page: 1, size: 20 }));
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (isOpen) {
            setCollegeParams({ page: 1, search: "" });
            dispatch(getAllColleges({ page: 1, size: 20 }));
        }
    }, [role, isOpen, dispatch]);

    useEffect(() => {
        if (watchedDegree) {
            const degreeObj = degrees.find((d: any) => d.id === watchedDegree);
            if (degreeObj) {
                setSpecializationParams({ page: 1, search: "" });
                dispatch(getAllSpecializations({ degreeName: degreeObj.degreeName, page: 1, size: 200 }));
            }
        }
    }, [watchedDegree, dispatch, degrees]); // Added degrees dependency

    console.log(userDetails,"fwrf");
    

    if (!isOpen) return null;

    const roles = [
        {
            id: "school",
            label: "School Student",
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5625 3.4375H3.4375C3.07283 3.4375 2.72309 3.58237 2.46523 3.84023C2.20737 4.09809 2.0625 4.44783 2.0625 4.8125V17.1875C2.0625 17.5522 2.20737 17.9019 2.46523 18.1598C2.72309 18.4176 3.07283 18.5625 3.4375 18.5625H4.5882C4.71832 18.5625 4.84577 18.5257 4.95576 18.4561C5.06575 18.3866 5.15374 18.2873 5.20953 18.1698C5.54384 17.4639 6.07167 16.8675 6.73161 16.4499C7.39155 16.0322 8.1565 15.8105 8.9375 15.8105C9.7185 15.8105 10.4834 16.0322 11.1434 16.4499C11.8033 16.8675 12.3312 17.4639 12.6655 18.1698C12.7213 18.2873 12.8093 18.3866 12.9192 18.4561C13.0292 18.5257 13.1567 18.5625 13.2868 18.5625H18.5625C18.9272 18.5625 19.2769 18.4176 19.5348 18.1598C19.7926 17.9019 19.9375 17.5522 19.9375 17.1875V4.8125C19.9375 4.44783 19.7926 4.09809 19.5348 3.84023C19.2769 3.58237 18.9272 3.4375 18.5625 3.4375ZM6.875 12.375C6.875 11.9671 6.99596 11.5683 7.22259 11.2291C7.44922 10.89 7.77134 10.6256 8.14822 10.4695C8.52509 10.3134 8.93979 10.2725 9.33987 10.3521C9.73996 10.4317 10.1075 10.6281 10.3959 10.9166C10.6844 11.205 10.8808 11.5725 10.9604 11.9726C11.04 12.3727 10.9991 12.7874 10.843 13.1643C10.6869 13.5412 10.4225 13.8633 10.0834 14.0899C9.74419 14.3165 9.34542 14.4375 8.9375 14.4375C8.39049 14.4375 7.86589 14.2202 7.47909 13.8334C7.0923 13.4466 6.875 12.922 6.875 12.375ZM18.5625 17.1875H13.701C13.1269 16.2004 12.2615 15.4152 11.2234 14.9394C11.7439 14.476 12.1112 13.8654 12.2767 13.1885C12.4421 12.5116 12.398 11.8004 12.1501 11.1491C11.9022 10.4979 11.4622 9.93736 10.8884 9.54187C10.3147 9.14638 9.63433 8.9346 8.9375 8.9346C8.24067 8.9346 7.56029 9.14638 6.98655 9.54187C6.41282 9.93736 5.97283 10.4979 5.72491 11.1491C5.477 11.8004 5.43286 12.5116 5.59834 13.1885C5.76383 13.8654 6.13114 14.476 6.65156 14.9394C5.61353 15.4152 4.7481 16.2004 4.17398 17.1875H3.4375V4.8125H18.5625V17.1875ZM4.8125 8.25V6.875C4.8125 6.69266 4.88493 6.5178 5.01386 6.38886C5.1428 6.25993 5.31766 6.1875 5.5 6.1875H16.5C16.6823 6.1875 16.8572 6.25993 16.9861 6.38886C17.1151 6.5178 17.1875 6.69266 17.1875 6.875V15.125C17.1875 15.3073 17.1151 15.4822 16.9861 15.6111C16.8572 15.7401 16.6823 15.8125 16.5 15.8125H15.125C14.9427 15.8125 14.7678 15.7401 14.6389 15.6111C14.5099 15.4822 14.4375 15.3073 14.4375 15.125C14.4375 14.9427 14.5099 14.7678 14.6389 14.6389C14.7678 14.5099 14.9427 14.4375 15.125 14.4375H15.8125V7.5625H6.1875V8.25C6.1875 8.43234 6.11507 8.6072 5.98614 8.73614C5.8572 8.86507 5.68234 8.9375 5.5 8.9375C5.31766 8.9375 5.1428 8.86507 5.01386 8.73614C4.88493 8.6072 4.8125 8.43234 4.8125 8.25Z" fill="#00BF53" />
                </svg>
            )
        },
        {
            id: "college",
            label: "College Student",
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.4674 4.84779L11.2174 2.09779C11.0763 2.05074 10.9237 2.05074 10.7826 2.09779L2.53258 4.84779C2.39568 4.89342 2.27662 4.98097 2.19225 5.09804C2.10788 5.21511 2.06249 5.35575 2.0625 5.50005V12.3751C2.0625 12.5574 2.13493 12.7323 2.26386 12.8612C2.3928 12.9901 2.56766 13.0626 2.75 13.0626C2.93234 13.0626 3.1072 12.9901 3.23614 12.8612C3.36507 12.7323 3.4375 12.5574 3.4375 12.3751V6.45396L6.32414 7.4156C5.5572 8.65465 5.31331 10.1474 5.64604 11.5661C5.97876 12.9848 6.8609 14.2135 8.09875 14.9824C6.55188 15.5891 5.21469 16.6865 4.23672 18.187C4.18586 18.2626 4.15053 18.3475 4.13279 18.4369C4.11505 18.5263 4.11524 18.6183 4.13337 18.7076C4.1515 18.7969 4.18719 18.8817 4.23838 18.957C4.28957 19.0324 4.35523 19.0969 4.43154 19.1466C4.50785 19.1964 4.5933 19.2305 4.68291 19.247C4.77253 19.2634 4.86452 19.2619 4.95354 19.2425C5.04256 19.2231 5.12684 19.1862 5.20147 19.134C5.2761 19.0817 5.3396 19.0151 5.38828 18.9381C6.68336 16.9512 8.72867 15.8126 11 15.8126C13.2713 15.8126 15.3166 16.9512 16.6117 18.9381C16.7126 19.088 16.8683 19.1921 17.0453 19.2281C17.2224 19.264 17.4064 19.2288 17.5577 19.1302C17.709 19.0315 17.8154 18.8772 17.8539 18.7007C17.8923 18.5242 17.8598 18.3397 17.7633 18.187C16.7853 16.6865 15.443 15.5891 13.9013 14.9824C15.1379 14.2136 16.0192 12.9857 16.3519 11.568C16.6846 10.1503 16.4414 8.65858 15.6759 7.41989L19.4674 6.15661C19.6043 6.111 19.7234 6.02346 19.8078 5.9064C19.8922 5.78933 19.9377 5.64867 19.9377 5.50435C19.9377 5.36003 19.8922 5.21937 19.8078 5.1023C19.7234 4.98523 19.6043 4.89769 19.4674 4.85208V4.84779ZM15.125 10.3126C15.1252 10.9647 14.9707 11.6076 14.6744 12.1885C14.378 12.7694 13.9481 13.2717 13.4199 13.6543C12.8918 14.0369 12.2805 14.2888 11.6362 14.3894C10.9918 14.4899 10.3328 14.4363 9.71321 14.2329C9.09361 14.0294 8.53108 13.682 8.07176 13.2191C7.61244 12.7561 7.26942 12.1909 7.07086 11.5697C6.8723 10.9485 6.82384 10.2891 6.92947 9.64559C7.0351 9.00206 7.2918 8.39274 7.67852 7.86763L10.7826 8.89888C10.9237 8.94593 11.0763 8.94593 11.2174 8.89888L14.3215 7.86763C14.8438 8.57575 15.1254 9.43264 15.125 10.3126ZM11 7.5256L4.92422 5.50005L11 3.4745L17.0758 5.50005L11 7.5256Z" fill="#00BF53" />
                    </svg>
                </svg>

            )
        },
        {
            id: "jobseeker", label: "Job Seekers", icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_529_2116)">
                        <path d="M11 11C14.0332 11 16.5 8.53325 16.5 5.5C16.5 2.46675 14.0332 0 11 0C7.96675 0 5.5 2.46675 5.5 5.5C5.5 8.53325 7.96675 11 11 11ZM11 1.83333C13.0222 1.83333 14.6667 3.47783 14.6667 5.5C14.6667 7.52217 13.0222 9.16667 11 9.16667C8.97783 9.16667 7.33333 7.52217 7.33333 5.5C7.33333 3.47783 8.97783 1.83333 11 1.83333ZM19.25 21.0833C19.25 21.5893 18.8403 22 18.3333 22C17.8264 22 17.4167 21.5893 17.4167 21.0833C17.4167 18.3159 15.6521 15.9592 13.1917 15.0608L11.8012 17.1472L12.8031 20.8047C12.9708 21.4152 12.4318 22.0009 11.7022 22.0009H10.2978C9.56817 22.0009 9.03008 21.4152 9.19692 20.8047L10.1988 17.1472L8.80825 15.0608C6.34792 15.9592 4.58333 18.3159 4.58333 21.0843C4.58333 21.5903 4.17267 22.0009 3.66667 22.0009C3.16067 22.0009 2.75 21.5903 2.75 21.0843C2.75 16.5358 6.4515 12.8343 11 12.8343C15.5485 12.8343 19.25 16.5348 19.25 21.0833Z" fill="#00BF53" />
                    </g>
                    <defs>
                        <clipPath id="clip0_529_2116">
                            <rect width="22" height="22" fill="white" />
                        </clipPath>
                    </defs>
                </svg>

            )
        },
        {
            id: "professional", label: "Working Professionals / Career Switchers", icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.5625 4.8125H15.125V4.125C15.125 3.57799 14.9077 3.05339 14.5209 2.66659C14.1341 2.2798 13.6095 2.0625 13.0625 2.0625H8.9375C8.39049 2.0625 7.86589 2.2798 7.47909 2.66659C7.0923 3.05339 6.875 3.57799 6.875 4.125V4.8125H3.4375C3.07283 4.8125 2.72309 4.95737 2.46523 5.21523C2.20737 5.47309 2.0625 5.82283 2.0625 6.1875V17.1875C2.0625 17.5522 2.20737 17.9019 2.46523 18.1598C2.72309 18.4176 3.07283 18.5625 3.4375 18.5625H18.5625C18.9272 18.5625 19.2769 18.4176 19.5348 18.1598C19.7926 17.9019 19.9375 17.5522 19.9375 17.1875V6.1875C19.9375 5.82283 19.7926 5.47309 19.5348 5.21523C19.2769 4.95737 18.9272 4.8125 18.5625 4.8125ZM8.25 4.125C8.25 3.94266 8.32243 3.7678 8.45136 3.63886C8.5803 3.50993 8.75516 3.4375 8.9375 3.4375H13.0625C13.2448 3.4375 13.4197 3.50993 13.5486 3.63886C13.6776 3.7678 13.75 3.94266 13.75 4.125V4.8125H8.25V4.125ZM18.5625 6.1875V9.76336C16.242 11.0264 13.642 11.688 11 11.6875C8.35811 11.688 5.75818 11.0268 3.4375 9.76422V6.1875H18.5625ZM18.5625 17.1875H3.4375V11.3128C5.79212 12.4645 8.37879 13.063 11 13.0625C13.6213 13.0626 16.2079 12.4638 18.5625 11.312V17.1875ZM8.9375 9.625C8.9375 9.44266 9.00993 9.2678 9.13886 9.13886C9.2678 9.00993 9.44266 8.9375 9.625 8.9375H12.375C12.5573 8.9375 12.7322 9.00993 12.8611 9.13886C12.9901 9.2678 13.0625 9.44266 13.0625 9.625C13.0625 9.80734 12.9901 9.9822 12.8611 10.1111C12.7322 10.2401 12.5573 10.3125 12.375 10.3125H9.625C9.44266 10.3125 9.2678 10.2401 9.13886 10.1111C9.00993 9.9822 8.9375 9.80734 8.9375 9.625Z" fill="#00BF53" />
                </svg>
            )
        },
    ];

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const storedEmail = userDetails?.email || "";
            const storedMobile = userDetails?.mobile || "";
            const storedUserID = userDetails?.id || "";

            const userStageMap: Record<string, string> = {
                school: "SCHOOL",
                college: "COLLEGE",
                jobseeker: "JOB_SEEKER",
                professional: "WORKING_PROFESSIONAL"
            };

            const payload: any = {
                fullName: data.fullName,
                mobileNumber: storedMobile,
                age: data.age ? parseInt(data.age) : undefined,
                dob: data.dob,
                email: storedEmail,
                userId: storedUserID,
                district: data.district,
                // @ts-ignore 
                userStage: userStageMap[role]
            };

            if (role === "school") {
                payload.school = {
                    school: data.schoolName,
                    schoolStandard: data.currentClass,
                    dreamCareer: data.dreamCareer
                };
            } else if (role === "college") {
                payload.college = {
                    college:  data.institution === "others" ? null :  data.institution,
                    collegeName: data.institution === "others" ? data.customInstitution : null,
                    degree: data.degree,
                    specialization: data.specialization,
                    academicYear: data.currentYear,
                    hasInternship: data.internship === "yes",
                    internshipDetails: data.internship === "yes" ? data.internshipDetails : null,
                    dreamCareer: data.dreamCareer
                };
            } else if (role === "jobseeker") {
                payload.jobSeeker = {
                    degree: data.degree || "",
                    specialization: data.specialization || "",
                    college:  data.institution === "others" ? null :  data.institution,
                    collegeName: data.institution === "others" ? data.customInstitution : null,
                    yearOfGraduation: data.yearOfGraduation || "",
                    preferredDomain: data.preferredDomain || "",
                    dreamCareer: data.dreamCareer || ""
                };
            } else if (role === "professional") {
                payload.professional = {
                    companyName: data.companyName,
                    currentDomain: data.domainIndustry,
                    currentRole: data.currentRole,
                    yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : 0,
                    degree: data.degree,
                    dreamCareer: data.careerGoal,
                    targetDomain: data.targetDomainReason
                };
            }

            const result = await dispatch(createOnboardDetails(payload)).unwrap();
            if (result.statusCode == 200) {
                showSuccess("Onboarding successfully updated!");
                // @ts-ignore
                await dispatch(refreshTokenAsync());
                onComplete();
                onClose();
            } else {
                showError(result.statusMessage || "Failed to update profile");
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Side Modal */}
            <div className="relative w-full max-w-full md:max-w-[calc(100vw-240px)] sm:max-w-[calc(100vw-240px)] bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-4 sm:right-6 top-4 sm:top-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="p-4 sm:p-6 md:p-8  sm:max-w-[100%] md:max-w-full mx-auto">
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-sm sm:text-md font-medium text-gray-900 mb-2">Hey Buddy 👋</h1>
                        <p className="text-[#1F2937] mb-4 text-sm sm:text-base">
                            Before we jump into your mock interview, let's get to know you a bit better.
                            Please complete the Onboarding Details — this helps me understand your goals, role, and experience so I can tailor the interview just for you.
                        </p>
                        <div className="mb-4">
                            <h3 className="font-medium mb-2 text-sm sm:text-md">🎯 With this, I'll:</h3>
                            <ul className="list-disc list-inside text-[#1F2937] space-y-1 text-xs sm:text-sm">
                                <li>Ask role-specific questions</li>
                                <li>Adjust difficulty to your level</li>
                                <li>Give personalized feedback</li>
                            </ul>
                        </div>
                        <p className="text-sm sm:text-md font-medium">
                            🚀 We've lined up some powerful features for you.
                        </p>
                        <span className="text-sm sm:text-base">Complete the onboarding and let's get started!</span>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="font-medium text-gray-900 italic text-sm sm:text-base">Tell us a bit about you so we can personalize your learning journey!</h2>

                        {/* Role Selection */}
                        <div>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {roles.slice(0, 2).map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => {
                                                setRole(r.id);
                                                reset();
                                            }}
                                            className={`p-3 sm:p-4 shadow-md rounded-xl border inline-flex items-center gap-2 sm:gap-3 transition-all text-left ${role === r.id
                                                ? "border-[#00BF53] bg-green-50 text-[#00BF53]"
                                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                                                }`}
                                        >
                                            {typeof r.icon === 'string' ? (
                                                <span className="text-sm sm:text-md">{r.icon}</span>
                                            ) : (
                                                r.icon
                                            )}
                                            <span className="font-medium text-xs sm:text-sm">{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {roles.slice(2, 4).map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => {
                                                setRole(r.id);
                                                reset();
                                            }}
                                            className={`p-3 sm:p-4 shadow-md rounded-xl border inline-flex items-center gap-2 sm:gap-3 transition-all text-left ${role === r.id
                                                ? "border-[#00BF53] bg-green-50 text-[#00BF53]"
                                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                                                }`}
                                        >
                                            {typeof r.icon === 'string' ? (
                                                <span className="text-sm sm:text-md">{r.icon}</span>
                                            ) : (
                                                r.icon
                                            )}
                                            <span className="font-medium text-xs sm:text-sm">{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected Role Bubble */}
                        {role && (
                            <div className="flex justify-end">
                                <div className="bg-[#F3F4F6] text-[#1F2937] px-4 sm:px-5 py-2 sm:py-3 rounded-2xl rounded-tr-sm flex items-center gap-2 sm:gap-3 shadow-sm animate-in zoom-in-95 fade-in slide-in-from-right-4 duration-500">
                                    <div className="">
                                        {roles.find(r => r.id === role)?.icon}
                                    </div>
                                    <span className="font-medium text-xs sm:text-sm">{roles.find(r => r.id === role)?.label}</span>
                                </div>
                            </div>
                        )}

                        {/* Form Fields - Show only if role selected */}
                        {role && (
                            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg sm:text-xl">{roles.find(r => r.id === role)?.icon}</span>
                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                        {roles.find(r => r.id === role)?.label}
                                    </span>
                                </div>

                                {role === "school" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Full Name"
                                                    name="fullName"
                                                    placeholder="Enter Full Name"
                                                    required
                                                    rules={{ required: "Full Name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    key="school-dob"
                                                    label="Date of Birth"
                                                    name="dob"
                                                    type="date"
                                                    required
                                                    rules={{
                                                        required: "Date of Birth is required",
                                                        validate: (value: string) => {
                                                            const today = new Date();
                                                            const birthDate = new Date(value);
                                                            let age = today.getFullYear() - birthDate.getFullYear();
                                                            const m = today.getMonth() - birthDate.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                                age--;
                                                            }
                                                            if (age < 12) return "You must be at least 12 years old";
                                                            return true;
                                                        }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="District"
                                                    name="district"
                                                    control={control}
                                                    required
                                                    rules={{ required: "District is required" }}
                                                    options={districtOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select District"
                                                    onScrollEnd={handleDistrictScroll}
                                                    onInputChange={handleDistrictSearch}
                                                    customStyles={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="School Name"
                                                    name="schoolName"
                                                    control={control}
                                                    required
                                                    rules={{ required: "School Name is required" }}
                                                    options={schoolOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select School"
                                                    onScrollEnd={handleSchoolScroll}
                                                    onInputChange={handleSchoolSearch}
                                                    customStyles={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Current Class"
                                                    name="currentClass"
                                                    placeholder="Enter Current Class"
                                                    required
                                                    rules={{ required: "Current Class is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            {/* <div className="space-y-1">
                                                <CustomTextarea
                                                    label="Dream career you're excited about"
                                                    name="dreamCareer"
                                                    placeholder="Type Here..."
                                                    required
                                                    rules={{ required: "Dream Career is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    rows={2}
                                                />
                                            </div> */}
                                        </div>
                                    </>
                                )}

                                {role === "college" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Full Name"
                                                    name="fullName"
                                                    placeholder="Enter Full Name"
                                                    required
                                                    rules={{ required: "Full Name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    key="college-dob"
                                                    label="Date of Birth"
                                                    name="dob"
                                                    type="date"
                                                    required
                                                    rules={{
                                                        required: "Date of Birth is required",
                                                        validate: (value: string) => {
                                                            const today = new Date();
                                                            const birthDate = new Date(value);
                                                            let age = today.getFullYear() - birthDate.getFullYear();
                                                            const m = today.getMonth() - birthDate.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                                age--;
                                                            }
                                                            if (age < 16) return "You must be at least 16 years old";
                                                            return true;
                                                        }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="University"
                                                    name="university"
                                                    control={control}
                                                    required
                                                    rules={{ required: "University is required" }}
                                                    options={universityOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select University"
                                                    onScrollEnd={handleUniversityScroll}
                                                    onInputChange={handleUniversitySearch}
                                                />
                                            </div> */}
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Institution Name"
                                                    name="institution"
                                                    control={control}
                                                    required
                                                    rules={{ required: "Institution Name is required" }}
                                                    options={collegeOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder={"Select your Institution Name"}
                                                    onScrollEnd={handleCollegeScroll}
                                                    onInputChange={handleCollegeSearch}
                                                    // disabled={!watchedUniversity}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Degree"
                                                    name="degree"
                                                    control={control}
                                                    required
                                                    rules={{ required: "Degree is required" }}
                                                    options={degreeOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select your Degree"
                                                    onScrollEnd={handleDegreeScroll}
                                                    onInputChange={handleDegreeSearch}
                                                />
                                            </div>
                                        </div>
                                        {watchedInstitution === "others" && (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                                <CustomInput
                                                    label="Enter College Name"
                                                    name="customInstitution"
                                                    placeholder="Enter your college name"
                                                    required
                                                    rules={{ required: "College name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Current Year"
                                                    name="currentYear"
                                                    placeholder="Enter your Current Year"
                                                    // required
                                                    // rules={{ required: "Current Year is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Specialization"
                                                    name="specialization"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "Specialization is required" }}
                                                    options={specializationOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder={watchedDegree ? "Select your Specialization" : "Select Degree first"}
                                                    onScrollEnd={handleSpecializationScroll}
                                                    onInputChange={handleSpecializationSearch}
                                                    disabled={!watchedDegree}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="District"
                                                    name="district"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "District is required" }}
                                                    options={districtOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select District"
                                                    onScrollEnd={handleDistrictScroll}
                                                    onInputChange={handleDistrictSearch}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                            <CustomInfiniteAutocomplete
                                                label="Internship Experience"
                                                name="internship"
                                                control={control}
                                                // required
                                                // rules={{ required: "Internship selection is required" }}
                                                options={internshipOptions}
                                                errors={errors}
                                                placeholder="Select Internship Experience"
                                                boxSx={onboardingMuiInputStyle}
                                            />
                                        </div>
                                        </div>
                                        
                                        {watch("internship") === "yes" && (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                                <CustomTextarea
                                                    label="If yes, Please mention in details"
                                                    name="internshipDetails"
                                                    placeholder="Type Here..."
                                                    // required
                                                    // rules={{ required: "Internship details are required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <CustomInput
                                                label="Your Dream Job or Company?"
                                                name="dreamCareer"
                                                placeholder="Type Here..."
                                                // required
                                                // rules={{ required: "This field is required" }}
                                                register={register}
                                                errors={errors}
                                                boxSx={onboardingMuiInputStyle}
                                            />
                                        </div>
                                    </>
                                )}

                                {role === "jobseeker" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Full Name"
                                                    name="fullName"
                                                    placeholder="Enter Full Name"
                                                    required
                                                    rules={{ required: "Full Name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    key="jobseeker-dob"
                                                    label="Date of Birth"
                                                    name="dob"
                                                    type="date"
                                                    required
                                                    rules={{
                                                        required: "Date of Birth is required",
                                                        validate: (value: string) => {
                                                            const today = new Date();
                                                            const birthDate = new Date(value);
                                                            let age = today.getFullYear() - birthDate.getFullYear();
                                                            const m = today.getMonth() - birthDate.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                                age--;
                                                            }
                                                            if (age < 14) return "You must be at least 14 years old";
                                                            return true;
                                                        }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            {/* <div className="space-y-1">
                                                <CustomInput
                                                    key="jobseeker-age"
                                                    label="Age"
                                                    name="age"
                                                    placeholder="Enter Age"
                                                    required
                                                    rules={{
                                                        required: "Age is required",
                                                        pattern: { value: /^[0-9]+$/, message: "Please enter a valid age" },
                                                        min: { value: 14, message: "Age must be at least 14" },
                                                        max: { value: 100, message: "Please enter a valid age" }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div> */}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Preferred Domain"
                                                    name="preferredDomain"
                                                    placeholder="Enter Preferred Domain"
                                                    required
                                                    rules={{ required: "Preferred Domain is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Institution Name"
                                                    name="institution"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "Institution Name is required" }}
                                                    options={collegeOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select your Institution Name"
                                                    onScrollEnd={handleCollegeScroll}
                                                    onInputChange={handleCollegeSearch}
                                                />
                                            </div>

                                        </div>
                                        {watchedInstitution === "others" && (
                                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                                <CustomInput
                                                    label="Enter College Name"
                                                    name="customInstitution"
                                                    placeholder="Enter your college name"
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Degree"
                                                    name="degree"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "Degree is required" }}
                                                    options={degreeOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select your Degree"
                                                    onScrollEnd={handleDegreeScroll}
                                                    onInputChange={handleDegreeSearch}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Specialization"
                                                    name="specialization"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "Specialization is required" }}
                                                    options={specializationOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder={watchedDegree ? "Select your Specialization" : "Select Degree first"}
                                                    onScrollEnd={handleSpecializationScroll}
                                                    onInputChange={handleSpecializationSearch}
                                                    disabled={!watchedDegree}
                                                />
                                            </div>

                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Year of Graduation"
                                                    name="yearOfGraduation"
                                                    placeholder="Enter Year of Graduation"
                                                    // required
                                                    // rules={{
                                                    //     required: "Year of Graduation is required",
                                                    //     pattern: { value: /^[0-9]{4}$/, message: "Please enter a valid 4-digit year" }
                                                    // }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="District"
                                                    name="district"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "District is required" }}
                                                    options={districtOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select District"
                                                    onScrollEnd={handleDistrictScroll}
                                                    onInputChange={handleDistrictSearch}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <CustomInput
                                                label="Dream Job"
                                                name="dreamCareer"
                                                placeholder="Type Here..."
                                                // required
                                                // rules={{ required: "Dream Job is required" }}
                                                register={register}
                                                errors={errors}
                                                boxSx={onboardingMuiInputStyle}
                                            />
                                        </div>
                                    </>
                                )}

                                {role === "professional" && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Full Name"
                                                    name="fullName"
                                                    placeholder="Enter Full Name"
                                                    required
                                                    rules={{ required: "Full Name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    key="pro-dob"
                                                    label="Date of Birth"
                                                    name="dob"
                                                    type="date"
                                                    required
                                                    rules={{
                                                        required: "Date of Birth is required",
                                                        validate: (value: string) => {
                                                            const today = new Date();
                                                            const birthDate = new Date(value);
                                                            let age = today.getFullYear() - birthDate.getFullYear();
                                                            const m = today.getMonth() - birthDate.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                                age--;
                                                            }
                                                            if (age < 18) return "You must be at least 18 years old";
                                                            return true;
                                                        }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            {/* <div className="space-y-1">
                                                <CustomInput
                                                    key="pro-age"
                                                    label="Age"
                                                    name="age"
                                                    placeholder="Enter Age"
                                                    required
                                                    rules={{
                                                        required: "Age is required",
                                                        pattern: { value: /^[0-9]+$/, message: "Please enter a valid age" },
                                                        min: { value: 18, message: "Age must be at least 18" },
                                                        max: { value: 100, message: "Please enter a valid age" }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div> */}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Company Name"
                                                    name="companyName"
                                                    placeholder="Enter Company Name"
                                                    required
                                                    rules={{ required: "Company Name is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Domain/Industry"
                                                    name="domainIndustry"
                                                    placeholder="Enter Domain/Industry"
                                                    required
                                                    rules={{ required: "Domain/Industry is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Current Role"
                                                    name="currentRole"
                                                    placeholder="Enter Current Role"
                                                    required
                                                    rules={{ required: "Current Role is required" }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInput
                                                    label="Years of Experience"
                                                    name="yearsOfExperience"
                                                    placeholder="Enter Years of Experience"
                                                    required
                                                    rules={{
                                                        required: "Years of Experience is required",
                                                        min: { value: 0, message: "Experience cannot be negative" },
                                                        max: { value: 30, message: "Please enter a valid experience" }
                                                    }}
                                                    register={register}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="Highest Degree"
                                                    name="degree"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "Highest Degree is required" }}
                                                    options={degreeOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select Highest Degree"
                                                    onScrollEnd={handleDegreeScroll}
                                                    onInputChange={handleDegreeSearch}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <CustomInfiniteAutocomplete
                                                    label="District"
                                                    name="district"
                                                    control={control}
                                                    // required
                                                    // rules={{ required: "District is required" }}
                                                    options={districtOptions}
                                                    errors={errors}
                                                    boxSx={onboardingMuiInputStyle}
                                                    placeholder="Select District"
                                                    onScrollEnd={handleDistrictScroll}
                                                    onInputChange={handleDistrictSearch}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <CustomTextarea
                                                label="Career Goal"
                                                name="careerGoal"
                                                placeholder="Type Here..."
                                                // required
                                                // rules={{ required: "Career Goal is required" }}
                                                register={register}
                                                errors={errors}
                                                boxSx={onboardingMuiInputStyle}
                                                rows={2}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <CustomTextarea
                                                label="Target Domain & Reason (If switching)"
                                                name="targetDomainReason"
                                                placeholder="Type Here..."
                                                // required
                                                // rules={{ required: "Target Domain & Reason is required" }}
                                                register={register}
                                                errors={errors}
                                                boxSx={onboardingMuiInputStyle}
                                                rows={2}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4 flex flex-col">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <button
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isSubmitting}
                                            className="flex max-auto justify-center items-center w-28 sm:w-32 bg-[#00BF53] hover:bg-green-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed py-2 text-sm sm:text-base"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                                    <span className="text-xs sm:text-sm">Submitting...</span>
                                                </>
                                            ) : (
                                                <span className="text-sm sm:text-base">Submit</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Error Message */}
                                    {errorMessage && (
                                        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-2">
                                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm">{errorMessage}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
