import { notFound } from "next/navigation";
import ShopPage from "@/components/views/ShopView";
import { getCatalog, staticParams } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { brands } = await getCatalog();
  return staticParams(brands.map((b) => b.id), "brandId");
}

export async function generateMetadata({ params }) {
  const { brandId } = await params;
  const brand = (await getCatalog()).brands.find((b) => b.id === brandId);
  return brand ? { title: brand.name, openGraph: { title: brand.name } } : {};
}

export default async function Page({ params }) {
  const { brandId } = await params;
  if (!(await getCatalog()).brands.some((b) => b.id === brandId)) notFound();
  return <ShopPage brandId={brandId} />;
}
