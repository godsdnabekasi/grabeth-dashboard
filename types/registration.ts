import { IEvent, IEventBooking, IEventCategory } from "@/types/event";
import { IPayment } from "@/types/payment";
import { IUser } from "@/types/user";

export interface IRegistration {
  id?: number;
  event_id: number;
  event?: IEvent;
  user_id: string;
  user?: IUser;
  total_price: number;
  status?: IRegistrationStatus;
  created_at?: string;
}

export interface IRegistrationCategories {
  registration_id: number;
  registration?: IRegistration;
  event_category_id: number;
  event_categories?: IEventCategory;
  event_booking_id: number;
  event_bookings?: IEventBooking;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface IRegistrationPayment {
  registration_id: number;
  registration?: IRegistration;
  payment_id: string;
  payment?: IPayment;
}

export type IRegistrationStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled";
