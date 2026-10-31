"use client";

import { useEffect, useRef, useState } from "react";

export type TrackPoint = {
  t: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type Detection = {
  label: string;
  /** Box position over time, in seconds and percentages of the frame. Sorted by `t`. */
  track: TrackPoint[];
};

type LazyVideoProps = {
  src: string;
  poster?: string;
  detection?: Detection;
};

function positionAt(track: TrackPoint[], time: number): TrackPoint {
  const nextIndex = track.findIndex((point) => point.t > time);
  if (nextIndex === -1) return track[track.length - 1];
  if (nextIndex === 0) return track[0];

  const from = track[nextIndex - 1];
  const to = track[nextIndex];
  const progress = (time - from.t) / (to.t - from.t);
  const mix = (a: number, b: number) => a + (b - a) * progress;
  return {
    t: time,
    left: mix(from.left, to.left),
    top: mix(from.top, to.top),
    width: mix(from.width, to.width),
    height: mix(from.height, to.height),
  };
}

function boxStyle(point: TrackPoint) {
  return {
    left: `${point.left}%`,
    top: `${point.top}%`,
    width: `${point.width}%`,
    height: `${point.height}%`,
  };
}

// Doesn't request the clip until the slot is near the viewport, and leaves just the poster
// showing for visitors who prefer reduced motion.
export function LazyVideo({ src, poster, detection }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [load, setLoad] = useState(false);
  const track = detection?.track;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoad(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !load) return;

    if (!visible) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});

    if (!track) return;
    let frame = requestAnimationFrame(function follow() {
      if (boxRef.current) Object.assign(boxRef.current.style, boxStyle(positionAt(track, video.currentTime)));
      frame = requestAnimationFrame(follow);
    });
    return () => cancelAnimationFrame(frame);
  }, [visible, load, track]);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={load ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      {detection && (
        <div
          ref={boxRef}
          data-detection
          style={boxStyle(detection.track[0])}
          className="absolute border border-cyan bg-cyan/5"
        >
          <span className="absolute bottom-full left-[-1px] whitespace-nowrap bg-cyan px-1.5 py-0.5 font-mono text-[8px] font-medium tracking-[0.08em] text-ink sm:text-[10px]">
            {detection.label}
          </span>
        </div>
      )}
    </>
  );
}
