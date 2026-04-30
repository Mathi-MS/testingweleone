import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface BatchFilters {
  search: string;
  selectedTypes: string[];
  selectedStatuses: string[];
  selectedLanguages: string[];
  selectedCategories: string[];
  selectedEnrollmentStatuses: string[];
  selectedpaymentType: string[];
  selectedTrack: string;
  selectedTimeZone: string;
  selectedCategory: string;
  selectedTrainer: string;
  selectedCourses: string[];
  maxPrice: string;
  batchStartDate: Dayjs | null;
  batchEndDate: Dayjs | null;
  enrollmentStartDate: Dayjs | null;
  enrollmentEndDate: Dayjs | null;
}

interface BatchFilterProps {
  filters: BatchFilters;
  updateFilter: (key: keyof BatchFilters, value: any) => void;
  onClearAll: () => void;
  appliedFiltersCount: number;
  trainersList: any[];
  mlData: any[];
}

const BATCH_TYPES = [
  { id: "false", name: "Batch" },
  { id: "true", name: "Masterclass" },
];

const STATUSES = [
  { id: "false", name: "Draft" },
  { id: "true", name: "Published" },
];

const LANGUAGES = [
  { id: "English", name: "English" },
  { id: "Tamil", name: "Tamil" },
];

const PAYMENTTYPE = [
  { id: "FREE", name: "FREE" },
  { id: "PAID", name: "PAID" },
];

const TRACKS = [
   { id: "Project/Product Leadership", name: "Project_Product_Leadership" },
  { id: "Infra_Security_QA", name: "Infra, Security & QA" },
  { id: "AI_ML_Data_Science", name: "AI/ML/Data Science" },
  { id: "Interface_Experience_Design", name: "Interface & Experience Design" },
  { id: "Application_Engineer", name: "Application Engineer" },
  
];

const CATEGORIES = [
  { id: "Mechanical_Engineering", name: "Mechanical Engineering" },
  { id: "Electronics_Communication_Engineering", name: "Electronics & Communication Engineering" },
  { id: "Civil_Engineering", name: "Civil Engineering" },
  { id: "Mathematics", name: "Mathematics" },
  { id: "Business_Management", name: "Business Management" },
  { id: "Physics", name: "Physics" },
  { id: "Chemistry", name: "Chemistry" },
  { id: "Automobile_Engineering", name: "Automobile Engineering" },
  { id: "Commerce_Accounting", name: "Commerce & Accounting" },
  { id: "Banking_Finance", name: "Banking & Finance" },
  { id: "Graphic_Design", name: "Graphic Design" },
  { id: "AI_ML_Emerging_AI", name: "AI/ML/Emerging AI" },
  { id: "Application_Engineer", name: "Application Engineer" },
  { id: "Digital_Infrastructure_QA", name: "Digital Infrastructure & QA" },
  { id: "Interface_Experience_Design", name: "Interface & Experience Design" },
  { id: "AI_ML_Data_Science", name: "Ai/ML/Data Science" },
  { id: "Product_Project_Leadership", name: "Product/Project Leadership" },
  { id: "Finance", name: "Finance" },
  { id: "Data_Analytics", name: "Data Analytics" },
  { id: "HR", name: "HR" },
  { id: "Leadership_Management", name: "Leadership & Management" },
  { id: "IT_Operations", name: "IT Operations" },
  { id: "Communication_Design", name: "Communication/Design" },
  { id: "Operations_Supply_Chain", name: "Operations/Supply chain" },
  { id: "Engineering_College_Faculty", name: "Engineering College Faculty" },
  { id: "School_Teachers", name: "School Teachers" },
  { id: "Art_Science_College_Staff", name: "Art & science College staff" },
  { id: "Corporate_Trainers", name: "Corporate trainers" },
];
const CheckboxGroup = ({ title, items, selected, onChange }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center mb-3 cursor-pointer">
        <h3 className="font-medium text-gray-900 text-sm">{title} ({items.length})</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isExpanded && (
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" checked={allSelected} onChange={() => onChange(allSelected ? [] : items.map((i: any) => i.id))} className="mr-2 rounded cursor-pointer" />
            <span className="text-sm text-gray-600">Select all</span>
          </label>
          {items.slice(0, 4).map((item: any) => (
            <label key={item.id} className="flex items-center">
              <input type="checkbox" checked={selected.includes(item.id)} onChange={(e) => onChange(e.target.checked ? [...selected, item.id] : selected.filter((id: string) => id !== item.id))} className="mr-2 rounded cursor-pointer" />
              <span className="text-sm text-gray-700">{item.name}</span>
            </label>
          ))}
          {items.length > 4 && <button className="text-sm text-blue-600 flex justify-end w-full">view all</button>}
        </div>
      )}
    </div>
  );
};

const SelectGroup = ({ title, items, selected, onChange, placeholder }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center mb-3 cursor-pointer">
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isExpanded && (
        <select value={selected} onChange={(e) => onChange(e.target.value)} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
          <option value="">{placeholder}</option>
          {items.map((item: any) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};

const InputGroup = ({ title, value, onChange, placeholder, type = "text" }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center mb-3 cursor-pointer">
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isExpanded && (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600" />
      )}
    </div>
  );
};

const DateRangeGroup = ({ groupTitle, startLabel, endLabel, startValue, endValue, onStartChange, onEndChange }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center mb-3 cursor-pointer">
        <h3 className="font-medium text-gray-900 text-sm">{groupTitle}</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isExpanded && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">{startLabel}</label>
          <DatePicker value={startValue} onChange={onStartChange} format="DD/MM/YYYY" slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "DD/MM/YYYY" } }} />
          <label className="text-xs font-semibold text-gray-700">{endLabel}</label>
          <DatePicker value={endValue} onChange={onEndChange} format="DD/MM/YYYY" minDate={startValue ?? undefined} disabled={!startValue} slotProps={{ textField: { size: "small", fullWidth: true, placeholder: "DD/MM/YYYY" } }} />
        </div>
      )}
    </div>
  );
};

const BatchFilter = ({ filters, updateFilter, onClearAll, appliedFiltersCount, trainersList, mlData }: BatchFilterProps) => {
  return (
    <div className="max-w-[250px] w-full space-y-2 max-h-[calc(100vh-175px)] overflow-y-auto">
      {appliedFiltersCount > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 text-sm">Applied Filters</h3>
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{appliedFiltersCount}</span>
          </div>
          <button onClick={onClearAll} className="text-sm text-blue-600 cursor-pointer underline">Clear all filters</button>
        </div>
      )}
      <CheckboxGroup title="Batch Type" items={BATCH_TYPES} selected={filters.selectedTypes} onChange={(v: any) => updateFilter("selectedTypes", v)} />
      <CheckboxGroup title="Status" items={STATUSES} selected={filters.selectedStatuses} onChange={(v: any) => updateFilter("selectedStatuses", v)} />
      <CheckboxGroup title="Language" items={LANGUAGES} selected={filters.selectedLanguages} onChange={(v: any) => updateFilter("selectedLanguages", v)} />
      <CheckboxGroup title="Payment Type" items={PAYMENTTYPE} selected={filters.selectedpaymentType} onChange={(v: any) => updateFilter("selectedpaymentType", v)} />
      <SelectGroup title="Track" items={TRACKS} selected={filters.selectedTrack} onChange={(v: string) => updateFilter("selectedTrack", v)} placeholder="All Tracks" />
      <SelectGroup title="Category" items={CATEGORIES} selected={filters.selectedCategory} onChange={(v: string) => updateFilter("selectedCategory", v)} placeholder="All Categories" />
      <InputGroup title="Max Price" value={filters.maxPrice} onChange={(v: string) => updateFilter("maxPrice", v)} placeholder="Enter max price" type="number" />
      <SelectGroup title="Trainer" items={trainersList?.map((t: any) => ({ id: t.id, name: t.trainerName })) || []} selected={filters.selectedTrainer} onChange={(v: string) => updateFilter("selectedTrainer", v)} placeholder="All Trainers" />
      <CheckboxGroup title="Courses" items={mlData?.map((c: any) => ({ id: c.id, name: c.courseTitle })) || []} selected={filters.selectedCourses} onChange={(v: any) => updateFilter("selectedCourses", v)} />
      <DateRangeGroup groupTitle="Batch Date" startLabel="Start Date" endLabel="End Date" startValue={filters.batchStartDate} endValue={filters.batchEndDate} onStartChange={(v: any) => updateFilter("batchStartDate", v)} onEndChange={(v: any) => updateFilter("batchEndDate", v)} />
      <DateRangeGroup groupTitle="Enrollment Date" startLabel="Start Date" endLabel="End Date" startValue={filters.enrollmentStartDate} endValue={filters.enrollmentEndDate} onStartChange={(v: any) => updateFilter("enrollmentStartDate", v)} onEndChange={(v: any) => updateFilter("enrollmentEndDate", v)} />
    </div>
  );
};

export default BatchFilter;
export type { BatchFilters };
