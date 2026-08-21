# Metacore Stack profile setup

The README uses one custom animated engineering observatory generated directly
inside the `metacore-stack/metacore-stack` repository. It never displays a real
name, email address, contribution calendar, or private activity.

## 1. Upload the package

Keep the supplied folder structure:

```text
README.md
assets/metacore-core.png
assets/metacore-observatory.svg
.github/workflows/profile-summary.yml
scripts/generate-observatory.mjs
```

The included SVG is a polished fallback, so the profile looks complete before
the first workflow run. The workflow replaces its public signals automatically.

## 2. Remove the old generic dashboard

Delete `profile-summary-card-output/` from the GitHub repository after the new
README is active. It is no longer used and may contain identity fields created
by the previous third-party generator.

## 3. Generate the public observatory

The workflow runs automatically when `profile-summary.yml` or the generator is
added. You can also open **Actions → Build Metacore Observatory → Run workflow**.

Wait for the green check, then refresh the profile. The workflow replaces the
fallback SVG in `assets/`, commits the live observatory, and refreshes it daily.
No personal access token or repository secret is required.

If the publish step reports a permission error, open **Settings → Actions →
General → Workflow permissions**, select **Read and write permissions**, and
run the workflow again.

## Privacy boundary

The generator reads only public repository metadata. It intentionally ignores
the profile name, email, biography, location, join date, contributions, commit
totals, and private repositories.
