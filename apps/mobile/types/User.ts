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
