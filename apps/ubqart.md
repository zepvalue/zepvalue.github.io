---
layout: case-study
title: UbqArt
project: ubqart
permalink: /apps/ubqart/
summary: A social network made by artists, for artists. Show your work, find creators, connect.
years: 2013–2016
stats:
  - { value: "3", label: platforms }
  - { value: co-founder, label: role }
  - { value: "+40%", label: active users }
---

## Problem

The contemporary art market runs through intermediaries. Living artists had few
places made for them first: on general social networks, ads compete with the
work, and it is hard to reach museums, buyers or people who give commissions.

UbqArt (Ubiquitous Art) set out to be an open, horizontal and global place for
contemporary art, with no ads, and a first step to a direct art market.

## What I built

My first startup, at BIGLE. A mobile social network for artists, their
audience and buyers. It shipped on the web, on iOS and on Android.

- **Free publishing.** Artists post images and videos of their work and studio
  life at no cost.
- **Engagement.** People vote on and comment on works, and share them to
  other social networks with one tap.
- **Direct contact.** Artists post updates to all followers, and send real-time
  messages to one person or to other artists.
- **Studio finder.** The mobile app shows artists' studios and workshops near
  you, so people can book visits and go to openings and events.

I was co-founder and Android engineer:

- Built the native Android app in Java, with Dagger 2 for dependency
  injection and Retrofit for the API, analytics and data models.
- Added push notifications with Firebase Cloud Messaging.
- Added geolocation and geofencing for location- and distance-based search
  and suggestions.
- Built the backend data layer: SQL with Hibernate, and Caffeine as a cache
  for a near-optimal hit rate.
- Moved the native app to React Native: one codebase for iOS and Android.

## Stack

- Java, Android
- Dagger 2, Retrofit
- Firebase Cloud Messaging
- React Native
- Hibernate, SQL, Caffeine

## Results

- Shipped on 3 platforms: web, iOS and Android.
- The move to React Native gave 40% more active users.
