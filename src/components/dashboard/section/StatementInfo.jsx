import Pagination1 from "@/components/section/Pagination1";
import DashboardNavigation from "../header/DashboardNavigation";
import StatementCard1 from "../card/StatementCard1";
import { statement } from "@/data/dashboard";

export default function StatementInfo() {
  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Transaction History</h2>
            <p className="text">
              Review all your past transactions in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              <table className="table-style3 table at-savesearch">
                <thead className="t-head">
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody className="t-body">
                  {statement.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    statement.map((item, i) => (
                      <StatementCard1 key={i} data={item} />
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt30">
                <Pagination1 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
