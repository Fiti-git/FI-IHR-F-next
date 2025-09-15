import { product1 } from "@/data/product";
import MostViewServiceCard1 from "../card/MostViewServiceCard1";
import DoughnutChart from "../chart/DoughnutChart";
import LineChart from "../chart/LineChart";
import DashboardNavigation from "../header/DashboardNavigation";
import RecentServiceCard1 from "../card/RecentServiceCard1";
import { job1 } from "@/data/job";

export default function DashboardJobProvider() {
  return (
    <div className="dashboard__content hover-bgc-color">
      {/* Top Navigation */}
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Job Provider Dashboard</h2>
            <p className="text">Manage your posted jobs and projects.</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row">
        {[
          { title: "Jobs Posted", count: 12, newCount: 2, icon: "flaticon-briefcase" },
          { title: "Projects Posted", count: 8, newCount: 1, icon: "flaticon-project-management" },
          { title: "Active Listings", count: 7, newCount: 1, icon: "flaticon-checklist" },
          { title: "Applications Received", count: 54, newCount: 5, icon: "flaticon-resume" },
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

      {/* Post New Job/Project */}
      <div className="row mt30">
        <div className="col-md-6">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
            <h5 className="title">Post a New Job</h5>
            <p>Find the right talent for your job openings.</p>
            <a href="/post-job" className="btn btn-thm btn-sm mt15">
              Post Job
            </a>
          </div>
        </div>
        <div className="col-md-6">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
            <h5 className="title">Post a New Project</h5>
            <p>Hire freelancers to complete your projects.</p>
            <a href="/create-projects" className="btn btn-thm btn-sm mt15">
              Post Project
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      
    </div>
  );
}
