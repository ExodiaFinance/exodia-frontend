#!/bin/sh
rm -r src/locales/translations
git clone https://github.com/ExodiaFinance/exodia-translations.git src/locales/translations
yarn install --frozen-lockfile
yarn lingui:extract
yarn lingui:compile
yarn build
