---
title: "Roadmap"
description: ""
lead: ""
draft: false
type: docs
weight: 1
toc: true
---

This document provides a high-level view on our product roadmap for this and upcoming quarters.

It is divided up into things we are currently working on *Now*, what we will look at *Next*, and things we will look into at a *Later* point in time.

## What we're working on now

### Role-Based Access Control (RBAC)

Platform teams need fine-grained control over who can access and modify different parts of their infrastructure setup. We're implementing a comprehensive RBAC system that will start with predefined Admin and Viewer roles, then expand to allow scoping permissions to specific projects and environments, and ultimately enable teams to define custom roles with granular permissions tailored to their organizational structure. This ensures teams can follow the principle of least privilege, giving each user only the access they need to do their job effectively.

## What we'll be looking at next

We're actively seeking feedback on these upcoming features. If you'd like to discuss details or help us build them the right way for your use case, please reach out to us at support@humanitec.com.

### Rollbacks

Development teams often need to quickly revert to a previous working state when issues arise in production. We're building comprehensive rollback capabilities that will enable developers to roll back not just their application code, but the entire infrastructure configuration to a previous deployment state—all without requiring intervention from platform engineers. This self-service capability operates entirely within the golden paths and guardrails defined by platform teams, reducing incident response time and freeing platform engineers from being bottlenecks during critical situations.

## What we'll be looking at later

We're actively seeking feedback on these future features. If you'd like to discuss details or help us build them the right way for your use case, please reach out to us at support@humanitec.com.

### Infrastructure Drift Detection

Infrastructure configurations can drift from their intended state due to manual changes, failed deployments, or external modifications. We're building drift detection capabilities that will continuously monitor your infrastructure and alert platform teams when actual state diverges from the declared configuration. This not only helps maintain consistency and reliability across environments, but also serves as a critical security feature—detecting unauthorized changes that could introduce vulnerabilities or compliance violations. When drift is detected, teams will be able to remediate quickly through a simple re-deployment, ensuring their infrastructure stays aligned with approved configurations.

### Roll-out Management

Platform teams need to evolve their infrastructure stack—testing new technologies, responding to incidents, or rolling out security patches—without risking widespread outages. We're developing roll-out management capabilities that will enable platform engineers to control the blast radius of changes by carefully orchestrating how updates propagate across environments and teams. This will allow platform teams to test changes in isolated environments first, gradually expand to broader audiences, and maintain fine-grained control over which workloads adopt new infrastructure versions and when.

### Impact Analysis

When making changes to shared infrastructure modules or providers, platform teams need to understand exactly what will be affected before rolling out updates. We're building impact analysis tools that will show platform engineers precisely which workloads, environments, and teams depend on a given infrastructure component. This visibility will enable teams to assess the blast radius of changes, understand which environments will be updated and which are safe, identify the teams that need to be notified, and make informed decisions about change management strategies—eliminating guesswork and reducing the risk of unexpected disruptions.

### SCIM Provisioning

Large organizations need to automate user lifecycle management across their entire tool stack. We're planning to add SCIM support, which will enable automatic provisioning and deprovisioning of users based on changes in your identity provider. When someone joins or leaves your organization, or changes roles, those changes will automatically sync to the Platform Orchestrator and eliminate manual user management overhead so that access is always in sync with your source of truth.
