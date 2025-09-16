import DashboardNavigation from "../header/DashboardNavigation";


export default function DashboardFreelancer() {
  return (
    <div className="dashboard__content hover-bgc-color">
      {/* Top Navigation */}
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Freelancer Dashboard</h2>
            <p className="text">Manage your gigs, proposals, and applications.</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row">
        {[
          { title: "Proposals Sent", count: 14, newCount: 3, icon: "flaticon-contract" },
          { title: "Jobs Applied", count: 10, newCount: 2, icon: "flaticon-resume" },
          { title: "Services Created", count: 6, newCount: 1, icon: "flaticon-layer" },
          { title: "Completed Projects", count: 8, newCount: 1, icon: "flaticon-success" },
        ].map((item, i) => (
          <div key={i} className="col-sm-6 col-xxl-3">
            <div className="d-flex align-items-center justify-content-between statistics_funfact">
              <div className="details">
                <div className="fz15">{item.title}</div>
                <div className="title">{item.count}</div>
                <div className="text fz14">
                  <span className="text-thm">{item.newCount}</span> New
                </div>
              </div>
              <div className="icon text-center">
                <i className={item.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Service / View Jobs */}
      <div className="row mt30">
        <div className="col-md-6">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
            <h5 className="title">Create a New Service</h5>
            <p>Offer your expertise and start earning.</p>
            <a href="/create-service" className="btn btn-thm btn-sm mt15">
              Create Service
            </a>
          </div>
        </div>
        <div className="col-md-6">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
            <h5 className="title">Find New Jobs</h5>
            <p>Browse job listings and send proposals.</p>
            <a href="/jobs" className="btn btn-thm btn-sm mt15">
              Browse Jobs
            </a>
          </div>
        </div>
      </div>




    </div>
  );
}
