import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart.store";

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds item to cart", () => {
    useCartStore.getState().addItem({
      productId: "p1",
      title: "Test Product",
      priceCents: 1000,
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("increments quantity for existing item", () => {
    const { addItem } = useCartStore.getState();
    addItem({ productId: "p1", title: "Test", priceCents: 1000 });
    addItem({ productId: "p1", title: "Test", priceCents: 1000 }, 2);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("calculates subtotal correctly", () => {
    const { addItem } = useCartStore.getState();
    addItem({ productId: "p1", title: "A", priceCents: 1000 }, 2);
    addItem({ productId: "p2", title: "B", priceCents: 500 }, 1);
    expect(useCartStore.getState().getSubtotalCents()).toBe(2500);
  });

  it("removes item from cart", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem({ productId: "p1", title: "Test", priceCents: 1000 });
    removeItem("p1");
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("sets quantity to zero removes item", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem({ productId: "p1", title: "Test", priceCents: 1000 });
    setQuantity("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
