"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header20 from "@/components/header/Header20";
import Footer from "@/components/footer/Footer";

export default function SelectRolePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
                    "Authorization": `Bearer ${accessToken}`, // Send token to authenticate the user
                },
                body: JSON.stringify({ role }),
            });

            if (!res.ok) {
                const data = await res.json();
                setMessage(data.error || "Failed to save role.");
            } else {
                // Role saved successfully, redirect to the correct dashboard
                if (role === 'employer') {
                    router.push("/employer-dashboard");
                } else {
                    router.push("/employee-dashboard");
                }
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
            console.error("Set role error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bgc-thm4">
            <Header20 />
            <section className="our-register">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 m-auto text-center">
                            <div className="main-title">
                                <h2 className="title">One Last Step</h2>
                                <p className="paragraph">Please select your role to continue.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-6 mx-auto">
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
                                        className="ud-btn btn-dark" // Example class for the second option
                                        onClick={() => handleRoleSelection('employee')}
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "I am an Employee (Offering Services)"}
                                    </button>
                                </div>
                                {message && <div className="alert alert-danger mt-3">{message}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}