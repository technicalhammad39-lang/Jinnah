import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout | Jinnah Hardware Store",
  description: "Complete your purchase securely. Enjoy fast delivery and premium service with Jinnah Hardware Store.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
