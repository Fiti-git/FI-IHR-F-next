import Link from "next/link";

export default function AccountSettings() {
  return (
    <>
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="container"> {/* Added container for grid */}
          <div className="row">
            <div className="col-lg-7">
              <div className="bdrb1 pb15 mb25">
                <h5 className="list-title">Account Settings</h5>
              </div>
              <form className="form-style1">
                <div className="row">
                  {/* Deactivate or Delete Account Section */}
                  <div className="col-12 mb-4"> {/* col-12 for full width and margin */}
                    <h6>Deactivate or Delete Account</h6>
                    <p className="text">
                      Warning: If you deactivate or delete your account, you will lose access to all services, including posting jobs or projects, hiring freelancers, and accessing your profile.
                      Deactivation is temporary, but account deletion is permanent and cannot be undone.
                    </p>
                  </div>

                  {/* Password Confirmation */}
                  <div className="col-sm-6 mb-3"> {/* Adjust column size and margin */}
                    <label className="heading-color ff-heading fw500 mb10">
                      Enter Password to Confirm
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="********"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="col-sm-6 d-flex justify-content-start align-items-center"> {/* Center alignment for button */}
                    <Link className="ud-btn btn-thm" href="/deactivate-account">
                      Deactivate Account
                      <i className="fal fa-arrow-right-long" />
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
