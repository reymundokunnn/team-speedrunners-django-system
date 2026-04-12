-- Clean schema for ER diagram

CREATE TABLE "auth_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "username" varchar(150) NOT NULL UNIQUE, "last_name" varchar(150) NOT NULL, "email" varchar(254) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL, "first_name" varchar(150) NOT NULL);

CREATE TABLE "auth_group" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(150) NOT NULL UNIQUE);

CREATE TABLE "presenta_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "email" varchar(254) NOT NULL UNIQUE, "password" varchar(128) NOT NULL, "joined_date" datetime NOT NULL, "profile_picture" varchar(100) NULL, "first_name" varchar(30) NULL, "last_name" varchar(30) NULL, "username" varchar(150) NULL UNIQUE, "auth_user_id" integer NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "bio" text NULL, "company" varchar(100) NULL, "created_at" datetime NOT NULL, "date_of_birth" date NULL, "gender" varchar(1) NULL, "location" varchar(100) NULL, "phone_number" varchar(20) NULL, "updated_at" datetime NOT NULL, "user_role" varchar(20) NOT NULL, "online_status" varchar(20) NOT NULL, "email_verified" bool NOT NULL, "phone_verified" bool NOT NULL, "pronouns" varchar(50) NULL, "admin_approval_status" varchar(20) NOT NULL, "is_banned" bool NOT NULL, "cover_photo" varchar(100) NULL);

-- Foreign keys for presenta_user:
--   auth_user_id -> auth_user.id

CREATE TABLE "presenta_designrequest" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "title" varchar(200) NOT NULL, "description" text NOT NULL, "status" varchar(20) NOT NULL, "budget" decimal NULL, "deadline" date NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "completed_at" datetime NULL, "notes" text NULL, "designer_id" integer NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "requester_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "design_type" varchar(20) NOT NULL, "currency" varchar(10) NOT NULL, "revision_notes" text NULL);

-- Foreign keys for presenta_designrequest:
--   requester_id -> auth_user.id
--   designer_id -> auth_user.id

CREATE TABLE "presenta_designrequestfile" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "file" varchar(100) NOT NULL, "uploaded_at" datetime NOT NULL, "design_request_id" bigint NOT NULL REFERENCES "presenta_designrequest" ("id") DEFERRABLE INITIALLY DEFERRED, "file_type" varchar(20) NOT NULL);

-- Foreign keys for presenta_designrequestfile:
--   design_request_id -> presenta_designrequest.id

CREATE TABLE "presenta_usersettings" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "theme_preference" varchar(10) NOT NULL, "timezone" varchar(50) NOT NULL, "language" varchar(10) NOT NULL, "email_notifications_enabled" bool NOT NULL, "order_updates_email" bool NOT NULL, "marketing_emails" bool NOT NULL, "notification_frequency" varchar(20) NOT NULL, "profile_visibility" varchar(20) NOT NULL, "designer_availability" varchar(20) NOT NULL, "designer_rate" decimal NULL, "designer_specializations" text NOT NULL, "accept_project_requests" bool NOT NULL, "maintenance_mode" bool NOT NULL, "two_fa_enabled" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "user_id" integer NOT NULL UNIQUE REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "currency_preference" varchar(10) NOT NULL, "max_concurrent_projects" integer NOT NULL, "minimum_project_budget" decimal NULL, "portfolio_url" varchar(200) NULL, "preferred_design_types" text NOT NULL, "revision_limit" integer NOT NULL, "show_user_status" bool NOT NULL, "announcement_banner" text NOT NULL, "announcement_banner_visible" bool NOT NULL, "api_rate_limit" integer NOT NULL, "auto_accept_criteria" text NOT NULL CHECK ((JSON_VALID("auto_accept_criteria") OR "auto_accept_criteria" IS NULL)), "auto_refund_enabled" bool NOT NULL, "availability_hours" varchar(20) NOT NULL, "backup_schedule" varchar(20) NOT NULL, "communication_preference" varchar(20) NOT NULL, "custom_hours" varchar(100) NOT NULL, "dispute_resolution_days" integer NOT NULL, "email_template_notification" text NOT NULL, "email_template_welcome" text NOT NULL, "emergency_contact_name" varchar(100) NOT NULL, "emergency_contact_phone" varchar(20) NOT NULL, "extra_revision_price" decimal NULL, "form_submission_limit" integer NOT NULL, "grant_analytics_to_roles" text NOT NULL, "industry_expertise" text NOT NULL, "moderation_keywords" text NOT NULL, "payout_frequency" varchar(20) NOT NULL, "payout_method" varchar(50) NOT NULL, "platform_commission_percent" decimal NOT NULL, "portfolio_public" bool NOT NULL, "preferred_contact_method" varchar(20) NOT NULL, "rush_job_multiplier" decimal NOT NULL, "seasonal_active" bool NOT NULL, "seasonal_end_date" date NULL, "seasonal_fee_multiplier" decimal NOT NULL, "seasonal_name" varchar(100) NOT NULL, "seasonal_start_date" date NULL, "show_testimonials" bool NOT NULL, "social_media_links" text NOT NULL CHECK ((JSON_VALID("social_media_links") OR "social_media_links" IS NULL)), "software_tools" text NOT NULL, "turnaround_time_days" integer NOT NULL, "user_approval_required" bool NOT NULL, "announcement_banner_bg_color" varchar(20) NOT NULL, "announcement_banner_text_color" varchar(20) NOT NULL, "announcement_banner_type" varchar(20) NOT NULL, "greeting_name_preference" varchar(20) NOT NULL, "show_time_date" bool NOT NULL);

-- Foreign keys for presenta_usersettings:
--   user_id -> auth_user.id

CREATE TABLE "presenta_samplecategory" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(100) NOT NULL, "slug" varchar(100) NOT NULL UNIQUE, "description" text NOT NULL, "icon" varchar(50) NOT NULL, "order" integer NOT NULL, "is_active" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);

CREATE TABLE "presenta_sampleitem" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "title" varchar(200) NOT NULL, "description" text NOT NULL, "image" varchar(100) NOT NULL, "client_name" varchar(200) NOT NULL, "project_date" date NULL, "tags" varchar(500) NOT NULL, "link" varchar(200) NOT NULL, "order" integer NOT NULL, "is_active" bool NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, "category_id" bigint NOT NULL REFERENCES "presenta_samplecategory" ("id") DEFERRABLE INITIALLY DEFERRED);

-- Foreign keys for presenta_sampleitem:
--   category_id -> presenta_samplecategory.id

