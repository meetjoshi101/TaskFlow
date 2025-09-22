# Taskflow

I am building an work-management system.

The system should have the following work groups:-

1. Strategic Planning
2. Execution
3. Operations

Each work group should have the following work type:-

A. Strategic Planning
    - Goals
    - Sub Goals
B. Execution
    - Portfolios
    - Projects
    - Tasks
    - Sub Tasks
    - Steps
C. Operations
    - Entity
    - Work Log
    - Work Checklist

Following is the relationship between the work groups and work types:-

1. Strategic Planning
    - Goals can have multiple Sub Goals.
    - Sub Goals can be part of multiple Goals.
    - Goals and Sub Goals can be associated with Portfolios, Projects, Tasks.

2. Execution
    - Portfolios can have multiple Projects
    - Projects can have multiple Tasks
    - Tasks can have multiple Sub Tasks
    - Sub Tasks can have multiple Steps
    - Project can be part of multiple Portfolios
    - Task can be part of multiple Projects

3. Operations
    - Work Log can be associated with Entity.
    - Work Checklist can be associated with Entity and Work Log.
    - Entity can have multiple Work Logs.
    - Work Log can have multiple Work Checklists.
    - Entity can be of type Goals, Sub Goals, Portfolios, Projects, Tasks.
