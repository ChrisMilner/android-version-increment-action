# android-version-increment-action

Increments the `versionCode` and `versionName` on you Gradle Android projects for you :tada:

> Note: `versionName` must use [standard semver format](https://semver.org/) e.g. `1.2.3`

* `versionCode` is incremented by 1 with each release
* `versionName` is incremented based on the increment type you provide (`major`|`minor`|`patch`)
  * `major` - `1.2.3 => 2.0.0`
  * `minor` - `1.2.3 => 1.3.0`
  * `patch` - `1.2.3 => 1.2.4` 

## Inputs

### `build-gradle-path`

The path to your `build.gradle` file.

_Defaults to `app/build.gradle`._

### `name-increment-type`

The increment type, alters how the `versionName` is updated as described above.

## Usage

### Basic

```yaml
steps:
  - name: Update version
    uses: ChrisMilner/android-version-increment-action@1.0.0
    with:
        name-increment-type: 'minor'
```

### Manual Input

```yaml
on:
  workflow_dispatch:
    inputs:
      increment-type:
        type: choice
        description: Release Type
        options:
          - patch
          - minor
          - major
        required: true

jobs:
  release-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update version
        uses: ChrisMilner/android-version-increment-action@1.0.0
        with:
          name-increment-type: ${{ inputs.increment-type }}
```
