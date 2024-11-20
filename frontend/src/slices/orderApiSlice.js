import { ORDERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get orders
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
      }),
      keepUnusedDataFor: 5,
    }),
    // placeOrder
    placeOrder: builder.mutation({
      query: (data) => ({
        url: ORDERS_URL,
        method: "POST",
        body: data,
      }),
      keepUnusedDataFor: 5,
    }),
    // get single order
    getSingleOrder: builder.query({
      query: (id) => ({
        url: ORDERS_URL + "/" + id,
      }),
      keepUnusedDataFor: 5,
    }),
    doPayment: builder.mutation({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}/payment`,
        method: "POST",
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetSingleOrderQuery,
  useDoPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
} = orderApiSlice;
