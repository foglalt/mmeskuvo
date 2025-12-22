# Wedding website scaffold requirements

This document outlines the requirements for a custom wedding website.

## Technical Requirements

- Build the website using react and next.js
- We will be deploying on Vercel and using NeonDB for managed database.
- The website should have a clean, elegant design that reflects the theme of the wedding. (floral, beige) with subtle animations/transitions and other nice, but not distracting effects.


## Functional Requirements

1. **General Structure**
   - There should be an Admin view besides the public view, where the admin can update content easily.
   - The public view should be mobile view first, the admin view can be desktop first.
   - Use a color palette that matches the wedding colors (to be defined by admin later)
   - There is a landing page, from there the users can scroll to other sections (or use a button to navigate there)
   - The language of the website is Hungarian by default, but there should be an option for selecting english translation as well (translations will be provided by admin)

2. **Home Page**
   - The physical invitation card's copy will be the landing page, it will be an image uploaded by the admin (you can live with the assumption that the image already contains the necessary text)
   - When the admin uploads the invitation card image, the color theme of the website can be overridden to match the colors in the invitation card.
   - From the landing page the users can scroll to other sections (or use a button to navigate there) - this should be smooth scrolling.
   - When the user enters the website for the first time, a popup should appear asking them to select their preferred language (Hungarian/English) if the device language is different from Hungarian.

3. **Important infos**
    - A section that includes a rich text area where the admin can add important information about the wedding (e.g., date, time, venue, dress code, etc.)
    - This section should support basic text formatting (bold, italics, lists, links) and use a special font for headings (e.g., a cursive or elegant font). Make a few font options available for the admin to choose from.
    - The Admin should be able to add subsections to separate different types of information (e.g., "Ceremony Details", "Reception Info", "Accommodation", etc.)

4. **RSVP Section**
   - This place should include a form where guests can RSVP to the wedding.
   - The form should collect the following information:
     - Guest's full name
     - Registering other Guests (yes/no). If yes, allow adding multiple names.
     - phone number (optional)
     - Needs help with accommodation (yes/no)
     - Needs transportation (yes/no)
     - A link to the `I'd like to support you` section (see below)

5. **"I'd like to support you" Section**
   - A simple section where the admin can provide information on how guests can support the couple (e.g., gift registry, monetary gifts, volunteering help, etc.)
   - The admin should be able to add multiple support options, each with a title, description, and link (if applicable).
   - There should be an option for the admin to add checkboxes for guests to indicate if they plan to contribute in specific ways (e.g., "meals preparation", "decorations", "ministry", "ceremony assistance", etc.)
   - A text area for the users to leave additional comments or questions regarding their support.

6. **About us**
   - A section where the couple can share their story, how they met, and other personal details.
   - The admin should be able to upload multiple images and arrange them in a gallery format.
   - There should be an option to add captions to each image.