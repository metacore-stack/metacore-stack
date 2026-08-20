# Metacore Stack profile setup

The README uses animated SVG status cards generated directly inside the
`metacore-stack/metacore-stack` repository. Complete these steps once.

## 1. Upload the package

Keep the supplied folder structure:

```text
README.md
assets/metacore-core.png
.github/workflows/profile-summary.yml
profile-summary-card-output/github_dark/*.svg
```

The included SVG files are animated first-sync cards, so the profile never
shows broken images. The workflow replaces them with live GitHub statistics.

## 2. Generate the public dashboard

The workflow now runs automatically when `profile-summary.yml` is first added.
You can also open **Actions → Animated GitHub profile dashboard → Run workflow**.

Wait for the green check, then refresh the profile. The workflow replaces the
first-sync cards in `profile-summary-card-output/github_dark/`, commits the live
SVG dashboard, and refreshes it daily.

## 3. Optional: create a GitHub token for private totals

Open GitHub **Settings → Developer settings → Personal access tokens →
Fine-grained tokens** and create a token with an expiration date.

For public repositories, grant read-only access to public repositories. If you
want aggregate private-repository activity included, select only the private
repositories you want counted and grant read-only access to Contents, Issues,
Pull requests, and Metadata.

Public statistics work with the built-in workflow token. Create this extra
token only if you want aggregate private-repository activity included. Never
paste the token into `README.md` or the workflow file.

## 4. Add the optional repository secret

Open the profile repository:

```text
https://github.com/metacore-stack/metacore-stack/settings/secrets/actions
```

Select **New repository secret** and create:

```text
Name:  SUMMARY_GITHUB_TOKEN
Value: your fine-grained GitHub token
```

## Optional: include private contribution totals

Open GitHub **Settings → Public profile → Contribution settings**, then enable
**Include private contributions on my profile**. The generated cards show only
aggregate totals and language labels; they do not reveal private repository
names or commit messages.
