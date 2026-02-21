import { SwipeCategory } from "@/types/SwipeCategory";

export interface User {
  user_id: string;
  full_name: string;
  age: number;
  bio: string;
  profile_picture_url: string | null;
  allow_messages_from_strangers: boolean;
}

export interface SwipedUser extends User {
  swipe_category: SwipeCategory;
}

export interface UserPrivate extends Partial<User> {
  full_name?: string;
  bio?: string;
  birth_date?: string;
  gender?: string;
  sexual_orientation?: string;
  pref_genders?: string[];
  pref_min_age?: number;
  pref_max_age?: number;
  pref_distance_radius_km?: number;
  allow_messages_from_strangers?: boolean;
  is_onboarded?: boolean;
  latitude?: number;
  longitude?: number;
}
