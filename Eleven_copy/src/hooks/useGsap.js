import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Scroll Reveal ──────────────────────────────────────────────
// Fades + slides an element into view on scroll
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      x = 0,
      duration = 1,
      delay = 0,
      ease = "power3.out",
      start = "top 85%",
      opacity = 0,
    } = options;

    gsap.set(el, { opacity, y, x });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
}

// ─── Stagger Reveal ─────────────────────────────────────────────
// Reveals child elements in a staggered fashion on scroll
export function useStaggerReveal(childSelector = ".stagger-child", options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const {
      y = 50,
      duration = 0.8,
      stagger = 0.1,
      ease = "power3.out",
      start = "top 85%",
    } = options;

    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    gsap.set(children, { opacity: 0, y });

    const tween = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease,
      scrollTrigger: {
        trigger: container,
        start,
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === container) t.kill();
      });
    };
  }, []);

  return ref;
}

// ─── Parallax ───────────────────────────────────────────────────
export function useParallax(speed = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
}

// ─── Magnetic Hover ─────────────────────────────────────────────
// Element follows cursor slightly when hovered
export function useMagneticHover(strength = 0.3) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return ref;
}

// ─── Text Reveal (manual character split) ───────────────────────
export function useTextReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      duration = 0.8,
      stagger = 0.04,
      ease = "power3.out",
      delay = 0,
      y = 80,
    } = options;

    const text = el.textContent;
    el.innerHTML = "";
    el.style.overflow = "hidden";

    const chars = text.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      el.appendChild(span);
      return span;
    });

    gsap.set(chars, { y, opacity: 0 });

    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      ease,
      delay,
    });

    return () => {
      gsap.killTweensOf(chars);
    };
  }, []);

  return ref;
}

// ─── Count Up ───────────────────────────────────────────────────
export function useCountUp(endValue, options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      duration = 2,
      ease = "power2.out",
      start = "top 85%",
      prefix = "",
      suffix = "",
    } = options;

    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: endValue,
      duration,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [endValue]);

  return ref;
}

// ─── Fade In (simple, no scroll) ────────────────────────────────
export function useFadeIn(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { duration = 0.6, delay = 0, y = 30, ease = "power2.out" } = options;

    gsap.fromTo(
      el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, delay, ease }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, []);

  return ref;
}

// ─── Slide In ───────────────────────────────────────────────────
export function useSlideIn(direction = "left", options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { duration = 0.8, delay = 0, distance = 100, ease = "power3.out" } = options;

    const from = {
      opacity: 0,
      x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    };

    gsap.fromTo(el, from, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      gsap.killTweensOf(el);
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
}
