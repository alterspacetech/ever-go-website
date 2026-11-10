import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Site section",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Link name", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "arabicName", title: "Arabic name", type: "string" }),
    defineField({ name: "blurb", title: "Short description", type: "text", rows: 2 }),
    defineField({ name: "illustration", title: "Placeholder drawing", description: "Shown for products with no photo.", type: "string", options: { list: [{ title: "Perfume bottle", value: "perfume" }, { title: "Oil bottle", value: "attar" }, { title: "Burner", value: "burner" }, { title: "Bowl", value: "chips" }, { title: "Jar", value: "jar" }, { title: "Ball", value: "ball" }] } }),
    defineField({ name: "sortOrder", title: "Position", type: "number" }),
  ],
  orderings: [{ title: "Position", name: "position", by: [{ field: "sortOrder", direction: "asc" }] }],
});