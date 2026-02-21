/**
 * Logic for the "Discovery" feed.
 *
 * The main SQL query here finds other users based on your preferences
 * like distance, age, and gender. It also sorts people by shared
 * interests and makes sure you don't see anyone you've already swiped on.
 */
import { Injectable } from '@nestjs/common';
import { FeedDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  async getFeed(
    user_id: string,
    limit: number,
    offset: number = 0,
  ): Promise<FeedDto[]> {
    return (await Bun.sql`
      SELECT
        u.user_id,
        u.full_name,
        extract(year from age(u.birth_date)) as age,
        u.bio,
        p.image_url as profile_picture_url,
        u.allow_messages_from_strangers,
        -- Calculate distance directly
        (
          earth_distance(
            ll_to_earth(u.latitude::float8, u.longitude::float8),
            ll_to_earth(me.latitude::float8, me.longitude::float8)
          ) / 1000
        )::float as distance_km,
        -- Match score
        (
          select count(*)
          from user_interests ui1
          join user_interests ui2 on ui1.interest_id = ui2.interest_id
          where ui1.user_id = u.user_id and ui2.user_id = me.user_id
        ) as match_score

      FROM users u
      JOIN users me ON me.user_id = ${user_id}
      LEFT JOIN photos p ON p.uploader_id = u.user_id AND p.is_primary = true

      WHERE
        u.user_id <> me.user_id
        AND u.is_active = true
        AND u.is_onboarded = true
        -- Gender check
        AND (
          me.pref_genders IS NULL OR 
          cardinality(me.pref_genders) = 0 OR 
          u.gender = ANY(me.pref_genders)
        )
        -- Age check
        AND extract(year from age(u.birth_date)) BETWEEN coalesce(me.pref_min_age, 18) AND coalesce(me.pref_max_age, 100)
        -- Distance check
        AND (
          u.latitude IS NULL OR me.latitude IS NULL OR
          earth_distance(
            ll_to_earth(u.latitude::float8, u.longitude::float8),
            ll_to_earth(me.latitude::float8, me.longitude::float8)
          ) / 1000 <= greatest(coalesce(me.pref_distance_radius_km, 50), 50)
        )
        -- Interaction exclusions
        AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.swiper_id = me.user_id AND s.receiver_id = u.user_id)
        AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = me.user_id AND b.blocked_id = u.user_id) OR (b.blocked_id = me.user_id AND b.blocker_id = u.user_id))
        AND NOT EXISTS (SELECT 1 FROM reports r WHERE (r.reporter_id = me.user_id AND r.reported_id = u.user_id) OR (r.reported_id = me.user_id AND r.reporter_id = u.user_id))

      ORDER BY
        match_score DESC,
        distance_km ASC

      LIMIT ${limit}
      OFFSET ${offset}
    `) as unknown as FeedDto[];
  }
}
