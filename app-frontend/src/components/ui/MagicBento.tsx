import * as React from "react";
import { cn } from "../../lib/utils";
import { gsap } from "gsap";

export interface MagicBentoProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  spotlite?: boolean;
  stars?: boolean;
}

export const MagicBento = React.forwardRef<HTMLDivElement, MagicBentoProps>(
  (
    { className, children, tilt, spotlite, stars, ...props },
    ref
  ) => {
    const bentoRef = React.useRef<HTMLDivElement>(null);
    const spotRef = React.useRef<HTMLDivElement>(null);
    const starsRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => bentoRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!tilt || !bentoRef.current) return;
      const el = bentoRef.current;
      let animation: gsap.core.Tween | null = null;
      const handlePointerMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;
        animation?.kill();
        animation = gsap.to(el, {
          rotateX: -rotateX,
          rotateY: rotateY,
          duration: 0.3,
          ease: "power2.out",
        });
      };
      const handlePointerLeave = () => {
        animation?.kill();
        animation = gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      };
      el.addEventListener("pointermove", handlePointerMove);
      el.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerleave", handlePointerLeave);
      };
    }, [tilt]);

    React.useEffect(() => {
      if (!spotlite || !spotRef.current || !bentoRef.current) return;
      const spot = spotRef.current;
      const el = bentoRef.current;
      const handlePointerMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.to(spot, {
          x: x - rect.width / 2,
          y: y - rect.height / 2,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };
      const handlePointerLeave = () => {
        gsap.to(spot, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      };
      el.addEventListener("pointermove", handlePointerMove);
      el.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        el.removeEventListener("pointermove", handlePointerMove);
        el.removeEventListener("pointerleave", handlePointerLeave);
      };
    }, [spotlite]);

    React.useEffect(() => {
      if (!stars || !starsRef.current) return;
      const starsEl = starsRef.current;
      const createStar = () => {
        const star = document.createElement("div");
        star.className = "magic-bento-star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.opacity = (0.5 + Math.random() * 0.5).toString();
        star.style.width = star.style.height = 1 + Math.random() * 2 + "px";
        starsEl.appendChild(star);
      };
      for (let i = 0; i < 24; i++) createStar();
      return () => {
        starsEl.innerHTML = "";
      };
    }, [stars]);

    return (
      <div
        ref={bentoRef}
        className={cn(
          "magic-bento relative bg-white border border-[#B2D8D8] overflow-hidden will-change-transform transition-transform duration-300",
          className
        )}
        style={{ perspective: 1000, ...props.style }}
        {...props}
      >
        {spotlite && (
          <div
            ref={spotRef}
            className="magic-bento-spot pointer-events-none absolute left-1/2 top-1/2 z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--bento-spotlite,rgba(178,216,216,0.5))_0%,_transparent_80%)] opacity-0 transition-opacity duration-300"
            style={{ filter: "blur(8px)" }}
          />
        )}
        {stars && (
          <div
            ref={starsRef}
            className="magic-bento-stars pointer-events-none absolute inset-0 z-0"
          />
        )}
        <div className="relative z-20">{children}</div>
      </div>
    );
  }
);
MagicBento.displayName = "MagicBento";
