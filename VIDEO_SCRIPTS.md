# Team Speedrunners Design System - Video Walkthrough Script
## Runtime: ~14 minutes | Target Audience: New Users, Stakeholders, Demo Presentations
---

## OPENING (0:00 - 0:45)
**[SCENE: Slow pan across landing page hero section, cut to login form, submit credentials, smooth load into client dashboard]**
> **VOICEOVER:** This is the Team Speedrunners design request platform. In this complete walkthrough we will go through each user role individually and completely. For every role we will first examine every UI element on the dashboard strictly top to bottom, demonstrating functionality, interactions and animations. Then we will navigate through every sidebar navigation category in order, demonstrating each page fully. Then we will repeat this exact same process for the next user role.

---

## GLOBAL UI LAYOUT DEEP DIVE (0:45 - 2:10)
**[SCENE: Hold steady on client dashboard, zoom and highlight each element sequentially]**
> **VOICEOVER:** First we cover the global interface elements that are 100% identical across every user role. These never change regardless of permissions:

### Header Bar (Left → Right Complete Breakdown)
> **[SCENE: Click and interact with each element as it is explained]**
> 1.  **Hamburger Menu Toggle** `[0:55]` - Smooth 300ms slide animation. Collapses sidebar to icon only view for extra workspace on smaller screens. State is remembered between sessions.
> 2.  **Application Logo** `[1:05]` - Hover state animation. Always acts as a universal home button that returns you to your role-appropriate dashboard from any page in the system, no matter how deep you have navigated.
> 3.  **Global Search Bar** `[1:15]` - Typeahead search that activates after 3 characters. Searches across usernames, request titles, reference numbers, and message content. Results are filtered by your user permissions automatically.
> 4.  **Messages Icon** `[1:28]` - Real time unread counter that updates without page refresh. Clicking opens a 3 line preview popup of your most recent conversations before navigating to the full chat interface.
> 5.  **Notifications Bell** `[1:40]` - Animated pulse effect when new notifications arrive. Dropdown shows 10 most recent items with mark as read buttons inline. Cleared notifications are archived permanently.
> 6.  **User Avatar** `[1:52]` - Small status indicator dot in the bottom right corner: green for online, yellow for idle, red for do not disturb. Clicking opens the user menu.
> 7.  **Dark Mode Toggle** `[2:02]` - Instant theme switch with no page reload. Selection is saved to your user profile and applied automatically on all devices.

---

## 🧑‍💼 CLIENT USER FULL WALKTHROUGH (2:10 - 5:45)
**[SCENE: Reset to full client dashboard view. Slow pan starting at absolute top of screen]**

### Client Dashboard - Top to Bottom Complete Walkthrough
> **VOICEOVER:** `[2:15]` Now the Client dashboard, going strictly top to bottom, element by element, exactly as they appear on screen:
>
> 1.  **Greeting Bar** `[2:20]` - Personalized welcome message with your full name. Live updating clock and date widget with 12/24 hour toggle that works with a single click.
> 2.  **Statistics Cards Row** `[2:32]` - Four cards, all update in real time every 60 seconds:
>     - Total requests submitted all time
>     - Requests currently being worked on
>     - Completed designs delivered this calendar month
>     - Current account balance with pending charges
>     *Each card has a hover elevation effect, and clicking opens the relevant filtered view*
> 3.  **Quick Actions Grid** `[2:55]` - Three large primary action buttons:
>     - **New Design Request** - Opens the multi step request form modal
>     - **View Schedule** - Shows upcoming delivery dates on a calendar view
>     - **Contact Support** - Opens a pre populated support chat thread
> 4.  **Needs Attention Panel** `[3:15]` - Left column. Items requiring your action are ordered by urgency and due date. Items turn orange 24 hours before deadline, red at 4 hours. Badges show exactly how many items are waiting.
> 5.  **Recent Activity Panel** `[3:30]` - Right column. Chronological feed of the last 10 system events related to your account. Each entry links directly to the relevant request or message.

### Client Workflow Demo: Submit New Design Request
**[ACTION: Click New Design Request button]**
> **VOICEOVER:** `[3:45]` Demonstrating complete new request submission workflow:
>
> **[ACTION: Select 'Presentation' from Design Type dropdown]**
> **[ACTION: Leave Designer Assignment as 'Open to all designers']**
> **[ACTION: Enter sample project title]**
> **[ACTION: Enter full description and requirements]**
> **[ACTION: Set budget 150 USD]**
> **[ACTION: Select deadline 5 days from now]**
> **[ACTION: Drag and drop 2 sample reference files]**
>
> **[ACTION: Click Submit Request]**
>
> Request is created with status PENDING. It appears immediately in My Requests and becomes visible to all designers in the request pool. Client receives confirmation notification.

### Client Sidebar Full Navigation
**[SCENE: Click each sidebar item, wait 8 seconds on each page, demonstrate sorting/filtering]**
> **VOICEOVER:** `[4:45]` Now we go through every sidebar navigation category in exactly the order they appear:
>
> 1.  ✅ **Dashboard** - The screen we just completed walking through
> 2.  📋 **My Requests** `[4:55]` - Complete tabular view of every request you have ever submitted. Sortable by every column, filterable by status, date range, and designer. Bulk actions available.
> 3.  📊 **Status Tracker** `[5:15]` - Drag and drop Kanban board view. Columns: Submitted, Review, In Progress, Revision, Complete, Delivered. Cards update in real time as designers change status.
> 4.  💳 **Payments** `[5:35]` - Full transaction history with PDF invoice downloads. Saved payment methods, auto pay toggle, and pending transaction previews.

> **VOICEOVER:** `[5:35]` That is every single page and feature available to a Client user. Now we will switch to the Designer role.

---

## 🎨 DESIGNER USER FULL WALKTHROUGH (5:45 - 9:30)
**[SCENE: Smooth logout animation, login as Designer user, wait for dashboard to load]**

### Designer Dashboard - Top to Bottom Complete Walkthrough
> **VOICEOVER:** `[5:55]` Now the Designer Dashboard, again strictly top to bottom order:
>
> 1.  **Greeting Bar** `[6:00]` - Exact same layout and clock widget, populated with Designer's name.
> 2.  **Statistics Cards Row** `[6:07]`
>     - Open requests available in the pool
>     - Active assignments currently accepted
>     - Completed work items this month
>     - Pending earnings scheduled for next payout
> 3.  **Quick Actions Grid** `[6:25]`
>     - **Browse Request Pool** - Jumps directly to available unassigned work
>     - **View Schedule** - Personal workload calendar with capacity indicators
>     - **Message Administrator** - Direct support line for designers
> 4.  **Needs Attention Panel** `[6:40]` - Assignments approaching deadlines, client revision requests, and items waiting for your review.
> 5.  **Recent Activity Panel** `[6:55]` - Assignment status changes, client messages, and payout notifications.

### Designer Workflow Demo: Claim Request + Update Status
**[ACTION: Navigate to Requests Pool]**
> **VOICEOVER:** `[7:10]` Demonstrating designer workflow:
>
> **[ACTION: Click Claim button on the request we just created as Client]**
> Request is now assigned to this designer. It moves from pool to Assignments. Client receives notification.
>
> **[ACTION: Open the assignment]**
> **[ACTION: Open status dropdown, select 'in_progress', click Update Status]**
> Status updates in real time on client dashboard.
>
> **[ACTION: Reopen request after 10 seconds]**
> **[ACTION: Select status 'completed', upload finished design file]**
> Completed status requires at least one uploaded file. Confirmation modal appears.
>
> **[ACTION: Click Yes, Complete]**
> Request moves to client completed column. Designer earnings are calculated automatically.

### Designer Sidebar Full Navigation
**[SCENE: Click each sidebar item in order, demonstrate core interactions]**
> **VOICEOVER:** `[8:30]` Designer sidebar categories in order:
>
> 1.  ✅ **Dashboard**
> 2.  🔍 **Requests Pool** `[8:40]` - Public list of all unassigned design requests. Filter by budget, deadline, and category. One click claim button that assigns the request to you instantly.
> 3.  📂 **Assignments** `[9:00]` - All your active projects. Progress bars, time tracking, delivery upload interface, and client communication threads all available inline.
> 4.  💰 **Earnings** `[9:15]` - Complete work history, payout schedule, tax documents download, and hourly earnings breakdown statistics.

> **VOICEOVER:** `[9:20]` That is every feature available to a Designer user. Now we switch to the Administrator role.

---

## 🔧 ADMINISTRATOR FULL WALKTHROUGH (9:30 - 13:30)
**[SCENE: Logout, login as Administrator]**

### Admin Dashboard - Top to Bottom Complete Walkthrough
> **VOICEOVER:** `[9:40]` Administrator Dashboard, top to bottom:
>
> 1.  **Greeting Bar**
> 2.  **Statistics Cards Row (5 cards)** `[9:48]`
>     - Total registered system users
>     - Active requests across the entire system
>     - Requests completed today
>     - System uptime percentage
>     - Gross revenue this month
> 3.  **Quick Actions Grid** `[10:05]`
>     - **Create New User** - Opens user creation modal
>     - **Generate System Report** - Exports CSV full system report
>     - **View System Logs** - Real time application error log
> 4.  **Needs Attention Panel** `[10:20]` - System alerts, user moderation flags, disputed requests, and failed payments.
> 5.  **Recent Activity Panel** `[10:30]` - Complete system wide audit log of every action taken by every user.

### Admin Workflow Demo: Users Management Full Actions
**[SCENE: Navigate to Users Management page]**
> **VOICEOVER:** `[10:45]` Demonstrating all user management actions:
>
> **[ACTION: Open Sort By dropdown, show all options]**
> - Sort selector: Name, Contact info, Date joined
>
> **[ACTION: Toggle Reverse sort checkbox]**
>
> **[ACTION: Click Filter button, open filter panel]**
> - Role filters: Administrator, Designer, Client
> - Status filters: Active, Inactive
>
> **[ACTION: Check Client filter, click Apply]**
>
> **[ACTION: Click Clear All button]**
>
> **[ACTION: Click Add User button, fill form, click Create User]**
>
> **[ACTION: Select 2 users, click Bulk Delete, cancel at confirmation]**
>
> **[ACTION: Click Edit User icon on the test client user]**
> - Change user role from Client to Designer, click Save Changes
>
> **[ACTION: Click Ban User action]**
> - Enter ban reason, confirm ban. User session is immediately terminated.

### Admin Sidebar Full Navigation
> **VOICEOVER:** `[12:30]` Remaining admin sidebar pages:
> 4.  📑 **Reports** - Completion rates, average turnaround times, designer performance rankings, and financial summaries.
> 5.  🖥️ **System Status** `[12:45]` - Real time server health metrics, queue backlog, background worker status, and error rate graphs.

---

## CLOSING (13:30 - 14:00)
**[SCENE: Fade out admin dashboard]**
> **VOICEOVER:** You have now seen every working feature of this application. Every workflow demonstrated is fully functional: submitting requests, claiming work, updating statuses, managing users, all as they operate in production.
>
> All three roles follow an identical layout structure and interaction pattern for maximum consistency and minimal learning curve for all user types. This completes the full end to end walkthrough.