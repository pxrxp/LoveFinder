/**
 * Database Schema Setup
 * 
 * This script creates our custom types (like gender and orientation), tables, 
 * and triggers. We use Postgres 'earthdistance' for location searching.
 * 
 * Triggers are used to automatically:
 * - Enforce age limits (must be 18+).
 * - Trim whitespace from emails and names.
 * - Ensure every user has at least one primary photo.
 */
create extension if not exists citext;
create extension if not exists cube;
create extension if not exists earthdistance;

create domain t_email as citext check (
    value ~* $$^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$$
);

create type t_gender as enum('male', 'female', 'nonbinary');

create type t_orientation as enum(
	'straight',
	'gay',
	'lesbian',
	'bisexual',
	'asexual',
	'demisexual',
	'pansexual',
	'queer',
	'questioning'
);

create type t_report_reason as enum(
	'spam', 'harassment', 'fake_profile', 'inappropriate_content', 'scam', 'impersonation', 'hate_speech', 'discrimination', 'threats', 'violence', 'nudity', 'self_harm', 'underage_user', 'bullying', 'misleading_information', 'offensive_language', 'other'
);

create type t_report_status as enum('under_review', 'dismissed', 'action_taken');
create type t_swipe_type as enum('like', 'dislike');
create type t_message_type as enum ('text', 'image', 'audio', 'video');

create or replace function check_age() returns trigger as $$
begin
    if new.birth_date is not null and new.birth_date > (current_date - interval '18 years') then
        raise exception 'user must be at least 18 years old.';
    end if;
    return new;
end;
$$ language plpgsql;

create or replace function trim_user_strings() returns trigger as $$
begin
    if new.email is not null then new.email := trim(new.email); end if;
    if new.full_name is not null then new.full_name := trim(new.full_name); end if;
    if new.bio is not null then new.bio := trim(new.bio); end if;
    return new;
end;
$$ language plpgsql;

create table if not exists users (
	user_id uuid primary key default gen_random_uuid(),
	email t_email not null unique,
	password_hash varchar(255) not null,
	full_name varchar(255) check (length(full_name) > 0),
	gender t_gender,
	sexual_orientation t_orientation,
	birth_date date,
	bio varchar(512) not null default '',
	created_at timestamptz not null default current_timestamp,
	latitude numeric(9, 6) check (latitude between -90 and 90),
	longitude numeric(9, 6) check (longitude between -180 and 180),
	pref_genders t_gender[],
	pref_min_age smallint not null default 18 check (pref_min_age between 18 and 200),
	pref_max_age smallint not null default 200 check (pref_max_age between 18 and 200),
	pref_distance_radius_km smallint not null default 10 check (pref_distance_radius_km between 0 and 20000),
	is_active boolean not null default true,
	is_onboarded boolean not null default false,
	is_verified boolean not null default false,
	allow_messages_from_strangers boolean not null default false,
	check (pref_min_age <= pref_max_age)
);

alter table users add constraint chk_onboarding_requirements check (
    is_onboarded = false or (
        full_name is not null and
        gender is not null and 
        sexual_orientation is not null and 
        birth_date is not null and 
        pref_genders is not null
    )
);

create view safe_users_personal as
select
	user_id, email, full_name, gender, sexual_orientation, birth_date, bio, created_at, pref_genders, pref_min_age, pref_max_age, pref_distance_radius_km, is_active, is_onboarded, is_verified, allow_messages_from_strangers
from users;

create view safe_users_public as
select
	user_id, full_name, extract(year from age(birth_date)) as age, bio, allow_messages_from_strangers
from users;

create trigger trg_check_age before insert or update on users for each row execute function check_age();
create trigger trg_trim_user_strings before insert or update on users for each row execute function trim_user_strings();

create table if not exists user_credentials (
    user_id uuid primary key references users(user_id) on delete cascade,
    verification_code varchar(6),
    reset_token varchar(255) unique,
    reset_expires timestamptz
);

create table if not exists user_oauth (
    oauth_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(user_id) on delete cascade,
    provider varchar(20) not null,
    provider_user_id varchar(255) not null,
    unique(provider, provider_user_id)
);

create table if not exists reports (
	report_id uuid primary key default gen_random_uuid(),
	reporter_id uuid not null references users (user_id),
	reported_id uuid not null references users (user_id),
	reason t_report_reason not null,
	details varchar(512) not null check (length(details) > 10),
	status t_report_status not null default 'under_review'
);

create table if not exists blocks (
	blocker_id uuid not null references users (user_id),
	blocked_id uuid not null references users (user_id),
	blocked_at timestamptz not null default current_timestamp,
	primary key (blocker_id, blocked_id),
	check (blocker_id <> blocked_id)
);

create table if not exists logins (
	login_id bigserial primary key,
	user_id uuid not null references users (user_id),
	ip_address inet not null,
	logged_in_at timestamptz not null default current_timestamp
);

create table if not exists messages (
	message_id uuid primary key default gen_random_uuid(),
	sender_id uuid not null references users (user_id),
	receiver_id uuid not null references users (user_id),
    message_type t_message_type not null default 'text',
	message_content varchar(1024) not null default '',
	is_read boolean not null default false,
	is_deleted boolean not null default false,
	sent_at timestamptz not null default current_timestamp,
	check (sender_id <> receiver_id)
);

create or replace function trim_interest_name() returns trigger as $$
begin
    if new.interest_name is not null then new.interest_name := trim(new.interest_name); end if;
    return new;
end;
$$ language plpgsql;

create table if not exists interests (
    interest_id serial primary key,
    interest_name citext not null unique check (
        length(interest_name) >= 2 and interest_name ~ $$^[a-za-z0-9\s\-\']{1,50}$$ and interest_name !~ $$(.)\1{4,}$$
    ),
    is_approved boolean not null default false
);

create trigger trg_trim_interest_name before insert or update on interests for each row execute function trim_interest_name();

create table if not exists user_interests (
	interest_id int not null references interests (interest_id),
	user_id uuid not null references users (user_id),
	primary key (interest_id, user_id)
);

create table if not exists swipes (
	swiper_id uuid not null references users (user_id),
	receiver_id uuid not null references users (user_id),
	swiped_at timestamptz not null default current_timestamp,
	swipe_type t_swipe_type not null,
	primary key (swiper_id, receiver_id),
	check (swiper_id <> receiver_id)
);

create or replace function check_allow_messages_from_strangers() returns trigger as $$
begin
    if (select allow_messages_from_strangers from users where user_id = new.receiver_id) then return new; end if;
    if exists(select 1 from swipes where swiper_id = new.receiver_id and receiver_id = new.sender_id and swipe_type = 'like') then return new; end if;
    raise exception 'cannot message: recipient does not allow strangers and no swipe exists';
end;
$$ language plpgsql;

create trigger trg_check_allow_messages_from_strangers before insert on messages for each row execute function check_allow_messages_from_strangers();

create table if not exists photos (
	photo_id uuid primary key default gen_random_uuid(),
	uploader_id uuid not null references users (user_id),
	image_url varchar(2083) not null unique check (image_url ~* '^https?://[^\s/$.?#].[^\s]*$'),
	is_primary boolean not null default false
);

create or replace function check_max_photos() returns trigger as $$
declare photo_count int;
begin
    select count(*) into photo_count from photos where uploader_id = new.uploader_id;
    if photo_count >= 6 then raise exception 'cannot insert photo: a user can have a maximum of 6 photos.'; end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_check_max_photos before insert on photos for each row execute function check_max_photos();

create or replace function ensure_primary_on_insert() returns trigger as $$
declare photo_count int;
begin
    select count(*) into photo_count from photos where uploader_id = new.uploader_id;
    if photo_count = 0 then new.is_primary := true; end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_ensure_primary_on_insert before insert on photos for each row execute function ensure_primary_on_insert();

create or replace function ensure_user_has_primary() returns trigger as $$
declare primary_count int;
begin
    select count(*) into primary_count from photos where uploader_id = coalesce(new.uploader_id, old.uploader_id) and is_primary = true;
    if primary_count = 0 then
        update photos set is_primary = true where photo_id = (select photo_id from photos where uploader_id = coalesce(new.uploader_id, old.uploader_id) order by photo_id desc limit 1);
    end if;
    return null;
end;
$$ language plpgsql;

create trigger trg_ensure_primary_after_update after update of is_primary on photos for each row execute function ensure_user_has_primary();
create trigger trg_ensure_primary_after_delete after delete on photos for each row execute function ensure_user_has_primary();

create index idx_users_demographics on users (gender, birth_date) where is_active = true;
create index idx_users_location on users using gist (ll_to_earth(latitude, longitude));
create index idx_reports_reporter on reports (reporter_id);
create index idx_reports_reported on reports (reported_id);
create index idx_reports_status on reports (status);
create index idx_blocks_blocker on blocks (blocker_id);
create index idx_blocks_blocked on blocks (blocked_id);
create index idx_logins_user on logins (user_id);
create index idx_logins_time on logins (logged_in_at);
create index idx_messages_sender_receiver on messages (sender_id, receiver_id, sent_at desc);
create index idx_messages_receiver_sender on messages (receiver_id, sender_id, sent_at desc);
create index idx_messages_unread on messages (receiver_id, is_read) where is_read = false;
create index idx_messages_not_deleted on messages (sender_id, receiver_id, sent_at desc) where is_deleted = false;
create index idx_messages_not_deleted_reverse on messages (receiver_id, sender_id, sent_at desc) where is_deleted = false;
create index idx_user_interests_user on user_interests (user_id);
create index idx_user_interests_interest on user_interests (interest_id);
create index idx_swipes_swiper on swipes (swiper_id);
create index idx_swipes_receiver on swipes (receiver_id);
create unique index ux_photos_primary_per_user on photos (uploader_id) where is_primary = true;
create index idx_photos_uploader on photos (uploader_id);

create type t_user_role as enum('user', 'admin');
create table if not exists user_roles (
    user_id uuid primary key references users(user_id),
    role t_user_role not null default 'user'
);
