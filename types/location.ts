export type LocationType =
  | "home"
  | "office"
  | "apartment"
  | "residential"
  | "open space"
  | "building"
  | "restaurant"
  | "hospital"
  | "mall"
  | "park"
  | "public facility"
  | "parking area"
  | "playground"
  | "toilet"
  | "other";

export type AgeGroupType =
  | "infant"
  | "toddler"
  | "preschool"
  | "pratama"
  | "madya"
  | "tunas"
  | "teens"
  | "youth"
  | "young adult"
  | "adult"
  | "senior"
  | "all";

export interface IProvince {
  id?: number;
  name?: string;
}

export interface ICity {
  id?: number;
  province_id?: number;
  province?: IProvince;
  name?: string;
}

export interface IDistrict {
  id?: number;
  city_id?: number;
  city?: ICity;
  name?: string;
  alias?: string;
}

export interface ILocation {
  id?: number;
  name: string;
  type: LocationType;
  address: string;
  description?: string;
  city_id?: string;
  city?: ICity;
  district_id?: string;
  district?: IDistrict;
  province_id?: string;
  province?: IProvince;
  postal_code?: string;
  age_group?: AgeGroupType;
  capacity?: number;
  long_lat?: string[];
  is_private?: boolean;
  is_open?: boolean;
}

export interface IPayloadLocation extends Omit<ILocation, "id"> {
  id?: number | undefined;
}
