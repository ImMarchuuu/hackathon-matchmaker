export default function Footer() {
  return (
    <footer className="mt-auto bg-theme-gradient text-center py-10 px-4">
      <div className="flex items-center justify-center gap-4 text-sm text-white mb-4">
        <a href="/terms" className="hover:text-navy-100 transition-colors">
          ข้อตกลงการใช้งาน
        </a>
        <span>|</span>
        <a href="/privacy" className="hover:text-navy-100 transition-colors">
          นโยบายความเป็นส่วนตัว
        </a>
      </div>
      <p className="text-sm text-white/90">2025 GrandLine. All right reserved.</p>
    </footer>
  );
}
