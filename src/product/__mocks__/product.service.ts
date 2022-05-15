import { productStub } from "../test/stubs/product.stub";

export const ProductService = jest.fn().mockReturnValue({
  getProduct: jest.fn().mockResolvedValue(productStub()),
});
