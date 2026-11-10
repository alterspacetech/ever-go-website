import { notFound } from "next/navigation";
import ShopPage from "@/components/views/ShopView";
import { getCatalog, staticParams } from "@/lib/data";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { visibleGroups } = await getCatalog();
  return staticParams(visibleGroups.map((g) => g.id), "group");
}

export async function generateMetadata({ params }) {
  const { group } = await params;
  const found = (await getCatalog()).getGroup(group);
  return found ? { title: found.name, description: found.blurb, openGraph: { title: found.name, description: found.blurb } } : {};
}

export default async function Page({ params }) {
  const { group } = await params;
  if (!(await getCatalog()).getGroup(group)) notFound();
  return <ShopPage groupId={group} />;
}
