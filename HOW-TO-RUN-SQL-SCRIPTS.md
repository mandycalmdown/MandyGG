# How to Run SQL Scripts in v0

## The News Ticker Issue

If you don't see the news ticker at the top of your website, it's because the announcements table hasn't been created in your database yet. Here's how to fix it:

## Step-by-Step Instructions

### 1. Find the SQL Script
Look in your file list on the left side of v0. You should see a folder called `scripts`. Inside that folder, there's a file called:
- `add-announcements-table.sql`

### 2. Run the Script
1. **Click on the script file** (`add-announcements-table.sql`) in the file list
2. **Look for a "Run Script" button** - it should appear near the top of the file viewer
3. **Click "Run Script"**
4. Wait for confirmation that the script ran successfully

### 3. Refresh Your Website
After the script runs successfully:
1. Go to your website preview
2. Refresh the page (or close and reopen the preview)
3. You should now see the news ticker at the top with the poker night announcement!

## What This Script Does

The script creates a new table in your Supabase database called `announcements` and adds a default message about the monthly poker night. Once this table exists, the ticker component can fetch and display announcements.

## Troubleshooting

**If you don't see a "Run Script" button:**
- Make sure you're viewing the SQL file (it should have a `.sql` extension)
- Try clicking on the file name in the left sidebar

**If the script fails to run:**
- Check that your Supabase integration is properly connected
- Go to the gear icon (⚙️) in the top right → Project Settings → Integrations
- Make sure Supabase is listed and connected

**If the ticker still doesn't appear after running the script:**
- Hard refresh your browser (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
- Check the browser console for any error messages

## Need More Help?

If you're still having issues, message the MandySupport bot on Telegram: https://t.me/mandysupport_bot
