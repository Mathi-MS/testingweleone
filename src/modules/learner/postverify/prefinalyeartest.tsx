import { useEffect, useState } from "react";
const skills = [
  "Select",
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "Cloud Computing",
  "Cybersecurity",
  "AI & Deep Learning",
];
const getGraduationYears = (count = 26) => {
  const curr = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => curr - i);
};

export default function PreFinalyears({ onDataChange,onValidate  }: any ) {
  const [institution, setInstitution] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [specialization, setSpecialization] = useState("");
  const [year, setYear] = useState("");
  const [hasInternship, setHasInternship] = useState(skills[0]);
  const [companyRole, setCompanyRole] = useState("");
  const [dreamJob, setDreamJob] = useState("");
   const [errors, setErrors] = useState<any>({});

  const years = getGraduationYears(26);

  const SelectWithIcon = ({ id, value, onChange, children, ...rest }: any) => (
  
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
        {...rest}
      >
        {children}
      </select>

      {/* chevron icon (pointer-events-none so clicks reach select) */}
      <svg
        className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
    const validate = () => {
    const newErrors: any = {};

    if (!institution.trim()) newErrors.institution = "Institution name is required";
    if (!degree.trim()) newErrors.degree = "Degree is required";
    if (!specialization.trim()) newErrors.specialization = "Specialization is required";
    if (!year) newErrors.year = "Select your current academic year";
    if (hasInternship === "Select") newErrors.hasInternship = "Select at least one skill";
    if (!dreamJob.trim()) newErrors.dreamJob = "Dream job is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  useEffect(() => {
    if (onValidate) onValidate(validate);
  }, [institution, degree, specialization, year, hasInternship, dreamJob]);
  useEffect(() => {
 
      onDataChange({
    institution,
    degree,
    specialization,
    year,
    hasInternship,
    dreamJob,
  })
  }, [institution, degree, specialization, year, hasInternship, dreamJob]);
  return (
      <div>
    <form className="space-y-8 max-w-4xl mx-auto">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
          >
            Institution Name
          </label>

         <input
  type="text"
  id="institution"
  placeholder="Enter Institution Name"
  value={institution}
  // onChange={(e) => setInstitution(e.target.value)}
  onChange={(e) => {
  setInstitution(e.target.value);
  setErrors((prev: any) => ({ ...prev, degree: '' }));
}}
className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border
  ${errors.institution 
    ? "border-[#ff0000] focus:border-[#ff0000]" 
    : "border-gray-300 focus:border-indigo-500"
  }`}

/>
 {errors.institution && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.institution}</p>
        )}

        </div>

        <div>
          <label
            htmlFor="degree"
            className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
          >
            Current Degree
          </label>

          <input
            id="degree"
            type="text"
            placeholder="Enter Degree "
            value={degree}
            onChange={(e: any) => setDegree(e.target.value)}
            className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border
  ${errors.degree 
    ? "border-[#ff0000] focus:border-[#ff0000]" 
    : "border-gray-300 focus:border-indigo-500"
  }`}
          />
           {errors.degree && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.degree}</p>
        )}
     
          

        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="specialization"
            className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
          >
            Specialization
          </label>
         
          <input
            id="specialization"
            type="text"
            placeholder="Enter specialization "
              value={specialization}
            onChange={(e: any) => setSpecialization(e.target.value)}
             className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border
  ${errors.specialization 
    ? "border-[#ff0000] focus:border-[#ff0000]" 
    : "border-gray-300 focus:border-indigo-500"
  }`}
          />
             {errors.specialization && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.specialization}</p>
        )}
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
          >
            Current Year
          </label>

          <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors.year ? "border-[#ff0000]" : "border-gray-300"
          }`}
        >
          <option value="">Select</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
           {errors.year && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.year}</p>
        )}
        </div>
      </div>

      {/* Row 3 - Internships */}
      <div>
        <label
          htmlFor="internships"
          className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
        >
          What skills do you want to explore?
        </label>

         <select
          value={hasInternship}
          onChange={(e) => setHasInternship(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors.hasInternship ? "border-[#ff0000]" : "border-gray-300"
          }`}
        >
          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        {errors.hasInternship && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.hasInternship}</p>
        )}
      </div>

      {/* Row 5 - Dream Job */}
      <div>
        <label
          htmlFor="dreamJob"
          className="block text-sm font-medium text-black/50 mb-4 font-[500] text-[15px]"
        >
          What is your Dream Job?
        </label>
        <input
          type="text"
          value={dreamJob}
          onChange={(e) => setDreamJob(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            errors.dreamJob ? "border-[#ff0000]" : "border-gray-300"
          }`}
          placeholder="Enter Dream Job"
        />
        {errors.dreamJob && (
          <p className="text-[#ff0000] text-sm mt-1">{errors.dreamJob}</p>
        )}
      </div>
    </form>
    
    </div>
  );
}
