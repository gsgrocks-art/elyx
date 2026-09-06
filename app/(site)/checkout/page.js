import { getSettings } from "@/lib/settings";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const settings = getSettings();
  return <CheckoutForm shopWhatsappNumber={settings?.whatsappNumber} />;
}
