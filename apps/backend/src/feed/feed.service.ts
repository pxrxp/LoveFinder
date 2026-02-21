import { Injectable } from '@nestjs/common';
import { FeedDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  async getFeed(
    user_id: string,
    limit: number,
    offset: number = 0,
  ): Promise<FeedDto[]> {
    return Array.from(
      await Bun.sql`
      with
      me as (
        select *
        from users
        where user_id = ${user_id}
      ),

      distances as (
        select
          u.user_id,
          case 
            when u.latitude is null or me.latitude is null then 0
            else (
              earth_distance(
                ll_to_earth(u.latitude, u.longitude),
                ll_to_earth(me.latitude, me.longitude)
              ) / 1000
            )
          end::float as distance_km
        from users u, me
      ),

      interest_match as (
        select
          a.user_id,
          count(*) as match_score
        from user_interests a
        join user_interests b
          on a.interest_id = b.interest_id
        join me
          on b.user_id = me.user_id
        group by a.user_id
      )

      select
        other.user_id,
        other.full_name,
        extract(year from age(other.birth_date)) as age,
        other.bio,
        photos.image_url as profile_picture_url,
        other.allow_messages_from_strangers

      from users other
      join me on true
      left join photos
        on photos.uploader_id = other.user_id
       and photos.is_primary = true
      join distances
        on distances.user_id = other.user_id
      left join interest_match
        on interest_match.user_id = other.user_id

      where
        other.user_id <> me.user_id
        and other.is_active = true
        and other.is_onboarded = true
        and (me.pref_genders is null or other.gender = any (me.pref_genders))
        and extract(year from age(other.birth_date)) between coalesce(me.pref_min_age, 18) and coalesce(me.pref_max_age, 100)
        and (
            (other.latitude is null or me.latitude is null) 
            or distances.distance_km <= greatest(coalesce(me.pref_distance_radius_km, 50), 50)
        )
        and not exists (
          select 1 from swipes s 
          where s.swiper_id = me.user_id and s.receiver_id = other.user_id
        )
        and not exists (
          select 1 from blocks b 
          where (b.blocker_id = me.user_id and b.blocked_id = other.user_id)
             or (b.blocker_id = other.user_id and b.blocked_id = me.user_id)
        )
        and not exists (
          select 1 from reports r 
          where (r.reporter_id = me.user_id and r.reported_id = other.user_id)
             or (r.reporter_id = other.user_id and r.reported_id = me.user_id)
        )

      order by
        coalesce(interest_match.match_score, 0) desc,
        distances.distance_km asc

      limit ${limit}
      offset ${offset}
    `,
    );
  }
}
