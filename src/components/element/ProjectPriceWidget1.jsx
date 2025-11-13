"use client";

export default function ProjectPriceWidget1({ projectData }) {
  // Format budget helper
  const formatBudget = (budget) => {
    if (!budget) return "0.00";
    return parseFloat(budget).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get project type display
  const getProjectTypeDisplay = () => {
    if (!projectData?.project_type) return "Fixed Price";
    return projectData.project_type === "fixed_price" ? "Fixed Price" : "Hourly Rate";
  };

  // Format deadline
  const formatDeadline = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!projectData?.deadline) return null;
    const deadline = new Date(projectData.deadline);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  if (!projectData) {
    return (
      <div className="price-widget pt25 bdrs8">
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading project details...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <>
      <div className="price-widget pt25 bdrs8">
        <h3 className="widget-title">${formatBudget(projectData.budget)}</h3>
        <p className="text fz14 mb-2">{getProjectTypeDisplay()}</p>
        
        {/* Project Status */}
        <div className="mb-3">
          <span className={`badge ${
            projectData.status === 'open' ? 'bg-success' : 
            projectData.status === 'in_progress' ? 'bg-primary' : 
            projectData.status === 'completed' ? 'bg-info' : 
            'bg-secondary'
          }`}>
            {projectData.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Deadline Info */}
        {projectData.deadline && (
          <div className="mb-3 pb-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted fz14">
                <i className="flaticon-calendar me-2"></i>
                Deadline
              </span>
            </div>
            <p className="mb-1 fw500">{formatDeadline(projectData.deadline)}</p>
            {daysRemaining && (
              <p className={`mb-0 fz13 ${
                daysRemaining === "Deadline passed" ? "text-danger" : 
                daysRemaining.includes("1 day") || daysRemaining === "Due today" ? "text-warning" : 
                "text-muted"
              }`}>
                {daysRemaining}
              </p>
            )}
          </div>
        )}

        {/* Category */}
        {projectData.category && (
          <div className="mb-3">
            <p className="text-muted fz14 mb-1">
              <i className="flaticon-folder me-2"></i>
              Category
            </p>
            <p className="mb-0 fw500">{projectData.category}</p>
          </div>
        )}

        {/* Visibility */}
        {projectData.visibility && (
          <div className="mb-3">
            <p className="text-muted fz14 mb-1">
              <i className="flaticon-eye me-2"></i>
              Visibility
            </p>
            <p className="mb-0 fw500 text-capitalize">{projectData.visibility}</p>
          </div>
        )}

        {/* Proposal Count */}
        {projectData.proposals && (
          <div className="mb-3 pb-3 border-bottom">
            <p className="text-muted fz14 mb-1">
              <i className="flaticon-document me-2"></i>
              Proposals
            </p>
            <p className="mb-0 fw500">
              {projectData.proposals.length} proposal{projectData.proposals.length !== 1 ? 's' : ''} submitted
            </p>
          </div>
        )}

        {/* Submit Proposal Button - Only show if project is open
        {projectData.status === 'open' ? (
          <div className="d-grid">
            <a 
              href="#proposal-form" 
              className="ud-btn btn-thm"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('.bsp_reveiw_wrt')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Submit a Proposal
              <i className="fal fa-arrow-right-long" />
            </a>
          </div>
        ) : (
          <div className="alert alert-info mb-0 text-center">
            <small>
              <i className="flaticon-info-button me-2"></i>
              This project is {projectData.status?.replace('_', ' ')}
            </small>
          </div>
        )} */}
      </div>
    </>
  );
}