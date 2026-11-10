import { defineField, defineType } from "sanity";

export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Brand name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Link name", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
  ],
});
