import { Injectable } from '@nestjs/common';
import { FeedDto } from './dto/feed.dto';

@Injectable()
export class FeedService {
  async getFeed(user_id: string, limit: number): Promise<FeedDto[]> {
    return Array.from(
      await Bun.sql`

        WITH
          	ME AS (
            		SELECT
              			*
            		FROM
              			USERS U
            		WHERE
              			U.USER_ID = ${user_id}
          	),
          	AGES AS (
          		SELECT
            			U.USER_ID,
            			EXTRACT(
              				YEAR
              				FROM
                					AGE (U.BIRTH_DATE)
            			) AS AGE
          		FROM
            			USERS U
          	),
          	DISTANCES AS (
          		SELECT
            			U.USER_ID,
            			(
              				EARTH_DISTANCE (
                					LL_TO_EARTH (U.LATITUDE, U.LONGITUDE),
                					LL_TO_EARTH (ME.LATITUDE, ME.LONGITUDE)
              				) / 1000
            			)::NUMERIC(5, 1) AS DISTANCE_KM
          		FROM
            			USERS U,
            			ME
          	),
          	INTEREST_MATCH AS (
          		SELECT
            			A.USER_ID,
            			COUNT(*) AS MATCH_SCORE
          		FROM
            			USER_INTERESTS A,
            			USER_INTERESTS B,
            			ME
          		WHERE
            			A.INTEREST_ID = B.INTEREST_ID
            			AND B.USER_ID = ME.USER_ID
          		GROUP BY
            			A.USER_ID
          	)
        SELECT
          	OTHER.USER_ID,
          	OTHER.FULL_NAME,
          	AGES.AGE,
          	OTHER.BIO,
          	PHOTOS.IMAGE_URL,
          	OTHER.ALLOW_MESSAGES_FROM_STRANGERS
        FROM
          	USERS OTHER
          	INNER JOIN ME ON OTHER.USER_ID <> ME.USER_ID
          	INNER JOIN AGES ON AGES.USER_ID = OTHER.USER_ID
          	INNER JOIN PHOTOS ON (
            		PHOTOS.UPLOADER_ID = OTHER.USER_ID
            		AND PHOTOS.IS_PRIMARY = TRUE
          	)
          	INNER JOIN DISTANCES ON DISTANCES.USER_ID = OTHER.USER_ID
          	LEFT OUTER JOIN INTEREST_MATCH ON INTEREST_MATCH.USER_ID = OTHER.USER_ID
        WHERE
          	OTHER.IS_ACTIVE = TRUE
          	AND OTHER.GENDER = ANY (ME.PREF_GENDERS)
          	AND AGE BETWEEN ME.PREF_MIN_AGE AND ME.PREF_MAX_AGE
          	AND OTHER.USER_ID <> ANY (
            		SELECT DISTINCT
              			RECEIVER_ID
            		FROM
              			SWIPES
            		WHERE
              			SWIPER_ID = ME.USER_ID
          	)
          	AND DISTANCES.DISTANCE_KM <= ME.PREF_DISTANCE_RADIUS_KM
        ORDER BY
          	(
            		CASE
            			WHEN INTEREST_MATCH.MATCH_SCORE IS NULL THEN 0
            			ELSE INTEREST_MATCH.MATCH_SCORE
            		END
          	),
          	(OTHER.SEXUAL_ORIENTATION = ME.SEXUAL_ORIENTATION),
          	DISTANCES.DISTANCE_KM
				LIMIT
						${limit}

		`);

  }
}
