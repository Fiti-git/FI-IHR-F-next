"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Breadcumb10({ path }) {
  const { id } = useParams();
  const [shareToggle, setShareToggle] = useState(false);
  const [project, setProject] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://206.189.134.117:8000/api/project/projects/";

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const response = await fetch(`${API_URL}${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };

    fetchProject();
  }, [id, API_URL]);

  // Build dynamic breadcrumb path
  const dynamicPath = project 
    ? ["Home", "Projects", project.category, project.title]
    : path || ["Home", "Projects"];

  // Share project URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(project?.title || 'Check out this project');
    
    let shareLink = '';
    
    switch(platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  return (
    <>
      <section className="breadcumb-section">
        <div className="container">
          <div className="row">
            <div className="col-sm-8 col-lg-10">
              <div className="breadcumb-style1 mb10-xs">
                <div className="breadcumb-list">
                  {dynamicPath?.map((item, i) => (
                    <span key={i}>
                      {i === 0 ? (
                        <Link href="/">{item}</Link>
                      ) : i === 1 ? (
                        <Link href="/projects-list">{item}</Link>
                      ) : i === dynamicPath.length - 1 ? (
                        <span className="text-dark">{item}</span>
                      ) : (
                        <span>{item}</span>
                      )}
                      {i < dynamicPath.length - 1 && (
                        <span className="mx-2">/</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-sm-4 col-lg-2">
              <div className="d-flex align-items-center justify-content-sm-end gap-3">
                {/* Share Button */}
                <div className="position-relative">
                  <button
                    onClick={() => setShareToggle(!shareToggle)}
                    className="border-0 bg-transparent cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className={`share-save-widget d-flex align-items-center ${
                        shareToggle ? "active" : ""
                      }`}
                    >
                      <span className="icon flaticon-share dark-color fz12 mr10" />
                      <div className="h6 mb-0">Share</div>
                    </div>
                  </button>
                  {shareToggle && (
                    <div className="ui-social-media">
                      <button 
                        onClick={() => handleShare('facebook')}
                        className="border-0 bg-transparent"
                        style={{ cursor: 'pointer' }}
                        title="Share on Facebook"
                      >
                        <i className="fa-brands fa-facebook-f"></i>
                      </button>
                      <button 
                        onClick={() => handleShare('twitter')}
                        className="border-0 bg-transparent"
                        style={{ cursor: 'pointer' }}
                        title="Share on Twitter"
                      >
                        <i className="fa-brands fa-twitter"></i>
                      </button>
                      <button 
                        onClick={() => handleShare('linkedin')}
                        className="border-0 bg-transparent"
                        style={{ cursor: 'pointer' }}
                        title="Share on LinkedIn"
                      >
                        <i className="fa-brands fa-linkedin-in"></i>
                      </button>
                      <button 
                        onClick={handleCopyLink}
                        className="border-0 bg-transparent"
                        style={{ cursor: 'pointer' }}
                        title="Copy Link"
                      >
                        <i className="fa-solid fa-link"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}