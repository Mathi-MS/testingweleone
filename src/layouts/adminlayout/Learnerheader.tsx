import UniversalHeader from "../../components/layout/UniversalHeader";

interface LearnerheaderProps {
  onToggleSidebar: () => void;
  sidebarOpen : boolean
}

const Learnerheader = ({ onToggleSidebar,sidebarOpen }: LearnerheaderProps) => {
    return <UniversalHeader onToggleSidebar={onToggleSidebar} sidebarOpen={sidebarOpen}/>;
}

export default Learnerheader
