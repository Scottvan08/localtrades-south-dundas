# SD&G Seed Expansion Notes

## Expansion Summary

BuiltLocal now uses an SD&G seed file with county and local-area fields so the prototype can feel local while covering Stormont, Dundas and Glengarry.

Current seed total: 208 public listings.

Local-area coverage:

- South Dundas: existing core launch area plus nearby service-area rows.
- North Dundas: municipal business-directory rows filtered to rural trades and property services.
- South Stormont: South Stormont Chamber rows filtered to trades/property services.
- North Stormont: municipal directory rows and source-specific public listings.
- South Glengarry: Choose Cornwall PDF and South Glengarry public business references.
- North Glengarry: public council/procurement references for relevant contractors.
- Cornwall & Area: Choose Cornwall PDF, Cornwall-area public directories, and provider/public profiles.

## Targeted Follow-Up Pass

A second pass focused on areas that were underrepresented after the first SD&G import:

- North Stormont: added more municipal-directory contractors for electrical, excavation, landscaping/materials, snow/plowing, and tree/property services.
- North Glengarry: added more Alexandria/Maxville public listings for plumbing, HVAC, electrical, roofing, and general contracting.
- South Glengarry: added more Lancaster, South Lancaster, Williamstown, Green Valley, Martintown, and North Lancaster public listings.
- Cornwall & Area: added more public electrical contractor listings where they serve Cornwall/SD&G.

The follow-up used YellowPages public listing/search pages and North Stormont municipal business directory entries, still importing only base public facts and no review text.

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
- YellowPages public search/listing pages for Alexandria, Maxville, Lancaster, South Glengarry, North Glengarry, Moose Creek, Finch, Cornwall, and related SD&G trades searches.
- Existing South Dundas, YellowPages, BBB, and provider website sources already present in the original seed.
