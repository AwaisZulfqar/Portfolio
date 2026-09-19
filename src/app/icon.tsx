import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090a",
          color: "#f1f3f0",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: -1,
          borderRadius: 7,
        }}
      >
        HA
      </div>
    ),
    { ...size }
  );
}
