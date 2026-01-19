TRUNCATE TABLE USERS, INTERESTS, PHOTOS, SWIPES, MESSAGES, REPORTS, BLOCKS, LOGINS CASCADE;

INSERT INTO INTERESTS (INTEREST_NAME) VALUES 
('Hiking'), ('Photography'), ('Coding'), ('Coffee'), ('Travel'),
('Yoga'), ('Gaming'), ('Cooking'), ('Music'), ('Art');

INSERT INTO USERS (EMAIL, PASSWORD_HASH, FULL_NAME, GENDER, SEXUAL_ORIENTATION, BIRTH_DATE, BIO, LATITUDE, LONGITUDE, PREF_GENDERS) VALUES
('alice@example.com', 'hashed_pw_1', 'Alice Smith', 'female', 'straight', '1998-05-15', 'Loves hiking and coffee.', 40.7128, -74.0060, ARRAY['male']::T_GENDER[]),
('bob@example.com', 'hashed_pw_2', 'Bob Jones', 'male', 'straight', '1995-08-22', 'Tech enthusiast and gamer.', 40.7300, -73.9900, ARRAY['female']::T_GENDER[]),
('charlie@example.com', 'hashed_pw_3', 'Charlie Day', 'nonbinary', 'pansexual', '2000-01-10', 'Artist seeking muse.', 40.7500, -73.9800, ARRAY['male', 'female', 'nonbinary']::T_GENDER[]),
('diana@example.com', 'hashed_pw_4', 'Diana Prince', 'female', 'lesbian', '1992-03-30', 'Traveler. Foodie.', 34.0522, -118.2437, ARRAY['female']::T_GENDER[]),
('evan@example.com', 'hashed_pw_5', 'Evan Wright', 'male', 'gay', '1996-11-05', 'Gym rat and coder.', 34.0600, -118.2500, ARRAY['male']::T_GENDER[]);

INSERT INTO USER_INTERESTS (USER_ID, INTEREST_ID) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Hiking')),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Coffee')),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Gaming')),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Coding')),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'charlie@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Art')),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'diana@example.com'), (SELECT INTEREST_ID FROM INTERESTS WHERE INTEREST_NAME = 'Travel'));

INSERT INTO PHOTOS (UPLOADER_ID, IMAGE_URL, IS_PRIMARY) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), 'https://example.com/alice1.jpg', TRUE),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), 'https://example.com/bob_profile.png', TRUE),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'charlie@example.com'), 'https://example.com/charlie_main.jpg', TRUE),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'charlie@example.com'), 'https://example.com/charlie_art.jpg', FALSE),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'diana@example.com'), 'https://example.com/diana.jpg', TRUE),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'evan@example.com'), 'https://example.com/evan.jpg', TRUE);

INSERT INTO SWIPES (SWIPER_ID, RECEIVER_ID, SWIPE_TYPE) VALUES
-- Mutual Like (Match)
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), 'like'),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), 'like'),
-- One-way Like
((SELECT USER_ID FROM USERS WHERE EMAIL = 'charlie@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), 'like'),
-- Dislike
((SELECT USER_ID FROM USERS WHERE EMAIL = 'diana@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'evan@example.com'), 'dislike');

INSERT INTO MESSAGES (SENDER_ID, RECEIVER_ID, MSG_CONTENT, SENT_AT) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), 'Hey! Nice profile.', NOW() - INTERVAL '1 hour'),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), 'Thanks! You too. Do you code?', NOW() - INTERVAL '55 minutes');

INSERT INTO REPORTS (REPORTER_ID, REPORTED_ID, REASON, DETAILS) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'diana@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'evan@example.com'), 'fake_profile', 'Uses a stock photo from Google.');

INSERT INTO BLOCKS (BLOCKER_ID, BLOCKED_ID) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'diana@example.com'), (SELECT USER_ID FROM USERS WHERE EMAIL = 'evan@example.com'));

INSERT INTO LOGINS (USER_ID, IP_ADDRESS) VALUES
((SELECT USER_ID FROM USERS WHERE EMAIL = 'alice@example.com'), '192.168.1.1'),
((SELECT USER_ID FROM USERS WHERE EMAIL = 'bob@example.com'), '10.0.0.5');
