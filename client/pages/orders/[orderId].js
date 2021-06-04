import { useEffect, useState } from "react";
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState();
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: ()=> Router.push('/orders'),
  })
  useEffect(()=> {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft/1000));
    }
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return ()=>{
      clearInterval(timerId);
    }
  },[]);
  if (timeLeft <0) {
    return (
      <div>
        Order Expired
      </div>
    );
  }
  return (
    <div>
      <h1>Time left to pay: {timeLeft}</h1>
      <StripeCheckout 
        token={({ id })=> doRequest({token: id})}
        stripeKey='pk_test_51Ixq4pJOfi9pqP883mpAA7VqgH8O62E7wUFiavWGTzNLZlTJpouRXnyLLj8fdntIlDicJGiJfTEgan5Hciwj1rDl00Py280PId'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data }
}

export default OrderShow