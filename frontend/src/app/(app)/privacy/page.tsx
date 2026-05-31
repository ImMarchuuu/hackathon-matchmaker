"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 mt-4">
      {/* ── Title ── */}
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-[#1b3168]">
          Privacy Policy / นโยบายความเป็นส่วนตัว
        </h1>
        <p className="text-gray-500 text-sm mt-2">Last updated: May 29, 2026</p>
      </div>

      {/* ── Content ── */}
      <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              1
            </span>
            Data Collection / การเก็บรวบรวมข้อมูล
          </h2>
          <p>
            We collect personal data to enable core matchmaking features. This includes:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
            <li><strong>Account Data:</strong> Username, email address, password.</li>
            <li><strong>Profile Information:</strong> Bio, skills, roles, avatar and cover images.</li>
            <li><strong>Social Integration:</strong> GitHub and LinkedIn URLs provided by you.</li>
          </ul>
          <p>
            เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเพื่อเปิดใช้งานระบบการจับคู่ทีมขั้นพื้นฐาน ซึ่งรวมถึงข้อมูลบัญชีผู้ใช้ (ชื่อผู้ใช้, อีเมล, รหัสผ่าน), ข้อมูลโปรไฟล์ส่วนตัว (แนะนำตัว, ทักษะ, บทบาท, รูปภาพโปรไฟล์และรูปภาพปก) รวมถึงบัญชีเชื่อมต่อภายนอก (GitHub, LinkedIn)
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              2
            </span>
            How We Use Your Data / วิธีการใช้ข้อมูลของคุณ
          </h2>
          <p>
            The collected data is used exclusively to connect you with other developers and innovators.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
            <li>To display your professional skills and interests in FIND TEAM.</li>
            <li>To allow other users to send team join requests.</li>
            <li>To send notifications about team updates and match suggestions.</li>
          </ul>
          <p>
            ข้อมูลที่รวบรวมจะถูกนำมาใช้งานเพื่อเชื่อมต่อคุณเข้ากับนักพัฒนาและนวัตกรคนอื่นๆ เพื่อวัตถุประสงค์ในการทำทีมแข่งขัน Hackathon เท่านั้น เช่น การแสดงความสามารถและสิ่งที่คุณสนใจในหน้ารวมผู้ใช้, การส่งคำขอเข้าร่วมทีม และการแจ้งเตือนต่างๆ เกี่ยวกับสถานะทีมของคุณ
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              3
            </span>
            Data Protection / การป้องกันข้อมูล
          </h2>
          <p>
            We implement high-standard security controls to protect your data from unauthorized access, disclosure, or alteration. Password hashing and encrypted communication channels are utilized across our system architecture.
          </p>
          <p>
            เราดำเนินการตามมาตรฐานความปลอดภัยระดับสูงเพื่อปกป้องข้อมูลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต การเปิดเผย หรือการเปลี่ยนแปลง โดยใช้การเข้ารหัสผ่านทางคณิตศาสตร์ (Password Hashing) และช่องทางการสื่อสารข้อมูลแบบเข้ารหัสทั่วทั้งสถาปัตยกรรมระบบของเรา
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              4
            </span>
            User Rights / สิทธิ์ของคุณ
          </h2>
          <p>
            You have full control over your data on GrandLine. At any time, you can:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
            <li>Edit your profile, skills, and settings.</li>
            <li>Turn off public profile visibility in Settings page.</li>
            <li>Request account and data deletion from our platform.</li>
          </ul>
          <p>
            คุณมีสิทธิ์ในการควบคุมข้อมูลส่วนบุคคลของคุณใน GrandLine อย่างสมบูรณ์ โดยคุณสามารถแก้ไขข้อมูลโปรไฟล์ ทักษะ และการตั้งค่าส่วนบุคคลได้ตลอดเวลา, ปิดการแสดงโปรไฟล์ของคุณไม่ให้ปรากฏในหน้าสาธารณะ หรือร้องขอให้เราลบบัญชีและข้อมูลทั้งหมดออกจากระบบได้ทันที
          </p>
        </section>
      </div>

      {/* ── Footer Link ── */}
      <div className="border-t border-gray-100 pt-8 mt-12 flex justify-center sm:justify-start">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1b3168] text-white font-bold text-sm hover:bg-[#12224f] transition-all shadow-md active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Settings / กลับไปที่การตั้งค่า
        </Link>
      </div>
    </div>
  );
}
