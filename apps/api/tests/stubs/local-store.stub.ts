import { LocalStore } from "@app/stores";

export const localStoreStub = (): LocalStore => {
  return {
    name: "Novus",
    slug: "novus",
    icon: "icons/novus.webp",
    cities: [
      {
        name: "Київ",
        slug: "kyiv",
        id: "48201029",
      },
    ],
  };
};
