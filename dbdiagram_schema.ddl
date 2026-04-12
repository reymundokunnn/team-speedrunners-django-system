// Clean ER Diagram for dbdiagram.io

Table auth_user {
  id integer [pk, increment]
  password varchar(128)
  last_login datetime
  is_superuser bool
  username varchar(150) [unique]
  last_name varchar(150)
  email varchar(254)
  is_staff bool
  is_active bool
  date_joined datetime
  first_name varchar(150)
}

Table presenta_user {
  id integer [pk, increment]
  email varchar(254) [unique]
  password varchar(128)
  joined_date datetime
  profile_picture varchar(100)
  first_name varchar(30)
  last_name varchar(30)
  username varchar(150) [unique]
  auth_user_id integer [ref: > auth_user.id]
  bio text
  company varchar(100)
  created_at datetime
  date_of_birth date
  gender varchar(1)
  location varchar(100)
  phone_number varchar(20)
  updated_at datetime
  user_role varchar(20)
  online_status varchar(20)
  email_verified bool
  phone_verified bool
  pronouns varchar(50)
  admin_approval_status varchar(20)
  is_banned bool
  cover_photo varchar(100)
}

Table presenta_usersettings {
  id integer [pk, increment]
  user_id integer [unique, ref: > auth_user.id]

  // Display & Theme
  theme_preference varchar(10)
  timezone varchar(50)
  language varchar(10)
  greeting_name_preference varchar(20)
  show_time_date bool

  // Notifications
  email_notifications_enabled bool
  order_updates_email bool
  marketing_emails bool
  notification_frequency varchar(20)

  // Privacy
  profile_visibility varchar(20)
  show_user_status bool
  social_media_links json

  // Contact
  preferred_contact_method varchar(20)
  emergency_contact_name varchar(100)
  emergency_contact_phone varchar(20)
  availability_hours varchar(20)
  custom_hours varchar(100)

  // Client Settings
  currency_preference varchar(10)
  preferred_design_types text

  // Designer Settings
  designer_availability varchar(20)
  designer_rate decimal
  designer_specializations text
  accept_project_requests bool
  portfolio_url varchar(200)
  max_concurrent_projects integer
  revision_limit integer
  minimum_project_budget decimal
  turnaround_time_days integer
  industry_expertise text
  software_tools text
  extra_revision_price decimal
  rush_job_multiplier decimal
  communication_preference varchar(20)
  portfolio_public bool
  auto_accept_criteria json
  show_testimonials bool
  payout_method varchar(50)
  payout_frequency varchar(20)

  // Admin Settings
  maintenance_mode bool
  user_approval_required bool
  platform_commission_percent decimal
  email_template_welcome text
  email_template_notification text
  announcement_banner text
  announcement_banner_visible bool
  announcement_banner_type varchar(20)
  announcement_banner_bg_color varchar(20)
  announcement_banner_text_color varchar(20)
  moderation_keywords text
  backup_schedule varchar(20)
  api_rate_limit integer
  form_submission_limit integer
  grant_analytics_to_roles text
  dispute_resolution_days integer
  auto_refund_enabled bool
  seasonal_active bool
  seasonal_name varchar(100)
  seasonal_start_date date
  seasonal_end_date date
  seasonal_fee_multiplier decimal
  two_fa_enabled bool

  created_at datetime
  updated_at datetime
}

Table presenta_designrequest {
  id integer [pk, increment]
  requester_id integer [ref: > auth_user.id]
  designer_id integer [ref: > auth_user.id]
  title varchar(200)
  design_type varchar(20)
  description text
  status varchar(20)
  budget decimal
  currency varchar(10)
  deadline date
  created_at datetime
  updated_at datetime
  completed_at datetime
  notes text
  revision_notes text
}

Table presenta_designrequestfile {
  id integer [pk, increment]
  design_request_id integer [ref: > presenta_designrequest.id]
  file varchar(100)
  file_type varchar(20)
  uploaded_at datetime
}

Table presenta_samplecategory {
  id integer [pk, increment]
  name varchar(100)
  slug varchar(100) [unique]
  description text
  icon varchar(50)
  order integer
  is_active bool
  created_at datetime
  updated_at datetime
}

Table presenta_sampleitem {
  id integer [pk, increment]
  category_id integer [ref: > presenta_samplecategory.id]
  title varchar(200)
  description text
  image varchar(100)
  client_name varchar(200)
  project_date date
  tags varchar(500)
  link varchar(200)
  order integer
  is_active bool
  created_at datetime
  updated_at datetime
}

Table auth_group {
  id integer [pk, increment]
  name varchar(150) [unique]
}