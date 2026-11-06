"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

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
  /** The above-the-fold slot: its poster is fetched first, at high priority. */
  priority?: boolean;
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

function timecode(totalSeconds: number) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`;
}

const tick = "absolute size-2 border-cyan";

// Doesn't request the clip until the slot is near the viewport, and leaves just the poster
// showing for visitors who prefer reduced motion.
export function LazyVideo({ src, poster, detection, priority = false }: LazyVideoProps) {
  // The hero poster is usually the largest thing on screen, so it should not queue behind
  // scripts and the other posters.
  if (priority && poster) preload(poster, { as: "image", fetchPriority: "high" });

  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [load, setLoad] = useState(false);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const track = detection?.track;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Posters below the fold are fetched once their frame comes within a screen or so, so they
    // don't compete with the stylesheet and the hero on first load.
    const posterObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        posterObserver.disconnect();
      },
      { rootMargin: "800px" },
    );
    posterObserver.observe(video);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => posterObserver.disconnect();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoad(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => {
      posterObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !load) return;

    if (!visible) {
      video.pause();
      return;
    }
    void video.play().catch(() => {});

    // The recording clock runs only while the frame is on screen.
    const clock = window.setInterval(() => setSeconds((value) => value + 1), 1000);

    if (!track) return () => window.clearInterval(clock);
    let frame = requestAnimationFrame(function follow() {
      if (boxRef.current) Object.assign(boxRef.current.style, boxStyle(positionAt(track, video.currentTime)));
      frame = requestAnimationFrame(follow);
    });
    return () => {
      window.clearInterval(clock);
      cancelAnimationFrame(frame);
    };
  }, [visible, load, track]);

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={load ? src : undefined}
        poster={priority || near ? poster : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        // The box locks on once the clip is actually showing frames.
        onPlaying={() => setLocked(true)}
      />
      {detection && (
        <div ref={boxRef} data-detection aria-hidden="true" style={boxStyle(detection.track[0])} className="absolute">
          <div className={`absolute inset-0 bg-cyan/5 ring-1 ring-cyan/60 ${locked ? "lock-on" : ""}`}>
            <span className={`${tick} top-0 left-0 border-t-2 border-l-2`} />
            <span className={`${tick} top-0 right-0 border-t-2 border-r-2`} />
            <span className={`${tick} bottom-0 left-0 border-b-2 border-l-2`} />
            <span className={`${tick} right-0 bottom-0 border-r-2 border-b-2`} />
            {/* Inside the box, so a target near the top edge never pushes the label out of frame. */}
            <span className="absolute top-0 left-0 bg-cyan px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] whitespace-nowrap text-ink sm:text-[11px]">
              {detection.label}
            </span>
          </div>
        </div>
      )}
      <p
        aria-hidden="true"
        className="absolute top-[calc(6%+1.25rem)] right-[5%] font-mono text-[10px] tracking-[0.12em] text-text tabular-nums [text-shadow:0_0_4px_#05080f] sm:text-[11px]"
      >
        REC {timecode(seconds)}
      </p>
    </>
  );
}
