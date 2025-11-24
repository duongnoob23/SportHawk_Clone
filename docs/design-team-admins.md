# SportHawk \- Team Admins Journey \- Sep 2025

Aim: Team Admins remaining journey needed in explicit and exhaustive detail ([gFolder](https://drive.google.com/drive/folders/1zZWyo7gMaTrXW0SHxWRwIwRFJCip7cJo)) of [priority screens](https://docs.google.com/document/d/1FdjmQMkgeSyDq3smc2mETno_JKTIlZ6FQOpt1S1dR28/edit?tab=t.0#heading=h.37c21ygea0se)

Movies in: [Prototype Walkthroughs \- Google Drive](https://drive.google.com/drive/folders/11k2Ng4RPMWIDjVNL36qlMKIaMxIzgXFv), flows:

## Summary Team Admins

Allow Team Admin to manage the members of a team, including searching, adding, removing, and dealing with those who have expressed interest; plus appointing other Team Admins.

- Manage Members, [559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682&t=kpvxUxMA6Mcu0a6a-0),
  - Admin Top Tab on Teams Footer tab
- Add Members, [559-2661](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2661&t=6ZJ5alaWkcQfOHGw-0),
  - Admin Top Tab on Teams Footer tab
- Manage Admins, [559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613&t=6ZJ5alaWkcQfOHGw-0),

## Manage Members

An Admin user, from Home, selects footer icon "Teams", top Tab "Admins" then taps "Members" icon from the array of 6, to get to the Manage Member screen [559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682&t=kpvxUxMA6Mcu0a6a-0).

Manage Members, [559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682&t=kpvxUxMA6Mcu0a6a-0), is different from Figma as it WILL have a top nav bar, title is "Manage Members" and custom left/ right buttons in the pattern of Create-Event.

Only when a single team is selected does the body of the screen show any detail.

The card called "Add members" shows the number of people who have registered interest in the selected Team (rows in the table interest_expressions with matching team_id column and interest_status column of "pending"), if the card is tapped the user is routed to the "Add Members" screen described in a section below; if there are no people who have registered interest the card is still displayed with "0 interested" and tapping does nothing.

There is a Search members field, when characters are input then using the app default 500ms debounce the search is done and the results displayed in the Team Members list below.

The Team Members list defaults to showing All members of the team.  
To the right of the "Team Members" title is a dropdown, if there is an active search then the dropdown shows "Search", but the user can choose the "All" option which will clear the search box, select All members and the dropdown shows and only has the "All" option.

If the user taps the "-" on the right of a player card then there is a pop-up "Confirm REMOVING player, \<first_name\> \<last_name\>" with buttons Confirm Remove or Cancel, on tapping Confirm Remove there is another pop-up "Are you sure you want to REMOVE \<first_name\> \<last_name\> from team: \<team_name\>" with buttons Yes or No; if the Yes button is clicked the identified user is deleted from the Team and sent a notification by inserting a row in the notifications table.

## Add Members

Add Members, as per Figma [559-2661](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2661&t=6ZJ5alaWkcQfOHGw-0), shows Interested Players title followed by a card for each row in the table interest_expressions with matching team_id column and interest_status column of "pending" from oldest to newest ordering of the expressed_at column.

Tapping the Accept button shows a pop-up "Confirm ACCEPTING \<first_name\> \<last_name\> to team: \<team_name\>" with Confirm Accept and Cancel buttons; on Confirm Accept the user is inserted to the team_members table (provided not already there) and the relevant row of the interest_expressions table column interest_status is updated to "accepted", and a notification is sent to the new Team member by inserting a row in the notifications table.

Tapping the Ignore button shows a pop-up "Confirm that you wish to IGNORE the JOIN request from \<first_name\> \<last_name\> to team: \<team_name\>" with Confirm Ignore and Cancel buttons; on Confirm Ignore the user being "ignored" has the relevant row of the interest_expressions table column interest_status is set to "ignored", and a notification is sent to the new "ignored" user by inserting a row in the notifications table.

## Manage Admins

As Admin user, starting from Home screen, taps Teams icon in footer, at the top a SINGLE Team is Selected(\*), tap Admins rightmost icon in the upper tabs, sees 6 icons (3 rows of 2 columns) (Figma 559-2966), taps "Admins" icon to see the manage Admins screen as per Figma [559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613&t=6ZJ5alaWkcQfOHGw-0). Non-admin users will not be permitted to access this screen (if necessary route non-Admin users to Home)

Figma [559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613&t=6ZJ5alaWkcQfOHGw-0), will have a top nav bar, titled "Admins" in the pattern of Create-Event.

The body of the screen starts with the heading "Team Admins" followed by cards for each user who is an Admin of the selected(\*) Team. Removal can ONLY be done by an App user who is a Club/Team Super Admin; if the user is a Super Admin then a dash icon (minus sign) is shown to the right of the cards, if not a Club/Team Super Admin the dash icon is not shown.

If the dash icon is tapped then there is a pop-up "Confirm REMOVING Team Admin, \<first_name\> \<last_name\> from Team \<team_name\>" with buttons Confirm Remove or Cancel, on tapping Confirm Remove there is another pop-up "Are you sure you want to REMOVE \<first_name\> \<last_name\> from team: \<team_name\>" with buttons Yes or No; if the Yes button is clicked the identified user has their row deleted from the team_admins table for the selected(\*) Team and the removed TeamAdmin is sent a notification by inserting a row in the notifications table.

The next part of the body is Search Members, when the search box is empty then all Members of the selected(\*) Team to are matched, when characters are input then using the app default 500ms debounce the search is done against those Members and matching Members shown. Matching Members are de-duplicated and each is shown as a card with a plus icon to the right of the card.

Tapping the plus icon shows a pop-up "Confirm TEAM ADMIN role for \<first_name\> \<last_name\> to team: \<team_name\>" with Confirm Team Admin and Cancel buttons; on Confirm Team Admin the card user has a row inserted to the team_admins table (provided not already there) for the selected(\*) relevant Team, and a notification is sent to the new Team Admin member by inserting a row in the notifications table.
