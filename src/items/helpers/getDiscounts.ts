import axios from 'axios';
import { DiscountedItems } from '../itemList';

export default async function getDiscounts(): Promise<DiscountedItems | null> {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/get-discounts`);
    return res.data as DiscountedItems;
  } catch (e) {
    return null;
  }
}
