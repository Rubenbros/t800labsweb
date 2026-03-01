import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "T800 Labs — Software Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(229,9,20,0.15) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0px",
              fontSize: "96px",
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            <span style={{ color: "#ffffff" }}>T800</span>
            <span style={{ color: "#e50914" }}>Labs</span>
          </div>
          <div
            style={{
              width: "120px",
              height: "2px",
              backgroundColor: "#e50914",
            }}
          />
          <div
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            Software Development
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "16px",
              fontSize: "16px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em",
            }}
          >
            <span>Web Apps</span>
            <span style={{ color: "rgba(229,9,20,0.5)" }}>|</span>
            <span>AI Integration</span>
            <span style={{ color: "rgba(229,9,20,0.5)" }}>|</span>
            <span>Mobile</span>
            <span style={{ color: "rgba(229,9,20,0.5)" }}>|</span>
            <span>Cloud</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.05em",
          }}
        >
          t800labs.com
        </div>
      </div>
    ),
    { ...size }
  );
}
