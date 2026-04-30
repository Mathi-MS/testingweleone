import { Calendar, LucideBookOpen, LucideUser } from "lucide-react";
import courseBg from "../../assets/image/Images/course-bg.webp";

interface CourseCardProps {
  course: {
    id: string | number;
    short: string;
    title: string;
    subtitle: string;
    basePrice?: number;
    sellingPrice?: number;
    sessionCount: number;
    startDate: string;
    endDate: string;
    skillsYouGain: string[];
    trainerName?: string;
    bannerUrl?: string;
    isMasterclass?: boolean;
    enrollmentEndDate?: string;
  };
  onClick: () => void;
  isEnrolled?: boolean;
}

export function CourseCard({
  course,
  onClick,
  isEnrolled = false,
}: CourseCardProps) {
  const isEnrollmentEnded = course.enrollmentEndDate
    ? new Date(course.enrollmentEndDate).setHours(23, 59, 59, 999) < new Date().getTime()
    : false;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-200 relative cursor-pointer hover:shadow-md transition-shadow"
    >
      <div
        className={`p-3 bg-cover bg-top ${course.bannerUrl ? "h-[113px]" : ""}`}
        style={{
          backgroundImage: `url(${course.bannerUrl || courseBg})`,
        }}
      >
        {!course.bannerUrl && (
          <div className="flex items-center gap-3 h-20 py-11">
            <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
              {course.short}
            </div>
            <div className="text-base font-bold text-gray-900 line-clamp-2">
              {course.title}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col">
        <h4 className="text-gray-900 mb-2 text-xs h-8 line-clamp-2">
          {course.subtitle}
        </h4>

        <div className="flex w-full items-center justify-between mb-3">
          <div className="flex items-center w-full justify-between gap-4">
            <div className="flex items-center gap-2">
              {course.sellingPrice ? (
                <>
                  <div className="text-lg font-bold text-gray-900">
                    ₹ {course.sellingPrice}
                  </div>
                  {course.basePrice &&
                    course.basePrice !== course.sellingPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        ₹ {course.basePrice}
                      </div>
                    )}
                </>
              ) : course.basePrice ? (
                <div className="text-lg font-bold text-gray-900">
                  ₹ {course.basePrice}
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-900">Free</div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <LucideBookOpen className="w-4 h-4 inline mr-1" />
              <span>{course.sessionCount} Sessions</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-3 h-10">
          {course.trainerName && (
            <div className="flex items-center gap-1">
              <LucideUser className="w-3 h-4 inline mr-1" />
              Trainer - {course.trainerName}
            </div>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-4 inline mr-1" />
            {course.startDate} - {course.endDate}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap h-12">
          {course.skillsYouGain && course.skillsYouGain.length > 0 ? (
            <>
              {course.skillsYouGain
                .slice(0, 2)
                .map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#f3f4f682] text-gray-700 text-xs font-medium rounded-full border border-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              {course.skillsYouGain.length > 3 && (
                <span className="px-3 py-1 bg-[#f3f4f682] text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                  +{course.skillsYouGain.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className="px-3 py-1 bg-[#f3f4f682] text-gray-700 text-xs font-medium rounded-full border border-gray-300">
              skills
            </span>
          )}
        </div>

        <button
          className={`w-full py-2 text-xs font-medium rounded-full border transition-colors ${isEnrolled || isEnrollmentEnded
            ? "border-gray-400 text-gray-600 cursor-not-allowed"
            : "text-[#00BF5C] border-[#00BF5C]"
            }`}
          disabled={isEnrolled || isEnrollmentEnded}
        >
          {isEnrolled ? "Enrolled" : isEnrollmentEnded ? "Enrollment Closed" : "Enroll Now"}
        </button>
      </div>
    </div>
  );
}
