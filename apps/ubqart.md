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

Artists had few places to show their work that were made for artists first.
On general social networks, ads compete with the work, and it is hard for an
artist to reach museums or people who give commissions. UbqArt was a platform
with no ads, made to connect artists with museums and possible commissions.

## What I built

My first startup, at BIGLE. A mobile social network where artists show their
work and find other creators. It shipped on the web, on iOS and on Android.
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

- Shipped on 3 platforms: web, App Store and Google Play.
- The move to React Native gave 40% more active users.
