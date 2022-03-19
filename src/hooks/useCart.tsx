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
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`stock/${productId}`);

      const existingCartProduct = cart.find(
        (cartProduct) => cartProduct.id === productId
      );

      if (existingCartProduct) {
        const amount = existingCartProduct.amount + 1;

        if (amount > stock.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        const addNewProduct = cart.map((product) => {
          return product.id === productId ? { ...product, amount } : product;
        });

        setCart(addNewProduct);
      } else {
        const { data: product } = await api.get(`products/${productId}`);
        setCart([...cart, { ...product, amount: 1 }]);
      }
    } catch {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter((product) => product.id !== productId);
      setCart(updatedCart);
    } catch {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        throw new Error("Inválido");
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
    } catch {
      toast.error("Ocorreu um erro inesperado");
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
