import { LocalCategory } from "@app/categories";

export const localCategoryStub = (): LocalCategory => {
  return {
    name: "Овочі",
    slug: "vegetables",
    icon: "icons/vegetables.svg",
    stores: [
      {
        slug: "novus",
        id: "vegetables",
        tm: "&tm=without-brand",
      },
      {
        slug: "auchan",
        id: "vegetables-auchan",
        tm: "&tm=without-brand",
      },
      {
        slug: "eko",
        id: "vegetables-ekomarket",
        tm: "&tm=without-brand",
      },
      {
        slug: "silpo",
        id: "378",
      },
    ],
  };
};
