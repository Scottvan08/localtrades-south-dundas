# SD&G Seed Expansion Notes

## Expansion Summary

BuiltLocal now uses an SD&G seed file with county and local-area fields so the prototype can feel local while covering Stormont, Dundas and Glengarry.

Current seed total: 168 public listings.

Local-area coverage:

- South Dundas: existing core launch area plus nearby service-area rows.
- North Dundas: municipal business-directory rows filtered to rural trades and property services.
- South Stormont: South Stormont Chamber rows filtered to trades/property services.
- North Stormont: municipal directory rows and source-specific public listings.
- South Glengarry: Choose Cornwall PDF and South Glengarry public business references.
- North Glengarry: public council/procurement references for relevant contractors.
- Cornwall & Area: Choose Cornwall PDF, Cornwall-area public directories, and provider/public profiles.

## Trusted Source Rules

Rows were added only from trusted public sources:

- Municipal business directories and public procurement/council references.
- Chamber/member directories.
- Choose Cornwall public business directory PDF.
- YellowPages/BBB/provider websites from the existing seed method.
- Public provider profiles when they clearly identify service type and location.

No third-party review text or ratings were imported.

## Fields Added

- `county`
- `local_area`
- `service_area_notes`

These fields support the prototype's county selector, North/South local-area selector, local map centering, and town-level `Near` filter.

## Source URLs Used In This Pass

- `https://www.northdundas.com/business-development/economic-development/business-directory`
- `https://sschambercommerce.ca/member-directory/`
- `https://www.northstormont.ca/business-development/business-directory`
- `https://choosecornwall.ca/resources/attachment/cornwall-business-directory/`
- `https://www.southglengarry.com/business-and-development/`
- `https://www.northglengarry.ca/`
- Existing South Dundas, YellowPages, BBB, and provider website sources already present in the original seed.
