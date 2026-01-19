-- 1. CLEAN SLATE
TRUNCATE TABLE USERS, INTERESTS, PHOTOS, SWIPES, MESSAGES, REPORTS, BLOCKS, LOGINS CASCADE;

-- 2. INSERT STATIC INTERESTS (Expanded List)
INSERT INTO INTERESTS (INTEREST_NAME) VALUES 
('Hiking'), ('Photography'), ('Coding'), ('Coffee'), ('Travel'),
('Yoga'), ('Gaming'), ('Cooking'), ('Music'), ('Art'),
('Surfing'), ('Politics'), ('Reading'), ('Dancing'), ('Wine'),
('Dogs'), ('Cats'), ('Fitness'), ('Fashion'), ('Movies'),
('Netflix'), ('Tattoos'), ('Spirituality'), ('Board Games'), ('Sushi');

-- 3. INSERT YOUR MANUAL "HERO" USERS (Alice, Bob, etc.)
-- We keep these so you have known accounts to log in with.
INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS) VALUES
('alice@example.com', 'hashed_pw_1', 'Alice Smith', 'female', 'straight', '1998-05-15', 'Loves hiking and coffee.', 40.7128, -74.0060, ARRAY['male']::T_GENDER[]),
('bob@example.com', 'hashed_pw_2', 'Bob Jones', 'male', 'straight', '1995-08-22', 'Tech enthusiast and gamer.', 40.7300, -73.9900, ARRAY['female']::T_GENDER[]),
('charlie@example.com', 'hashed_pw_3', 'Charlie Day', 'nonbinary', 'pansexual', '2000-01-10', 'Artist seeking muse.', 40.7500, -73.9800, ARRAY['male', 'female', 'nonbinary']::T_GENDER[]),
('diana@example.com', 'hashed_pw_4', 'Diana Prince', 'female', 'lesbian', '1992-03-30', 'Traveler. Foodie.', 34.0522, -118.2437, ARRAY['female']::T_GENDER[]),
('evan@example.com', 'hashed_pw_5', 'Evan Wright', 'male', 'gay', '1996-11-05', 'Gym rat and coder.', 34.0600, -118.2500, ARRAY['male']::T_GENDER[]);

-- 4. BULK GENERATE 500 RANDOM USERS
-- We use a DO block to generate data using loops and random logic
DO $$
DECLARE
    i INT;
    v_gender T_GENDER;
    v_orientation T_ORIENTATION;
    v_lat NUMERIC;
    v_long NUMERIC;
    v_pref T_GENDER[];
    v_user_id UUID;
    v_interest_count INT;
BEGIN
    FOR i IN 1..500 LOOP
        -- Randomize Gender & Orientation
        v_gender := (ARRAY['male', 'female', 'nonbinary']::T_GENDER[])[floor(random()*3 + 1)];
        v_orientation := (ARRAY['straight', 'gay', 'bisexual', 'pansexual']::T_ORIENTATION[])[floor(random()*4 + 1)];
        
        -- Generate sensible preferences based on orientation
        IF v_orientation = 'straight' AND v_gender = 'male' THEN v_pref := ARRAY['female']::T_GENDER[];
        ELSIF v_orientation = 'straight' AND v_gender = 'female' THEN v_pref := ARRAY['male']::T_GENDER[];
        ELSIF v_orientation = 'gay' AND v_gender = 'male' THEN v_pref := ARRAY['male']::T_GENDER[];
        ELSIF v_orientation = 'gay' AND v_gender = 'female' THEN v_pref := ARRAY['female']::T_GENDER[];
        ELSE v_pref := ARRAY['male', 'female', 'nonbinary']::T_GENDER[];
        END IF;

        -- Random Location (Clustered around NYC 40.7, -74.0 with slight variance)
        -- This ensures users are actually close enough to appear in recommendations
        v_lat := 40.7 + (random() * 0.2 - 0.1); 
        v_long := -74.0 + (random() * 0.2 - 0.1);

        -- Insert User
        INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS)
        VALUES (
            'user_' || i || '@generated.com',
            'password123',
            'User ' || i,
            v_gender,
            v_orientation,
            CURRENT_DATE - (INTERVAL '18 years' + (random() * (INTERVAL '30 years'))), -- Age 18-48
            'This is a generated bio for User ' || i,
            v_lat,
            v_long,
            v_pref
        ) RETURNING USER_ID INTO v_user_id;

        -- Assign 3 Random Interests per User
        INSERT INTO USER_INTERESTS (USER_ID, INTEREST_ID)
        SELECT v_user_id, INTEREST_ID 
        FROM INTERESTS 
        ORDER BY random() 
        LIMIT 3;

        -- Assign a dummy photo
        INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY)
        VALUES (v_user_id, 'https://picsum.photos/seed/' || v_user_id || '/200/300', TRUE);
        
    END LOOP;
END $$;

-- 5. GENERATE RANDOM SWIPES (Create history)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- For every user, generate 5 random swipes on other users
    FOR r IN SELECT USER_ID FROM USERS LOOP
        INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE, SWIPED_AT)
        SELECT 
            r.USER_ID, 
            u.USER_ID, 
            (ARRAY['like', 'dislike']::T_SWIPE_TYPE[])[floor(random()*2 + 1)],
            NOW() - (random() * INTERVAL '30 days')
        FROM USERS u 
        WHERE u.USER_ID != r.USER_ID
        ORDER BY random()
        LIMIT 5
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 6. GENERATE MUTUAL MATCHES & MESSAGES
-- Find cases where User A liked B, and force B to like A back for some cases to create matches
DO $$
DECLARE
    match_rec RECORD;
BEGIN
    -- 1. Create artificial matches (Force reciprocal likes)
    INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE)
    SELECT s.RECEIVER_ID, s.SWIPER_ID, 'like'
    FROM SWIPES s
    WHERE s.SWIPE_TYPE = 'like' 
    AND random() < 0.3 -- 30% chance of a match if one person liked
    ON CONFLICT DO NOTHING;

    -- 2. Generate Messages for Matches
    FOR match_rec IN 
        SELECT s1.SWIPER_ID as u1, s1.RECEIVER_ID as u2
        FROM SWIPES s1
        JOIN SWIPES s2 ON s1.RECEIVER_ID = s2.SWIPER_ID AND s2.RECEIVER_ID = s1.SWIPER_ID
        WHERE s1.SWIPE_TYPE = 'like' AND s2.SWIPE_TYPE = 'like' AND s1.SWIPER_ID < s1.RECEIVER_ID
    LOOP
        INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MSG_CONTENT, SENT_AT) VALUES
        (match_rec.u1, match_rec.u2, 'Hey! We matched!', NOW() - INTERVAL '2 days'),
        (match_rec.u2, match_rec.u1, 'Hi there, how are you?', NOW() - INTERVAL '1 day'),
        (match_rec.u1, match_rec.u2, 'Doing great, you?', NOW() - INTERVAL '5 hours');
    END LOOP;
END $$;

-- 7. GENERATE SOME LOGINS
INSERT INTO LOGINS (USER_ID, IP_ADDRESS, LOGGED_IN_AT)
SELECT USER_ID, '127.0.0.1', NOW() - (random() * INTERVAL '7 days')
FROM USERS
ORDER BY random()
LIMIT 300;
