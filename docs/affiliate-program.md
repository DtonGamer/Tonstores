# Affiliate Program Implementation Guide

## Overview

The Tonstores Affiliate Program is designed for builders who understand the importance of infrastructure independence. The program is built around the core principle that affiliates should be "builders promoting infrastructure to other builders" rather than traditional marketers.

## Components

### 1. Affiliate Dashboard (`/affiliate`)
- Shows affiliate stats (referrals, earnings, commission rate)
- Provides affiliate link generation and sharing tools
- Displays list of referrals and their status
- Links to resources and tools

### 2. Affiliate Tools & Resources (`/affiliate/tools`)
- Marketing materials and templates
- Comparison documents showing extraction platforms vs Tonstores
- Case studies and testimonials
- Recognition badges system

### 3. Program Terms (`/affiliate/terms`)
- Commission structure and payment terms
- Affiliate principles and best practices
- Recognition system information

## Key Features

### Shared Success Focus
- 20% recurring commission on all referred customer revenue
- Emphasis on mutual benefit: when affiliates help other builders, everyone wins

### Recognition & Status
- Multiple recognition badges (Founding Infrastructure Partner, Community Builder, etc.)
- Public recognition as infrastructure advocates in the community

### Tools That Match the Mission
- Conversation guides and talking points
- Case studies to share
- Platform comparison materials
- Email templates

## Implementation Details

### Database Schema
- `affiliates` table tracks referral relationships between users
- Includes status tracking (active, pending, inactive)
- Tracks commission rates, earnings, and referral performance

### Registration Integration
- Detects referral parameters in registration URLs
- Automatically creates affiliate relationships when users register via referral links

### Navigation
- Added "Affiliate" link to the main sidebar navigation
- Accessible to all authenticated users

## User Journey

1. User discovers Tonstores through an affiliate link
2. User registers and their referral is automatically recorded
3. User becomes an active customer
4. Referring affiliate earns 20% recurring commission
5. Affiliate can track their referrals and earnings in the dashboard
6. Affiliate receives recognition for their contributions to the ecosystem

## Design Philosophy

The affiliate program is designed to align with the core values of Tonstores:
- Builder autonomy and independence
- Infrastructure ownership
- Community building
- Value-aligned recommendations over hard selling

The program emphasizes the psychological shift from earning commissions to building the ecosystem alongside Tonstores, making affiliates feel like partners in the mission rather than just marketers.