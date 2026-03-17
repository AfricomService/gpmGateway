# Implementation Plan: Redesign Home Screen for Unauthenticated Users

Objective: Create a modern, visually appealing landing page for users who are not logged in.

## Requirements

- Background: Gradient or image.
- Logo: Placeholder or app logo at top.
- Content: Welcome message + "Connecter" button calling `login()`.
- Style: Modern, minimal, responsive (rounded corners, shadows).
- Colors:
  - --bg-primary: #F8FAFC
  - --bg-card: #FFFFFF
  - --bg-sidebar: #F1F5F9
  - --color-primary: #2563EB
  - --color-primary-hover: #1D4ED8

## Files to Modify

1.  `src/main/webapp/app/home/home.component.html`
2.  `src/main/webapp/app/home/home.component.scss`

## Detailed Changes

### 1. `home.component.html`

Replace existing content with a conditional structure:

- If `!account`: Show new landing page.
- If `account`: Show existing logged-in content (or placeholder).

Structure for unauthenticated view:

```html
<div class="home-container" *ngIf="!account">
  <div class="hero-card">
    <div class="logo-placeholder">
      <!-- App Logo or Icon -->
      <img src="content/images/jhipster_family_member_0.svg" alt="Logo" class="app-logo" />
    </div>
    <h1 class="welcome-title">Bienvenue sur GPM Gateway</h1>
    <p class="welcome-subtitle">Connectez-vous pour accéder à votre espace.</p>

    <button class="btn btn-primary login-btn" (click)="login()">Connecter</button>
  </div>
</div>

<div *ngIf="account" class="logged-in-container">
  <div class="row">
    <div class="col-md-3">
      <span class="hipster img-fluid rounded"></span>
    </div>
    <div class="col-md-9">
      <h1 class="display-4">Welcome, {{ account.login }}!</h1>
      <p class="lead">You are logged in as user "{{ account.login }}".</p>
    </div>
  </div>
</div>
```

### 2. `home.component.scss`

Define variables and styles:

```scss
:host {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --bg-sidebar: #f1f5f9;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
}

.home-container {
  min-height: calc(100vh - 60px); // Adjust based on navbar height
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-primary);
  background: linear-gradient(135deg, var(--bg-primary) 0%, #e2e8f0 100%);
  padding: 20px;
}

.hero-card {
  background: var(--bg-card);
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 480px;
  width: 100%;

  .logo-placeholder {
    margin-bottom: 2rem;

    .app-logo {
      height: 80px;
      width: auto;
    }
  }

  .welcome-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .welcome-subtitle {
    font-size: 1.125rem;
    color: #64748b;
    margin-bottom: 2.5rem;
  }

  .login-btn {
    background-color: var(--color-primary);
    border: none;
    padding: 0.75rem 2rem;
    font-size: 1.125rem;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
    width: 100%;

    &:hover {
      background-color: var(--color-primary-hover);
    }
  }
}

// Existing hipster style
.hipster {
  display: inline-block;
  width: 347px;
  height: 497px;
  background: url('../../content/images/jhipster_family_member_0.svg') no-repeat center top;
  background-size: contain;
}

/* wait autoprefixer update to allow simple generation of high pixel density media query */
@media only screen and (-webkit-min-device-pixel-ratio: 2),
  only screen and (-moz-min-device-pixel-ratio: 2),
  only screen and (-o-min-device-pixel-ratio: 2/1),
  only screen and (min-resolution: 192dpi),
  only screen and (min-resolution: 2dppx) {
  .hipster {
    background: url('../../content/images/jhipster_family_member_0.svg') no-repeat center top;
    background-size: contain;
  }
}
```
