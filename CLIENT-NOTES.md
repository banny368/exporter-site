# Notes for the client conversation

## What to say when you send the link

This is a working demo, not a finished site. Three things are worth stating up front so
nobody discovers them awkwardly later.

**1. The company details are placeholders on purpose.** It reads "Your Company Name" and
"Your Logo" throughout, with XXXXX for the IEC, GST and phone numbers. That is so the
client can judge the structure without arguing about a name we invented. Every one of those
fields is editable from the admin panel without a developer.

**2. The product data is real; the photographs are not.** Every HS code, origin cluster,
season, packing format, MOQ, container loadability figure and quality parameter on the site
is genuine export-grade specification. The images are generated placeholders and are
labelled as such on the page. Real product photography must replace them before launch — an
importer who receives a shipment that does not match the website will not order twice, and
in some markets misleading product imagery is a compliance problem.

**3. The admin panel genuinely works.** Open /admin with the passcode demo1234, add a
product, upload an image, change the company name, and the public site changes. Two honest
caveats: the passcode is not real security, and changes save in that browser rather than a
database. Both are solved by the backend phase.

## The one question to ask

A demo with a single clear question gets a reply far more often than one ending with "let
me know your feedback".

> **Which of the three product ranges should the site lead with — fresh produce,
> dehydrated products and spices, or furniture?**

Whatever they answer tells you where their margin is, which buyers they actually want, and
which photographs to ask for first.

## What to collect before the real build

**Company.** Registered and trading name, logo in vector format, year established,
registered and factory addresses, IEC, GST, APEDA RCMC, Spices Board registration, FSSAI
licence, plus any of ISO 22000, HACCP, GLOBALG.A.P., Halal, Kosher, Organic or FSC.

**Contact.** WhatsApp business number, phone, sales email, working hours, and every social
and marketplace profile URL — IndiaMART and TradeIndia included, because buyers use those
to check that a company exists.

**Products.** The confirmed list per category with grades and varieties, the HS codes as
they appear on their own shipping bills, packing specifications and container loadability
from actual shipments, MOQ, lead times, and the Incoterms and payment terms they accept.

**Proof.** Facility, pack house, cold storage and loading photographs; team photos and
designations; buyer testimonials with written permission to publish; certificate scans; any
existing catalogue or brochure.

Product photographs are the long pole on this job. Ask for a hero, a detail and a packing
shot per product, and start that conversation in the first reply rather than the fifth.

**Technical.** The domain and who controls its DNS, hosting preference, email provider, and
Google Analytics or Search Console access if they already have it.

## Costs, as things stand

Nothing yet. The site runs on Vercel's free tier, the fonts are self-hosted, and there are
no third-party scripts.

The only certain cost ahead is the **domain**, which is bought from a registrar and
renewed yearly — Vercel does not charge to attach it, and SSL is included.

Costs after that are optional and only arrive with specific features: a transactional
email provider once the inquiry form needs to deliver to an inbox (free tiers cover a
site of this size), and a database if admin changes ever need to reach every visitor
without a redeploy.
