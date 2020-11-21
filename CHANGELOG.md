# 11/21/2020

- Fixed duplicated tranforms for JS files that are required multiple times
- Added automatic project publish for contributors
- Improved handling when netlify function folder does not exist

# 10/13/2020

- Fixed a regression that failed build for Node 10 environments
- Added unit test infrastructure

# 09/23/2020

- Added `include` and `exclude` configuration option to support cases that users do not want(or only want) to transform specific environment variables

# 09/22/2020

- Improved readability by utilizing built-in `utils.functions.listAll`

# 07/30/2020

- Added `buildEvent` configuration option

# 06/11/2020

- Improved error handling
- Added summary report
- Print env key names only in verbose mode to avoid leaking sensitive information

# 06/10/2020

- Initial version
