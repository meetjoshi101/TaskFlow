# Taskflow

I am building a work-management system.

The system should have the following work groups:-

1. Strategic Planning
2. Execution
3. Operations

Each work group should have the following work type:-

A. Goals Management
    - Goals
    - Sub Goals
B. Execution
    - Portfolios
    - Projects
    - Tasks
    - Sub Tasks
    - Steps
C. Operations
    - Work Item Entity (represents Goals, Sub Goals, Portfolios, Projects, Tasks)
    - Work Log
    - Work Checklist

Following is the relationship between the work groups and work types:-

1. Strategic Planning
    - Goals can have multiple Sub Goals.
    - Sub Goals can be part of multiple Goals.
    - Goals and Sub Goals can have a many-to-many association with Portfolios, Projects, and Tasks.

2. Execution
    - Portfolios can have multiple Projects
    - Projects can have multiple Tasks
    - Tasks can have multiple Sub Tasks
    - Sub Tasks can have multiple Steps
    - Project can be part of multiple Portfolios
    - Task can be part of multiple Projects

3. Operations
    - Work Log can be associated with a Work Item Entity.
    - Work Checklist can be associated with a Work Item Entity and Work Log.
    - Work Item Entity can have multiple Work Logs.
    - Work Log can have multiple Work Checklists.
    - Work Item Entity is a polymorphic type that can represent one of: Goal, Sub Goal, Portfolio, Project, or Task.

Exclude:
    1) User Management and User Authencation.

Focuse on core features only.
