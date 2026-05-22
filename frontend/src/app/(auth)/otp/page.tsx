"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Focus on first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    // take only the last character if user types more than 1 char
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // move focus to next box
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // focus previous input and clear it if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) return; // check if pasted data contains only numbers

    const pastedDigits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    pastedDigits.forEach((digit, i) => {
      newOtp[i] = digit;
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = digit;
      }
    });
    setOtp(newOtp);

    // focus last filled input or next empty
    const focusIndex = Math.min(pastedDigits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      // Mock Auth logic
      document.cookie = "grandline_auth=u1; path=/; max-age=86400";
      router.push("/find-team");
    }
  };

  const isComplete = otp.join("").length === 6;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-navy-700 text-center mb-2">ยืนยันรหัส OTP</h1>
      <p className="text-sm text-navy-400 text-center mb-8 leading-relaxed">
        กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-xs mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold rounded-xl border border-navy-200 text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all bg-gray-50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!isComplete}
          className={`w-full py-3 rounded-full font-bold transition-all shadow-md mt-4 ${
            isComplete
              ? "bg-[#1b3168] hover:bg-[#12234b] text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          ยืนยัน
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            alert("ส่งรหัส OTP ใหม่อีกครั้งแล้ว!");
            if (inputRefs.current[0]) inputRefs.current[0].focus();
          }}
          className="text-xs text-navy-500 hover:text-navy-700 font-semibold hover:underline"
        >
          ไม่ได้รับรหัส? ส่งใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
