import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`stock/${productId}`);

      const existingCartProduct = cart.find(
        (cartProduct) => cartProduct.id === productId
      );

      let updatedCart;

      if (existingCartProduct) {
        const amount = existingCartProduct.amount + 1;

        if (amount > stock.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        updatedCart = cart.map((product) => {
          return product.id === productId ? { ...product, amount } : product;
        });

        setCart(updatedCart);
      } else {
        const { data: product } = await api.get(`products/${productId}`);
        updatedCart = [...cart, { ...product, amount: 1 }];
        setCart(updatedCart);
      }

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find((product) => productId === product.id);

      if (!productExists) {
        throw new Error("O produto não existe no carrinho");
      }

      const updatedCart = cart.filter((product) => product.id !== productId);
      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        throw new Error("Operação inválida");
      }

      const {
        data: { amount: stockAmount },
      } = await api.get(`stock/${productId}`);

      if (stockAmount < amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = cart.map((product) => {
        return product.id === productId ? { ...product, amount } : product;
      });

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
