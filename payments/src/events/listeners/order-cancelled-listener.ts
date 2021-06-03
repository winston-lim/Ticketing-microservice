import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@winston-test/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { id, version } = data;
    const order = await Order.findOne({
      _id: id,
      version: version - 1,
    });
    if (!order) throw new Error('Order not found');
    order.set({
      status: OrderStatus.Cancelled,
    });
    try {
      await order.save();
      msg.ack();
    } catch(e) {
      console.log(e);
      throw e;
    }
  }
}