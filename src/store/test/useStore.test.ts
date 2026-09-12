// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { useStore, Watch } from "../useStore";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const mockWatch: Watch = {
  id: 1,
  name: "Rolex Submariner",
  brand: "Rolex",
  price: 15000,
  category: "Luxury",
  image: "rolex.jpg",
  images: [],
  movement: "Automatic",
  waterResistance: "300m",
  caseMaterial: "Oystersteel",
  warranty: "5 Years",
  caseSize: "41mm",
  description: "Classic luxury watch",
  stock: 5,
  rating: 4.8,
  reviews: 120,
  featured: true,
  new: true,
};

describe("Zustand useStore Unit Tests", () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.clear();
    }
    useStore.setState({
      cart: [],
      currentUser: null,
      isAuthenticated: false,
      searchQuery: "",
    });
    vi.restoreAllMocks();
  });

  it("should add item to cart", () => {
    useStore.getState().addToCart(mockWatch);

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].watch.id).toBe(1);
    expect(cart[0].quantity).toBe(1);
  });

  it("should increment quantity if same watch added twice", () => {
    useStore.getState().addToCart(mockWatch);
    useStore.getState().addToCart(mockWatch);

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("should remove item from cart", () => {
    useStore.getState().addToCart(mockWatch);
    useStore.getState().removeFromCart(1);

    const cart = useStore.getState().cart;
    expect(cart).toHaveLength(0);
  });

  it("should update search query state", () => {
    useStore.getState().setSearchQuery("Omega");
    expect(useStore.getState().searchQuery).toBe("Omega");
  });

  it("should clear authentication and cart on logout", () => {
    useStore.setState({
      isAuthenticated: true,
      currentUser: {
        id: 1,
        name: "Danish",
        email: "a@b.com",
        phone: "123",
        address: "",
        city: "",
        role: "user",
        createdAt: "",
      },
      cart: [{ watch: mockWatch, quantity: 1 }],
    });

    useStore.getState().logout();

    expect(useStore.getState().isAuthenticated).toBe(false);
    expect(useStore.getState().currentUser).toBeNull();
    expect(useStore.getState().cart).toHaveLength(0);
  });
});

import { vi } from "vitest";

it("should login user successfully on API success", async () => {
  // Global fetch API mock karein
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: "Danish", role: "user" }),
  } as Response);

  const res = await useStore.getState().login("test@email.com", "password123");

  expect(res.success).toBe(true);
  expect(useStore.getState().isAuthenticated).toBe(true);
});
