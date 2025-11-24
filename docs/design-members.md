# SportHawk \- Team Members Lifecycle \- Sep 2025

Aim: Users & Members / life-cycle needed in explicit and exhaustive detail ([gFolder](https://drive.google.com/drive/folders/1zZWyo7gMaTrXW0SHxWRwIwRFJCip7cJo)) of [priority screens](https://docs.google.com/document/d/1FdjmQMkgeSyDq3smc2mETno_JKTIlZ6FQOpt1S1dR28/edit?tab=t.0#heading=h.37c21ygea0se)

NB Links are local and only available to the designers

Movies in: [Prototype Walkthroughs \- Google Drive](https://drive.google.com/drive/folders/11k2Ng4RPMWIDjVNL36qlMKIaMxIzgXFv), flows:

## Summary Team Members

- Explore Map, [559-5596](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5596&t=qfJC76c7WOLUseJb-0),
  - Explore Footer Tab
  - (AES to create Fremington FC & Newquay minimum)
- Club Details tab About (or Teams) [559-5678](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5678&t=jPVcEcqldCDVlMVc-0)
- Team Details tab About (or Members, [559-5728](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5728),
  - Explore (Allow user to join minimum)

## Explore Map

User taps Explore icon on footer menu of Home Screen [559-695](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-695)

Explore screen shown as per Figma [559-5596](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5596&t=qfJC76c7WOLUseJb-0) which is scrollable

No Top Nav.

Search bar at the top (filter icon to the right) which does nothing for now.

User types characters that make up a search, after 300ms pause, the entered text is split into words and wildcard search for any work found in the "clubs" table columns: Name, Location_City, Location_State, Description, Postcode, Contact_Phone. The order of best match to least is the clubs with the most of the longest words matched priority in the column order above.

The sports icons act as radio buttons and the results are restricted to clubs matching the currently selected icon. Initially the "Football" icon is selected

The matching search results are shown as tappable cards.

There is a floating map button just above the bottom of the screen body in the centre.

If the user taps any part of a club card the Club Details screen is shown.

## Club Details

The "Club Details" screen on the default tab "Club" is as per Figma [559-5678](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5678&t=jPVcEcqldCDVlMVc-0) which is scrollable and has a top Nav bar (custom left and right icons in the same pattern as Create-Event)

Top tab is initially Club, can be Teams, a first working version of this screen (forced to be Fremington) exists at /app/clubs/\[id\]/teams.tsx ; and should be refactored

When the top tab is Club, it shows up to 3 Teams ordered by largest member count downwards.

When the "All teams" button is tapped the screen changes to be Top Tab as Teams as per [559-5817](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5817&t=jPVcEcqldCDVlMVc-0).

When Top Tab is Teams, tapping on a Team card takes the user to Team Details screen [559-5728](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5728&t=jPVcEcqldCDVlMVc-0) which is scrollable and has Top Nav (in the pattern of "Club About").

## Team Details

On Team Details the initial Top tab is About ( [559-5728](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5728&t=jPVcEcqldCDVlMVc-0) ), a first working version of this screen exists at /app/teams/\[id\]/about.tsx ; and should be refactored.

When the Top tab is Members the screen is as per Figma [559-5787](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5787&t=jPVcEcqldCDVlMVc-0), a first working version of this screen exists at /app/teams/\[id\]/members.tsx ; and should be refactored.

Tapping the "Join Us" button on Team Details shows an "Are you Sure?" pop-up, the text should read:  
"Tapping Continue will send your details and join request to the Team Admin for consideration."

If the user taps Continue from the Join Us / Are you sure? Pop-up then a notification is sent to the Team Admin and a row is inserted to the table "interest_expressions".
