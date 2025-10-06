"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header20 from "@/components/header/Header20";
import Footer from "@/components/footer/Footer";

// You can create these as separate components for cleaner code
const EmployerForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        logo: null,
        name: "",
        email: "",
        phone: "",
        overview: "",
        jobType: "",
        industry: "",
        country: "",
        city: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12">
            <h4 className="text-center mb30">Complete Your Employer Profile</h4>
            <div className="mb-3">
                <label className="form-label">Upload Logo</label>
                <input type="file" className="form-control" onChange={handleFileChange} />
                <div className="form-text">Max 1MB, 330x300, .jpg & .png</div>
            </div>
            <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" placeholder="Your Company Name or Your Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-control" placeholder="company@domain.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-control" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Company Overview</label>
                <textarea name="overview" className="form-control" rows="4" placeholder="Describe your company and your hiring needs." value={formData.overview} onChange={handleChange}></textarea>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Job Type</label>
                    <input type="text" name="jobType" className="form-control" value={formData.jobType} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Industry</label>
                    <input type="text" name="industry" className="form-control" value={formData.industry} onChange={handleChange} />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" className="form-control" value={formData.country} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
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

const EmployeeForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        profileImage: null,
        fullName: "",
        email: "",
        phone: "",
        title: "",
        hourlyRate: "",
        gender: "",
        experience: "",
        specialization: "",
        skills: [],
        country: "",
        city: "",
        language: "",
        proficiency: "",
        socialLink: "",
        bio: "",
    });
    const [currentSkill, setCurrentSkill] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, profileImage: e.target.files[0] }));
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' && currentSkill) {
            e.preventDefault();
            if (!formData.skills.includes(currentSkill)) {
                setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill] }));
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
            <h4 className="text-center mb30">Complete Your Employee Profile</h4>
             <div className="mb-3">
                <label className="form-label">Upload Image</label>
                <input type="file" className="form-control" onChange={handleFileChange} />
                <div className="form-text">Max 1MB, 330x300, .jpg, .png</div>
            </div>
            <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="fullName" className="form-control" placeholder="Jane Doe" value={formData.fullName} onChange={handleChange} required />
            </div>
             <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" className="form-control" placeholder="jane@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" name="phone" className="form-control" placeholder="+971 50 123 4567" value={formData.phone} onChange={handleChange} />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Professional Title</label>
                    <input type="text" name="title" className="form-control" placeholder="Full Stack Developer" value={formData.title} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Hourly Rate ($)</label>
                    <input type="number" name="hourlyRate" className="form-control" placeholder="50" value={formData.hourlyRate} onChange={handleChange} />
                </div>
            </div>
             <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Gender</label>
                     <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Experience Level</label>
                     <select name="experience" className="form-select" value={formData.experience} onChange={handleChange}>
                        <option value="">Select Level</option>
                        <option value="entry">Entry</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                    </select>
                </div>
            </div>
             <div className="mb-3">
                <label className="form-label">Specialization</label>
                <input type="text" name="specialization" className="form-control" placeholder="e.g., Frontend, Backend, DevOps" value={formData.specialization} onChange={handleChange} />
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
                    <input type="text" name="country" className="form-control" value={formData.country} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Language</label>
                    <input type="text" name="language" className="form-control" placeholder="e.g., English, Spanish" value={formData.language} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Language Proficiency</label>
                    <select name="proficiency" className="form-select" value={formData.proficiency} onChange={handleChange}>
                        <option value="">Select Proficiency</option>
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                    </select>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">LinkedIn / GitHub</label>
                <input type="url" name="socialLink" className="form-control" placeholder="https://linkedin.com/in/..." value={formData.socialLink} onChange={handleChange} />
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
    const [selectedRole, setSelectedRole] = useState(null); // 'employer', 'employee', or null

    const handleRoleSelection = async (role) => {
        setLoading(true);
        setMessage("");

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            setMessage("Authentication error. Please log in again.");
            setLoading(false);
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/myapi/set-role/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save role.");
            }
            
            // Role saved, now show the profile form
            setSelectedRole(role);

        } catch (error) {
            setMessage(error.message || "An error occurred. Please try again.");
            console.error("Set role error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (profileData) => {
        setLoading(true);
        setMessage("");

        // Here you would send the profileData to your backend.
        // The endpoint will depend on your API design.
        // For example: `http://localhost:8000/myapi/complete-profile/`
        console.log("Submitting profile:", profileData);

        // This is a placeholder for your API call.
        // Replace it with your actual fetch logic.
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // After successful submission, redirect to the dashboard
            if (selectedRole === 'employer') {
                router.push("/employer-dashboard");
            } else {
                router.push("/employee-dashboard");
            }

        } catch (error) {
             setMessage("Failed to save profile. Please try again.");
             console.error("Profile submission error:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const renderContent = () => {
        if (selectedRole === 'employer') {
            return <EmployerForm onSubmit={handleProfileSubmit} loading={loading} />;
        }

        if (selectedRole === 'employee') {
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
                        onClick={() => handleRoleSelection('employer')}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "I am an Employer (Hiring)"}
                    </button>
                    <button
                        className="ud-btn btn-dark"
                        onClick={() => handleRoleSelection('employee')}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "I am an Employee (Offering Services)"}
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
                           {message && <div className="alert alert-danger mt-3 text-center">{message}</div>}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}