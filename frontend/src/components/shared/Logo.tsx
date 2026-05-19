import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center select-none active:scale-95 transition-transform">
      <img 
        src="/Logo.svg" 
        alt="Grand Line Logo" 
        className="w-48 sm:w-64 h-auto object-contain drop-shadow-md"
      />
    </Link>
  );
}