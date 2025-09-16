import DashboardNavigation from "../header/DashboardNavigation";
import ChangePassword from "./ChangePassword";
import ConfirmPassword from "./ConfirmPassword";
import ProfileDetails from "./JPProfileDetails";


export default function MyProfileInfo() {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>My Profile</h2>
              <p className="text">Your profile for posting jobs and working with freelancers.</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <ProfileDetails />
            <ChangePassword />
            <ConfirmPassword />
          </div>
        </div>
      </div>
    </>
  );
}
