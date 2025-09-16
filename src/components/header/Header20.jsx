"use client";
import Link from "next/link";

import Image from "next/image";
import { usePathname } from "next/navigation";

import Navigation from "./Navigation";
import MobileNavigation2 from "./MobileNavigation2";

export default function Header20() {
    const path = usePathname();
    return (
        <>
            <header className="header-nav nav-innerpage-style main-menu  ">
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

        {/* Sign In Link */}
        <Link
            className={`login-info small-text ${
                path === "/login" ? "ui-active" : ""
            }`}
            href="/login"
        >
            Sign in
        </Link>

        {/* Join Button */}
        <Link
            className="ud-btn btn-thm btn-sm join-btn"
            href="/register"
        >
            Join
        </Link>
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
