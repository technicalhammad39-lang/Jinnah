import { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Order Management | Jinnah Admin",
  description: "Manage customer orders.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
