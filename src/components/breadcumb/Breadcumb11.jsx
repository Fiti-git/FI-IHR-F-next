"use client";
import { project1 } from "@/data/product";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function Breadcumb11() {
  const { id } = useParams();

  const data = project1.find((item) => item.id == id);

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src="/images/vector-img/right-bottom.png"
            alt="right-bottom"
          />
          <Image
            height={300}
            width={532}
            className="service-v1-vector bounce-y d-none d-xl-block"
            src="/images/vector-img/vector-service-v1.png"
            alt="vector-service"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-7">
                <div className="position-relative">
                  {data ? (
                    <h2>{data.title}</h2>
                  ) : (
                    <h2>Website Designer Required For Directory Theme</h2>
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
