# Feature Specification: SplitSmart Shared Expense Management

**Feature Branch**: `not-created`

**Created**: 2026-10-29

**Status**: Draft

**Input**: Authoritative customer requirements in `UserRequirement.md`; request to create a testable, traceable feature specification and separately identify a Java Swing MVP subset.

## Clarifications

### Session 2026-10-29

- Q: For each expense, who should be recorded as having paid it? → A: The submitter selects one payer separately from the participants.
- Q: Which sign-in methods should SplitSmart offer? → A: Email and password, with email verification and password recovery.
- Q: How should a person become a member of a group? → A: A group manager invites the person, who must accept before gaining access.
- Q: How should SplitSmart validate expense amounts and percentage shares, and handle rounding when shares do not divide evenly? → A: Require a positive amount and percentages from 0% to 100% that total exactly 100%; allocate leftover currency units by largest fractional remainder, breaking ties by participant entry order.
- Q: How should an approved expense affect what each participant owes the payer? → A: Each participant owes their calculated share to the payer; the payer's own share is excluded.

## User Scenarios & Testing *(mandatory)*

### Actors

- **Account holder**: A person who signs in and views their own expenses and balances.
- **Group manager**: A member who creates a group and manages its membership and approval policy.
- **Expense submitter**: A group member who records an expense and submits it for review.
- **Payer**: The one group member selected as having paid an expense; they need not be one of
  its participants.
- **Approver**: A group member authorized by the group's approval policy to review expenses.
- **Payment sender and recipient**: Group members who settle an amount owed.
- **Report viewer**: An account holder who reviews group expenses, balances, and payments.

### User Story 1 - Record and approve a shared expense (Priority: P1)

As a group member, I want to record an expense, identify who paid and who shared it, and have
it reviewed before it affects balances, so that group members can trust the amounts they owe.

**Why this priority**: Expense entry and approval are the source of the shared financial records.

**Independent Test**: Create a group with multiple members, submit an expense using each supported
split method with a payer distinct from at least one participant, approve it, and verify that the
resulting shares and balances are correct.

**Acceptance Scenarios**:

1. **AC-001** **Given** a person without an account, **When** they register with an email
   address and password and verify their email, **Then** they can sign in and access their own
   expense and balance information.
2. **AC-002** **Given** a group manager and a person who is not yet a member, **When** the
   manager invites that person and they accept the invitation, **Then** they become a member
   and can access the group's information; before acceptance, they cannot access it as a member.
3. **AC-003** **Given** a group member entering an expense, **When** they provide its amount,
   date, description, one payer, participants, split method, and optional receipt, **Then** the
   expense is submitted for review with those details.
4. **AC-004** **Given** an expense split equally among its participants, **When** it is approved,
   **Then** shares are rounded to the smallest currency unit by largest fractional remainder,
   ties are resolved by participant entry order, the shares equal the expense total, and the
   approved shares affect balances.
5. **AC-005** **Given** an expense split by percentage, **When** valid percentages totaling 100%
   with each percentage from 0% through 100% are submitted and approved, **Then** each
   participant's share reflects their percentage using the same rounding rule and the shares
   total the expense amount.
6. **AC-019** **Given** an approved expense whose payer is also a participant, **When** its
   shares are applied to balances, **Then** the payer owes nothing to themselves, and each other participant owes their
calculated share to the payer.
7. **AC-020** **Given** an expense with a zero or negative amount, **When** the submitter tries
   to submit it, **Then** the system rejects it, explains that the amount must be positive, and
   creates no approvable expense.
8. **AC-021** **Given** a percentage split with a percentage outside 0% through 100% or with
   percentages that do not total exactly 100%, **When** the submitter tries to submit it,
   **Then** the system rejects the split with an explanation and creates no approvable expense.
9. **AC-006** **Given** a pending expense, **When** every approval required by the group's policy has been completed,
   **Then** the expense becomes approved and is included in balance calculations. Before the final required approval, balances remain unchanged.
10. **AC-007** **Given** a pending expense, **When** an authorized approver rejects it, **Then**
   it does not affect balances and its submitter can see its rejected status.
11. **AC-008** **Given** a group with expense notifications enabled, **When** a member submits an
   expense, **Then** the other group members are notified.

### User Story 2 - Review balances and record a settlement (Priority: P1)

As a group member, I want to see what I owe and what others owe me, and record a payment, so
that settlements are reflected in the group's current balances.

**Why this priority**: Accurate pairwise balances and settlement records are the core value of
shared expense tracking.

**Independent Test**: Approve expenses between at least two members, inspect each member's
pairwise balance, record a payment, and verify the corresponding balance changes.

**Acceptance Scenarios**:

1. **AC-009** **Given** approved expenses involving group members, **When** a member views
   balances, **Then** the system shows the amount owed by each member to every other member.
2. **AC-010** **Given** a balance between two members, **When** a member records a payment with
   its sender, recipient, amount, and date, **Then** the payment is included in payment history
   and the relevant balance is reduced by that amount.
3. **AC-011** **Given** a payment greater than the recorded amount owed, **When** it is
   submitted, **Then** the system rejects it with an explanation and leaves the balance
   unchanged.

### User Story 3 - Review and filter financial reports (Priority: P2)

As a report viewer, I want summaries of expenses, balances, and payments and the ability to
choose a date range and other report criteria, so that I can understand group spending and
settlement history.

**Why this priority**: Reports make recorded activity useful for reviewing spending over time.

**Independent Test**: Create approved expenses and payments across multiple dates, groups, and
members; request summaries with and without filters; compare the results with the source records.

**Acceptance Scenarios**:

1. **AC-012** **Given** expense, balance, and payment records, **When** a member views a report,
   **Then** the report provides summaries for all three record types.
2. **AC-013** **Given** records both inside and outside a selected date range, **When** a member
   requests a report with that range and other supported criteria, **Then** only matching
   records contribute to the report totals.

### User Story 4 - Use the product on supported platforms (Priority: P1)

As a customer, I want to use SplitSmart on the web and on Android and iOS, so that I can access
my account and group expense information on the platforms requested.

**Why this priority**: The customer's platform requirement includes web and both major mobile
operating systems.

**Independent Test**: Complete account, group, expense, balance, payment, and report flows on
each supported client and verify that the same account data and permissions are observed.

**Acceptance Scenarios**:

1. **AC-014** **Given** an account holder, **When** they use the web client, **Then** they can
   access the customer-required features available in the release.
2. **AC-015** **Given** an account holder, **When** they use the Android app, **Then** they can
   access the customer-required features available in the release.
3. **AC-016** **Given** an account holder, **When** they use the iOS app, **Then** they can
   access the customer-required features available in the release.
4. **AC-017** **Given** a supported client, **When** a user completes an account, expense,
   approval, balance, or payment flow using keyboard navigation and accessibility tools,
   **Then** interactive controls are operable and have labels that identify their purpose.
5. **AC-018** **Given** an account holder who cannot remember their password, **When** they
   request password recovery for their registered email address and complete the recovery
   process, **Then** they can sign in using a replacement password.

### Edge Cases

- An expense has no participants, includes a payer or participant who is not a group member,
  has a zero or negative amount, or has invalid/missing required fields; the system rejects the
  expense and identifies the invalid field.
- Percentage shares are below 0%, above 100%, or fail to total exactly 100%; the system rejects
  the split without creating an approvable expense.
- An equal split or percentage calculation leaves fractional currency units, or fractional
  remainders tie; the largest-remainder rule assigns leftover units deterministically.
- The expense submitter is also an approver, or an approval policy has no eligible approver.
- A pending or rejected expense is mistakenly included in balance or report totals.
- A group member leaves or is removed after participating in historical expenses.
- A payment is zero, negative, greater than the outstanding amount, or duplicates a prior
  payment.
- A report has an empty date range, reversed dates, or no matching records.
- A notification cannot be delivered, or a member attempts to access another account's records.
- A client is offline or submits the same expense or payment more than once.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow each person to create an individual account with an email
  address and password, verify the email address, and sign in.
- **FR-021**: The system MUST provide a password recovery process for an account holder who
  cannot sign in with their current password.
- **FR-002**: The system MUST allow an account holder to access their own expense and balance
  information and MUST prevent access to another person's private account information without
  authorization.
- **FR-003**: The system MUST allow users to create and manage groups. A group manager MUST
  invite a person to join, and that person MUST accept the invitation before becoming a member
  or gaining member access to group information.
- **FR-004**: The system MUST allow a group member to create an expense with an amount, date,
  description, one group-member payer, split method, and optional receipt image. The payer MUST
  be recorded separately from the expense participants and MAY be different from them. The
  amount MUST be greater than zero; zero and negative amounts MUST be rejected with an
  explanation.
- **FR-005**: The system MUST allow the submitter to identify the group members involved in an
  expense.
- **FR-006**: The system MUST calculate an equal share for each selected participant when an
  expense uses an equal split. If shares include fractional smallest currency units, the system
  MUST assign remaining units by largest fractional remainder, breaking ties by participant
  entry order.
- **FR-007**: The system MUST calculate participant shares by percentage when an expense uses a
  percentage split. Each percentage MUST be between 0% and 100%, inclusive, and the percentages
  MUST total exactly 100%; otherwise the system MUST reject the split with an explanation. The
  system MUST use the FR-006 rounding rule for resulting shares.
- **FR-008**: The system MUST notify group members other than the submitter when a new group
  expense is submitted.
- **FR-009**: The system MUST support an approval policy for each group with one or more review
  stages and authorized approvers.
- **FR-010**: The system MUST keep pending expenses out of balances and settled-activity totals
  until all required approvals are complete.
- **FR-011**: The system MUST allow an authorized approver to reject an expense; rejected
  expenses MUST NOT affect balances.
- **FR-012**: The system MUST include an expense in group balances only after it has received
  every approval required by that group's policy.
- **FR-013**: The system MUST track the amount owed by each group member to every other member,
  using approved expenses, each expense's payer and participant shares, and recorded payments.
  Each participant MUST owe their share to the payer, and the payer's own share MUST NOT create
  an amount owed by the payer to themselves.
- **FR-014**: The system MUST allow users to record a payment between members and reflect that
  payment in the relevant balances and payment history.
- **FR-015**: The system MUST provide reports or summaries of expenses, balances, and payments.
- **FR-016**: The system MUST allow users to filter reports by a date range and other available
  report criteria, and report totals MUST reflect only matching records.
- **FR-017**: The customer-required product MUST provide a web-based client.
- **FR-018**: The customer-required product MUST provide an Android app.
- **FR-019**: The customer-required product MUST provide an iOS app.
- **FR-020**: The system MUST reject a payment greater than the amount owed between its sender
  and recipient and MUST leave the balance unchanged.

### Non-Functional Requirements

- **NFR-001**: A user who is not authorized for an account or group MUST be unable to view or
  change its private records; verification MUST include attempts to access records as a
  different account.
- **NFR-002**: In a representative test with 100 concurrent active users, at least 95% of
  account, group, expense, balance, payment, and report interactions MUST show a result within
  two seconds.
- **NFR-003**: For every supported currency calculation, approved participant shares and
  recorded settlements MUST reconcile to the expense and payment totals at that currency's
  smallest supported unit. Any remaining units MUST be allocated by largest fractional
  remainder, with ties resolved by participant entry order.
- **NFR-004**: Each supported client MUST provide keyboard-operable primary flows and
  accessibility labels for interactive controls, validated with accessibility checks for
  account, expense, approval, balance, and payment flows.
- **NFR-005**: The same account's approved expenses, approval status, balances, payments, and
  report totals MUST be consistent across supported clients after a change is saved and
  displayed as complete.

### Customer Requirements Inventory

This inventory preserves the features and platform requirements from `UserRequirement.md`.
The IDs are the testable specification requirements; the customer source remains authoritative.

| Customer feature | Requirement IDs | Coverage |
|---|---|---|
| Individual user accounts, login, own expenses and balances | FR-001, FR-002, FR-021 | Verified email/password account creation, sign-in, password recovery, and protected personal information |
| Create and manage groups of people | FR-003 | Group and membership management |
| Create expenses with amount, date, description, split method, optional receipt | FR-004, FR-006, FR-007 | Required expense details, one separately selected payer, and both specified split methods |
| Specify users involved in an expense and adjust balances accordingly | FR-005, FR-012, FR-013 | Participants, distinct payer, approval-gated inclusion, pairwise balances |
| Notify users when other group members create an expense | FR-008 | Other group members are notified on submission |
| Review and approve expenses before balance adjustment; single or multiple review | FR-009, FR-010, FR-011, FR-012 | Configurable review stages; pending and rejected expenses do not affect balances |
| Track balance owed by each user to every other user | FR-013 | Pairwise member balances |
| Record payments and update balances | FR-014 | Payment history and settlement adjustment |
| Reports and summaries for expenses, balances, payments; custom date ranges and parameters | FR-015, FR-016 | Three report categories and selectable filters |
| Primary web-based product | FR-017 | Web client required |
| Android app | FR-018 | Android app required |
| iOS app | FR-019 | iOS app required |

### Proposed Java Swing MVP Subset — Implementation Decision, Not Customer Requirement

The following is a proposed first delivery subset, separated from the customer requirements.
It is a desktop MVP/prototype and MUST NOT be represented as satisfying the customer's web,
Android, or iOS platform requirements. A Java Swing delivery choice does not remove FR-017,
FR-018, or FR-019 from the product requirements.

| MVP capability | Requirements included | MVP boundary |
|---|---|---|
| Account access and groups | FR-001 through FR-003 | Account sign-in and group membership for the MVP environment |
| Expense entry and split calculations | FR-004 through FR-007 | Required fields, optional receipt, equal and percentage splits |
| Notifications and approval | FR-008 through FR-012 | In-product notifications and a single approval stage |
| Balances and payments | FR-013, FR-014, FR-020 | Pairwise balances, recorded settlements, and overpayment validation |
| Reports | FR-015, FR-016 | Expense, balance, and payment summaries with date filtering |
| Product platforms | FR-017 through FR-019 | Excluded from the desktop MVP; remain required for the customer product |

Java 21, Maven, Java Swing, JUnit 5, PlantUML, object-oriented design, and separation of GUI
from business logic are implementation policies from the project constitution, not customer
requirements. The MVP's exact release role remains an open product decision.

### Key Entities *(include if feature involves data)*

- **Account**: A person’s individual identity and access to their own SplitSmart information.
- **Group**: A collection of members, with membership and an expense approval policy.
- **Membership**: A person's accepted participation in a group and any group permissions;
  invitations do not grant membership or member access until accepted.
- **Expense**: A submitted group cost with amount, date, description, submitter, participants,
  one separately selected payer, split method and shares, optional receipt, and approval status.
- **Approval**: A review decision by an authorized group member at a required approval stage.
- **Balance**: The amount one group member owes another, derived from approved expenses and
  recorded payments.
- **Payment**: A recorded settlement between a sender and recipient with amount and date.
- **Notification**: An alert to a group member about a submitted group expense.
- **Report**: A summary of expense, balance, and payment records selected by report criteria.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance tests of valid equal and percentage expenses, 100% of approved
  participant shares reconcile to the entered total at the supported currency precision.
- **SC-002**: In tests containing pending, rejected, and approved expenses, 100% of balance
  totals exclude pending and rejected expenses and include approved expenses exactly once.
- **SC-003**: In settlement tests, 100% of recorded valid payments appear in payment history and
  are reflected in the appropriate member-to-member balances.
- **SC-004**: For each customer-required platform, testers can complete account access, group
  expense submission, approval, balance review, payment recording, and a date-filtered report.
- **SC-005**: At least 90% of first-time test participants can submit a valid shared expense and
  find the resulting balance without assistance.
- **SC-006**: Under the NFR-002 test conditions, at least 95% of the listed user interactions
  complete within two seconds.
- **SC-007**: In cross-client consistency tests, 100% of saved and completed record changes
  produce matching approval status, balances, payment history, and report totals on each
  supported platform.

## Assumptions

- Each expense belongs to one group and has one payer selected from its group members,
  independently of the submitter and participants; the group can have multiple expenses and
  participants.
- A group manager selects its approval policy. Unless changed by that policy, a submitter cannot
  approve their own expense.
- Expenses remain visible with pending or rejected status, but only fully approved expenses
  affect balances. Rejected expenses may be corrected and resubmitted.
- A group's approval policy has at least one eligible approver; it may require one or multiple
  approval stages.
- Percentage shares must total exactly 100%. Equal-split and percentage rounding assigns any
  remaining smallest currency unit by largest fractional remainder; ties are broken by
  participant entry order. Amounts must be greater than zero.
- A group uses one currency for its expenses and balances until multi-currency behavior is
  specified.
- Group membership changes do not erase historical expenses, approvals, payments, or balances.
- Notifications must reach affected group members; the delivery channels, retry behavior, and
  user preferences are not yet specified.
- A report date range includes its start and end dates.
- The measurable usability and responsiveness thresholds are proposed acceptance targets, not
  figures supplied by the customer.
- The Java Swing MVP is a proposed desktop prototype or first-stage release. It does not replace
  the customer-required web, Android, or iOS product.

## Open Questions

1. Is the Java Swing MVP intended only as a desktop prototype/first-stage release, or is it
   expected to be the production product despite the customer's web and mobile platform
   requirements?
2. Who may approve expenses, and should a group select approvers individually, by role, or by
   another rule? This specification assumes group-configured approvers and prevents submitters
   from approving their own expenses by default.
3. Is one currency per group acceptable, and which currencies must be supported? This
   specification assumes one currency per group.
4. Which notification delivery channels should be supported, and what should happen when
   delivery fails? The customer requirement specifies notification, but not its channel or
   delivery guarantees.

## Requirement-to-Acceptance Traceability

| Requirement IDs | Acceptance coverage |
|---|---|
| FR-001, FR-002 | AC-001 |
| FR-003 | AC-002 |
| FR-004, FR-005, FR-006, FR-007 | AC-003, AC-004, AC-005, AC-020, AC-021 |
| FR-008 | AC-008 |
| FR-009, FR-010, FR-011, FR-012 | AC-006, AC-007 |
| FR-013 | AC-004, AC-005, AC-009, AC-010, AC-019 |
| FR-014 | AC-010, AC-011 |
| FR-015, FR-016 | AC-012, AC-013 |
| FR-017, FR-018, FR-019 | AC-014, AC-015, AC-016 |
| FR-020 | AC-011 |
| FR-021 | AC-018 |
| NFR-001 | AC-001; Edge Cases |
| NFR-002 | SC-006 |
| NFR-003 | AC-004, AC-005; SC-001 |
| NFR-004 | AC-017 |
| NFR-005 | AC-014, AC-015, AC-016; SC-007 |
