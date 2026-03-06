# Dependency Security

Scanning, monitoring, and managing vulnerable dependencies.

## npm Audit

### Basic Usage

```bash
# Standard audit
npm audit

# JSON output for parsing
npm audit --json > audit.json

# Only production dependencies
npm audit --omit=dev

# Specific severity threshold
npm audit --audit-level=high

# Auto-fix where possible
npm audit fix

# Force major updates (review carefully)
npm audit fix --force
```

### Interpreting Results

```json
{
  "vulnerabilities": {
    "lodash": {
      "severity": "high",
      "via": ["Prototype Pollution"],
      "range": "<4.17.21",
      "fixAvailable": {
        "name": "lodash",
        "version": "4.17.21"
      }
    }
  }
}
```

### Severity Actions

| Severity | Production | Dev Only |
|----------|------------|----------|
| Critical | Block deploy | Urgent fix |
| High | Fix within 24h | Fix within week |
| Moderate | Fix within week | Fix within sprint |
| Low | Track in backlog | Optional |

### Handling False Positives

Create `.npmauditrc` or use `package.json`:

```json
{
  "audit-level": "moderate",
  "ignore-advisories": [
    "GHSA-xxxx-xxxx-xxxx"  
  ]
}
```

Document exclusions:

```markdown
## Security Audit Exclusions

### GHSA-xxxx-xxxx-xxxx (lodash prototype pollution)
- **Package**: lodash@4.17.15
- **Reason**: Only affects `_.template()` which we don't use
- **Review date**: 2024-01-15
- **Next review**: 2024-04-15
```

---

## pip-audit (Python)

### Installation

```bash
pip install pip-audit
```

### Usage

```bash
# Basic audit
pip-audit

# JSON output
pip-audit --format=json -o audit.json

# Specific requirements file
pip-audit -r requirements.txt

# Fix vulnerabilities
pip-audit --fix

# Strict mode (exit non-zero on any finding)
pip-audit --strict
```

### Safety Check (Alternative)

```bash
pip install safety

# Basic check
safety check

# Full report
safety check --full-report

# JSON output
safety check --json > safety-report.json
```

---

## Snyk Integration

### CLI Setup

```bash
npm install -g snyk
snyk auth
```

### Usage

```bash
# Test for vulnerabilities
snyk test

# Monitor (continuous)
snyk monitor

# Fix interactively
snyk wizard

# Test specific manifest
snyk test --file=package.json

# Test container image
snyk container test <image>

# Test IaC files
snyk iac test
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high

# GitLab CI
snyk_test:
  image: snyk/snyk:node
  script:
    - snyk auth $SNYK_TOKEN
    - snyk test --severity-threshold=high
```

### Snyk Policies

Create `.snyk` file:

```yaml
version: v1.25.0
ignore:
  'npm:lodash:20180130':
    - '*':
        reason: Only affects _.template() which we don't use
        expires: 2024-06-01
patch: {}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9am

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: npm audit
        run: npm audit --audit-level=high
        
      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-audit
          path: |
            npm-audit.json
            snyk-results.json
```

### GitLab CI

```yaml
security-audit:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm audit --audit-level=high --json > npm-audit.json || true
    - |
      CRITICAL=$(jq '.metadata.vulnerabilities.critical' npm-audit.json)
      HIGH=$(jq '.metadata.vulnerabilities.high' npm-audit.json)
      if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo "Found $CRITICAL critical and $HIGH high vulnerabilities"
        exit 1
      fi
  artifacts:
    reports:
      junit: npm-audit.json
    when: always
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running security audit..."
npm audit --audit-level=high

if [ $? -ne 0 ]; then
  echo "Security vulnerabilities found. Fix before committing."
  exit 1
fi
```

---

## Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    groups:
      security-patches:
        applies-to: security-updates
        patterns:
          - "*"
      minor-updates:
        applies-to: version-updates
        update-types:
          - "minor"
          - "patch"
    ignore:
      - dependency-name: "eslint"
        update-types: ["version-update:semver-major"]
```

---

## Renovate Configuration

Create `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":semanticCommits",
    "security:openssf-scorecard"
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  },
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["major"],
      "labels": ["major-update"]
    }
  ],
  "schedule": ["before 9am on monday"]
}
```

---

## CVE Tracking

### Monitoring Sources

| Source | URL | Coverage |
|--------|-----|----------|
| NVD | nvd.nist.gov | All CVEs |
| GitHub Advisory | github.com/advisories | npm, pip, etc. |
| Snyk DB | snyk.io/vuln | npm, pip, etc. |
| npm Registry | npmjs.com | npm packages |
| PyPI | pypi.org/security | Python packages |

### CVE Response Process

```
1. Detection (automated)
   ├── Snyk alert
   ├── Dependabot PR
   └── npm audit CI failure

2. Triage (within 24h)
   ├── Confirm exploitability
   ├── Check if affected code path is used
   └── Determine actual severity

3. Response (based on severity)
   ├── Critical: Patch within 24-48h
   ├── High: Patch within 1 week
   ├── Medium: Patch within sprint
   └── Low: Track in backlog

4. Verification
   ├── Re-run security scans
   ├── Test functionality
   └── Deploy

5. Post-mortem (critical only)
   └── Document lessons learned
```

---

## Lock File Best Practices

### npm (package-lock.json)

```bash
# Always commit lock file
git add package-lock.json

# Use ci for deterministic installs
npm ci  # Not npm install

# Verify integrity
npm ci --ignore-scripts
```

### Yarn (yarn.lock)

```bash
# Commit lock file
git add yarn.lock

# Deterministic install
yarn install --frozen-lockfile

# Check for issues
yarn audit
```

### pnpm (pnpm-lock.yaml)

```bash
# Commit lock file
git add pnpm-lock.yaml

# Frozen install
pnpm install --frozen-lockfile

# Security audit
pnpm audit
```

---

## Supply Chain Security

### Package Provenance

Check npm package signatures:

```bash
# Enable signature verification
npm config set package-lock-only true
npm config set audit-level moderate

# Check provenance
npm audit signatures
```

### Scorecard Analysis

```bash
# Install scorecard
brew install scorecard

# Check a package
scorecard --repo=github.com/lodash/lodash

# Check npm package
scorecard --npm=lodash
```

### SBOM Generation

```bash
# Generate with npm
npm sbom --sbom-format=cyclonedx

# Generate with syft
syft . -o cyclonedx-json > sbom.json

# Generate with trivy
trivy fs . --format cyclonedx --output sbom.json
```
