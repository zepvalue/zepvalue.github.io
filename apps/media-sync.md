---
layout: prose
title: media_sync
permalink: /apps/media-sync/
---

# media_sync

<p class="updated">A personal tool for creators</p>

media_sync is a personal, local tool that lets a creator republish their own
short-form videos to TikTok. It runs on your own computer, acts only on your own
content, and never posts publicly without you finalizing the post yourself inside the
TikTok app.

## How it works

1. **Sign in.** You authenticate with your own TikTok account via TikTok's Login Kit
   (OAuth). The app reads `user.info.basic` only to confirm the authenticated account
   and display the connected username before posting. No other profile data is used
   or stored.
2. **Select a video.** You pick one of your own videos from your device.
3. **Send to your inbox.** Using TikTok's Content Posting API
   (`/v2/post/publish/inbox/video/init/`), the app uploads the MP4 and delivers it to
   your TikTok inbox as a draft.
4. **Review and publish.** You review and finalize the post inside the TikTok app. The
   app never posts publicly without you completing this step.

Every action is initiated by you, the authenticated user, on your own content. No
third-party or scraped content is ever posted.

## Links

- **Source:** [github.com/zepvalue](https://github.com/zepvalue)
- **Privacy Policy:** [/privacy/](/privacy/)
- **Terms of Service:** [/terms/](/terms/)
- **Contact:** [zepvalue@gmail.com](mailto:zepvalue@gmail.com)

media_sync is not affiliated with, endorsed by, or sponsored by TikTok or ByteDance.
