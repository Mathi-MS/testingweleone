import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { RootState } from "../../../app/store";
import {
  fetchCategorizedCommunities,
  setActiveCommunity,
  Community,
} from "../../../features/communitySlice";
import { UserAvatar } from "../../../components/common/UserAvatar";
import { useAppDispatch } from "../../../app/hook";
import CreateCommunity from "./CreateCommunity";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import {
  JOIN_GROUP,
  REQUEST_TO_JOIN_GROUP,
} from "../../../graphql/mutations/chatMutations";
import { communityClient } from "../../../graphql/client";

export function CommunityListing() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, categorized } = useSelector(
    (state: RootState) => state.community,
  );
  const { userDetails } = useSelector((state: RootState) => state.ar);
  const userId = userDetails?.id;
  const isAdmin = userDetails?.roles?.some(
    (role: string) => role.toUpperCase() === "ROLE_ADMIN",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    "All",
    "Ai",
    "Design",
    "Business",
    "Robotics",
    "Product_Management",
    "Finance",
    "AR_VR",
  ];

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    dispatch(fetchCategorizedCommunities());
  }, [dispatch]);

  const handleCommunityClick = (community: Community) => {
    if (community.type !== "FREE_GROUP" && community.type !== "COURSE_GROUP")
      return;
    if (!community.isJoined && community.type !== "COURSE_GROUP") return;
    dispatch(setActiveCommunity(community));
    navigate(`/community/chat/${community.id}`);
  };

  const handleJoinGroup = async (e: React.MouseEvent, community: Community) => {
    e.stopPropagation();

    if (community.type === "FREE_GROUP") {
      try {
        const { data } = await communityClient.mutate({
          mutation: JOIN_GROUP,
          variables: { chatId: community.chatId || community.id },
          context: { headers: { "x-user-id": userId } },
        });
        if (data?.joinGroup) {
          toast.success("Successfully joined the group!", {
            position: "top-center",
          });
          dispatch(fetchCategorizedCommunities());
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to join group", {
          position: "top-center",
        });
      }
    } else if (community.type === "MODERATED_GROUP") {
      try {
        const { data } = await communityClient.mutate({
          mutation: REQUEST_TO_JOIN_GROUP,
          variables: { chatId: community.chatId || community.id },
          context: { headers: { "x-user-id": userId } },
        });
        if (data?.requestToJoinGroup) {
          toast.success("Join request sent successfully!", {
            position: "top-center",
          });
          dispatch(fetchCategorizedCommunities());
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to send join request", {
          position: "top-center",
        });
      }
    } else {
      handleCommunityClick(community);
    }
  };

  const filterList = (list: Community[]) =>
    list.filter(
      (c) =>
        (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (activeCategory === "All" || c.category === activeCategory),
    );

  const renderGrid = (list: Community[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {list.map((community: Community) => (
        <div
          key={community.id}
          onClick={() => handleCommunityClick(community)}
          className={`rounded-xl border border-[#00000019] p-2 transition-all h-[150px] flex flex-col ${
            community.isJoined || community.type === "COURSE_GROUP"
              ? "cursor-pointer"
              : "cursor-default"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 me-5">
              <div className="w-[2.5rem] h-[2.5rem] flex-shrink-0">
                <UserAvatar
                  src={community.icon}
                  name={community.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[#181c1f] font-semibold text-[16px] m-0 mb-[2px] line-clamp-1">
                  {community.name}
                </h3>
                <p className="text-[12px] text-[#5c6c74] m-0">
                  {community.members} members
                </p>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-[#5c6c74] line-clamp-2 m-0">
            {community.description}
          </p>
          <div className="flex justify-end mt-auto">
            <button
              onClick={(e) => {
                if (!community.isJoined && community.type !== "COURSE_GROUP")
                  handleJoinGroup(e, community);
              }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors border ${
                community.isJoined || community.type === "COURSE_GROUP"
                  ? "border-none text-gray-400 cursor-default bg-gray-50"
                  : "border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              {community.isJoined || community.type === "COURSE_GROUP"
                ? "Joined"
                : "Join Group"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const hotList = filterList(categorized.hot);
  const warmList = filterList(categorized.warm);
  const coolList = filterList(categorized.cool);
  const totalCount = hotList.length + warmList.length + coolList.length;

  return (
    <div className="flex-1 min-h-screen bg-white">
      <div className="flex-1 px-4 pt-2 pb-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-md font-semibold text-gray-800">
            Explore Groups
          </h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
            {isAdmin && (
              <div>
                <CustomButton
                  type="button"
                  variant="contained"
                  label="Create Community"
                  size="large"
                  startIcon={<MdAdd />}
                  onClick={() => setOpenDrawer(true)}
                  sx={{}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => scrollCategories("left")}
            className="py-2 flex-shrink-0"
          >
            <ChevronLeft className="text-gray-300" />
          </button>

          <div
            ref={categoriesScrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none", width: "100%" }}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <div
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "text-gray-500 border-gray-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200"
                  }`}
                >
                  {category.replace(/_/g, " ")}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="py-2 flex-shrink-0"
          >
            <ChevronRight className="text-gray-300" />
          </button>
        </div>

        <hr className="pt-1 pb-3" />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">
              No data available in this category
            </p>
          </div>
        ) : (
          <div>
            {hotList.length > 0 && (
              <>
                <h2 className="inline-block text-[14px] text-[red] bg-[#ff000024] mb-2 font-bold px-2 py-1 rounded-2xl">
                  Hot 🔥
                </h2>
                {renderGrid(hotList)}
              </>
            )}
            {warmList.length > 0 && (
              <>
                <h2 className="inline-block text-[14px] text-[orange] bg-[#ffa50036] mb-2 font-bold px-2 py-1 rounded-2xl">
                  Warm ☀️
                </h2>
                {renderGrid(warmList)}
              </>
            )}
            {coolList.length > 0 && (
              <>
                <h2 className="inline-block text-[14px] text-[#4c4ca7] bg-[#87ceeb57] mb-2 font-bold px-2 py-1 rounded-2xl">
                  Cool ❄️
                </h2>
                {renderGrid(coolList)}
              </>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <CreateCommunity
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
        />
      )}
    </div>
  );
}
