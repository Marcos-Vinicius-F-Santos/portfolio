-- Complete the profile media extension for databases created from the original schema.
alter table portfolio_editorial.media
  drop constraint if exists media_bucket_check;
alter table portfolio_editorial.media
  add constraint media_bucket_check check (
    bucket in (
      'editorial-project-images',
      'editorial-skill-icons',
      'editorial-curricula',
      'editorial-profile-images'
    )
  );

alter table portfolio_editorial.media
  drop constraint if exists media_purpose_check;
alter table portfolio_editorial.media
  add constraint media_purpose_check check (
    purpose in ('project_image', 'skill_icon', 'curriculum', 'profile_image')
  );
