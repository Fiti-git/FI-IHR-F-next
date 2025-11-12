"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { job1 } from "@/data/job";
import AboutMe1 from "../element/AboutMe1";
import EmployeeDetailSlider1 from "../element/EmployeeDetailSlider1";
import ServiceDetailComment1 from "../element/ServiceDetailComment1";
import ServiceDetailReviewInfo1 from "../element/ServiceDetailReviewInfo1";
import JobCard5 from "../card/JobCard5";
import api from '@/lib/axios';

export default function EmployeeDetail1() {
  const params = useParams();
  const userId = params?.id;

  const [jobProvider, setJobProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobProviderDetail = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        const response = await api.get("/api/profile/job-providers/");
        console.log("Fetched job providers:", response.data);

        // Find the job provider with matching user ID
        const provider = response.data.find(p => p.user?.id === parseInt(userId));

        if (provider) {
          setJobProvider(provider);
          setError(null);
        } else {
          setError("Job provider not found");
        }
      } catch (err) {
        console.error("Error fetching job provider:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobProviderDetail();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading job provider details...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !jobProvider) {
    return (
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="alert alert-warning" role="alert">
                <h4>Job Provider Not Found</h4>
                <p>{error || "The job provider you're looking for doesn't exist."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Extract and format data
  const user = jobProvider.user || {};
  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user.first_name || user.last_name || user.username || jobProvider.company_name || "User";

  const countryDisplay = {
    'usa': 'United States',
    'canada': 'Canada',
    'uk': 'United Kingdom'
  }[jobProvider.country] || jobProvider.country || "Location";

  const industryDisplay = {
    'technology': 'Technology',
    'healthcare': 'Healthcare',
    'finance': 'Finance',
    'education': 'Education'
  }[jobProvider.industry] || jobProvider.industry || "Industry";

  const jobTypeDisplay = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'remote': 'Remote'
  }[jobProvider.job_type] || jobProvider.job_type || "Job Type";

  // Prepare data for AboutMe1 component
  const aboutMeData = {
    company: jobProvider.company_name || "Company",
    name: displayName,
    industry: industryDisplay,
    jobType: jobTypeDisplay,
    companySize: "N/A", // You can add this field to your model later
    founded: "N/A", // You can add this field to your model later
    phone: jobProvider.phone_number || "N/A",
    email: jobProvider.email_address || user.email || "N/A",
    location: countryDisplay,
    username: user.username,
  };

  return (
    <>
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-8">
              <div className="service-about">
                <h4 className="mb20">About {jobProvider.company_name || "Company"}</h4>

                {jobProvider.company_overview ? (
                  <>
                    {jobProvider.company_overview.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text mb30">
                        {paragraph}
                      </p>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text mb30">
                      Welcome to {jobProvider.company_name || "our company"}. We are committed to
                      providing excellent opportunities and fostering a great work environment for
                      talented professionals.
                    </p>
                    <p className="text mb30">
                      Our team is dedicated to innovation and excellence in the {industryDisplay} sector.
                      We offer {jobTypeDisplay.toLowerCase()} positions and are always looking for
                      passionate individuals to join our growing team.
                    </p>
                  </>
                )}

                {/* Company Highlights */}
                <div className="row mt40 mb40">
                  <div className="col-md-4 col-sm-6">
                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                      <div className="icon flex-shrink-0">
                        <span className="flaticon-factory" />
                      </div>
                      <div className="details">
                        <h5 className="title">Industry</h5>
                        <p className="mb-0 text">{industryDisplay}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-6">
                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                      <div className="icon flex-shrink-0">
                        <span className="flaticon-tracking" />
                      </div>
                      <div className="details">
                        <h5 className="title">Job Type</h5>
                        <p className="mb-0 text">{jobTypeDisplay}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-6">
                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                      <div className="icon flex-shrink-0">
                        <span className="flaticon-place" />
                      </div>
                      <div className="details">
                        <h5 className="title">Location</h5>
                        <p className="mb-0 text">{countryDisplay}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="mb20 mt60">Who are we?</h5>
                <p className="text mb30">
                  {jobProvider.company_name || "Our company"} is a leading organization in the {industryDisplay} industry. We specialize in providing quality services and creating opportunities for talented professionals to grow and succeed in their careers.
                </p>

                <h5 className="mb20 mt60">What do we do?</h5>
                <p className="text mb30">
                  We offer {jobTypeDisplay.toLowerCase()} positions in various departments. Our company
                  is committed to excellence and innovation, providing a dynamic work environment
                  where employees can thrive and develop their skills. We believe in fostering a
                  culture of collaboration and continuous improvement.
                </p>

                <EmployeeDetailSlider1 />

                <div className="row">
                  <h4 className="mb25">Open Positions</h4>
                  <p className="text-muted mb30">
                    Explore our current job openings and find your next career opportunity with {jobProvider.company_name || "us"}.
                  </p>
                  {job1.slice(0, 3).map((item, i) => (
                    <div key={i} className="col-sm-6 col-xl-12">
                      <JobCard5 data={item} />
                    </div>
                  ))}
                </div>

                <ServiceDetailReviewInfo1 />
                <ServiceDetailComment1 />
              </div>
            </div>
            <div className="col-lg-4">
              <AboutMe1 data={aboutMeData} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}