import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  QrCode,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Copy,
  Building,
  GraduationCap,
  Calendar,
  Heart,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { campusStore } from "@/lib/campus-store";

interface DigitalCampusIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCampusIdModal: React.FC<DigitalCampusIdModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const state = campusStore.getState();
  const idCard = state.digitalId;
  const user = state.currentUser;

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(idCard.qrVerificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1A3C6E] to-[#F2A93B] text-white shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Digital Campus ID Card
              </h2>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> GSFC University Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Body with Flip Support */}
        <div className="p-6">
          {!isFlipped ? (
            /* Front of the ID Card */
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0e2547] via-[#14325e] to-[#0a182d] p-5 text-white shadow-2xl">
              {/* Holographic watermarks & glow accents */}
              <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#F2A93B]/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

              {/* University Branding */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-md">
                    <img
                      src="/gsfc-logo.png"
                      alt="GSFC University"
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs font-black text-[#1A3C6E]">GSFC</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-[#F2A93B] uppercase">
                      GSFC UNIVERSITY
                    </h3>
                    <p className="text-[10px] text-slate-300 font-medium">
                      Vadodara, Gujarat · Student Smart Pass
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ACTIVE
                </div>
              </div>

              {/* Photo & Primary Details */}
              <div className="mt-4 flex gap-4 items-center">
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar || idCard.photoUrl}
                    alt={idCard.name}
                    className="h-20 w-20 rounded-2xl border-2 border-[#F2A93B]/80 object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-600 p-1 text-white shadow">
                    <ShieldCheck className="h-3 w-3" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-lg font-black text-white tracking-wide">
                    {user.name || idCard.name}
                  </h4>
                  <div className="mt-0.5 inline-block rounded-md bg-[#F2A93B]/20 border border-[#F2A93B]/40 px-2 py-0.5 text-xs font-mono font-bold text-[#F2A93B]">
                    {user.rollNo || idCard.rollNo}
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-300 font-medium flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                    {idCard.program}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {user.department || idCard.department} · Sem {user.semester || idCard.semester}
                  </p>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-black/30 p-2.5 text-[11px] border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-semibold text-rose-300 flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-400" /> {idCard.bloodGroup}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Valid Until</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" /> {idCard.validTill}
                  </span>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="mt-3 flex flex-col items-center justify-center rounded-xl bg-white p-2 text-slate-900 shadow-inner">
                {/* Simulated GSFC Barcode */}
                <div className="flex h-8 w-full items-center justify-center gap-0.5 px-2">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 2, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="h-full bg-black rounded-[0.5px]"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    )
                  )}
                </div>
                <span className="mt-1 font-mono text-[10px] font-bold tracking-widest text-slate-700">
                  *{user.rollNo || idCard.barcode}*
                </span>
              </div>
            </div>
          ) : (
            /* Back of ID Card — Security Verification QR & Authenticator */
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0a182d] via-[#14325e] to-[#0e2547] p-5 text-white shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2 text-[#F2A93B]">
                <QrCode className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Campus Verification Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                Scan this QR code at campus entry gates, library turnstiles, and examination halls for real-time authentication.
              </p>

              {/* Dynamic QR Box */}
              <div className="relative rounded-2xl bg-white p-4 shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(idCard.qrVerificationCode)}&color=0e2547`}
                  alt="Security QR"
                  className="h-36 w-36 rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-8 w-8 rounded-full bg-[#1A3C6E] border-2 border-white flex items-center justify-center text-[9px] font-black text-[#F2A93B] shadow">
                    GSFC
                  </div>
                </div>
              </div>

              <div className="mt-3 w-full rounded-xl bg-black/40 p-2.5 text-left border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Digital Signature:</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy Token"}
                  </button>
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-slate-300">
                  {idCard.qrVerificationCode}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <RefreshCw className="h-4 w-4 text-[#F2A93B]" />
              {isFlipped ? "View Front Pass" : "View Security QR"}
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#255294] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all border border-blue-400/30"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy ID"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
