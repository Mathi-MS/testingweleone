import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTypewriter } from "../../../hooks/useTypewriter";
import { GraduationCap, LucideBell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { fetchAllBatches } from "../../../features/allBatchesSlice";
import { fetchLearnerBatches } from "../../../features/learnerBatchesSlice";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { CourseCard } from "../../../components/common/CourseCard";
import { CategoryFilter } from "../../../components/common/CategoryFilter";

export function MasterClass() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedCourseTypes, setSelectedCourseTypes] = useState<string[]>([]);
  const [showCards, setShowCards] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    batches,
    loading: batchLoading,
    error: batchError,
  } = useAppSelector((state) => state.allBatches);

  const { batches: learnerBatches } = useAppSelector(
    (state) => state.learnerBatches,
  );
  const { userDetails } = useAppSelector((state: any) => state.ar);
  const userId = userDetails?.id;

  useEffect(() => {
    dispatch(fetchAllBatches({ isMasterClass: true, page: 0, size: 100 }));
    if (userId) {
      dispatch(fetchLearnerBatches({ learnerId: userId, page: 0, size: 100 }));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!batchLoading) {
      setShowCards(true);
    }
  }, [batchLoading]);

  const categories = [
    "ALL",
    "Mechanical_Engineering",
    "Electronics_Communication_Engineering",
    "Civil_Engineering",
    "Mathematics",
    "Business_Management",
    "Physics",
    "Chemistry",
    "Automobile_Engineering",
    "Commerce_Accounting",
    "Banking_Finance",
    "Graphic_Design",
    "AI_ML_Emerging_AI",
    "Application_Engineer",
    "Digital_Infrastructure_QA",
    "Interface_Experience_Design",
    "AI_ML_Data_Science",
    "Product_Project_Leadership",
    "Finance",
    "HR",
    "Data_Analytics",
    "Leadership_Management",
    "IT_Operations",
    "Communication_Design",
    "Operations_Supply_Chain",
    "Engineering_College_Faculty",
    "School_Teachers",
    "Art_Science_College_Staff",
    "Corporate_Trainers",
  ];

  const transformedCourses = batches.map((batch, index) => ({
    id: batch.id || index + 1,
    tag: batch.isMasterClass ? "Master Class" : "Main Course",
    short: batch.batchName?.substring(0, 2).toUpperCase() || "BC",
    title: batch.batchName || "Batch Course",
    subtitle: batch.batchDescription || "Course Description",
    basePrice: batch.basePrice,
    sellingPrice: batch.sellingPrice,
    duration: batch.duration ? `${batch.duration} hrs` : "N/A",
    sessionCount: batch.sessionCount || 0,
    progress: batch.overAllPercentage || 0,
    nextSession: batch.whatYouLearn || "Next Session",
    startDate: batch.batchStartDate
      ? new Date(batch.batchStartDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "TBD",
    endDate: batch.batchEndDate
      ? new Date(batch.batchEndDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "TBD",
    time:
      batch.sessionStartTime && batch.sessionEndTime
        ? `${batch.sessionStartTime} - ${batch.sessionEndTime}`
        : "TBD",
    note: batch.batchOverview || `Must learning class for ${batch.batchName}!`,
    category: batch.category || "General",
    language: batch.language || "English",
    skillsYouGain: batch.skillsYouGain || [],
    bannerUrl: batch.bannerUrl,
    isMasterclass: batch.isMasterClass,
    courseName: batch.courseName,
    trainerName: batch.trainerList?.[0]?.trainerName || "",
    forWhom: batch.forWhom || "",
    enrollmentEndDate: batch.enrollmentEndDate,
    rawStartDate: batch.batchStartDate ? new Date(batch.batchStartDate) : null,
  }));

  const filteredCourses = transformedCourses.filter((course) => {
    const categoryMatch =
      activeCategory === "ALL" ||
      (Array.isArray(course.category)
        ? course.category.some(
          (cat: any) =>
            cat?.categoryName?.toUpperCase() ===
            activeCategory.toUpperCase() ||
            (typeof cat === "string" &&
              cat?.toUpperCase() === activeCategory.toUpperCase()),
        )
        : typeof course.category === "string" &&
        (course.category as string).toUpperCase() ===
        activeCategory.toUpperCase());

    const courseTypeMatch =
      selectedCourseTypes.length === 0 ||
      selectedCourseTypes.some((type) => {
        if (!course.forWhom) return false;
        const forWhomUpper = String(course.forWhom).toUpperCase();
        return forWhomUpper.includes(type.toUpperCase());
      });

    return categoryMatch && courseTypeMatch;
  });

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 15);

  const sortByDateDesc = (a: any, b: any) => {
    if (!a.rawStartDate) return 1;
    if (!b.rawStartDate) return -1;
    return b.rawStartDate.getTime() - a.rawStartDate.getTime();
  };

  const upcomingCourses = filteredCourses
    .filter((c) => c.rawStartDate && c.rawStartDate >= fiveDaysAgo)
    .sort(sortByDateDesc);
  const pastCourses = filteredCourses
    .filter((c) => !c.rawStartDate || c.rawStartDate < fiveDaysAgo)
    .sort(sortByDateDesc);

  const headingTW = useTypewriter("Upskill with Masterclasses", 30, true);

  const para1TW = useTypewriter(
    "We'll combine AI guidance, live expert sessions, and career-focused learning to help you grow faster. Each masterclass is designed to give you practical skills you can apply right away.",
    20,
    headingTW.isDone,
  );

  const para2TW = useTypewriter(
    "Choose a masterclass and start learning today.",
    20,
    para1TW.isDone,
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* <div className="sticky top-0 z-30 border-b border-[#0d0d0d0d] bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg text-gray-900 flex items-center">
              <GraduationCap size={18} className="mr-2" />
              Master Class
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <AuthHeaderControls />
            <div className="flex items-center space-x-2">
              <LucideBell />
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-white w-full max-w-5xl mx-auto px-6 pb-[6rem]">
        <div className="py-6 mb-2">
          <h2 className="text-[20px] text-[#111827] font-semibold mb-3">
            {/* {headingTW.displayText} */}
            Upskill with Masterclasses
          </h2>
          <p className="text-[14px] text-[#374151] mb-2">
            {/* {para1TW.displayText} */}
            We'll combine AI guidance, live expert sessions, and career-focused
            learning to help you grow faster. Each masterclass is designed to
            give you practical skills you can apply right away.
          </p>
          <p className="text-[14px] text-[#000] font-medium">
            {/* {para2TW.displayText} */}
            Choose a masterclass and start learning today.
          </p>
        </div>

        {batchLoading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              selectedCourseTypes={selectedCourseTypes}
              onCourseTypesChange={setSelectedCourseTypes}
            />

            {showCards && (
              <div className="mt-8">
                {upcomingCourses.length > 0 && (
                  <>
                    <h2 className="text-[20px] text-[#111827] font-semibold mb-3">
                      Upcoming Masterclasses
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {upcomingCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onClick={() =>
                            navigate(`/course/${course.id}`, {
                              state: {
                                trainerName: course.trainerName,
                                fromMasterclass: true,
                              },
                            })
                          }
                          isEnrolled={learnerBatches.some(
                            (batch: any) => batch.id === course.id,
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <h2 className="text-[20px] text-[#111827] font-semibold mb-3">
                  Masterclasses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {pastCourses.length > 0 ? (
                    pastCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onClick={() =>
                          navigate(`/course/${course.id}`, {
                            state: {
                              trainerName: course.trainerName,
                              fromMasterclass: true,
                            },
                          })
                        }
                        isEnrolled={learnerBatches.some(
                          (batch: any) => batch.id === course.id,
                        )}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">
                        No masterclasses found
                        {selectedCourseTypes.length > 0 &&
                          ` for ${selectedCourseTypes[0].replace(/_/g, " ")}`}
                        {activeCategory !== "ALL" &&
                          selectedCourseTypes.length > 0 &&
                          " and "}
                        {activeCategory !== "ALL" &&
                          activeCategory.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
