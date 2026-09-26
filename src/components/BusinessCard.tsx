import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import siteConfig from "@/config/siteConfig";
import type { BusinessCardHandle, BusinessCardProps, BusinessCardTemplate } from "@/types/components/BusinessCard.types";

// Real-world business-card ratio (3.5in x 2in) rendered at high enough
// resolution that the downloaded PNG still looks crisp when printed.
// Fixed size — the note (150 chars max) is laid out to always fit inside
// this, rather than growing the card.
const CARD_W = 1050;
const CARD_H = 600;
const NOTE_TEXT_X = 340;
const NOTE_MAX_WIDTH = CARD_W - NOTE_TEXT_X - 40;
// const NOTE_FONT = "italic 400 20px 'Segoe UI', Arial, sans-serif";
const NOTE_FONT = "400 20px 'Segoe UI', Arial, sans-serif";
const NOTE_LINE_HEIGHT = 27;
const NOTE_MAX_LINES = 3;

export const BUSINESS_CARD_TEMPLATES: BusinessCardTemplate[] = [
  { id: "classic",  label: "Classic Navy",  swatch: "linear-gradient(135deg, #0A2A43, #0A5B76)" },
  { id: "teal",     label: "Clean Teal",    swatch: "linear-gradient(135deg, #ffffff, #e6f3f6)" },
  { id: "gold",     label: "Elegant Gold",  swatch: "linear-gradient(135deg, #111111, #2b2b2b)" },
  { id: "gradient", label: "Modern Gradient", swatch: "linear-gradient(135deg, #0A5B76, #6C3FAE)" },
];

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const websiteLabel = siteConfig.productionUrl.replace(/^https?:\/\//, "");

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string, maxLines?: number): string[] {
  ctx.font = font;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // Safety net only — at 150 characters this basically never triggers, but
  // guarantees the note can never push into or past the footer watermark.
  if (maxLines && lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    let last = truncated[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    truncated[maxLines - 1] = `${last}…`;
    return truncated;
  }
  return lines;
}

function drawWatermark(ctx: CanvasRenderingContext2D, lightText: boolean) {
  // Large, faint, rotated site name across the whole card — the "watermark"
  // in the traditional sense — plus a small, fully legible footer line with
  // the actual URL, so the attribution is readable even at a glance.
  ctx.save();
  ctx.translate(CARD_W / 2, CARD_H / 2);
  ctx.rotate((-22 * Math.PI) / 180);
  ctx.globalAlpha = 0.08;
  // ctx.fillStyle = lightText ? "#ffffff" : "#000000";
  ctx.fillStyle = lightText ? "#ffffff35" : "#00000075";
  ctx.font = "700 92px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(siteConfig.companyName.toUpperCase(), 0, 0);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = lightText ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)";
  ctx.font = "500 20px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${siteConfig.companyName} · ${websiteLabel}`, CARD_W - 32, CARD_H - 24);
  ctx.restore();
}

function drawAvatar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, img: HTMLImageElement | null, name: string, ringColor: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = "#e6f3f6";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#0A5B76";
    ctx.font = "700 48px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials(name), cx, cy + 2);
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = ringColor;
  ctx.stroke();
  ctx.restore();
}

function draw(
  ctx: CanvasRenderingContext2D,
  { name, roleLabel, mobileNumber, email, easyId, theme }: BusinessCardProps,
  avatarImg: HTMLImageElement | null,
  noteLines: string[]
) {
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  let textColor = "#ffffff";
  let subColor = "rgba(255,255,255,0.75)";
  let accent = "#D4AF37";
  let lightWatermark = true;

  if (theme === "classic") {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, "#0A2A43");
    g.addColorStop(1, "#0A5B76");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    accent = "#D4AF37";
  } else if (theme === "teal") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = "#0A5B76";
    ctx.fillRect(0, 0, CARD_W, 150);
    textColor = "#111827";
    subColor = "#4B5563";
    accent = "#0A5B76";
    lightWatermark = false;
  } else if (theme === "gold") {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    accent = "#D4AF37";
    subColor = "rgba(212,175,55,0.75)";
  } else {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, "#0A5B76");
    g.addColorStop(1, "#6C3FAE");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    accent = "#ffffff";
  }

  // Thin border frame
  ctx.save();
  ctx.strokeStyle = theme === "teal" ? "#E5E7EB" : "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  roundRect(ctx, 6, 6, CARD_W - 12, CARD_H - 12, 18);
  ctx.stroke();
  ctx.restore();

  drawWatermark(ctx, lightWatermark);

  // Avatar
  // const cx = 180, cy = theme === "teal" ? 260 : 240, r = 110;
  const cx = 180, cy = theme === "teal" ? 280 : 240, r = 110;
  drawAvatar(ctx, cx, cy, r, avatarImg, name, accent);

  // Text block
  const textX = NOTE_TEXT_X;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = textColor;
  ctx.font = "700 46px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(name || "Your Name", textX, theme === "teal" ? 230 : 210);

  ctx.fillStyle = accent;
  ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(roleLabel, textX, theme === "teal" ? 268 : 248);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(textX, (theme === "teal" ? 268 : 248) + 18);
  ctx.lineTo(textX + 70, (theme === "teal" ? 268 : 248) + 18);
  ctx.stroke();

  const lines = [
    mobileNumber ? `Mobile :   ${mobileNumber}` : null,
    email        ? `Email    :   ${email}`        : null,
    easyId       ? `Agent ID : ${easyId}`       : null,
  ].filter(Boolean) as string[];

  ctx.fillStyle = subColor;
  ctx.font = "500 22px 'Segoe UI', Arial, sans-serif";
  const startY = (theme === "teal" ? 268 : 248) + 55;
  lines.forEach((line, i) => ctx.fillText(line, textX, startY + i * 34));

  // Company wordmark, top-right
  ctx.textAlign = "right";
  ctx.fillStyle = textColor;
  ctx.font = "700 26px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(siteConfig.companyName, CARD_W - 40, 60);

  // Personal note — own section below the Agent ID, only when present.
  // Fixed position sized to always clear the watermark footer: contact
  // lines end by ~411 at the latest (teal theme, all 3 lines shown), and
  // at NOTE_MAX_LINES=3 the note's last line lands at ~527 — comfortably
  // above the footer at CARD_H-24=576.
  if (noteLines.length) {
    const dividerY = 400;
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.01;
    ctx.beginPath();
    ctx.moveTo(textX, dividerY);
    ctx.lineTo(CARD_W - 40, dividerY);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = accent;
    // ctx.font = "600 15px 'Segoe UI', Arial, sans-serif";
    // ctx.fillText("IN THEIR OWN WORDS", textX, dividerY + 24);

    ctx.fillStyle = subColor;
    ctx.font = NOTE_FONT;
    const noteStartY = dividerY + 48;
    noteLines.forEach((line, i) => ctx.fillText(line, textX, noteStartY + i * NOTE_LINE_HEIGHT));
  }
}

const BusinessCard = forwardRef<BusinessCardHandle, BusinessCardProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? null,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noteLines = props.note ? wrapText(ctx, props.note, NOTE_MAX_WIDTH, NOTE_FONT, NOTE_MAX_LINES) : [];

    // profileImage is always a client-compressed base64 data URI (never a
    // remote URL — see models/User.js), so this never taints the canvas
    // and toDataURL() above stays usable without any CORS handling.
    if (props.profileImage) {
      const img = new Image();
      img.onload = () => draw(ctx, props, img, noteLines);
      img.src = props.profileImage;
    } else {
      draw(ctx, props, null, noteLines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.name, props.roleLabel, props.mobileNumber, props.email, props.easyId, props.profileImage, props.note, props.theme]);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md ${props.className ?? ""}`}>
      <canvas
        ref={canvasRef}
        width={CARD_W}
        height={CARD_H}
        className={`w-full h-auto block ${props.locked ? "blur-sm scale-[1.02]" : ""}`}
      />
      {props.locked && (
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <span className="bg-white/95 text-form-header text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full shadow">
            🔒 Locked preview
          </span>
        </div>
      )}
    </div>
  );
});

BusinessCard.displayName = "BusinessCard";
export default BusinessCard;
