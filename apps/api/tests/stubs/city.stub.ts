import { City } from "@app/stores";

export const cityStub = (): City => {
  return {
    id: "1234",
    name: "Київ",
    slug: "kyiv",
  };
};
