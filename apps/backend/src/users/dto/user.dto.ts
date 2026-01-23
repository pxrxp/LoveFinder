export class UserDto {
  user_id!: string;
  email!: string;
  password_hash!: string;
  full_name!: string;
  gender!: string;
  sexual_orientation!: string;
  birth_date!: Date;
  bio!: string;
  created_at!: Date;
  pref_genders!: string;
  pref_min_age!: number;
  pref_max_age!: number;
  pref_distance_radius!: number;
  is_active!: number;
  allow_messages_from_strangers!: boolean;
};
