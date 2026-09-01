# DESIGN A COMPLETE FINTECH DASHBOARD — “CHARGEBACK SHIELD”

Create a production-quality, multi-section fintech SaaS dashboard called **“CHARGEBACK SHIELD”**.

The product is an **AI-powered dispute triage and chargeback management platform for merchants**. It analyzes payment disputes, predicts win probability, automatically decides whether to FIGHT or ACCEPT a dispute, and routes uncertain cases to human review.

The UI should feel like a combination of:

* Premium fintech SaaS
* AI operations dashboard
* Risk-management platform
* High-performance fitness/gym brand energy

The visual personality must be **bold, aggressive, confident, sharp, technical, and professional**.

Do NOT make it look like a generic soft SaaS dashboard.

---

# 1. CORE VISUAL DIRECTION

Use a strict **RED + BLACK + OFF-WHITE** visual system.

### Primary Colors

* Primary Black: `#0D0D0D`
* Brand Red / CTA Red: `#EF4444`
* Main Background: `#F7F7F8`
* White Cards: `#FFFFFF`
* Primary Text: `#0D0D0D`
* Secondary Text: `#6B7280`

### Decision Colors

FIGHT:

* Green: `#22C55E`

REVIEW:

* Amber: `#F59E0B`

ACCEPT:

* Grey: `#9CA3AF`
* Use a subtle red border to maintain brand connection.

Do not mix the three decision colors with the primary brand red.

---

# 2. TYPOGRAPHY

Use a bold modern sans-serif font.

Preferred:

* Inter
* Poppins
* Manrope

Headings:

* Extra Bold / Black
* Uppercase
* Tight letter spacing
* Strong visual hierarchy

Example:

CHARGEBACK SHIELD

DISPUTE QUEUE

REVENUE IMPACT

BODY:

* Regular / Medium weight
* Highly readable
* Dark charcoal text on light backgrounds

Numbers:

* Extra Bold
* Large
* High contrast

Use uppercase labels for dashboard metrics.

---

# 3. GLOBAL LAYOUT

Create a desktop-first dashboard at approximately:

**1440 × 1024 px**

Structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ TOP HEADER                                                  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │              MAIN CONTENT                    │
│              │                                              │
│              │                                              │
│              │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Sidebar:

* Fixed
* Width approximately 240px

Header:

* Fixed
* Height approximately 72px

Main content:

* Scrollable
* Background `#F7F7F8`
* Comfortable 24–32px spacing

Use an 8px spacing system wherever possible.

---

# 4. TOP HEADER BAR

Create a solid black header.

Background:
`#0D0D0D`

Height:
Approximately 72px.

### Left side

Place:

* Small red shield icon
* Text: `CHARGEBACK SHIELD`

Wordmark:

* White
* Bold
* Uppercase
* Heavy typography

Shield icon:

* Red
* Minimal line/filled style
* Should communicate security + protection.

### Right side

Add:

1. Search icon
2. Notification bell icon
3. Red CTA button:

`+ NEW REVIEW QUEUE`

Button:

* Background `#EF4444`
* White text
* Bold uppercase
* Sharp corners
* No excessive rounding

Below the header add a **thin 2px red divider line**.

---

# 5. LEFT SIDEBAR

Create a fixed black sidebar.

Width:
Approximately 240px.

Background:
`#0D0D0D`

Navigation items:

* Dashboard
* Dispute Queue
* Evidence Packets
* Model Performance
* Reason Code Rules
* Settings

Each item contains:

* Simple line icon
* Label
* Comfortable vertical padding

### Active state

Dashboard should be active.

Active item:

* Very dark grey background
* 3–4px red left border
* White text
* Red/white icon

Inactive:

* Grey-white text
* Transparent background

Hover:

* Slightly lighter black/grey background
* Red icon

### Sidebar bottom

Add a small merchant profile section:

* Circular avatar
* Merchant name: `ACME COMMERCE`
* Small subtitle: `Merchant Admin`
* Settings/profile icon

Keep it compact.

---

# 6. MAIN DASHBOARD HEADER

Inside the main content area create:

Large heading:

`COMMAND CENTER`

Subtitle:

`AI-powered dispute intelligence and automated chargeback decisions.`

On the right:

Small date/status indicator:

`LIVE • AUG 26, 2026`

Use a small green live indicator.

---

# 7. SECTION 1 — KEY METRICS

Create a row of **5 metric cards**.

Cards:

* White background
* 4–6px corner radius maximum
* Thin 2–3px red top border
* Very subtle crisp shadow
* No large soft shadows

Metrics:

### Card 1

Label:
`PRECISION`

Value:
`81.2%`

Trend:
`↑ 4.2%`

### Card 2

Label:
`RECALL`

Value:
`92.9%`

Trend:
`↑ 2.8%`

### Card 3

Label:
`F1 SCORE`

Value:
`86.7%`

Trend:
`↑ 3.1%`

### Card 4

Label:
`AUTO-DECIDED`

Value:
`89/150`

Small text:
`59.3% of cases`

Trend:
`↑ 7.4%`

### Card 5

Label:
`ROUTED TO HUMAN REVIEW`

Value:
`40.7%`

Trend:
`↓ 5.6%`

Use tiny trend arrows in the upper-right corner.

Numbers should dominate the cards.

---

# 8. SECTION 2 — REVENUE IMPACT

Create a section heading:

`REVENUE IMPACT`

Subtitle:

`Financial impact generated by AI-assisted dispute decisions.`

Create 3 large horizontal cards.

---

## CARD 1 — RECOVERED VALUE

Label:
`RECOVERED VALUE (EST.)`

Value:
`₹4,82,000`

Add:

* Green upward arrow
* Small text: `+18.4% vs baseline`

Use green only for the positive financial indicator.

---

## CARD 2 — TOTAL FIGHTABLE AMOUNT AT STAKE

Label:

`TOTAL FIGHTABLE AMOUNT AT STAKE`

Value:

`₹6,10,000`

Add a black/red financial shield icon.

---

## CARD 3 — CAPTURE RATE

Label:

`CAPTURE RATE`

Value:

`79%`

Create a circular progress ring:

* Red progress
* Light grey remaining track
* 79% in the center

Caption:

`Recovery efficiency across winnable disputes`

Below all 3 cards display:

`Baseline = merchant accepts every dispute. Recovered = winnable disputes correctly auto-fought by the agent.`

Use small grey typography.

---

# 9. SECTION 3 — DISPUTE QUEUE

This should be the largest and most important section.

Heading:

`DISPUTE QUEUE`

Subtitle:

`Prioritized disputes requiring automated action or human review.`

### Filter row

Create filter chips:

`FIGHT`

`ACCEPT`

`REVIEW`

`ALL`

Default active:
`ALL`

Active:

* Red background
* White text

Inactive:

* White background
* Black border
* Black text

Chips should have sharp/minimal corners.

---

# 10. DISPUTE DATA TABLE

Create a high-quality enterprise data table.

Columns:

1. DISPUTE ID
2. REASON CODE
3. AMOUNT
4. WIN PROBABILITY
5. DECISION
6. TOP SIGNALS
7. ACTION

Use realistic sample rows.

### Sample data

DSP-1042

* Product Not Received
* ₹18,500
* 94%
* FIGHT
* delivery proof available; reason: product not received
* View

DSP-1038

* Duplicate Charge
* ₹7,200
* 88%
* FIGHT
* transaction fingerprint matched; duplicate detected
* View

DSP-1035

* Fraudulent Transaction
* ₹32,800
* 51%
* REVIEW
* customer verification incomplete; conflicting device signals
* View

DSP-1029

* Product Not Received
* ₹12,400
* 18%
* ACCEPT
* delivery evidence absent; customer history consistent
* View

DSP-1024

* Credit Not Processed
* ₹9,850
* 73%
* REVIEW
* refund record found; settlement timing unclear
* View

---

# 11. WIN PROBABILITY VISUALIZATION

Inside the Win Probability column:

Display:

`94%`

plus a small horizontal progress bar.

Example:

* 94% bar almost full
* 51% bar half full
* 18% bar short

Keep the bar compact.

---

# 12. DECISION STATUS

Use solid rectangular status badges.

FIGHT:

* Green `#22C55E`
* White text
* `FIGHT`

REVIEW:

* Amber `#F59E0B`
* Black/dark text
* `REVIEW`

ACCEPT:

* Grey `#9CA3AF`
* Dark text
* `ACCEPT`

Do not use rounded pill styling excessively. Keep badges rectangular and compact.

---

# 13. TABLE STYLING

Column headers:

* Black
* Bold
* Uppercase
* Small font

Add a thin red underline beneath the table header.

Rows:

* Alternating white / light-grey
* Very subtle row borders

Hover state:

* Pale red background
* Thin red left indicator

The table should look like a serious enterprise risk-management tool.

---

# 14. SECTION 4 — EVIDENCE PACKETS

Create section:

`EVIDENCE PACKETS`

Subtitle:

`Submission-ready evidence bundles generated by the AI agent.`

Create expandable cards for FIGHT disputes.

---

## Evidence Card Example

Header:
Black background.

Display:

`DSP-1042`

Amount:
`₹18,500`

Status:
`✓ SUBMITTABLE`

Amount should use red text.

---

### Card Body

Section:

`INCLUDED EVIDENCE`

Checklist:

✓ Delivery confirmation
✓ Carrier tracking history
✓ Customer order record
✓ Transaction receipt
✓ Customer communication log

Use green check icons.

---

### Missing Evidence

If evidence is missing:

`MISSING EVIDENCE`

⚠ Customer delivery confirmation

⚠ Signed delivery receipt

Use amber warning icons.

---

### Recommendation

Italic grey text:

`Agent recommendation: Fight. Delivery proof and tracking evidence strongly support merchant position.`

Bottom-right CTA:

`SUBMIT PACKET`

Red background.

If evidence is incomplete:

`SUBMIT PACKET`

Grey disabled state.

---

# 15. SECTION 5 — AI EXPLAINABILITY PANEL

This must be an interactive side panel.

When the user clicks `View` on any dispute row:

A panel should **slide in from the right side**.

Width:
Approximately 420–480px.

Overlay:
Semi-transparent black backdrop.

Panel:
White background.

---

## PANEL HEADER

Black header.

Display:

`DSP-1042`

`PRODUCT NOT RECEIVED`

Close X icon on right.

---

# 16. WIN PROBABILITY GAUGE

Inside the panel:

Large circular gauge.

Example:

`94%`

Label:

`WIN PROBABILITY`

Use red progress around the circle.

Below:

`HIGH CONFIDENCE`

---

# 17. FEATURE IMPORTANCE

Heading:

`WHY THE MODEL CHOSE FIGHT`

Create mini horizontal bar chart.

Signals:

Delivery proof — 92%
Refund record — 84%
Customer verified — 76%
Prior disputes — 31%
Device consistency — 18%

Use red bars for positive decision signals.

Use grey for weaker signals.

---

# 18. PLAIN-LANGUAGE EXPLANATION

Create a highlighted explanation box.

Heading:

`WHY THIS DECISION`

Text:

`The dispute is highly winnable because verified delivery evidence is available and the customer's order history matches the transaction. No conflicting refund record was detected. The model therefore recommends fighting the dispute.`

Keep this explanation understandable to a merchant who is not technical.

---

# 19. GATING STATUS

Add a prominent badge.

For high-confidence decisions:

`● AUTO-DECIDED`

For uncertain decisions:

`⚠ ROUTED TO HUMAN — CONFIDENCE BELOW THRESHOLD`

Use appropriate status styling.

---

# 20. SECTION 6 — MODEL PERFORMANCE

Create a secondary dashboard screen called:

`MODEL PERFORMANCE`

Include:

### Model Health Cards

* Precision — 81.2%
* Recall — 92.9%
* F1 Score — 86.7%
* Accuracy — 88.4%

### Performance Chart

Create a clean line/bar visualization showing:

* Auto-decided disputes
* Human review
* Correctly won disputes
* Incorrect decisions

Use red/black/grey with limited green and amber.

### Confusion Matrix

Display:

* True Fight
* False Fight
* True Accept
* False Accept

Keep it clean and enterprise-oriented.

---

# 21. SECTION 7 — SETTINGS / THRESHOLDS

Create another screen:

`DECISION SETTINGS`

Subtitle:

`Control how aggressively the AI agent automates dispute decisions.`

---

## FIGHT THRESHOLD

Create slider.

Label:

`FIGHT THRESHOLD`

Example:
`80%`

Description:

`Disputes above this probability can be automatically fought.`

---

## ACCEPT THRESHOLD

Create slider.

Example:
`25%`

Description:

`Disputes below this probability can be automatically accepted.`

Use red slider tracks.

---

## LIVE PREVIEW

Create a black preview card:

`CURRENT AUTOMATION PROFILE`

Text:

`At current settings:`

`59.3% AUTO-DECIDED`

`40.7% SENT TO HUMAN REVIEW`

Add a simple visual split bar.

---

# 22. REASON CODE EVIDENCE RULES

Create editable table.

Columns:

REASON CODE | REQUIRED EVIDENCE | MIN CONFIDENCE | STATUS

Example:

Product Not Received
→ Delivery proof, tracking record
→ 80%
→ Active

Duplicate Charge
→ Transaction record, duplicate fingerprint
→ 75%
→ Active

Fraudulent Transaction
→ Customer verification, device history
→ 85%
→ Active

Credit Not Processed
→ Refund record, settlement record
→ 78%
→ Active

Add edit icons on each row.

---

# 23. INTERACTIONS

Make the prototype interactive.

### Sidebar

Clicking:

* Dashboard → Dashboard screen
* Dispute Queue → Queue screen
* Evidence Packets → Evidence screen
* Model Performance → Performance screen
* Reason Code Rules → Rules screen
* Settings → Settings screen

### Dispute Table

Click `View`:
→ Open explainability side panel.

### Side Panel

Close button:
→ Slide panel out.

### Evidence Cards

Click card header:
→ Expand/collapse evidence details.

### Filters

Click:
FIGHT → only FIGHT rows

ACCEPT → only ACCEPT rows

REVIEW → only REVIEW rows

ALL → all rows

### New Review Queue

Click:
`+ NEW REVIEW QUEUE`

Open a modal containing:

`CREATE REVIEW QUEUE`

Fields:

* Queue name
* Reason codes
* Minimum confidence
* Priority
* Assign reviewer

CTA:
`CREATE QUEUE`

---

# 24. RESPONSIVE DESIGN

Desktop:

* 1440px layout
* Fixed sidebar

Tablet:

* Sidebar collapses
* Metric cards become 2-column grid
* Tables become horizontally scrollable

Mobile:

* Sidebar becomes hamburger menu
* Metrics become stacked cards
* Revenue cards become vertical
* Table becomes horizontally scrollable
* Explainability panel becomes full-screen modal

Maintain spacing and hierarchy across all breakpoints.

---

# 25. COMPONENT SYSTEM

Create reusable Figma components and variants for:

* Sidebar navigation item
* Metric card
* Revenue card
* Status badge
* Filter chip
* Probability bar
* Data table row
* Evidence card
* Button
* Slider
* Modal
* Explainability panel
* Circular gauge
* Chart card

Create component variants for:

Button:

* Default
* Hover
* Disabled

Status:

* FIGHT
* REVIEW
* ACCEPT

Navigation:

* Active
* Inactive
* Hover

Evidence:

* Complete
* Missing
* Expanded
* Collapsed

---

# 26. ICON STYLE

Use simple modern line icons.

Preferred icon concepts:

* Shield
* Dashboard/grid
* Dispute/document
* Evidence/file-check
* Chart
* Rules/sliders
* Settings
* Search
* Bell
* User
* Arrow-up
* Warning
* Check
* Close
* Chevron

Avoid cartoon icons.

Avoid colorful illustrations.

---

# 27. SHADOWS & CORNERS

Cards should NOT look like modern bubbly SaaS cards.

Use:

* 4–6px radius
* Thin borders
* Crisp shadows
* Minimal depth

Avoid:

* Large rounded cards
* Excessive gradients
* Glassmorphism
* Pastel backgrounds
* Excessive blur
* Floating neumorphism

The interface should feel **hard-edged, premium, technical and confident**.

---

# 28. BRAND DETAILS

Add subtle brand elements throughout the dashboard:

* Red 2px lines
* Red section indicators
* Black title bars
* Red numerical highlights
* Shield motifs
* Small uppercase labels
* Strong typography
* High-contrast separators

Use the red accent strategically.

Do NOT make the entire dashboard red.

Black should dominate the navigation/header while off-white dominates the workspace.

---

# 29. EMPTY / LOADING STATES

Also design:

### Empty Queue

`NO DISPUTES MATCH YOUR FILTER`

`Try changing your decision filter or date range.`

CTA:

`CLEAR FILTERS`

### Loading

Use simple skeleton rows.

### Error

Black/red error panel:

`DISPUTE DATA UNAVAILABLE`

`Unable to load the latest dispute decisions.`

CTA:

`RETRY`

---

# 30. FOOTER

At the bottom of the application:

Black footer.

Left:

`CHARGEBACK SHIELD`

Right:

`AI DISPUTE INTELLIGENCE • MERCHANT PROTECTION`

Add:

`v1.0.0`

Keep footer minimal.

---

# 31. FINAL DESIGN QUALITY REQUIREMENTS

The final Figma file should look like a **real production fintech product**, not a student wireframe.

Prioritize:

1. Strong visual hierarchy
2. Excellent spacing
3. Consistent component system
4. Realistic financial/dispute data
5. Clear AI decision states
6. Professional enterprise table
7. Strong black/red branding
8. Interactive explainability experience
9. Responsive behavior
10. Accessibility and readability

The dashboard should immediately communicate:

**“This AI protects merchant revenue by deciding which chargebacks to fight, accept, or send to a human.”**

Overall visual direction:

**BLACK + RED + WHITE**

**BOLD + SHARP + AGGRESSIVE**

**FINTECH + AI + RISK MANAGEMENT**

**PREMIUM ENTERPRISE PRODUCT**

Avoid generic dashboard aesthetics. Make **CHARGEBACK SHIELD** visually distinctive and memorable.
