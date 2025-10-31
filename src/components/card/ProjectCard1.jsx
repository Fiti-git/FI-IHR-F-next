import Image from "next/image";
import Link from "next/link";

export default function ProjectCard1({ data }) {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Helper function to get user display name
  const getUserName = () => {
    if (data.user?.first_name && data.user?.last_name) {
      return `${data.user.first_name} ${data.user.last_name}`;
    }
    return data.user?.username || data.author || "Anonymous";
  };

  // Helper function to get project type display
  const getProjectTypeDisplay = () => {
    if (data.projectType === 'fixed_price' || data.project_type === 'fixed_price') {
      return "Fixed Price";
    }
    if (data.projectType === 'hourly' || data.project_type === 'hourly') {
      return "Hourly Rate";
    }
    return "Fixed Price";
  };

  // Helper function to format budget
  const formatBudget = () => {
    const budget = parseFloat(data.budget || data.price?.min || 0);
    return budget.toFixed(2);
  };

  // Helper function to get tags/skills
  const getTags = () => {
    if (data.tags && data.tags.length > 0) return data.tags;
    if (data.skill && data.skill.length > 0) return data.skill;
    if (data.category) return [data.category];
    return [];
  };

  // Helper function to get location
  const getLocation = () => {
    if (data.location) return data.location;
    if (data.user?.first_name) return "Remote";
    return "Remote";
  };


  const getImageUrl = () => {
    return data.imgUrl || 
           data.authorImg || 
           data.img || 
           "/images/team/default-project.png";
  };

  // Truncate description
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const tags = getTags();

  return (
    <>
      <div className="freelancer-style1 bdr1 hover-box-shadow row ms-0 align-items-lg-center">
        <div className="col-lg-8 ps-0">
          <div className="d-lg-flex bdrr1 bdrn-xl pr15 pr0-lg">
            <div className="thumb w60 position-relative rounded-circle mb15-md">
              {/* <Image
                height={60}
                width={60}
                className="rounded-circle mx-auto"
                src={data.img || data.imgUrl || "/images/team/default-project.png"}
                alt="project"
              /> */}
            
              <span className="online-badge2" />
            </div>
            <div className="details ml15 ml0-md mb15-md">
              <h5 className="title mb-3">{data.title}</h5>
              
              <p className="mb-0 fz14 list-inline-item mb5-sm pe-1">
                <i className="flaticon-place fz16 vam text-thm2 me-1" />{" "}
                {getLocation()}
              </p>
              
              <p className="mb-0 fz14 list-inline-item mb5-sm pe-1">
                <i className="flaticon-30-days fz16 vam text-thm2 me-1 bdrl1 pl15 pl0-xs bdrn-xs" />{" "}
                {formatDate(data.createdAt || data.created_at)}
              </p>
              
              <p className="mb-0 fz14 list-inline-item mb5-sm">
                <i className="flaticon-contract fz16 vam text-thm2 me-1 bdrl1 pl15 pl0-xs bdrn-xs" />{" "}
                {data.proposals?.length || 0} Received
              </p>
              
              <p className="text mt10">
                {truncateText(data.description || data.brief)}
              </p>
              
              {tags.length > 0 && (
                <div className="skill-tags d-flex align-items-center justify-content-start flex-wrap">
                  {tags.slice(0, 3).map((item, i) => (
                    <span key={i} className="tag me-2 mb-2">
                      {item}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="tag mb-2">+{tags.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 ps-0 ps-xl-3 pe-0">
          <div className="details">
            <div className="text-lg-end">
              <h4>${formatBudget()}</h4>
              <p className="text">{getProjectTypeDisplay()}</p>
            </div>
            
            {/* Status Badge */}
            <div className="text-lg-end mb-2">
              <span className={`badge ${
                data.status === 'open' ? 'bg-success' : 
                data.status === 'in_progress' ? 'bg-warning' : 
                data.status === 'completed' ? 'bg-primary' : 
                'bg-secondary'
              }`}>
                {data.status?.toUpperCase() || 'OPEN'}
              </span>
            </div>
            
            {/* View Button - Changed from "Send Proposal" */}
            <div className="d-grid mt15">
              <Link
                href={`/project-single/${data.id}`}
                className="ud-btn btn-light-thm"
              >
                View
                <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}