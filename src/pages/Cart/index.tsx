import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(
    (product): ProductFormatted => ({
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.price * product.amount),
    })
  );
  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      sumTotal += product.amount * product.price;
      return sumTotal;
    }, 0)
  );

  function handleProductIncrement(product: Product) {
    // TODO
  }

  function handleProductDecrement(product: Product) {
    // TODO
  }

  function handleRemoveProduct(productId: number) {
    // TODO
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((product) => {
            const { id, image, priceFormatted, title, subTotal, amount } =
              product;
            return (
              <tr data-testid="product" key={id}>
                <td>
                  <img src={image} alt={title} />
                </td>
                <td>
                  <strong>{title}</strong>
                  <span>{priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      // disabled={product.amount <= 1}
                      // onClick={() => handleProductDecrement()}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      // onClick={() => handleProductIncrement()}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    // onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
