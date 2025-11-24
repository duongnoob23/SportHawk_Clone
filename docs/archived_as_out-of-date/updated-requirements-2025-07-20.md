Figma is to be used as the visual definition of screens.

Use \_all-screens-titles-and-figma-ids.md to correlate screen to Figma Id.

The goal of "Pixel perfect" match to Figma is highest priority, noting that top navigation is to use Expo Stack component and bottom navigation Expo Tabs component

Remove the requirement for TDD (Test Driven Development).

Remove all references to the files \_all-screens.md and combined-ui.md.

This project must use expo-router so /app is start of the folder hiearchy for source files (NOT /src).

This project must use expo-video (NOT expo-av).

An important project aim is that the screen TSX files only reference components and do not contain any styling, instead, styling should be in the components. As far as is practical the range of components should be limited, e.g. the component /components/ShButton/ShButton.tsx should, ideally, be the only place in the project's source code where buttons are rendered, the component should be parameterised with the name of the button text and look to achieve the different types; similarly: ShText for all variations of text.

Form labels and error messages should be considered as part of the component for each type of form input field.

Use the \*.ts files in /globals for definition of colors, text styling options etc. .

Icons, images and video in /assets, many icons available in SVG (preferred) and PNG types with root file names of the form <icon*name>*<figma_id_with_hyphen> e.g. bell_66-204.svg or bell_91-257.png . If an icon, image, video cannot be found in /assets then ask me to upload it.

Figma Id 559:467 is the "Welcome" screen app entry point to be coded in /app/index.tsx .

Figma Id 559:444 is the "Sign In" screen to be coded in /app/(auth)/SignIn.tsx, this screen is used for the login function, do not create a file called login.

Figma Id 559:415 is the "Sign Up" screen to be coded in /app/(auth)/SignUp.tsx, this screen is used for the register function, do not create a file called register

Top navigation MUST use Expo <Stack>

Bottom navigation MUST use Expo <Tabs>
