import type { Metadata } from "next";
import { PaymentQrApp } from "@/components/payment-qr-app";

export const metadata: Metadata = {
  title: "QR platba",
  description: "Jednoducha responzivni aplikace pro generovani platebnich QR kodu Charlieczech."
};

export default function PaymentQrPage() {
  return <PaymentQrApp />;
}
