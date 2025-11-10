"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header20 from "@/components/header/Header20";
import Footer from "@/components/footer/Footer";
import api from '@/lib/axios';


// Note: I've updated this form to use <select> dropdowns for fields with choices.
const EmployerForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        profile_image: null,
        company_name: "",
        email_address: "",
        phone_number: "",
        company_overview: "",
        job_type: "",
        industry: "",
        country: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, profile_image: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
            <h4 className="text-center mb30">Complete Your Job Provider Profile</h4>
            <div className="mb-3">
                <label className="form-label">Upload Logo</label>
                <input type="file" name="profile_image" className="form-control" onChange={handleFileChange} />
                <div className="form-text">Max 1MB, .jpg & .png</div>
            </div>
            <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input type="text" name="company_name" className="form-control" placeholder="Your Company Name" value={formData.company_name} onChange={handleChange} required />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email_address" className="form-control" placeholder="contact@company.com" value={formData.email_address} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" name="phone_number" className="form-control" placeholder="+1 234 567 890" value={formData.phone_number} onChange={handleChange} />
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Company Overview</label>
                <textarea name="company_overview" className="form-control" rows="4" placeholder="Describe your company and your hiring needs." value={formData.company_overview} onChange={handleChange}></textarea>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Default Job Type</label>
                    <select name="job_type" className="form-select" value={formData.job_type} onChange={handleChange}>
                        <option value="">Select Job Type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="remote">Remote</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Industry</label>
                    <select name="industry" className="form-select" value={formData.industry} onChange={handleChange}>
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <select name="country" className="form-select" value={formData.country} onChange={handleChange}>
                        <option value="">Select Country</option>
                        <option value="usa">United States</option>
                        <option value="canada">Canada</option>
                        <option value="uk">United Kingdom</option>
                    </select>
                </div>
            </div>
            <div className="d-grid">
                <button type="submit" className="ud-btn btn-thm" disabled={loading}>
                    {loading ? "Saving Profile..." : "Submit Profile"}
                </button>
            </div>
        </form>
    );
};

// Note: I've updated this form to use <select> dropdowns for fields with choices.
const EmployeeForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        profile_image: null,
        full_name: "",
        phone_number: "",
        professional_title: "",
        hourly_rate: "",
        gender: "",
        experience_level: "",
        specialization: "",
        skills: [],
        country: "",
        city: "",
        language: "",
        language_proficiency: "",
        linkedin_or_github: "",
        bio: "",
    });
    const [currentSkill, setCurrentSkill] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, profile_image: e.target.files[0] }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' && currentSkill.trim() !== "") {
            e.preventDefault();
            if (!formData.skills.includes(currentSkill.trim())) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill.trim()] }));
            }
            setCurrentSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };


    return (
        <form onSubmit={handleSubmit} className="form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
            <h4 className="text-center mb30">Complete Your Freelancer Profile</h4>
            <div className="mb-3">
                <label className="form-label">Upload Profile Image</label>
                <input type="file" name="profile_image" className="form-control" onChange={handleFileChange} />
                <div className="form-text">Max 1MB, .jpg, .png</div>
            </div>
            <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="full_name" className="form-control" placeholder="Jane Doe" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" name="phone_number" className="form-control" placeholder="+971 50 123 4567" value={formData.phone_number} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Professional Title</label>
                    <input type="text" name="professional_title" className="form-control" placeholder="Full Stack Developer" value={formData.professional_title} onChange={handleChange} />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Hourly Rate</label>
                    <select name="hourly_rate" className="form-select" value={formData.hourly_rate} onChange={handleChange}>
                        <option value="">Select Rate</option>
                        <option value="30">$30/hr</option>
                        <option value="40">$40/hr</option>
                        <option value="50">$50/hr</option>
                        <option value="60">$60/hr</option>
                        <option value="70">$70/hr</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Gender</label>
                    <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Experience Level</label>
                    <select name="experience_level" className="form-select" value={formData.experience_level} onChange={handleChange}>
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="mid">Mid-Level</option>
                        <option value="senior">Senior</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Specialization</label>
                    <select name="specialization" className="form-select" value={formData.specialization} onChange={handleChange}>
                        <option value="">Select Specialization</option>
                        <option value="web-dev">Web Development</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                    </select>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Skills (press Enter to add)</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Type a skill and press Enter"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                />
                <div className="mt-2">
                    {formData.skills.map(skill => (
                        <span key={skill} className="badge bg-secondary me-2 p-2">
                            {skill} <button type="button" className="btn-close btn-close-white ms-1" onClick={() => removeSkill(skill)}></button>
                        </span>
                    ))}
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <select name="country" className="form-select" value={formData.country} onChange={handleChange}>
                        <option value="">Select Country</option>
                        <option value="uae">UAE</option>
                        <option value="uk">UK</option>
                        <option value="usa">USA</option>
                        <option value="india">India</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <select name="city" className="form-select" value={formData.city} onChange={handleChange}>
                        <option value="">Select City</option>
                        <option value="dubai">Dubai</option>
                        <option value="london">London</option>
                        <option value="new-york">New York</option>
                        <option value="toronto">Toronto</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Language</label>
                    <select name="language" className="form-select" value={formData.language} onChange={handleChange}>
                        <option value="">Select Language</option>
                        <option value="english">English</option>
                        <option value="arabic">Arabic</option>
                        <option value="french">French</option>
                        <option value="spanish">Spanish</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Language Proficiency</label>
                    <select name="language_proficiency" className="form-select" value={formData.language_proficiency} onChange={handleChange}>
                        <option value="">Select Proficiency</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="fluent">Fluent</option>
                    </select>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">LinkedIn / GitHub URL</label>
                <input type="url" name="linkedin_or_github" className="form-control" placeholder="https://linkedin.com/in/..." value={formData.linkedin_or_github} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Short Bio / Summary</label>
                <textarea name="bio" className="form-control" rows="4" placeholder="Tell us about your professional background." value={formData.bio} onChange={handleChange}></textarea>
            </div>
            <div className="d-grid">
                <button type="submit" className="ud-btn btn-thm" disabled={loading}>
                    {loading ? "Saving Profile..." : "Submit Profile"}
                </button>
            </div>
        </form>
    );
};


export default function SelectRolePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedRole, setSelectedRole] = useState(null);


    const handleRoleSelection = async (role) => {
        try {
            const res = await api.post('/myapi/set-role/', { role });
            setSelectedRole(role);
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error("Set role error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (profileData) => {
        setLoading(true);
        setMessage("");
        console.log(localStorage.getItem("access_token"))
        console.log(localStorage)

        const access_token = localStorage.getItem("access_token");
        if (!access_token) {
            setMessage("Authentication error. Please log in again.");
            setLoading(false);
            router.push("/login");
            return;
        }

        const dataToSend = new FormData();

        // Populate FormData with all key-value pairs from profileData
        for (const key in profileData) {
            // Handle the 'skills' array separately
            if (key === 'skills') {
                dataToSend.append('skills', profileData.skills.join(','));
            } else if (profileData[key]) { // Append only if the value is not null/empty
                dataToSend.append(key, profileData[key]);
            }
        }

        let apiUrl;
        if (selectedRole === 'Freelancer') {
            apiUrl = "/api/profile/freelancer/";
        } else if (selectedRole === 'Job Provider') {
            apiUrl = "/api/profile/job-provider/";
        } else {
            setMessage("No role selected.");
            setLoading(false);
            return;
        }

        try {
            // IMPORTANT: For FormData, axios automatically sets the correct Content-Type
            const res = await api.post(apiUrl, dataToSend);

            // On success, redirect to the appropriate dashboard
            if (selectedRole === 'Job Provider') {
                router.push("/job-provider");
            } else {
                router.push("/freelancer");
            }

        } catch (error) {
            // Handle validation errors from backend
            const errorData = error.response?.data;

            if (errorData) {
                const errorMessages = Object.entries(errorData)
                    .map(([field, errors]) => {
                        const errorArray = Array.isArray(errors) ? errors : [errors];
                        return `${field}: ${errorArray.join(' ')}`;
                    })
                    .join('\n');
                setMessage(errorMessages);
            } else {
                setMessage(error.message || "Failed to save profile. Please check the form.");
            }

            console.error("Profile submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (selectedRole === 'Job Provider') {
            return <EmployerForm onSubmit={handleProfileSubmit} loading={loading} />;
        }

        if (selectedRole === 'Freelancer') {
            return <EmployeeForm onSubmit={handleProfileSubmit} loading={loading} />;
        }

        // Default view: Role selection
        return (
            <div className="log-reg-form form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12 text-center">
                <h4>How will you be using HRHUB?</h4>
                <p className="text mt20 mb30">
                    This helps us customize your experience. This cannot be changed later.
                </p>
                <div className="d-grid gap-3">
                    <button
                        className="ud-btn btn-thm"
                        onClick={() => handleRoleSelection('Job Provider')}
                        disabled={loading}
                    >
                        {loading ? "..." : "I am a Job Provider (Hiring)"}
                    </button>
                    <button
                        className="ud-btn btn-dark"
                        onClick={() => handleRoleSelection('Freelancer')}
                        disabled={loading}
                    >
                        {loading ? "..." : "I am a Freelancer (Offering Services)"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bgc-thm4">
            <Header20 />
            <section className="our-register">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 m-auto text-center">
                            <div className="main-title">
                                <h2 className="title">{selectedRole ? 'Complete Your Profile' : 'One Last Step'}</h2>
                                <p className="paragraph">
                                    {selectedRole ? 'Fill in the details below to get started.' : 'Please select your role to continue.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-8 mx-auto">
                            {renderContent()}
                            {message && (
                                <div className="alert alert-danger mt-3 text-center" style={{ whiteSpace: 'pre-line' }}>
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}