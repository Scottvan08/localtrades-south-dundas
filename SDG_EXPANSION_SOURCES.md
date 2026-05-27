# SD&G Seed Expansion Notes

## Expansion Summary

BuiltLocal now uses an SD&G seed file with county and local-area fields so the prototype can feel local while covering Stormont, Dundas and Glengarry.

Current seed total: 237 public listings.

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

## Wide-Net Search Pass

This pass broadened discovery with search-driven queries for weak local areas and thin rural-service categories.

Result:

- 27 high-confidence rows added directly to `sdg-seed-listings.csv`.
- 7 medium-confidence candidates held in `candidate-listings-sdg.csv` for owner confirmation or deeper review.
- Existing weak rows improved where stronger official evidence was found, including David Brown Construction Ltd, S.L Electric, and Casey Mechanical Inc.

Coverage added:

- North Stormont: drywall, concrete/precast, building supplies, general contracting, well drilling, landscaping/turf, and home-centre materials.
- South Stormont: plumbing rows added for Ingleside/South Stormont; additional uncertain South Stormont rows held for review.
- South Glengarry: septic, excavation, agricultural/rural construction, and septic pumping.
- North Glengarry: HVAC, home repair, construction, and outdoor power equipment.
- Cornwall & Area: HVAC, fencing, junk removal/light demolition, pressure washing/property maintenance, and outdoor power equipment.

Review/activity handling:

- Google review recency was treated as a priority activity signal, not a hard gate.
- No Google review text, third-party review text, or third-party ratings were imported into BuiltLocal reviews.
- Review recency notes are tracked only in `candidate-listings-sdg.csv`.

## Trusted Source Rules

Rows were added only from trusted public sources:

- Municipal business directories and public procurement/council references.
- Chamber/member directories.
- Choose Cornwall public business directory PDF.
- YellowPages/BBB/provider websites from the existing seed method.
- Public provider profiles when they clearly identify service type and location.
- Official provider websites that clearly identify location, service area, and contact path.

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
- `https://www.davidrcoleman.ca`
- `https://www.bourgeoiswelldrilling.com/en`
- `https://www.nevillehvac.ca/about-us`
- `https://ironvalleyconstructions.com`
- `https://guardian-fencing.ca`
- `https://www.thecleanupcrew.info`
- `https://redrobinlawns.com/window-cleaning-3/`
- `https://www.lefebvresmallengine.ca/Locations`
- `https://rrsmallengine.com/Contact-Us/`
- `https://www.claudessmallengines.ca/map-hours-directions-atvs-snowmobiles-dealership--hours`
- `https://houdemechanical.com`
- `https://www.caseymechanical.com`
- Nation Conservation septic directory PDFs for septic installer/designer candidates.
