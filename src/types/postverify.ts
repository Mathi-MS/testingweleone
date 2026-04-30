export type  schoolsFormFields =
  | "fullName"
  | "age"
  | "dob"
  | "mobile"
  | "district"
  | "school"
  | "classStd"
  | "career";



 export type workingprofessionalFormFields =
  | "fullName"
  | "age"
  | "dob"
  | "mobile"
  | "email"
  | "degree"
  | "companyName"
  | "currentDomain"
  | "currentRole"
  | "yearsOfExperience" 
  | "careerGoal"
  | "targetDomain"
  | "district";


 export  type FormType = {
  fullName: string;
  age: string;
  dob: string;
  mobile: string;
  email: string;
  degree: string;
  companyName: string;
  currentDomain: string;
  currentRole: string;
  yearsOfExperience: string;
  careerGoal: string;
  targetDomain: string;
  district: string;
  specialization:string
};

 export interface collegeFormType {
  fullName: string;
  age: string;
  dob: string;
  mobile: string;
  institution: string;
  degree: string;
  specialization: string;
  currentYear: string;
  internship: boolean;
  internshipDetails: string;
  dreamCareer: string;
  district: string;
  college: string;
}
export type District = {
  id: number;            // or string, depending on your API
  districtName: string;
    districts: District[];
  districtLoading: boolean;
  districtHasNext: boolean;
  
};


export interface University {
  id: string;
  universityName: string;
}

export interface GetAllUniversityResponse {
  getAllUniversity: {
    dataList: University[];
    page: number;
    size: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}


export type College = {
  id: number;            // or string, depending on your API
  collegeName: string;
};


export type school = {
  id: number;            // or string, depending on your API
  school: string;
};

export type jobseekersFormFields = 
  | "fullName"
  | "age"
  | "dob"
  | "mobile"
  | "district"
  | "institution"
  | "College"
  | "internship"
  | "internshipDetails"
  | "degree"
  | "specialization"
  | "Yearofgraduate"
  | "PreferredDomain"
  | "dreamCareer";
  

 export interface postverify {
  postverify: string | null;
  schoolHasNext: boolean;
  districts: District[];
  degrees: any[];
  colleges: any[];
  collegeHasNext: boolean;
  collegeLoading: boolean;
  universities: any[];
  specializations: any[];
  specializationHasNext: boolean;
  specializationLoading: boolean;
  universityHasNext: boolean;
  universityLoading: boolean;
  schools: any[];
  data: null;
  page?: number;
  size?: number;
  districtPagination: {
    page: 1;
    size: 10;
    totalElements: 0;
    totalPages: 1;
  };
  schoolLoading: boolean;
  districtLoading: boolean;
  districtHasNext: boolean;
  degreeLoading: boolean;
  
  degreeHasNext: boolean;
  hasNext: boolean;
  error: string | null;
  roles: any[];
  accessToken: string | null;
  refreshToken?: string | null;
  hasPrevious: boolean;
  expiresIn: any;
  tokenType: any;
  scope: any;
  onBoard: boolean;
  signupMessage: any;
  otpcheck: any;
  createpassword: any;
  resendopt: any;
  forgotPassword: any;
  ResetUserPassword: any;
  loginres: boolean;
  message: any;
  token: any;
  loading?: boolean;
 }