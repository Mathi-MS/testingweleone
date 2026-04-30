import { Search } from "lucide-react";
import { Course } from "../../../types";

interface Event {
  day: string;
  date: string;
  title: string;
  time: string;
}

const Learninghub = () => {
  const courses: Course[] = [
    {
      id: 1,
      title: "Modern JavaScript From The Beginning Course 2.0 (2025)",
      tag: "Main Course",
      img: "https://cdn.worldvectorlogo.com/logos/javascript-1.svg",
      progress: 40,
      sessionsRemaining: 6,
      trainer: "Krishna",
      nextSession: "22th July, 2025 & 6 PM - GST",
      btnText: "Join Session"
    },
    {
      id: 2,
      title: "Modern HTML & CSS From The Beginning 2.0",
      tag: "Skill-Up Add-on 1",
      img: "https://cdn.worldvectorlogo.com/logos/html-1.svg",
      price: "₹ 199",
      duration: "01:30 hr",
      btnText: "Enroll Now"
    },
    {
      id: 3,
      title: "React.js Tutorial and Projects Course",
      tag: "Skill-Up Add-on 2",
      img: "https://cdn.worldvectorlogo.com/logos/react-2.svg",
      price: "₹ 99",
      duration: "01:30 hr",
      btnText: "Enroll Now"
    }
  ];

  const events: Event[] = [
    { day: "Mon", date: "21", title: "Color Styles Class - 4th Session", time: "6:00 - 7:00 PM GST" },
    { day: "Tue", date: "22", title: "Color Styles Class - 5th Session", time: "6:00 - 7:00 PM GST" },
    { day: "Wed", date: "23", title: "Mentor Session", time: "6:00 - 7:00 PM GST" },
    { day: "Thu", date: "24", title: "Webinar - Started design with Figma", time: "6:00 - 7:00 PM GST" },
    { day: "Fri", date: "25", title: "Color Styles Class - Final Session", time: "6:00 - 7:00 PM GST" }
  ];

  return (
    <div className="bg-background p-5 rounded-xl">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Learning Hub</h1>
          <p className="text-sm text-text-gray">"Level Up with Every Click"</p>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search from Courses, Sessions, etc..."
            className="w-full px-4 py-2 pr-10 bg-white rounded-lg border-0 text-sm placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-gray" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDE - COURSES */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">My Courses</h2>
              <span className="text-sm text-primary cursor-pointer">See all</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-border rounded-xl overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image section */}
                  <div className="bg-background p-6 text-center relative">
                    <span className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-dark-gray">
                      {course.tag}
                    </span>
                    <img src={course.img} alt={course.title} className="w-15 h-15 mx-auto" />
                  </div>

                  {/* Text Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 min-h-12">{course.title}</h3>

                    {course.progress && (
                      <>
                        <div className="mb-2">
                          <div className="h-1.5 bg-purple-100 rounded-full">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-xs text-text-gray mb-1">
                          {course.progress}% Completed • {course.sessionsRemaining} Sessions remaining
                        </p>

                        <p className="text-xs text-text-gray">
                          Next Session: {course.nextSession}
                        </p>
                      </>
                    )}

                    {course.price && (
                      <p className="text-sm font-bold mt-2">
                        {course.price} • {course.duration}
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <div className="p-4 pt-0">
                    <button
                      className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${
                        course.progress
                          ? 'bg-primary text-white hover:bg-accent'
                          : 'border border-primary text-primary hover:bg-background'
                      }`}
                    >
                      {course.btnText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - EVENTS */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl p-5 shadow-sm h-full">
            <h2 className="text-lg font-bold mb-4">My Events</h2>

            <div className="max-h-96 overflow-y-auto pr-2">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-lg p-3 mb-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{event.day} {event.date}</p>
                    <p className="text-xs text-text-gray">{event.title}</p>
                  </div>
                  <p className="text-xs font-semibold text-primary">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learninghub;