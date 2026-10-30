<!--
Sync Impact Report
Version change: not established -> 1.0.0 (initial adoption)
Modified principles: None (initial constitution)
Added sections: Core Principles, Engineering Constraints, Delivery Workflow and Quality Gates
Removed sections: None
Follow-up TODOs: None
-->

# SplitSmart Constitution

## Core Principles

### I. Customer Requirements and Implementation Decisions
Customer requirements MUST remain distinct from implementation decisions. Requirements and
implementation plans MUST identify which statements originate in `UserRequirement.md` and which
are choices made to deliver them. An implementation decision MUST NOT be presented as a customer
requirement or silently override one. Any conflict between a customer requirement and a proposed
implementation MUST be documented and resolved through an explicit product decision. In particular,
the customer's web-based and Android/iOS platform request is not fulfilled merely by choosing Java
21 and Swing.

### II. Java 21 and Maven Baseline
Production application code MUST target Java 21, and Maven MUST be the build and dependency
management system. Build and test instructions MUST use the project's Maven configuration so
developers can reproduce validation consistently.

### III. Object-Oriented Design and GUI/Business Separation
The application MUST use object-oriented design with clear responsibility boundaries. Swing
presentation code MUST delegate business rules and expense/balance calculations to business-layer
components; business logic MUST NOT depend on Swing or be implemented in event handlers. This
separation keeps core behavior independently testable and allows presentation decisions to evolve
without changing business rules.

### IV. Monetary Accuracy with BigDecimal
All monetary values and monetary calculations MUST use `BigDecimal`. Floating-point types MUST NOT
be used for money. Currency scale and rounding MUST be explicit at defined calculation or display
boundaries, and tests MUST cover the applicable rounding behavior.

### V. Tested Changes and Human Review
Automated tests MUST use JUnit 5. Changes to business behavior MUST include tests for the changed
behavior, including relevant boundary cases. AI-generated code, tests, diagrams, and documentation
MUST receive human review before acceptance; AI output is a proposal, not approval or evidence that
requirements are satisfied.

## Engineering Constraints

PlantUML MUST be used for UML diagrams that communicate architecture or important domain behavior.
Diagrams MUST reflect the intended implementation and be updated when a change makes them
inaccurate. Architecture diagrams and implementation notes MUST identify implementation decisions
separately from customer requirements.

The customer requirements in `UserRequirement.md` are the source for customer-requested behavior,
including accounts, groups, expenses and receipts, notifications, approval, balances, payments,
reporting, and web and mobile platforms. The Java 21, Maven, Swing, JUnit 5, PlantUML, and
architecture rules in this constitution are implementation policies; they do not amend or waive
those customer requirements.

## Delivery Workflow and Quality Gates

Each accepted customer requirement MUST be traceable from its source to the applicable feature
specification and to implementation and verification evidence. Changes MUST identify the
requirements they address; tests and review evidence MUST make it possible to verify that those
requirements remain satisfied. Implementation decisions that materially affect scope, platform,
architecture, or behavior MUST be recorded separately and reviewed for conflicts with customer
requirements.

Before accepting a change, reviewers MUST check requirement traceability, relevant JUnit 5 test
results, applicable PlantUML accuracy, adherence to the technology and design constraints, and
human review of any AI-generated output.

## Governance

Amendments MUST include a rationale and an impact report identifying affected principles,
constraints, and workflow requirements. The project maintainers MUST review and approve amendments
before they take effect. Changes MUST preserve the distinction between customer requirements and
implementation decisions.

The constitution uses semantic versioning: MAJOR for backward-incompatible governance changes or
principle removals/redefinitions, MINOR for new principles or materially expanded requirements, and
PATCH for clarifications and non-semantic wording changes. The version and amendment date MUST be
updated with each approved amendment.

Contributors and reviewers MUST assess proposed work for compliance with this constitution.
Non-compliant work MUST be revised or accompanied by an explicit, approved amendment; review MUST
not treat passing tests or AI-generated analysis as a substitute for human judgment.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
