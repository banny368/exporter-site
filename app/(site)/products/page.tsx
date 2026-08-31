import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { ProductsBody } from "@/components/pages/products-body";

export const metadata: Metadata = {
  title: "Product catalogue",
  description:
    "Full export catalogue: fresh produce, dehydrated products and spices, and solid wood furniture. HS code, grade, packing, MOQ and loadability per item.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/products/"),
};

export default function ProductsPage() {
  return <ProductsBody />;
}
