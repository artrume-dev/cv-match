# Job Research System - Phase 2 Specification

**Version:** 1.0
**Date:** November 23, 2025
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature Requirements](#feature-requirements)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema Changes](#database-schema-changes)
5. [API Endpoints Design](#api-endpoints-design)
6. [UI/UX Implementation](#uiux-implementation)
7. [Payment Integration](#payment-integration)
8. [Implementation Phases](#implementation-phases)
9. [Security Considerations](#security-considerations)
10. [Testing Requirements](#testing-requirements)

---

## Executive Summary

This specification outlines Phase 2 of the Job Research System, transitioning from a single-user MVP to a multi-user SaaS platform with authentication, dashboard, CV templates, and payment integration.

### Key Objectives

- **Multi-user support** with secure authentication
- **Dashboard** for tracking CVs, optimizations, and job applications
- **CV Templates** marketplace foundation
- **Profile management** with comprehensive settings
- **Payment system** for lifetime access pricing
- **Enhanced tracking** for job applications with dates and match scores

### Current State Analysis

**What Exists:**
- ✅ Comprehensive SQLite database (8 tables, ~150 fields)
- ✅ Full CV upload/parsing system (PDF, DOCX, TXT, MD)
- ✅ Job scraping for 38 companies (5 ATS systems)
- ✅ CV optimization with AI (conservative, optimized, stretch variants)
- ✅ Job analysis with alignment scoring (0-100%)
- ✅ Onboarding wizard (7 steps)
- ✅ User profile management (single user)
- ✅ Job filtering and search
- ✅ 41 API endpoints (Express server)

**What's Missing:**
- ❌ Authentication system (no login/register)
- ❌ Multi-user database support (user_id foreign keys)
- ❌ Dashboard for tracking applications
- ❌ CV export functionality (PDF/DOCX)
- ❌ CV templates
- ❌ Payment integration
- ❌ Profile editing UI
- ❌ Application date tracking

---

## Feature Requirements

### 1. Authentication & Registration

#### 1.1 User Registration Flow

**Requirements:**
- Use existing **OnboardingWizard** as the registration flow
- Capture user credentials at the start of onboarding
- Store user data securely with password hashing
- Generate JWT tokens upon successful registration
- Auto-login after registration

**Registration Steps:**

```
Step 0 (NEW): Account Creation
├── Email address (unique, validated)
├── Password (min 8 chars, 1 uppercase, 1 number, 1 special)
├── Confirm password
└── Accept terms & conditions

Step 1: Welcome Screen
└── Show product overview

Step 2: Profile Setup
├── Full name
├── Current position
└── Years of experience

Step 3: LinkedIn Import (Optional)
└── Skip or import from LinkedIn

Step 4: CV Upload
└── Upload resume file

Step 5: Industry Preferences
└── Select preferred industries

Step 6: Location Preferences
└── Select preferred locations

Step 7: Company Selection
└── Select companies to track
```

**Validation Rules:**
- Email must be unique across all users
- Password strength: minimum 8 characters, 1 uppercase, 1 number, 1 special character
- Email verification (optional for MVP, recommended for production)
- Rate limiting: max 5 registration attempts per IP per hour

**Database Changes:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires DATETIME,
  subscription_status TEXT DEFAULT 'free', -- free, lifetime
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_date DATETIME,
  payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

#### 1.2 Login System

**Requirements:**
- Email + password authentication
- JWT token generation (1 week expiry)
- Refresh token support (30 days)
- "Remember me" option
- Failed login attempt tracking (max 5 attempts, 15-minute lockout)

**Login Flow:**
```
1. User enters email + password
2. Backend validates credentials
3. If valid:
   - Generate access token (JWT, 1 week)
   - Generate refresh token (30 days)
   - Update last_login timestamp
   - Return tokens + user profile
4. If invalid:
   - Increment failed_attempts counter
   - Lock account after 5 failed attempts
   - Send notification email if account locked
```

**JWT Payload Structure:**
```json
{
  "userId": 123,
  "email": "user@example.com",
  "subscriptionStatus": "lifetime",
  "iat": 1700000000,
  "exp": 1700604800
}
```

#### 1.3 Password Management

**Requirements:**
- Forgot password flow with email reset link
- Reset token valid for 1 hour
- Password change from settings page
- Password history (prevent reusing last 3 passwords)

**Reset Flow:**
```
1. User clicks "Forgot Password"
2. Enters email address
3. Backend generates reset token (UUID)
4. Send email with reset link: /reset-password?token=xxx
5. User clicks link, enters new password
6. Backend validates token (not expired, matches user)
7. Update password_hash, clear reset_token
8. Send confirmation email
9. Redirect to login
```

---

### 2. Dashboard

#### 2.1 Dashboard Overview

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                    [Profile Icon]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ CVs Uploaded│  │ CVs Optimized│  │ Jobs Applied│         │
│  │     3       │  │      12      │  │      8      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  Recent CV Optimizations                      [View All]     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Senior Product Designer - Anthropic         92% Match │  │
│  │ Optimized 2 days ago                                  │  │
│  │ [Download] [View Changes]                             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Design Systems Lead - Stripe                85% Match │  │
│  │ Optimized 5 days ago                                  │  │
│  │ [Download] [View Changes]                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Jobs Applied                                 [View All]     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Product Designer - Vercel              Applied: Nov 20 │  │
│  │ Match Score: 88%                          Status: ●   │  │
│  │ [View Job] [View CV Used]                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 CV Management Section

**Requirements:**

1. **CV Uploaded List**
   - Display all uploaded CVs with metadata
   - Show: filename, upload date, file size, active status
   - Actions: View, Set Active, Delete, Download
   - Visual indicator for active CV

2. **CV Optimization History**
   - List all optimized CV versions
   - Group by job posting
   - Show: job title, company, optimization date, match score, variant type
   - Actions: Download PDF, Download DOCX, View Changes, Use for Application

3. **CV Version Comparison**
   - Side-by-side diff view
   - Highlight changes made during optimization
   - Show strong matches and gaps identified

**Data Structure:**
```typescript
interface CVUploadedItem {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  isActive: boolean;
  optimizationCount: number; // Derived count
}

interface CVOptimizationItem {
  id: number;
  baseCVId: number;
  baseCVName: string;
  jobId: number;
  jobTitle: string;
  company: string;
  variantType: 'conservative' | 'optimized' | 'stretch';
  matchScore: number;
  optimizedDate: Date;
  changesSummary: string[];
  strongMatches: string[];
  gaps: string[];
  isFinal: boolean;
}
```

#### 2.3 Jobs Applied Tracking

**Requirements:**

1. **"Mark as Applied" Feature**
   - Add button to JobCard component
   - Capture application date automatically
   - Optional: manual date entry for past applications
   - Link to CV variant used for application
   - Add application notes field

2. **Application Status Tracking**
   ```
   Status Flow:
   New → Applied → In Review → Interview Scheduled →
   Offer Received → Accepted/Rejected/Withdrawn
   ```

3. **Application Timeline**
   - Visual timeline of application journey
   - Show key dates: applied, reviewed, interviewed, decision
   - Add reminders for follow-ups

**Database Changes:**
```sql
CREATE TABLE job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  cv_variant_id INTEGER, -- Which optimized CV was used
  applied_date DATE NOT NULL,
  application_status TEXT DEFAULT 'applied',
  application_source TEXT, -- 'company_site', 'linkedin', 'indeed', etc.
  application_notes TEXT,
  follow_up_date DATE,
  interview_date DATETIME,
  interview_notes TEXT,
  offer_amount DECIMAL(10,2),
  offer_currency TEXT DEFAULT 'USD',
  decision TEXT, -- 'accepted', 'rejected', 'withdrawn', 'pending'
  decision_date DATE,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (cv_variant_id) REFERENCES cv_variants(id) ON DELETE SET NULL
);

CREATE INDEX idx_applications_user ON job_applications(user_id);
CREATE INDEX idx_applications_status ON job_applications(application_status);
CREATE INDEX idx_applications_date ON job_applications(applied_date DESC);
```

**UI Components:**

1. **Mark Applied Button** (in JobCard)
   ```tsx
   <Button onClick={() => handleMarkApplied(job)}>
     <CheckCircle /> Mark as Applied
   </Button>
   ```

2. **Application Dialog**
   ```
   ┌─────────────────────────────────────────┐
   │ Mark Job as Applied                     │
   ├─────────────────────────────────────────┤
   │                                         │
   │ Job: Senior Product Designer            │
   │ Company: Anthropic                      │
   │                                         │
   │ Application Date: [Nov 23, 2025]       │
   │                                         │
   │ CV Used: [Select CV Variant ▼]        │
   │ ○ Base CV                               │
   │ ● Optimized for Anthropic (92% match)   │
   │ ○ Conservative variant                  │
   │                                         │
   │ Applied Via: [Select ▼]               │
   │                                         │
   │ Notes:                                  │
   │ ┌─────────────────────────────────────┐ │
   │ │ Applied through referral...         │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │         [Cancel]  [Mark as Applied]     │
   └─────────────────────────────────────────┘
   ```

3. **Applications Dashboard Table**
   ```
   | Job Title        | Company    | Applied   | Match | CV Used     | Status      | Actions    |
   |------------------|------------|-----------|-------|-------------|-------------|------------|
   | Product Designer | Anthropic  | Nov 23    | 92%   | Optimized   | In Review   | [View] [Update] |
   | Design Lead      | Stripe     | Nov 20    | 85%   | Conservative| Applied     | [View] [Update] |
   | UX Designer      | Vercel     | Nov 18    | 88%   | Optimized   | Interview   | [View] [Update] |
   ```

#### 2.4 Match Scores for Applied Jobs

**Requirements:**
- Display match scores prominently in applications list
- Color-coded badges:
  - 🟢 Green (70-100%): Strong match
  - 🟠 Orange (50-69%): Moderate match
  - 🔴 Red (0-49%): Weak match
- Filter applications by match score range
- Analytics: average match score for applied jobs
- Trend analysis: match score vs. success rate

**Analytics Views:**
```
Application Success Rate by Match Score:
┌────────────────────────────────────────┐
│ 90-100%: ████████████ 75% success     │
│ 80-89%:  ██████████   60% success     │
│ 70-79%:  ██████       40% success     │
│ 60-69%:  ████         25% success     │
│ <60%:    ██           10% success     │
└────────────────────────────────────────┘
```

---

### 3. CV Templates System

#### 3.1 Template Architecture

**Requirements:**
- Predefined CV templates (5-10 initial templates)
- Template categories: Modern, Classic, Minimalist, Creative, ATS-Friendly
- Template preview before selection
- One-click apply template to CV
- Template customization options (colors, fonts, sections)
- Export with template styling (PDF/DOCX)

**Template Structure:**
```typescript
interface CVTemplate {
  id: number;
  name: string;
  category: 'modern' | 'classic' | 'minimalist' | 'creative' | 'ats';
  description: string;
  thumbnailUrl: string;
  previewUrl: string;
  isPremium: boolean;
  price: number; // 0 for free templates
  structure: TemplateStructure;
  styling: TemplateStyling;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: Date;
}

interface TemplateStructure {
  sections: Array<{
    id: string;
    type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'custom';
    order: number;
    required: boolean;
  }>;
  layout: 'single-column' | 'two-column' | 'three-column';
  headerPosition: 'top' | 'left' | 'right';
}

interface TemplateStyling {
  fonts: {
    heading: string;
    body: string;
    size: { heading: number; body: number };
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  spacing: {
    sectionGap: number;
    lineHeight: number;
    margins: { top: number; right: number; bottom: number; left: number };
  };
}
```

**Database Schema:**
```sql
CREATE TABLE cv_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  is_premium BOOLEAN DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  structure_json TEXT, -- JSON of TemplateStructure
  styling_json TEXT, -- JSON of TemplateStyling
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  author TEXT DEFAULT 'TalentNode',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_template_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  price_paid DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES cv_templates(id) ON DELETE CASCADE,
  UNIQUE(user_id, template_id)
);
```

#### 3.2 Template Selection Flow

**Integration Point:** After CV optimization, before download

```
User Flow:
1. User clicks "Optimize CV" for a job
2. AI generates optimized CV content
3. Show template selection modal:
   ┌─────────────────────────────────────────┐
   │ Choose CV Template                      │
   ├─────────────────────────────────────────┤
   │                                         │
   │ [Modern]  [Classic]  [Minimalist]      │
   │                                         │
   │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
   │ │     │ │     │ │     │ │     │       │
   │ │  A  │ │  B  │ │  C  │ │ 👑 D│       │
   │ │     │ │     │ │     │ │     │       │
   │ └─────┘ └─────┘ └─────┘ └─────┘       │
   │  Modern  Classic  Minimal  Premium     │
   │  ⭐4.8   ⭐4.5    ⭐4.9    ⭐5.0        │
   │                                         │
   │ Preview: [Selected template preview]    │
   │                                         │
   │     [Cancel]  [Download with Template]  │
   └─────────────────────────────────────────┘
4. User selects template
5. Backend generates PDF/DOCX with template styling
6. User downloads formatted CV
```

**Template Preview Component:**
```tsx
<TemplateSelector
  templates={availableTemplates}
  cvContent={optimizedContent}
  onSelect={(templateId) => handleTemplateSelect(templateId)}
  userHasPremium={user.subscriptionStatus === 'lifetime'}
/>
```

#### 3.3 Template Marketplace (Future Phase)

**Features for Marketplace:**
- Browse all templates (free + premium)
- Filter by category, price, rating
- Template ratings and reviews
- Template creator profiles
- Purchase individual templates ($5-15)
- Lifetime access includes all premium templates
- Creator revenue sharing (70/30 split)

**Monetization Model:**
```
Free Tier:
- 3 basic templates (ATS-friendly, Classic, Modern)
- Limited customization

Lifetime Access ($49):
- All premium templates unlocked
- Full customization options
- Priority support
- Future templates included

Individual Template Purchase:
- $5-15 per template
- One-time purchase
- Access to all variants (PDF, DOCX, LaTeX)
```

---

### 4. Profile Management

#### 4.1 Profile Edit Page

**Requirements:**
- Comprehensive profile editing UI
- Real-time validation
- Auto-save on change (debounced)
- Profile completeness indicator
- LinkedIn sync option

**Editable Fields:**

```typescript
interface UserProfile {
  // Personal Information
  fullName: string;
  email: string; // Requires email verification if changed
  profilePhoto: string; // Upload new photo
  headline: string;
  summary: string;
  currentPosition: string;
  yearsOfExperience: number;

  // Professional Information
  skills: string[];
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;

  // Work Experience (JSON array)
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate: Date | null; // null if current
    description: string;
  }>;

  // Education (JSON array)
  education: Array<{
    degree: string;
    school: string;
    field: string;
    graduationYear: number;
  }>;

  // Preferences
  preferredIndustries: string[];
  preferredLocations: string[];
  preferredJobTypes: string[];
  remoteOnly: boolean;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;

  // Settings
  emailNotifications: boolean;
  weeklyDigest: boolean;
  jobAlerts: boolean;
}
```

**UI Layout:**
```
┌───────────────────────────────────────────────────────────┐
│ Profile Settings                                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────┬───────────────────────────────────┐ │
│ │                 │                                   │ │
│ │  [Photo]        │  Full Name: [John Doe          ] │ │
│ │  [Upload]       │  Email: [john@example.com      ] │ │
│ │                 │  Headline: [Product Designer   ] │ │
│ │                 │                                   │ │
│ └─────────────────┴───────────────────────────────────┘ │
│                                                           │
│ Professional Information                                  │
│ ├─ Current Position: [Senior Product Designer        ]  │
│ ├─ Years of Experience: [5 ▼]                           │
│ ├─ LinkedIn URL: [linkedin.com/in/johndoe            ]  │
│ ├─ Portfolio URL: [johndoe.design                    ]  │
│ └─ GitHub URL: [github.com/johndoe                   ]  │
│                                                           │
│ Skills                                [+ Add Skill]       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Figma ×] [React ×] [Design Systems ×] [UX ×]     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Work Experience] [Education] [Preferences]              │
│                                                           │
│                      [Save Changes]                       │
└───────────────────────────────────────────────────────────┘
```

#### 4.2 Account Settings

**Features:**
- Change password
- Email preferences
- Notification settings
- Privacy settings
- Data export (GDPR compliance)
- Delete account (with confirmation)

**Settings Categories:**

1. **Security**
   - Change password
   - Two-factor authentication (2FA) - future
   - Active sessions management
   - Login history

2. **Notifications**
   - Email notifications on/off
   - New job matches
   - Weekly job digest
   - Application reminders
   - System updates

3. **Privacy**
   - Profile visibility (public/private)
   - Data sharing preferences
   - Cookie preferences

4. **Account**
   - Subscription status
   - Payment history
   - Download data (JSON export)
   - Delete account

---

### 5. Payment Integration

#### 5.1 Payment Options Comparison

| Feature | Stripe | Paddle | Lemon Squeezy | Gumroad |
|---------|--------|--------|---------------|---------|
| **Setup Complexity** | Medium | Low | Very Low | Very Low |
| **Transaction Fee** | 2.9% + $0.30 | 5% + $0.50 | 5% + $0.50 | 8.5% + $0.30 |
| **Merchant of Record** | No (you handle taxes) | Yes (they handle taxes) | Yes | Yes |
| **Global Payments** | Excellent | Excellent | Good | Good |
| **Recurring Billing** | Yes | Yes | Yes | Yes |
| **One-time Payments** | Yes | Yes | Yes | Yes |
| **Webhook Support** | Excellent | Good | Good | Basic |
| **Dashboard Quality** | Excellent | Good | Good | Good |
| **VAT/Tax Handling** | Manual | Automatic | Automatic | Automatic |
| **Refund Management** | Full control | Full control | Full control | Full control |
| **Customer Support** | 24/7 (Premium) | Email | Email | Email |

**Recommendation: Lemon Squeezy**

**Why Lemon Squeezy?**
1. ✅ Merchant of Record (handles all taxes/VAT automatically)
2. ✅ Simple integration (minimal backend code)
3. ✅ Supports lifetime pricing model perfectly
4. ✅ Built-in fraud detection
5. ✅ Professional checkout experience
6. ✅ Webhook support for automation
7. ✅ Affiliate program support (future referrals)
8. ✅ Lower complexity than Stripe for your use case

**Alternative: Stripe** (if you want more control)
- Better for complex billing scenarios
- More developer-friendly
- Requires tax compliance management
- More expensive per transaction

**Not Recommended:**
- ❌ Gumroad: Higher fees (8.5%), less professional
- ❌ PayPal: Poor developer experience, high refund issues

#### 5.2 Pricing Model

**Lifetime Access Plan:**
```
┌─────────────────────────────────────────┐
│         Lifetime Access                 │
│                                         │
│         $49 USD                         │
│         One-time payment                │
│                                         │
│ ✓ Unlimited job searches               │
│ ✓ Unlimited CV optimizations           │
│ ✓ All premium CV templates             │
│ ✓ Priority support                     │
│ ✓ Future features included             │
│ ✓ No recurring fees                    │
│                                         │
│    [Purchase Lifetime Access]           │
└─────────────────────────────────────────┘
```

**Launch Pricing Strategy:**
```
Early Bird (First 100 users): $29 (40% off)
Launch Price (First 500 users): $39 (20% off)
Regular Price: $49
```

#### 5.3 Payment Flow with Lemon Squeezy

**Integration Steps:**

1. **Setup Lemon Squeezy**
   ```bash
   npm install @lemonsqueezy/lemonsqueezy.js
   ```

2. **Create Product in Lemon Squeezy Dashboard**
   - Product Name: "TalentNode - Lifetime Access"
   - Price: $49 USD
   - Type: One-time purchase
   - Enable webhooks

3. **Backend Integration**
   ```typescript
   // lemonsqueezy-config.ts
   import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

   lemonSqueezySetup({
     apiKey: process.env.LEMONSQUEEZY_API_KEY,
     onError: (error) => console.error(error),
   });

   // Create checkout endpoint
   app.post('/api/payment/create-checkout', authenticateUser, async (req, res) => {
     const { userId } = req.user;

     const checkout = await createCheckout(
       process.env.LEMONSQUEEZY_STORE_ID,
       process.env.LEMONSQUEEZY_VARIANT_ID,
       {
         checkoutData: {
           email: req.user.email,
           custom: {
             user_id: userId.toString(),
           },
         },
         checkoutOptions: {
           embed: false,
           media: true,
           logo: true,
         },
         productOptions: {
           name: 'TalentNode - Lifetime Access',
           description: 'Unlock unlimited job searches, CV optimizations, and premium templates',
           receiptButtonText: 'Go to Dashboard',
           receiptLinkUrl: `${process.env.FRONTEND_URL}/dashboard`,
         },
       }
     );

     res.json({ checkoutUrl: checkout.data.attributes.url });
   });

   // Webhook handler
   app.post('/api/payment/webhook', async (req, res) => {
     const signature = req.headers['x-signature'];
     const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

     // Verify webhook signature
     if (!verifySignature(req.body, signature, secret)) {
       return res.status(401).send('Unauthorized');
     }

     const event = req.body;

     if (event.meta.event_name === 'order_created') {
       const { user_id } = event.meta.custom_data;
       const orderId = event.data.id;
       const amount = event.data.attributes.total;

       // Update user subscription
       await db.run(`
         UPDATE users
         SET subscription_status = 'lifetime',
             payment_status = 'paid',
             payment_date = datetime('now'),
             payment_id = ?
         WHERE id = ?
       `, [orderId, user_id]);

       // Send confirmation email
       await sendEmail({
         to: event.data.attributes.user_email,
         subject: 'Welcome to TalentNode Lifetime Access!',
         template: 'lifetime-access-confirmation',
       });
     }

     if (event.meta.event_name === 'order_refunded') {
       const { user_id } = event.meta.custom_data;

       // Revoke access
       await db.run(`
         UPDATE users
         SET subscription_status = 'free',
             payment_status = 'refunded'
         WHERE id = ?
       `, [user_id]);
     }

     res.status(200).send('OK');
   });
   ```

4. **Frontend Integration**
   ```tsx
   // PaymentButton.tsx
   const handlePurchase = async () => {
     try {
       setLoading(true);
       const response = await fetch('/api/payment/create-checkout', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });

       const { checkoutUrl } = await response.json();

       // Redirect to Lemon Squeezy checkout
       window.location.href = checkoutUrl;
     } catch (error) {
       console.error('Payment error:', error);
       showAlert('Payment failed. Please try again.');
     } finally {
       setLoading(false);
     }
   };
   ```

5. **Payment Verification Middleware**
   ```typescript
   export const requirePremium = (req, res, next) => {
     if (req.user.subscriptionStatus !== 'lifetime') {
       return res.status(403).json({
         error: 'Premium access required',
         upgradeUrl: '/pricing',
       });
     }
     next();
   };
   ```

#### 5.4 Free vs. Lifetime Features

**Free Tier:**
- ✅ 3 CV optimizations per month
- ✅ 10 job searches per month
- ✅ 3 basic CV templates
- ✅ Manual job tracking
- ❌ No AI job matching
- ❌ Limited template customization
- ❌ No export to PDF/DOCX

**Lifetime Access ($49):**
- ✅ Unlimited CV optimizations
- ✅ Unlimited job searches
- ✅ All premium CV templates (current + future)
- ✅ AI-powered job matching
- ✅ Full template customization
- ✅ Export to PDF/DOCX/LaTeX
- ✅ Application tracking with analytics
- ✅ Priority support
- ✅ Early access to new features

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Auth Pages│  │ Dashboard │  │ Job Search│  │ CV Optimizer │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
│        │              │              │                │         │
│        └──────────────┴──────────────┴────────────────┘         │
│                              │                                   │
│                         Axios HTTP Client                        │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               │ HTTPS
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                    API Gateway (Express)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Auth Middleware (JWT Validation)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Auth API │  │ User API │  │ Jobs API │  │ Payment API  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
└───────┼─────────────┼─────────────┼────────────────┼───────────┘
        │             │             │                │
        │             │             │                │
┌───────▼─────────────▼─────────────▼────────────────▼───────────┐
│                    Database Layer (SQLite)                      │
│  ┌────────┐ ┌─────────────┐ ┌──────┐ ┌──────────────────────┐ │
│  │ users  │ │ user_profiles│ │ jobs │ │ job_applications    │ │
│  └────────┘ └─────────────┘ └──────┘ └──────────────────────┘ │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────────────┐│
│  │cv_documents│ │ cv_variants  │ │ cv_templates               ││
│  └────────────┘ └──────────────┘ └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
        │                                              │
        │                                              │
┌───────▼──────────────────────────────────┐  ┌───────▼──────────┐
│    External Services                     │  │   File Storage   │
│  ┌──────────────────┐ ┌───────────────┐ │  │  /uploads/       │
│  │ Lemon Squeezy    │ │ Email Service │ │  │  - CV files      │
│  │ (Payments)       │ │ (SendGrid)    │ │  │  - Templates     │
│  └──────────────────┘ └───────────────┘ │  │  - Exports       │
└──────────────────────────────────────────┘  └──────────────────┘
```

### Technology Stack

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express 5.1.0
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Zod
- **File Upload:** Multer
- **Payment:** @lemonsqueezy/lemonsqueezy.js
- **Email:** nodemailer + SendGrid

**Frontend:**
- **Framework:** React 19.2.0
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Routing:** React Router v6
- **UI Library:** shadcn/ui + Tailwind CSS
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Rich Text:** TipTap (for CV editing)
- **PDF Generation:** react-pdf or jsPDF

**DevOps:**
- **Version Control:** Git
- **Hosting (Backend):** Railway, Render, or DigitalOcean
- **Hosting (Frontend):** Vercel or Netlify
- **Database Backups:** SQLite backup to S3
- **Monitoring:** Sentry (error tracking)

---

## Database Schema Changes

### Multi-User Schema Updates

**New Tables:**

```sql
-- Users table (authentication)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires DATETIME,
  subscription_status TEXT DEFAULT 'free',
  payment_status TEXT DEFAULT 'unpaid',
  payment_date DATETIME,
  payment_id TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until DATETIME,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_status);

-- Job applications tracking
CREATE TABLE job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  cv_variant_id INTEGER,
  applied_date DATE NOT NULL,
  application_status TEXT DEFAULT 'applied',
  application_source TEXT,
  application_notes TEXT,
  follow_up_date DATE,
  interview_date DATETIME,
  interview_notes TEXT,
  offer_amount DECIMAL(10,2),
  offer_currency TEXT DEFAULT 'USD',
  decision TEXT,
  decision_date DATE,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (cv_variant_id) REFERENCES cv_variants(id) ON DELETE SET NULL
);

CREATE INDEX idx_applications_user ON job_applications(user_id);
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_status ON job_applications(application_status);
CREATE INDEX idx_applications_date ON job_applications(applied_date DESC);

-- CV templates
CREATE TABLE cv_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  is_premium BOOLEAN DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  structure_json TEXT,
  styling_json TEXT,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  author TEXT DEFAULT 'TalentNode',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User template purchases
CREATE TABLE user_template_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  price_paid DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES cv_templates(id) ON DELETE CASCADE,
  UNIQUE(user_id, template_id)
);

-- Activity log (for analytics)
CREATE TABLE user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL, -- 'login', 'cv_upload', 'cv_optimize', 'job_apply', etc.
  activity_data TEXT, -- JSON with additional data
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_user ON user_activity(user_id);
CREATE INDEX idx_activity_type ON user_activity(activity_type);
CREATE INDEX idx_activity_date ON user_activity(created_at DESC);
```

**Updated Tables (Add user_id foreign keys):**

```sql
-- Add user_id to existing tables
ALTER TABLE user_profiles ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE cv_documents ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE jobs ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE custom_companies ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for foreign keys
CREATE INDEX idx_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_cv_docs_user ON cv_documents(user_id);
CREATE INDEX idx_jobs_user ON jobs(user_id);
CREATE INDEX idx_companies_user ON custom_companies(user_id);

-- Update cv_variants to link to user
ALTER TABLE cv_variants ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX idx_cv_variants_user ON cv_variants(user_id);
```

**Migration Strategy:**
```sql
-- Migration: Add user_id to existing data
-- For existing single-user data, assign to user ID 1
UPDATE user_profiles SET user_id = 1 WHERE user_id IS NULL;
UPDATE cv_documents SET user_id = 1 WHERE user_id IS NULL;
UPDATE jobs SET user_id = 1 WHERE user_id IS NULL;
UPDATE cv_variants SET user_id = 1 WHERE user_id IS NULL;
```

### Seed Data for CV Templates

```sql
-- Insert 5 initial CV templates
INSERT INTO cv_templates (name, category, description, is_premium, price, structure_json, styling_json) VALUES
(
  'Modern Professional',
  'modern',
  'Clean, modern design with bold headers and two-column layout',
  0,
  0,
  '{"sections":[{"id":"header","type":"header","order":1,"required":true},{"id":"summary","type":"summary","order":2,"required":true},{"id":"experience","type":"experience","order":3,"required":true},{"id":"education","type":"education","order":4,"required":true},{"id":"skills","type":"skills","order":5,"required":true}],"layout":"two-column","headerPosition":"top"}',
  '{"fonts":{"heading":"Inter","body":"Inter","size":{"heading":24,"body":11}},"colors":{"primary":"#2563EB","secondary":"#64748B","text":"#1E293B","background":"#FFFFFF"},"spacing":{"sectionGap":24,"lineHeight":1.6,"margins":{"top":40,"right":40,"bottom":40,"left":40}}}'
),
(
  'Classic ATS-Friendly',
  'ats',
  'Simple, single-column design optimized for ATS parsing',
  0,
  0,
  '{"sections":[{"id":"header","type":"header","order":1,"required":true},{"id":"summary","type":"summary","order":2,"required":true},{"id":"experience","type":"experience","order":3,"required":true},{"id":"education","type":"education","order":4,"required":true},{"id":"skills","type":"skills","order":5,"required":true}],"layout":"single-column","headerPosition":"top"}',
  '{"fonts":{"heading":"Arial","body":"Arial","size":{"heading":18,"body":11}},"colors":{"primary":"#000000","secondary":"#404040","text":"#000000","background":"#FFFFFF"},"spacing":{"sectionGap":20,"lineHeight":1.5,"margins":{"top":40,"right":40,"bottom":40,"left":40}}}'
),
(
  'Minimalist Executive',
  'minimalist',
  'Elegant minimalist design with subtle accents',
  1,
  9.99,
  '{"sections":[{"id":"header","type":"header","order":1,"required":true},{"id":"summary","type":"summary","order":2,"required":true},{"id":"experience","type":"experience","order":3,"required":true},{"id":"skills","type":"skills","order":4,"required":true},{"id":"education","type":"education","order":5,"required":true}],"layout":"single-column","headerPosition":"left"}',
  '{"fonts":{"heading":"Helvetica","body":"Helvetica","size":{"heading":20,"body":10}},"colors":{"primary":"#1A1A1A","secondary":"#666666","text":"#2D2D2D","background":"#FAFAFA"},"spacing":{"sectionGap":32,"lineHeight":1.8,"margins":{"top":50,"right":50,"bottom":50,"left":50}}}'
),
(
  'Creative Portfolio',
  'creative',
  'Eye-catching design for creative professionals',
  1,
  12.99,
  '{"sections":[{"id":"header","type":"header","order":1,"required":true},{"id":"summary","type":"summary","order":2,"required":true},{"id":"experience","type":"experience","order":3,"required":true},{"id":"skills","type":"skills","order":4,"required":true},{"id":"education","type":"education","order":5,"required":true}],"layout":"two-column","headerPosition":"top"}',
  '{"fonts":{"heading":"Montserrat","body":"Open Sans","size":{"heading":28,"body":11}},"colors":{"primary":"#8B5CF6","secondary":"#EC4899","text":"#1F2937","background":"#FFFFFF"},"spacing":{"sectionGap":28,"lineHeight":1.7,"margins":{"top":40,"right":40,"bottom":40,"left":40}}}'
),
(
  'Tech Professional',
  'modern',
  'Developer-focused design with technical sections',
  1,
  9.99,
  '{"sections":[{"id":"header","type":"header","order":1,"required":true},{"id":"summary","type":"summary","order":2,"required":true},{"id":"skills","type":"skills","order":3,"required":true},{"id":"experience","type":"experience","order":4,"required":true},{"id":"education","type":"education","order":5,"required":true}],"layout":"two-column","headerPosition":"top"}',
  '{"fonts":{"heading":"JetBrains Mono","body":"Roboto","size":{"heading":22,"body":10}},"colors":{"primary":"#10B981","secondary":"#6366F1","text":"#111827","background":"#FFFFFF"},"spacing":{"sectionGap":24,"lineHeight":1.6,"margins":{"top":40,"right":40,"bottom":40,"left":40}}}'
);
```

---

## API Endpoints Design

### Authentication Endpoints

```typescript
POST /api/auth/register
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
Response:
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "subscriptionStatus": "free"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 604800
  }
}

POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
Response: (same as register)

POST /api/auth/logout
Request:
{
  "refreshToken": "eyJhbGc..."
}
Response:
{
  "success": true,
  "message": "Logged out successfully"
}

POST /api/auth/refresh
Request:
{
  "refreshToken": "eyJhbGc..."
}
Response:
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 604800
}

POST /api/auth/forgot-password
Request:
{
  "email": "user@example.com"
}
Response:
{
  "success": true,
  "message": "Password reset email sent"
}

POST /api/auth/reset-password
Request:
{
  "token": "reset-token-uuid",
  "newPassword": "NewPass123!"
}
Response:
{
  "success": true,
  "message": "Password reset successful"
}
```

### Dashboard Endpoints

```typescript
GET /api/dashboard/stats
Headers: Authorization: Bearer {token}
Response:
{
  "cvsUploaded": 3,
  "cvsOptimized": 12,
  "jobsApplied": 8,
  "averageMatchScore": 84.5,
  "successRate": 37.5,
  "recentActivity": [
    {
      "type": "cv_optimized",
      "jobTitle": "Product Designer",
      "company": "Anthropic",
      "matchScore": 92,
      "date": "2025-11-21T10:30:00Z"
    }
  ]
}

GET /api/dashboard/cv-optimizations
Headers: Authorization: Bearer {token}
Query: ?page=1&limit=10&sortBy=date&sortOrder=desc
Response:
{
  "total": 12,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 45,
      "baseCVId": 3,
      "baseCVName": "john-doe-resume.pdf",
      "jobId": 123,
      "jobTitle": "Senior Product Designer",
      "company": "Anthropic",
      "variantType": "optimized",
      "matchScore": 92,
      "optimizedDate": "2025-11-21T10:30:00Z",
      "changesSummary": [
        "Emphasized AI/ML experience",
        "Reordered skills to match requirements",
        "Updated professional summary"
      ],
      "strongMatches": [
        "Design systems experience",
        "Enterprise scale",
        "Cross-functional leadership"
      ],
      "gaps": [
        "Limited AI product experience"
      ],
      "downloadUrls": {
        "pdf": "/api/cv-variants/45/download?format=pdf",
        "docx": "/api/cv-variants/45/download?format=docx"
      }
    }
  ]
}

GET /api/dashboard/applications
Headers: Authorization: Bearer {token}
Query: ?status=applied&page=1&limit=10
Response:
{
  "total": 8,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 12,
      "job": {
        "id": 123,
        "title": "Senior Product Designer",
        "company": "Anthropic",
        "url": "https://anthropic.com/careers/123"
      },
      "appliedDate": "2025-11-20",
      "matchScore": 92,
      "status": "in_review",
      "cvVariant": {
        "id": 45,
        "type": "optimized",
        "downloadUrl": "/api/cv-variants/45/download?format=pdf"
      },
      "notes": "Applied through referral from Jane Smith",
      "followUpDate": "2025-11-27"
    }
  ]
}
```

### Job Application Endpoints

```typescript
POST /api/jobs/:jobId/mark-applied
Headers: Authorization: Bearer {token}
Request:
{
  "appliedDate": "2025-11-23",
  "cvVariantId": 45,
  "applicationSource": "company_site",
  "notes": "Applied through referral"
}
Response:
{
  "success": true,
  "application": {
    "id": 13,
    "jobId": 123,
    "appliedDate": "2025-11-23",
    "status": "applied"
  }
}

PUT /api/applications/:id
Headers: Authorization: Bearer {token}
Request:
{
  "status": "interview_scheduled",
  "interviewDate": "2025-12-01T14:00:00Z",
  "interviewNotes": "First round with hiring manager"
}
Response:
{
  "success": true,
  "application": { ... }
}

DELETE /api/applications/:id
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Application deleted"
}
```

### CV Template Endpoints

```typescript
GET /api/cv-templates
Response:
{
  "templates": [
    {
      "id": 1,
      "name": "Modern Professional",
      "category": "modern",
      "description": "Clean, modern design...",
      "thumbnailUrl": "/templates/thumbnails/modern-pro.jpg",
      "isPremium": false,
      "price": 0,
      "rating": 4.8,
      "usageCount": 1247
    }
  ]
}

GET /api/cv-templates/:id/preview
Response:
{
  "template": { ... },
  "previewUrl": "/templates/previews/modern-pro.pdf"
}

POST /api/cv-variants/:variantId/apply-template
Headers: Authorization: Bearer {token}
Request:
{
  "templateId": 1,
  "customizations": {
    "colors": {
      "primary": "#2563EB"
    }
  }
}
Response:
{
  "success": true,
  "downloadUrls": {
    "pdf": "/api/exports/variant-123-template-1.pdf",
    "docx": "/api/exports/variant-123-template-1.docx"
  }
}

POST /api/templates/purchase
Headers: Authorization: Bearer {token}
Request:
{
  "templateId": 3,
  "paymentMethodId": "pm_123"
}
Response:
{
  "success": true,
  "purchase": {
    "id": 45,
    "templateId": 3,
    "pricePaid": 9.99,
    "purchaseDate": "2025-11-23"
  }
}
```

### Payment Endpoints

```typescript
POST /api/payment/create-checkout
Headers: Authorization: Bearer {token}
Response:
{
  "checkoutUrl": "https://talentnode.lemonsqueezy.com/checkout/..."
}

POST /api/payment/webhook
Headers: X-Signature: {signature}
Request: (Lemon Squeezy webhook payload)
Response: 200 OK

GET /api/payment/status
Headers: Authorization: Bearer {token}
Response:
{
  "subscriptionStatus": "lifetime",
  "paymentStatus": "paid",
  "paymentDate": "2025-11-15",
  "features": {
    "cvOptimizations": "unlimited",
    "jobSearches": "unlimited",
    "premiumTemplates": true
  }
}
```

### Profile Management Endpoints

```typescript
GET /api/profile/me
Headers: Authorization: Bearer {token}
Response:
{
  "id": 123,
  "email": "user@example.com",
  "fullName": "John Doe",
  "profilePhoto": "/uploads/profiles/123.jpg",
  "headline": "Senior Product Designer",
  "summary": "...",
  ... (all profile fields)
}

PUT /api/profile/me
Headers: Authorization: Bearer {token}
Request:
{
  "fullName": "John Doe",
  "headline": "Lead Product Designer",
  "skills": ["Figma", "React", "Design Systems"]
}
Response:
{
  "success": true,
  "profile": { ... }
}

POST /api/profile/photo
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Request: FormData with 'photo' file
Response:
{
  "success": true,
  "photoUrl": "/uploads/profiles/123.jpg"
}

PUT /api/profile/settings
Headers: Authorization: Bearer {token}
Request:
{
  "emailNotifications": true,
  "weeklyDigest": false,
  "jobAlerts": true
}
Response:
{
  "success": true
}

DELETE /api/profile/me
Headers: Authorization: Bearer {token}
Request:
{
  "password": "current-password",
  "confirmation": "DELETE MY ACCOUNT"
}
Response:
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## UI/UX Implementation

### Page Structure

```
/
├── / (Home/Landing)
├── /login
├── /register
├── /forgot-password
├── /reset-password/:token
├── /dashboard
│   ├── /dashboard/overview
│   ├── /dashboard/cvs
│   ├── /dashboard/optimizations
│   ├── /dashboard/applications
│   └── /dashboard/analytics
├── /jobs
│   ├── /jobs/search
│   ├── /jobs/:id
│   └── /jobs/:id/optimize-cv
├── /cv
│   ├── /cv/upload
│   ├── /cv/templates
│   └── /cv/editor/:id
├── /profile
│   ├── /profile/edit
│   └── /profile/settings
├── /pricing
└── /help
```

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoutes
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   ├── ForgotPasswordPage
│   │   └── ResetPasswordPage
│   └── ProtectedRoutes (requires authentication)
│       ├── DashboardLayout
│       │   ├── Sidebar
│       │   ├── TopNav
│       │   └── Content
│       │       ├── DashboardOverview
│       │       ├── CVManagement
│       │       ├── OptimizationsView
│       │       └── ApplicationsView
│       ├── JobSearchPage
│       ├── CVOptimizerPage
│       ├── ProfileEditPage
│       └── SettingsPage
└── Modals
    ├── MarkAppliedDialog
    ├── TemplateSelector
    └── UpgradePrompt
```

### Key UI Components

**1. Dashboard Overview Component**
```tsx
<DashboardOverview>
  <StatsCards>
    <StatCard
      title="CVs Uploaded"
      value={stats.cvsUploaded}
      icon={<FileText />}
      trend="+2 this month"
    />
    <StatCard
      title="CVs Optimized"
      value={stats.cvsOptimized}
      icon={<Sparkles />}
      trend="+8 this month"
    />
    <StatCard
      title="Jobs Applied"
      value={stats.jobsApplied}
      icon={<Briefcase />}
      trend="+3 this week"
    />
  </StatsCards>

  <RecentOptimizations
    data={recentOptimizations}
    onDownload={handleDownload}
  />

  <ApplicationsTimeline
    data={recentApplications}
    onStatusUpdate={handleStatusUpdate}
  />
</DashboardOverview>
```

**2. Mark Applied Dialog**
```tsx
<MarkAppliedDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  job={selectedJob}
  availableVariants={cvVariants}
  onSubmit={handleMarkApplied}
>
  <Form>
    <DatePicker
      label="Application Date"
      value={appliedDate}
      onChange={setAppliedDate}
    />

    <Select
      label="CV Used"
      options={cvVariants}
      value={selectedVariant}
      onChange={setSelectedVariant}
    />

    <Select
      label="Applied Via"
      options={['company_site', 'linkedin', 'indeed', 'glassdoor']}
      value={applicationSource}
      onChange={setApplicationSource}
    />

    <Textarea
      label="Notes"
      value={notes}
      onChange={setNotes}
      placeholder="Add any additional information..."
    />
  </Form>
</MarkAppliedDialog>
```

**3. CV Template Selector**
```tsx
<TemplateSelector
  templates={templates}
  userHasPremium={user.subscriptionStatus === 'lifetime'}
  onSelect={handleTemplateSelect}
>
  <TemplateGrid>
    {templates.map(template => (
      <TemplateCard
        key={template.id}
        template={template}
        isPremium={template.isPremium}
        locked={template.isPremium && !userHasPremium}
        onPreview={() => handlePreview(template)}
        onSelect={() => handleSelect(template)}
      />
    ))}
  </TemplateGrid>

  {!userHasPremium && (
    <UpgradePrompt
      message="Unlock all premium templates"
      cta="Upgrade to Lifetime Access"
      onClick={() => navigate('/pricing')}
    />
  )}
</TemplateSelector>
```

**4. Applications Table**
```tsx
<ApplicationsTable
  applications={applications}
  onStatusChange={handleStatusChange}
  onDelete={handleDelete}
>
  <DataTable
    columns={[
      { header: 'Job Title', accessor: 'job.title' },
      { header: 'Company', accessor: 'job.company' },
      { header: 'Applied', accessor: 'appliedDate', format: 'date' },
      { header: 'Match', accessor: 'matchScore', format: 'percentage' },
      { header: 'Status', accessor: 'status', render: StatusBadge },
      { header: 'Actions', render: ActionsMenu }
    ]}
    data={applications}
    sortable
    filterable
    pagination
  />
</ApplicationsTable>
```

### Responsive Design

**Breakpoints:**
```css
/* Mobile: 0-640px */
/* Tablet: 641-1024px */
/* Desktop: 1025px+ */
```

**Mobile-First Approach:**
- Dashboard sidebar collapses to hamburger menu
- Tables convert to cards on mobile
- Stats cards stack vertically
- Template grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

---

## Implementation Phases

### Phase 1: Authentication & Multi-User (2 weeks)

**Week 1: Backend**
- [ ] Create `users` table migration
- [ ] Add `user_id` to existing tables
- [ ] Implement JWT authentication
- [ ] Build registration endpoint
- [ ] Build login endpoint
- [ ] Build password reset flow
- [ ] Add auth middleware
- [ ] Update all API endpoints to filter by user_id
- [ ] Write authentication tests

**Week 2: Frontend**
- [ ] Create Login page
- [ ] Create Register page (integrate with OnboardingWizard)
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Build AuthProvider context
- [ ] Implement protected routes
- [ ] Add JWT token management (localStorage + refresh)
- [ ] Build logout functionality
- [ ] Add session timeout handling

**Deliverables:**
- ✅ Multi-user authentication system
- ✅ Protected API routes
- ✅ Secure password management
- ✅ User sessions with JWT

---

### Phase 2: Dashboard & Application Tracking (2 weeks)

**Week 1: Backend**
- [ ] Create `job_applications` table
- [ ] Create `user_activity` table
- [ ] Build dashboard stats endpoint
- [ ] Build CV optimizations list endpoint
- [ ] Build applications CRUD endpoints
- [ ] Add application analytics endpoint
- [ ] Create email notification system

**Week 2: Frontend**
- [ ] Build Dashboard layout (sidebar + content)
- [ ] Create DashboardOverview component
- [ ] Build CVManagement section
- [ ] Create OptimizationsView component
- [ ] Build ApplicationsView component
- [ ] Add "Mark Applied" button to JobCard
- [ ] Create MarkAppliedDialog component
- [ ] Build ApplicationsTable component
- [ ] Add application status tracking
- [ ] Create analytics charts

**Deliverables:**
- ✅ Complete dashboard UI
- ✅ CV optimization tracking
- ✅ Job application tracking with dates
- ✅ Match score analytics
- ✅ Application timeline view

---

### Phase 3: CV Templates (1.5 weeks)

**Week 1:**
- [ ] Create `cv_templates` table
- [ ] Seed initial templates (5 templates)
- [ ] Build template rendering engine
- [ ] Implement PDF export with templates
- [ ] Implement DOCX export with templates
- [ ] Create template selection API
- [ ] Build template preview generation

**Week 2 (Part):**
- [ ] Build TemplateSelector component
- [ ] Create TemplateCard components
- [ ] Add template preview modal
- [ ] Integrate template selection with CV optimization flow
- [ ] Build template customization UI (colors, fonts)
- [ ] Add premium template gating
- [ ] Create template purchase flow (for future marketplace)

**Deliverables:**
- ✅ 5 professional CV templates
- ✅ Template selection interface
- ✅ PDF/DOCX export with templates
- ✅ Template customization
- ✅ Premium template gating

---

### Phase 4: Payment Integration (1 week)

**Week 1:**
- [ ] Set up Lemon Squeezy account
- [ ] Create product in Lemon Squeezy
- [ ] Integrate Lemon Squeezy SDK
- [ ] Build checkout creation endpoint
- [ ] Implement webhook handler
- [ ] Add subscription status checks
- [ ] Build pricing page
- [ ] Create upgrade prompts
- [ ] Add feature gating (free vs. lifetime)
- [ ] Test payment flow end-to-end
- [ ] Set up email confirmations

**Deliverables:**
- ✅ Working payment system
- ✅ Lifetime access pricing
- ✅ Feature gating
- ✅ Payment confirmations
- ✅ Webhook automation

---

### Phase 5: Profile Management (1 week)

**Week 1:**
- [ ] Build Profile Edit page
- [ ] Add profile photo upload
- [ ] Create Settings page
- [ ] Build account settings UI
- [ ] Add notification preferences
- [ ] Implement password change flow
- [ ] Add account deletion
- [ ] Build data export (GDPR compliance)
- [ ] Create activity log viewer

**Deliverables:**
- ✅ Complete profile editing
- ✅ Settings management
- ✅ Account security features
- ✅ GDPR compliance

---

### Phase 6: Polish & Testing (1 week)

**Week 1:**
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security audit
- [ ] UI/UX refinements
- [ ] Documentation
- [ ] Deployment preparation
- [ ] Beta testing with users

**Deliverables:**
- ✅ Production-ready application
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Ready for launch

---

**Total Timeline: 8.5 weeks (~2 months)**

---

## Security Considerations

### Authentication Security

1. **Password Security**
   - Minimum 8 characters, 1 uppercase, 1 number, 1 special character
   - bcrypt hashing with salt rounds = 12
   - Password history (prevent reuse of last 3 passwords)
   - Rate limiting on password attempts

2. **JWT Security**
   - Short-lived access tokens (1 week)
   - Long-lived refresh tokens (30 days)
   - Secure token storage (httpOnly cookies or localStorage)
   - Token rotation on refresh
   - Blacklist for revoked tokens

3. **Account Protection**
   - Email verification (optional for MVP)
   - Account lockout after 5 failed attempts (15-minute lockout)
   - Password reset token expires in 1 hour
   - Two-factor authentication (future enhancement)

### API Security

1. **Authentication Middleware**
   ```typescript
   const authenticateUser = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];

     if (!token) {
       return res.status(401).json({ error: 'No token provided' });
     }

     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({ error: 'Invalid token' });
     }
   };
   ```

2. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';

   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 requests per window
     message: 'Too many attempts, please try again later'
   });

   app.post('/api/auth/login', authLimiter, loginHandler);
   ```

3. **Input Validation**
   - Validate all inputs with Zod schemas
   - Sanitize user inputs
   - Prevent SQL injection (parameterized queries)
   - XSS protection (escape HTML)
   - CSRF protection (CSRF tokens)

4. **CORS Configuration**
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

### Data Security

1. **Encryption**
   - HTTPS in production (TLS 1.3)
   - Encrypt sensitive data at rest
   - Secure file uploads (virus scanning)
   - Secure environment variables

2. **Database Security**
   - Prepared statements (prevent SQL injection)
   - Regular backups (daily automated backups)
   - Foreign key constraints with CASCADE
   - Row-level security (user_id filtering)

3. **File Upload Security**
   - File type validation (whitelist: PDF, DOCX, TXT, MD)
   - File size limits (5MB max)
   - Virus scanning (ClamAV)
   - Secure file storage (outside public directory)
   - Unique filenames (UUID)

### Privacy & Compliance

1. **GDPR Compliance**
   - Data export functionality
   - Account deletion (hard delete + cascade)
   - Privacy policy
   - Cookie consent
   - Data processing agreement

2. **Data Retention**
   - Delete inactive accounts after 2 years
   - Purge deleted user data after 30 days
   - Anonymize analytics data after 1 year

3. **Audit Logging**
   - Log all authentication events
   - Track sensitive operations (payment, data export, deletion)
   - Store IP addresses and user agents
   - 90-day log retention

---

## Testing Requirements

### Unit Tests

**Backend:**
```typescript
// Auth tests
describe('Authentication', () => {
  test('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        fullName: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('tokens');
  });

  test('should reject duplicate email', async () => {
    // Create first user
    await createUser({ email: 'test@example.com' });

    // Try to create duplicate
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Email already exists');
  });

  test('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'weak'
      });

    expect(response.status).toBe(400);
  });
});

// Application tests
describe('Job Applications', () => {
  test('should mark job as applied', async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post('/api/jobs/123/mark-applied')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appliedDate: '2025-11-23',
        cvVariantId: 45
      });

    expect(response.status).toBe(201);
    expect(response.body.application).toHaveProperty('id');
  });

  test('should require authentication', async () => {
    const response = await request(app)
      .post('/api/jobs/123/mark-applied')
      .send({
        appliedDate: '2025-11-23'
      });

    expect(response.status).toBe(401);
  });
});
```

**Frontend:**
```typescript
// Component tests
describe('MarkAppliedDialog', () => {
  test('should render form fields', () => {
    render(<MarkAppliedDialog open={true} job={mockJob} />);

    expect(screen.getByLabelText('Application Date')).toBeInTheDocument();
    expect(screen.getByLabelText('CV Used')).toBeInTheDocument();
    expect(screen.getByLabelText('Applied Via')).toBeInTheDocument();
  });

  test('should submit application', async () => {
    const onSubmit = jest.fn();
    render(<MarkAppliedDialog open={true} job={mockJob} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Application Date'), {
      target: { value: '2025-11-23' }
    });

    fireEvent.click(screen.getByText('Mark as Applied'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        appliedDate: '2025-11-23',
        cvVariantId: expect.any(Number)
      });
    });
  });
});
```

### Integration Tests

```typescript
describe('End-to-End: Apply to Job', () => {
  test('complete application flow', async () => {
    // 1. Register user
    const { token } = await registerUser({
      email: 'test@example.com',
      password: 'Test123!'
    });

    // 2. Upload CV
    const { cvId } = await uploadCV(token, 'resume.pdf');

    // 3. Search for jobs
    const jobs = await searchJobs(token);
    expect(jobs.length).toBeGreaterThan(0);

    // 4. Optimize CV for job
    const { variantId } = await optimizeCV(token, jobs[0].id, cvId);

    // 5. Mark job as applied
    const application = await markApplied(token, jobs[0].id, {
      cvVariantId: variantId,
      appliedDate: '2025-11-23'
    });

    expect(application.status).toBe('applied');

    // 6. Check dashboard
    const stats = await getDashboardStats(token);
    expect(stats.jobsApplied).toBe(1);
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  test('dashboard should load in < 2 seconds', async () => {
    const start = Date.now();
    const response = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000);
  });

  test('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

### Security Tests

```typescript
describe('Security', () => {
  test('should prevent SQL injection', async () => {
    const response = await request(app)
      .get('/api/jobs?search=\'; DROP TABLE users; --');

    expect(response.status).not.toBe(500);
  });

  test('should prevent unauthorized access', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats');

    expect(response.status).toBe(401);
  });

  test('should rate limit login attempts', async () => {
    const attempts = Array(10).fill(null).map(() =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
    );

    const responses = await Promise.all(attempts);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## Appendix

### Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./data/jobs.db

# JWT
JWT_SECRET=your-secret-key-here-min-32-characters
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-here-min-32-characters
REFRESH_TOKEN_EXPIRES_IN=30d

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_VARIANT_ID=your-variant-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@talentnode.com

# File Upload
MAX_FILE_SIZE=5242880 # 5MB in bytes
UPLOAD_DIR=./uploads

# AI (OpenAI/Anthropic)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
AI_PROVIDER=anthropic

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=5

# Features
ENABLE_EMAIL_VERIFICATION=false
ENABLE_2FA=false
```

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Seed initial data (CV templates)
- [ ] Set up SSL certificate
- [ ] Configure CORS for production domain
- [ ] Set up error monitoring (Sentry)
- [ ] Configure automated backups
- [ ] Test payment webhooks
- [ ] Set up CDN for static assets
- [ ] Configure email templates
- [ ] Run security audit
- [ ] Load testing
- [ ] Set up monitoring/alerts
- [ ] Create admin dashboard
- [ ] Write deployment documentation

### Third-Party Services

| Service | Purpose | Cost |
|---------|---------|------|
| Lemon Squeezy | Payment processing | 5% + $0.50 per transaction |
| SendGrid | Email delivery | Free (12k emails/month) |
| Railway/Render | Backend hosting | $5-20/month |
| Vercel | Frontend hosting | Free |
| Sentry | Error monitoring | Free (5k events/month) |
| Cloudflare | CDN + DDoS protection | Free |

---

## Conclusion

This specification provides a complete roadmap for Phase 2 of the Job Research System. The implementation will transform the MVP into a production-ready SaaS platform with:

✅ Multi-user authentication
✅ Comprehensive dashboard
✅ Application tracking with dates
✅ CV templates marketplace
✅ Payment integration
✅ Profile management

**Estimated Timeline:** 8.5 weeks
**Estimated Cost:** $500-1000 (third-party services for 1 year)

**Next Steps:**
1. Review and approve this specification
2. Set up development environment
3. Begin Phase 1 implementation (Authentication & Multi-User)

---

**Document Version:** 1.0
**Last Updated:** November 23, 2025
**Status:** Awaiting Approval
