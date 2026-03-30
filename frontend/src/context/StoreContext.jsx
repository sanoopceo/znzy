import * as React from 'react';

export const StoreContext = React.createContext();

const initialState = {
  userInfo: localStorage.getItem('userInfo') ? (() => {
    try {
      const u = JSON.parse(localStorage.getItem('userInfo'));
      return u && u.token ? u : null; // Validation
    } catch (e) {
      return null;
    }
  })() : null,
  cartItems: localStorage.getItem('cartItems') ? (() => {
    try {
      const items = JSON.parse(localStorage.getItem('cartItems'));
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  })() : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? (() => {
    try {
      return JSON.parse(localStorage.getItem('shippingAddress'));
    } catch (e) {
      return {};
    }
  })() : {},
  theme: localStorage.getItem('theme') || 'light'
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, userInfo: action.payload };
    case 'USER_LOGOUT':
      return { ...state, userInfo: null, cartItems: [], shippingAddress: {} };
    case 'CART_ADD_ITEM':
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product && x.variantId === item.variantId);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.product === existItem.product && x.variantId === existItem.variantId ? item : x
          ),
        };
      } else {
        return { ...state, cartItems: [...state.cartItems, item] };
      }
    case 'CART_REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => !(x.product === action.payload.product && x.variantId === action.payload.variantId)),
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };
    case 'CART_CLEAR_ITEMS':
      return { ...state, cartItems: [] };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
}

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  React.useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  React.useEffect(() => {
    localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
  }, [state.userInfo]);

  const value = { state, dispatch };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
