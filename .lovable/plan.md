

## Plan: Auto-Fetch Roblox Games, Fix Images, Add Password Reset & Email Verification

### 1. Database Migration
- Add `roblox_game_id` (bigint, unique, nullable) column to `games` table to deduplicate Roblox imports
- Add unique index on `roblox_game_id`

### 2. Edge Function: `fetch-roblox-games`
- Create `supabase/functions/fetch-roblox-games/index.ts`
- Call Roblox API endpoints:
  - `https://games.roblox.com/v1/games/sorts` to get the "Most Popular" sort token
  - `https://games.roblox.com/v1/games/list?sortToken=...&limit=50` to get games
  - `https://thumbnails.roblox.com/v1/games/icons?universeIds=...&size=512x512&format=Png` for thumbnails
- For each game: extract name, thumbnail URL, generate `roblox_link` as `https://www.roblox.com/games/{placeId}`
- Use `roblox_game_id` to skip duplicates (upsert or check-before-insert)
- Auto-assign category as "Casual" (Roblox API genre data is limited) and set status to "approved"
- Uses service role key to bypass RLS

### 3. Scheduled Cron Job
- Enable `pg_cron` and `pg_net` extensions
- Schedule the edge function to run daily via `cron.schedule`

### 4. Fix Homepage Image Placeholders
- **Root cause**: `GameCard` and `HeroCarousel` use a hardcoded `gameImages[slug]` map that only has 6 entries, falling back to `/placeholder.svg`
- **Fix**: Update both components to use `game.image` from the database first, then fallback to `gameImages[slug]`, then placeholder
- Same pattern: `const imgSrc = game.image || gameImages[game.slug] || '/placeholder.svg'`

### 5. Password Reset
- Add "Forgot Password?" link on LoginPage
- New mode `'forgot'` that shows email input and calls `supabase.auth.resetPasswordForEmail()`
- Add `/reset-password` route with a `ResetPasswordPage` that detects the recovery token from URL hash and lets user set a new password via `supabase.auth.updateUser({ password })`

### 6. Email Verification
- Signup already sends a verification email (current code calls `supabase.auth.signUp` without auto-confirm)
- After signup, show a message telling the user to check their email
- No additional backend changes needed -- the existing flow handles this; just improve the UX messaging

### Files to Create/Edit
- **New**: `supabase/functions/fetch-roblox-games/index.ts` -- edge function
- **New**: `src/pages/ResetPasswordPage.tsx` -- password reset form
- **Migration**: add `roblox_game_id` column
- **Edit**: `src/components/GameCard.tsx` -- fix image source
- **Edit**: `src/components/home/HeroCarousel.tsx` -- fix image source  
- **Edit**: `src/pages/LoginPage.tsx` -- add forgot password mode
- **Edit**: `src/App.tsx` -- add reset-password route
- **SQL insert**: cron job schedule

