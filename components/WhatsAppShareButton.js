"use client";

import { buildShareUrl } from "@/lib/whatsapp";

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.766.46 3.492 1.334 5.012L2 22l5.126-1.317A9.958 9.958 0 0012.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.169a8.14 8.14 0 01-4.152-1.135l-.298-.176-3.043.782.813-2.968-.194-.305a8.15 8.15 0 01-1.256-4.368c0-4.506 3.667-8.169 8.13-8.169 4.462 0 8.129 3.663 8.129 8.169 0 4.505-3.667 8.17-8.13 8.17z" />
  </svg>
);

export default function WhatsAppShareButton({
  message,
  path,
  className,
  label = "Share on WhatsApp",
}) {
  const handleClick = () => {
    const link = path ? `${window.location.origin}${path}` : "";
    const fullMessage = link ? `${message}\n${link}` : message;
    const url = buildShareUrl(fullMessage);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      }
    >
      <WhatsAppIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
