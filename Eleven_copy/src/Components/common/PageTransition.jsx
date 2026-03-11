import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

const PageTransition = ({ children }) => {
    const location = useLocation();
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Animate in
        gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
            }
        );

        // Scroll to top on route change
        window.scrollTo(0, 0);

        return () => {
            gsap.killTweensOf(el);
        };
    }, [location.pathname]);

    return (
        <div ref={containerRef} style={{ willChange: "opacity, transform" }}>
            {children}
        </div>
    );
};

export default PageTransition;
