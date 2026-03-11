import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Preloader = ({ onComplete }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [show, setShow] = useState(true);

    useEffect(() => {
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!container || !textEl) return;

        const tl = gsap.timeline({
            onComplete: () => {
                setShow(false);
                if (onComplete) onComplete();
            },
        });

        // Simple fade in
        tl.fromTo(
            textEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out" }
        );

        // Hold
        tl.to({}, { duration: 0.3 });

        // Fade out entire container
        tl.to(container, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut",
        });

        return () => tl.kill();
    }, []);

    if (!show) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
            }}
        >
            <h1
                ref={textRef}
                style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                    fontWeight: 300,
                    letterSpacing: "0.35em",
                    color: "#000",
                    textTransform: "uppercase",
                    opacity: 0,
                }}
            >
                ELEVEN
            </h1>
        </div>
    );
};

export default Preloader;
