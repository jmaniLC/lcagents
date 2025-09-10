# Pod Selection Enhancement

## 🏢 Interactive Pod Selection During Installation

During LCAgents installation, after validating the directory contains valid code, users will now see:

```
🏢 Pod Selection
Select the pod that this repository belongs to:

❯ Alchemy - Deposits
  Alchemy - DMM DebtIQ / Debt Monitoring and Management
  Alchemy - Lending
  CDS - Credit Decision System
  CURE - Consumer Core & Data
  DAP - Dynamic Application Platform
  MarEngg - Marketing Engineering
  MPUW - Multi Product Underwriting
  Originations Core Eng - Auto Loans
  Originations Core Eng - PL BE
  PF - Purchase Finance
  Platform - Engineering Efficiency (EE)
  Platform - Infra (INF)
  Platform - Investor Servicing (INVS)
  Platform - Test Infra and Automation (TIA)
  UFE - UPPER FUNNEL EXP
  UIP - UI Tools / UI Platform
  UWOPS - Underwriting Experience & Operations
  WESFO - Website Strategic Foundation
  XP - Experience Platform
  Other - Add new pod
```

## 🆕 Custom Pod Creation

If user selects "Other - Add new pod":

```
? Enter the new pod name: › DataScience - ML Platform
```

Validation rules:
- Cannot be empty
- Must be at least 3 characters long

## 🔧 Generated Pod Information

Based on selection, the system generates:

### Example 1: Predefined Pod (Alchemy - Lending)
```yaml
pod:
  id: pod-alchemy-lending
  name: Alchemy - Lending
  owner: team-alchemy
  description: Development pod for Alchemy - Lending and related repositories
```

### Example 2: Custom Pod (DataScience - ML Platform)
```yaml
pod:
  id: pod-datascience-ml-platform
  name: DataScience - ML Platform
  owner: team-datascience
  description: Development pod for DataScience - ML Platform and related repositories
```

## 📊 Enhanced Installation Output

After pod selection, users see:

```
📊 Technology Stack Information:
   Primary Stack: JavaScript/TypeScript (React, Express)
   Frameworks: React, Express
🏢 Pod Information:
   Pod: Alchemy - Lending (pod-alchemy-lending)
   Owner: team-alchemy
   Repository: my-project (Main)
   ✅ Tech stack preferences saved to technical-preferences.md
```

## 🎯 Benefits

1. **Organizational Context**: Clear pod ownership for each repository
2. **Team Identification**: Automatic team assignment based on pod
3. **Multi-Repository Support**: Acknowledgment that pods contain multiple repos
4. **Flexibility**: Support for both predefined and custom pods
5. **Consistent Naming**: Standardized pod ID generation

This enhancement provides proper organizational context during installation, ensuring each repository is correctly associated with its owning pod and team.
