# Metacore Stack profile setup

The README uses animated SVG status cards generated directly inside the
`metacore-stack/metacore-stack` repository. Complete these steps once.

## 1. Upload the package

Keep the supplied folder structure:

```text
README.md
assets/metacore-core.png
.github/workflows/profile-summary.yml
```

## 2. Create the GitHub token

Open GitHub **Settings → Developer settings → Personal access tokens →
Fine-grained tokens** and create a token with an expiration date.

For public repositories, grant read-only access to public repositories. If you
want aggregate private-repository activity included, select only the private
repositories you want counted and grant read-only access to Contents, Issues,
Pull requests, and Metadata.

Never paste the token into `README.md` or the workflow file.

## 3. Add the repository secret

Open the profile repository:

```text
https://github.com/metacore-stack/metacore-stack/settings/secrets/actions
```

Select **New repository secret** and create:

```text
Name:  SUMMARY_GITHUB_TOKEN
Value: your fine-grained GitHub token
```

## 4. Generate the animated cards

Open **Actions → Animated GitHub profile dashboard → Run workflow**.

The workflow creates `profile-summary-card-output/github_dark/`, commits the
animated SVG cards to the profile repository, and refreshes them daily.

## Optional: include private contribution totals

Open GitHub **Settings → Public profile → Contribution settings**, then enable
**Include private contributions on my profile**. The generated cards show only
aggregate totals and language labels; they do not reveal private repository
names or commit messages.
