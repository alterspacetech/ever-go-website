import { notFound } from "next/navigation";
import ProductView from "@/components/views/ProductView";
import { minPrice } from "@/lib/catalog";
import { getCatalog, staticParams } from "@/lib/data";
import { imageUrl, money } from "@/lib/format";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return staticParams(products.map((p) => p.id), "id");
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = (await getCatalog()).byId[id];
  if (!product) return {};

  const price = `${product.variants.length > 1 ? "From " : ""}${money(minPrice(product))}`;
  const description = [price, product.desc].filter(Boolean).join(". ");
  const image = imageUrl(product.photo, 1200);

  return {
    title: product.name,
    description,
    openGraph: { title: `${product.name} | ${price}`, description, type: "website", ...(image ? { images: [{ url: image, width: 1200, height: 1200 }] } : {}) },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  if (!(await getCatalog()).byId[id]) notFound();
  return <ProductView key={id} id={id} />;
}
