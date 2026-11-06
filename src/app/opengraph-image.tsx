import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The preview WhatsApp, LinkedIn and others show when someone shares a link to the site.
export const alt = "VX44 AI Monitoring: Your cameras see everything. Now someone's watching.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const poster = await readFile(join(process.cwd(), "public/footage/forecourt.jpg"));
const posterUrl = `data:image/jpeg;base64,${poster.toString("base64")}`;

const ink = "#05080f";
const gold = "#cfa23a";
const text = "#eef2f8";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: ink }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img
          src={posterUrl}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* ImageResponse doesn't support the inset shorthand, so the layer is sized explicitly. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            // ImageResponse only draws gradients from backgroundImage.
            backgroundImage: `linear-gradient(90deg, ${ink} 0%, rgba(5, 8, 15, 0.9) 45%, rgba(5, 8, 15, 0.35) 100%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: text, letterSpacing: -2 }}>
              VX<span style={{ color: gold }}>44</span>
            </div>
            <div style={{ fontSize: 22, letterSpacing: 6, color: "#a9b4c8" }}>AI MONITORING</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.08, color: text, letterSpacing: -2 }}>
              Your cameras see everything. Now someone’s watching.
            </div>
            <div style={{ marginTop: 28, fontSize: 28, color: "#a9b4c8" }}>
              AI monitoring for the cameras you already own.
            </div>
          </div>
          <div style={{ display: "flex", width: 120, height: 6, background: gold }} />
        </div>
      </div>
    ),
    size,
  );
}
