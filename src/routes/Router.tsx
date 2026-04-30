import { lazy, Suspense, useEffect } from "react";
import { isAspireDomain } from "../utils/domain";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
// scheduleTokenRefresh removed

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/adminlayout/AdminLayout";

// Components
import ErrorPage from "../pages/ErrorPage";
import NotFound from "../pages/NotFound";
import PrivateRoute from "./PrivateRoute";
import { LoadingSpinner } from "../components/ui";
import { Home } from "../pages/Home";
import { CareerCompass } from "../modules/learner/career/CareerCompass";
import { CourseLearner } from "../modules/learner/course/Courses";
import { CoursesDetail } from "../modules/learner/course/CoursesDetail";
import { SessionDetail } from "../modules/learner/course/session/SessionDetail";
import CustomTableBatch from "../modules/admin/microlearingnew/Tabletest";
import { MasterClass } from "../modules/learner/masterClass/MasterClass";
import { Learninghub } from "../modules/learner/learninghub/learningHub";
import LearningHubDetails from "../modules/learner/learninghub/LearningHubDetails";

import { AIChatInterface } from "../modules/learner/ai/AIChatInterface";
import NewsLetterList from "../modules/newsletter/NewsLetterList";
import CareerCompassReport from "../modules/admin/Report/CareerCompassReport";



// import Coursemappingmodel from "../modules/admin/batch/coursemappingmodel";


// --- Lazy Load Helper ---
const Loadable = (Component: React.ComponentType<any>) => (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// --- Auth Modules ---
const AuthPage = Loadable(lazy(() => import("../modules/auth/Signup")));
const ExistUser = Loadable(lazy(() => import("../modules/auth/Signin")));
const ResetCode = Loadable(lazy(() => import("../modules/auth/resetcode")));
const NewPassword = Loadable(lazy(() => import("../modules/auth/password/createpassword")));
const ForgotPassword = Loadable(lazy(() => import("../modules/auth/password/forgotpassword")));
const ResetPassword = Loadable(lazy(() => import("../modules/auth/password/resetpassword")));
const AspireSignIn = Loadable(lazy(() => import("../modules/auth/aspireSignIn")));

// --- Learner / Public Modules ---
const PostVerify = Loadable(lazy(() => import("../modules/learner/postverify/postverify")));
const GuestDashboard = Loadable(lazy(() => import("../pages/guestuser")));
const CollegeStudents = Loadable(lazy(() => import("../modules/learner/postverify/collegestudents")));
const SchoolStudentForm = Loadable(lazy(() => import("../modules/learner/postverify/schoolstudent")));
const JobSeekers = Loadable(lazy(() => import("../modules/learner/postverify/jobseekers")));
const WorkingProfessional = Loadable(lazy(() => import("../modules/learner/postverify/workingProfessional")));
const LearnerCalendar =Loadable(lazy(()=> import("../modules/learner/LearnerCalendar")));

// --- Admin Modules ---
const MicroLearning = Loadable(lazy(() => import("../modules/admin/microlearingnew/MicroLearning")));
const MLDetails = Loadable(lazy(() => import("../modules/admin/microlearning/MLDetails")));
const Courses = Loadable(lazy(() => import("../modules/admin/course/Courses")));
const Books = Loadable(lazy(() => import("../modules/admin/books/Books")));
const Chapters = Loadable(lazy(() => import("../modules/admin/chapters/Chapters")));
const ChapterNew = Loadable(lazy(() => import("../modules/admin/chapters/chapternew")));
const ChapterForm = Loadable(lazy(() => import("../modules/admin/chapters/ChapterForm")));
const Batch = Loadable(lazy(() => import("../modules/admin/Batch/Batch")));
const Report = Loadable(lazy(() => import("../modules/admin/Report/Report")));
const CoursesReport = Loadable(lazy(() => import("../modules/admin/Report/CoursesReport ")));
const MasterclassReport = Loadable(lazy(() => import("../modules/admin/Report/MasterclassReport")));
const Entity = Loadable(lazy(() => import("../modules/admin/entity/Entity")));
const AllLearner = Loadable(lazy(() => import("../modules/admin/users/Learner/AllLearner").then(module => ({ default: module.AllLearner }))));
const AllTrainer = Loadable(lazy(() => import("../modules/admin/users/Trainer/AllTrainer").then(module => ({ default: module.AllTrainer }))));
const AdminDashboard = Loadable(lazy(() => import("../modules/admin/Dashboard/AdminDashboard")));
const ReferralCode = Loadable(lazy(() => import("../modules/admin/Batch/ReferralCode")));
// --- Trainer Modules ---
const MyBatch = Loadable(lazy(() => import("../modules/trainer/MyBatch")));
const BatchDetail = Loadable(lazy(() => import("../modules/trainer/BatchDetail")));
const TrainerCalendar = Loadable(
  lazy(() => import("../modules/trainer/TrainerCalendar"))
);
const MyChats = Loadable(lazy(() => import("../modules/trainer/TrainerChat/MyChats")));

// --- App / Learner Modules ---
const Dashboard = Loadable(lazy(() => import("../modules/learner/dashboard/Dashboard")));
const DashboardLearner = Loadable(lazy(() => import("../modules/learner/dashboard/DashboardLearner")));
// const LearningHub = Loadable(lazy(() => import("../modules/learner/learninghub/learninghubold")));

// Named exports handling - these files export named components, not default
const CommunityListing = Loadable(lazy(() => import("../modules/learner/community/CommunityListing").then(module => ({ default: module.CommunityListing }))));
const CommunityChatInterface = Loadable(lazy(() => import("../modules/learner/community/CommunityChatInterface").then(module => ({ default: module.CommunityChatInterface }))));
const AIChatWrapper = Loadable(lazy(() => import("../modules/learner/ai/AIChatWrapper").then(module => ({ default: module.AIChatWrapper }))));
const AIChatHistory = Loadable(lazy(() => import("../modules/learner/ai/AIChatHistory").then(module => ({ default: module.AIChatHistory }))));
const BlogList = Loadable(lazy(() => import("../modules/blog/BlogList")));
const CreateBlog = Loadable(lazy(() => import("../modules/blog/CreateBlog")));
const CreateNewsletter = Loadable(lazy(() => import("../modules/newsletter/CreateNewsletter")));
const BlogDetail = Loadable(lazy(() => import("../modules/blog/BlogDetail")));
const NewsletterDetail = Loadable(lazy(() => import("../modules/newsletter/NewsletterDetail")));

// --- Routes Configuration ---

const appRoutes = {
  element: <PrivateRoute />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "learner-dashboard", element: <DashboardLearner />  },
        { path: "learninghub", element: <Learninghub /> },
        { path: "learninghub/details/:id", element: <LearningHubDetails /> },
        { path: "learninghub/:id/session/:sessionId", element: <SessionDetail /> },
        { path: "community", element: <CommunityListing /> },
        { path: "career", element: <CareerCompass /> },
        { path: "CourseLearner", element: <CourseLearner /> },
        { path: "course/:id", element: <CoursesDetail /> },
        { path: "session/:sessionId", element: <SessionDetail /> },
        { path: "masterclass", element: <MasterClass /> },
        { path: "community/chat/:id", element: <CommunityChatInterface /> },
        { path: "ai-chat", element: <AIChatWrapper /> },
        { path: "ai-chat/history", element: <AIChatHistory /> },
        { path: "blog", element: <BlogList /> },
        { path: "blog/create", element: <CreateBlog /> },
        { path: "blog/:id", element: <BlogDetail /> },
        { path: "newsletter", element: <NewsLetterList /> },
        { path: "newsletter/create", element: <CreateNewsletter /> },
        { path: "newsletter/:id", element: <NewsletterDetail /> },
        { path: "learnercalendar", element: <LearnerCalendar /> },
      ],
    }
  ],
};

const adminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  errorElement: <ErrorPage />,
  children: [
    { path: "microlearning", element: <MicroLearning /> },
    { path: "microlearning/details/:id", element: <MLDetails /> },
    { path: "courses", element: <Courses /> },
    { path: "books", element: <Books /> },
    { path: "chapters", element: <Chapters /> },
    { path: "Chapter", element: <ChapterNew /> },
    { path: "chapters/create", element: <ChapterForm /> },
    { path: "chapters/:id", element: <ChapterForm /> },
    { path: "entity", element: <Entity /> },
    { path: "book", element: <Books /> },
    { path: "batch", element: <Batch /> },
    { path: "CustomTableBatch", element: <CustomTableBatch /> },
    { path: "users/learners", element: <AllLearner /> },
    { path: "users/trainers", element: <AllTrainer /> },
    { path: "report", element: <Report /> },
    { path: "coursesReport", element: <CoursesReport /> },
    { path: "masterclassReport", element: <MasterclassReport /> },
    { path: "careercompassReport", element: <CareerCompassReport /> },
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "referralcode", element: <ReferralCode /> },
    
  ]
};

const trainerRoutes = {
  path: "/trainer",
  element: <AdminLayout />,
  errorElement: <ErrorPage />,
  children: [
    { path: "mybatch", element: <MyBatch /> },
    { path: "batch/:id", element: <BatchDetail /> },
    {path:"trainercalendar",element:<TrainerCalendar/>},
    { path: "mychats", element: <MyChats /> }
  ]
};

const appRoutesAspire = {
  element: <PrivateRoute />,
  errorElement: <ErrorPage />,
  children: [
    { path: "/", element: <AspireSignIn /> },
    {
      element: <AdminLayout />,
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "learner-dashboard", element: <DashboardLearner /> },
        { path: "learninghub", element: <Learninghub /> },
        { path: "learninghub/details/:id", element: <LearningHubDetails /> },
        { path: "learninghub/:id/session/:sessionId", element: <SessionDetail /> },
        { path: "community", element: <CommunityListing /> },
        { path: "career", element: <CareerCompass /> },
        { path: "CourseLearner", element: <CourseLearner /> },
        { path: "course/:id", element: <CoursesDetail /> },
        { path: "session/:sessionId", element: <SessionDetail /> },
        { path: "masterclass", element: <MasterClass /> },
        { path: "community/chat/:id", element: <CommunityChatInterface /> },
        { path: "ai-chat", element: <AIChatWrapper /> },
        { path: "ai-chat/history", element: <AIChatHistory /> },
        { path: "blog", element: <BlogList /> },
        { path: "blog/create", element: <CreateBlog /> },
        { path: "blog/:id", element: <BlogDetail /> },
        { path: "newsletter", element: <NewsLetterList /> },
        { path: "newsletter/create", element: <CreateNewsletter /> },
        { path: "newsletter/:id", element: <NewsletterDetail /> },
        { path: "learnercalendar", element: <LearnerCalendar /> },
      ],
    }
  ],
};

const router = createHashRouter(
  isAspireDomain()
    ? [appRoutesAspire, adminRoutes, trainerRoutes, { path: "*", element: <NotFound /> }]
    : [adminRoutes, trainerRoutes, appRoutes, { path: "/aspire", element: <AspireSignIn /> }, { path: "*", element: <NotFound /> }],
  { basename: "/" }
);

// --- Router Component ---

function Router() {
  const { accessToken, expiresIn, loading } = useSelector(
    (state: any) => state.ar
  );

  // useEffect(() => {
  //   if (accessToken !== null && expiresIn !== null && !loading) {
  //     scheduleTokenRefresh(expiresIn);
  //   }
  // }, [accessToken, expiresIn, loading]);

  return <RouterProvider router={router} />;
}

export default Router;
