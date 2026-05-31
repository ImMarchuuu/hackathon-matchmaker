"use client";

import { useState } from "react";

interface JoinRequestModalProps {
  teamTitle: string;
  availableRoles: string[];
  availableSkills: string[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (roles: string[], skills: string[]) => void;
}

export default function JoinRequestModal({
  teamTitle,
  availableRoles,
  availableSkills,
  saving,
  onClose,
  onSubmit,
}: JoinRequestModalProps) {
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#1b3168]">ขอเข้าร่วมทีม</h2>
            <p className="text-sm text-gray-500 mt-0.5">{teamTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Roles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">
            ตำแหน่งที่ต้องการ <span className="text-red-500 font-bold">*</span>{" "}
            <span className="text-gray-400 font-normal normal-case">(เลือกอย่างน้อย 1 อัน)</span>
          </label>
          {availableRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((r) => {
                const sel = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggle(r, roles, setRoles)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${sel ? "bg-[#1b3168] text-white border-[#1b3168]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1b3168] hover:text-[#1b3168]"}`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs italic">ทีมนี้ไม่ได้ระบุตำแหน่งที่เปิดรับ</p>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#1b3168] uppercase tracking-wide">
            ทักษะที่นำเสนอ <span className="text-gray-400 font-normal normal-case">(เลือกได้หลายอัน)</span>
          </label>
          {availableSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((s) => {
                const sel = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s, skills, setSkills)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${sel ? "bg-[#2c52ed] text-white border-[#2c52ed]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2c52ed] hover:text-[#2c52ed]"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs italic">ทีมนี้ไม่ได้ระบุทักษะที่ต้องการ</p>
          )}
        </div>

        {roles.length === 0 && availableRoles.length > 0 && (
          <p className="text-red-500 text-xs font-semibold -mt-2">กรุณาเลือกตำแหน่งอย่างน้อย 1 อัน</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => onSubmit(roles, skills)}
            disabled={saving || (availableRoles.length > 0 && roles.length === 0)}
            className="flex-1 py-3 rounded-full bg-[#1b3168] text-white text-sm font-bold hover:bg-[#12224f] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "กำลังส่ง…" : "ส่งคำขอ"}
          </button>
        </div>
      </div>
    </div>
  );
}
