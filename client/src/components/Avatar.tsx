// ─── Avatar Component ────────────────────────────────────────────────────────
// Shows a gradient circle with the player's emoji & initial.

import React from "react";
import { getAvatarColors, getAvatarEmoji } from "../utils/avatar";

type AvatarProps = {
  name: string;
  size?: number;        // diameter in px, default 40
  showName?: boolean;   // show name below avatar
  isDrawer?: boolean;   // show pencil badge
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  showName = false,
  isDrawer = false,
}) => {
  const [from, to] = getAvatarColors(name);
  const emoji = getAvatarEmoji(name);
  const fontSize = size * 0.42;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Gradient circle */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${from}, ${to})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            boxShadow: `0 2px 8px ${from}55`,
            border: "2px solid rgba(255,255,255,0.6)",
            userSelect: "none",
          }}
        >
          {emoji}
        </div>

        {/* Pencil badge for the drawer */}
        {isDrawer && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              background: "#FFD93D",
              borderRadius: "50%",
              width: size * 0.38,
              height: size * 0.38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: size * 0.22,
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            ✏️
          </div>
        )}
      </div>

      {showName && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#4a5568",
            maxWidth: size + 16,
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
};

export default Avatar;