"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header20() {
    const path = usePathname();
    const router = useRouter();
    // 1. Store the full user object
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setUser(null);
                return;
            }

            try {
                const response = await fetch("http://206.189.134.117:8000/api/profile/check-auth/", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    // 2. Set the user state with API data
                    if (data.isAuthenticated) {
                        setUser(data);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setUser(null);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
        router.push("/login");
    };

    return (
        <>
            <header className="header-nav nav-innerpage-style main-menu">
                <nav className="posr">
                    <div className="container-fluid posr menu_bdrt1">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-auto pe-0">
                                <div className="d-flex align-items-center">
                                    <Link
                                        className="header-logo bdrr1 pr30 pr5-xl"
                                        href="/home-20"
                                    >
                                        <Image
                                            height={40}
                                            width={133}
                                            className="w-100 h-100 object-fit-contain"
                                            src="/images/header-logo-dark.svg"
                                            alt="Header Logo"
                                        />
                                    </Link>
                                    <div className="home1_style">

                                    </div>
                                </div>
                            </div>
                            <div className="col-auto">
                                <div className="d-flex align-items-center gap-3">
                                    <Navigation />

                                    {!user ? (
                                        <>
                                            <Link
                                                className={`login-info small-text ${path === "/login" ? "ui-active" : ""}`}
                                                href="/login"
                                            >
                                                Sign in
                                            </Link>
                                            <Link
                                                className="ud-btn btn-thm btn-sm join-btn"
                                                href="/register"
                                            >
                                                Join
                                            </Link>
                                        </>
                                    ) : (
                                        // 3. Implement role-based rendering
                                        <div className="d-flex align-items-center gap-3">
                                            {user.roles?.includes('freelancer') ? (
                                                <Link href="/freelancer-dashboard" className="login-info small-text">
                                                    Freelancer Dashboard
                                                </Link>
                                            ) : user.roles?.includes('job-provider') ? (
                                                <Link href="/job-provider-dashboard" className="login-info small-text">
                                                    Employer Dashboard
                                                </Link>
                                            ) : (
                                                <Link href="/dashboard" className="login-info small-text">
                                                    My Account
                                                </Link>
                                            )}

                                            <button onClick={handleLogout} className="ud-btn btn-thm btn-sm join-btn">
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <MobileNavigation2 />
        </>
    );
}