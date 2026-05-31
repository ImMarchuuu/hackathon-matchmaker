"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 mt-4">
      {/* ── Title ── */}
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-[#1b3168]">
          Terms of Service / ข้อตกลงการใช้งาน
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
            Introduction / บทนำ
          </h2>
          <p>
            Welcome to <strong>GrandLine Hackathon Team Matchmaking Platform</strong>. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
          </p>
          <p>
            ยินดีต้อนรับสู่ <strong>GrandLine Hackathon Team Matchmaking Platform</strong> การเข้าถึงหรือใช้งานแพลตฟอร์มของเรา ถือว่าคุณตกลงที่จะปฏิบัติตามและผูกพันตามข้อตกลงการใช้งานเหล่านี้ โปรดอ่านรายละเอียดอย่างละเอียดถี่ถ้วน
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              2
            </span>
            User Responsibilities / ความรับผิดชอบของผู้ใช้
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
            <li>You must not use the platform for any illegal or unauthorized purpose.</li>
            <li>You must not harass, abuse, or harm other builders or innovators.</li>
            <li>You must not spam or post misleading recruitment posts.</li>
          </ul>
          <p>
            คุณมีหน้าที่รับผิดชอบในการรักษาความลับของบัญชีผู้ใช้งาน และกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ คุณตกลงที่จะให้ข้อมูลที่ถูกต้อง เป็นปัจจุบัน และครบถ้วนในระหว่างการลงทะเบียนใช้งาน
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              3
            </span>
            Account & Recruiting Rules / กฎการใช้งานบัญชีและการหาทีม
          </h2>
          <p>
            Our platform connects people for hackathons. By posting or requesting to join a team, you agree to behave professionally and contribute productively. GrandLine reserves the right to suspend or terminate accounts that violate our community standards or engage in disruptive behavior.
          </p>
          <p>
            แพลตฟอร์มของเราเชื่อมโยงผู้คนเพื่อเข้าแข่งขัน Hackathon การโพสต์หาทีมหรือส่งคำขอเข้าร่วมทีม ถือว่าคุณตกลงที่จะประพฤติตนอย่างมืออาชีพและทำงานร่วมกับผู้อื่นอย่างสร้างสรรค์ GrandLine ขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ที่ละเมิดมาตรฐานชุมชนของเรา
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#1b3168] flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#1b3168] font-bold text-sm">
              4
            </span>
            Limitation of Liability / ข้อจำกัดความรับผิด
          </h2>
          <p>
            GrandLine is provided &quot;as is&quot; without warranties of any kind. We are not liable for any disagreements, intellectual property disputes, or project failures that occur within matchmaking teams. The team dynamics and hackathon projects are solely the responsibility of the participating individuals.
          </p>
          <p>
            GrandLine ให้บริการในลักษณะ &quot;ตามที่เป็นอยู่&quot; โดยไม่มีการรับประกันใดๆ เราจะไม่รับผิดชอบต่อความขัดแย้ง ข้อพิพาททางทรัพย์สินทางปัญญา หรือความล้มเหลวของโครงการที่เกิดขึ้นภายในทีมที่จับคู่กัน การบริหารงานภายในทีมและโครงการ Hackathon เป็นความรับผิดชอบส่วนบุคคลของผู้เข้าร่วมทั้งหมด
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
