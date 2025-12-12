"use client";
import { useEffect, useState } from "react";
import FreelancerAbout1 from "../element/FreelancerAbout1";
import FreelancerSkill1 from "../element/FreelancerSkill1";
import ServiceDetailComment1 from "../element/ServiceDetailComment1";
import ServiceDetailReviewInfo1 from "../element/ServiceDetailReviewInfo1";
import api from '@/lib/axios';

export default function FreelancerDetail1({ id }) {
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFreelancerDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // 1. Fetch the list of ALL freelancers instead of a specific ID
        const response = await api.get("/api/profile/freelancers/");
        
        // 2. Find the specific freelancer from the list
        // We check if the URL ID matches the Freelancer ID OR the User ID
        const foundFreelancer = response.data.find(item => 
            String(item.id) === String(id) || 
            String(item.user?.id) === String(id)
        );

        if (foundFreelancer) {
            setFreelancer(foundFreelancer);
        } else {
            setError("Freelancer not found in database.");
        }
        
      } catch (err) {
        console.error("Error fetching freelancer details:", err);
        setError("Failed to load freelancer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerDetail();
  }, [id]);

  if (loading) {
    return <div className="text-center pt50 pb50">Loading details...</div>;
  }

  if (error || !freelancer) {
    return <div className="text-center pt50 pb50 text-danger">{error || "Freelancer not found"}</div>;
  }

  // Helper to safely get education/experience arrays
  const educationList = freelancer.education || [];
  const experienceList = freelancer.work_experience || [];

  return (
    <>
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-8">
              <div className="service-about">
                
                {/* --- Description --- */}
                <h4>Description</h4>
                <div className="text mb30">
                   <p>{freelancer.bio || "No description provided."}</p>
                </div>

                <hr className="opacity-100 mb60 mt60" />

                {/* --- Education --- */}
                <h4 className="mb30">Education</h4>
                <div className="educational-quality">
                  {educationList.length > 0 ? (
                    educationList.map((edu, index) => (
                      <div key={index}>
                        <div className="m-circle text-thm">
                            {edu.degree ? edu.degree.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div className={`wrapper ${index === educationList.length - 1 ? 'mb60' : 'mb40'}`}>
                          <span className="tag">
                            {edu.start_year} - {edu.end_year || 'Present'}
                          </span>
                          <h5 className="mt15">{edu.degree}</h5>
                          <h6 className="text-thm">{edu.school}</h6>
                          <p>{edu.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No education history available.</p>
                  )}
                </div>

                <hr className="opacity-100 mb60" />

                {/* --- Work Experience --- */}
                <h4 className="mb30">Work &amp; Experience</h4>
                <div className="educational-quality">
                  {experienceList.length > 0 ? (
                    experienceList.map((work, index) => (
                      <div key={index}>
                        <div className="m-circle text-thm">
                            {/* Use company name or job title for the icon letter */}
                            {(work.company || work.job_title || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className={`wrapper ${index === experienceList.length - 1 ? 'mb60' : 'mb40'}`}>
                          <span className="tag">
                             {work.start_year} - {work.end_year || 'Present'}
                          </span>
                          <h5 className="mt15">{work.position || work.job_title}</h5>
                          <h6 className="text-thm">{work.company}</h6>
                          <p>{work.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No work experience available.</p>
                  )}
                </div>

                <hr className="opacity-100 mb60" />

                {/* Comments & Reviews */}
                {/* <ServiceDetailReviewInfo1 />
                <ServiceDetailComment1 /> */}
              </div>
            </div>

            {/* --- Sidebar --- */}
            <div className="col-lg-4">
              <div className="blog-sidebar ms-lg-auto">
                <FreelancerAbout1 freelancer={freelancer} />
                <FreelancerSkill1 freelancer={freelancer} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}