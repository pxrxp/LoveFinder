import { Injectable } from '@nestjs/common';
import { FeedDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  async getFeed(user_id: string, limit: number): Promise<FeedDto[]> {
    return Array.from(
      await Bun.sql`

        WITH
        ME AS (
          SELECT *
          FROM USERS
          WHERE USER_ID = ${user_id}
        ),

        AGES AS (
          SELECT
            USER_ID,
            EXTRACT(YEAR FROM AGE(BIRTH_DATE)) AS AGE
          FROM USERS
        ),

        DISTANCES AS (
          SELECT
            U.USER_ID,
            (
              EARTH_DISTANCE(
                LL_TO_EARTH(U.LATITUDE, U.LONGITUDE),
                LL_TO_EARTH(ME.LATITUDE, ME.LONGITUDE)
              ) / 1000
            )::NUMERIC(5,1) AS DISTANCE_KM
          FROM USERS U, ME
        ),

        INTEREST_MATCH AS (
          SELECT
            A.USER_ID,
            COUNT(*) AS MATCH_SCORE
          FROM USER_INTERESTS A
          JOIN USER_INTERESTS B
            ON A.INTEREST_ID = B.INTEREST_ID
          JOIN ME
            ON B.USER_ID = ME.USER_ID
          GROUP BY A.USER_ID
        )

        SELECT
          OTHER.USER_ID,
          OTHER.FULL_NAME,
          AGES.AGE,
          OTHER.BIO,
          PHOTOS.IMAGE_URL,
          OTHER.ALLOW_MESSAGES_FROM_STRANGERS

        FROM USERS OTHER

        JOIN ME ON TRUE

        JOIN AGES
          ON AGES.USER_ID = OTHER.USER_ID

        JOIN PHOTOS
          ON PHOTOS.UPLOADER_ID = OTHER.USER_ID
         AND PHOTOS.IS_PRIMARY = TRUE

        JOIN DISTANCES
          ON DISTANCES.USER_ID = OTHER.USER_ID

        LEFT JOIN INTEREST_MATCH
          ON INTEREST_MATCH.USER_ID = OTHER.USER_ID

        WHERE
          OTHER.USER_ID <> ME.USER_ID

          AND OTHER.IS_ACTIVE = TRUE

          AND OTHER.GENDER = ANY (ME.PREF_GENDERS)

          AND AGES.AGE BETWEEN ME.PREF_MIN_AGE AND ME.PREF_MAX_AGE

          AND DISTANCES.DISTANCE_KM <= ME.PREF_DISTANCE_RADIUS_KM

          AND NOT EXISTS (
            SELECT 1
            FROM SWIPES S
            WHERE S.SWIPER_ID = ME.USER_ID
              AND S.RECEIVER_ID = OTHER.USER_ID
          )

          AND NOT EXISTS (
            SELECT 1
            FROM BLOCKS B
            WHERE
              (B.BLOCKER_ID = ME.USER_ID AND B.BLOCKED_ID = OTHER.USER_ID)
              OR
              (B.BLOCKER_ID = OTHER.USER_ID AND B.BLOCKED_ID = ME.USER_ID)
          )

          AND NOT EXISTS (
            SELECT 1
            FROM REPORTS R
            WHERE
              (R.REPORTER_ID = ME.USER_ID AND R.REPORTED_ID = OTHER.USER_ID)
              OR
              (R.REPORTER_ID = OTHER.USER_ID AND R.REPORTED_ID = ME.USER_ID)
          )

        ORDER BY
          COALESCE(INTEREST_MATCH.MATCH_SCORE, 0) DESC,
          (OTHER.SEXUAL_ORIENTATION = ME.SEXUAL_ORIENTATION) DESC,
          DISTANCES.DISTANCE_KM ASC

        LIMIT ${limit}

      `
    );
  }
}
