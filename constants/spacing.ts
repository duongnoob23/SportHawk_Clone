export const spacing = {
  // --- Base Spacing Units ---
  none: 0,
  xxxs: 1,
  xxs:2,
  xs: 4,
  xsm: 6,
  sm: 8,
  smd:10,
  md: 12,
  mdx: 14,
  lg: 16,
  lgx: 18,
  xl: 20,
  xxl: 24,
  xml:26,
  mml:28,
  xxxl: 32,

  // --- Component-Specific Sizing ---
  avatarSizeMedium2: 48,
  textAreaMinHeight: 100, // <-- thêm key này (dp ~ px trên RN)
  // Payment Components
  paymentSummaryIconGap: 6, // Gap between icon and text in payment summary
  paymentCardPadding: 20,
  paymentCardGap: 12,
  paymentCardBorderRadius: 16,

  // Post Card Specific
  postCardPadding: 24, // Figma: 24px padding for post cards
  postCardGap: 16, // Figma: 16px gap between post card elements
  postCardImageHeight: 227, // Figma: Variable height, this is example
  postCardImageBorderRadius: 12, // Figma: 12px border radius for images
  postCardActionsGap: 24, // Figma: 24px gap between action buttons
  postCardClubLogoSize: 48, // Figma: 48x48 club logo
  postCardIconTextGap: 4, // Figma: Small gap between icon and count
  postCardHeaderGap: 16, // Figma: Gap between header elements
  postCardTimestampWidth: 40, // Figma: Width for timestamp
  postCardMoreButtonSize: 14, // Figma: More button icon size

  buttonHeight: 52,
  buttonHeightMedium: 40,
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 24,
  buttonHeightLarge: 50,
  logoSize: 64,
  inputPaddingVertical: 12,
  inputPaddingHorizontal: 16,
  cardPadding: 16,
  screenPadding: 16,
  listItemPadding: 16,
  sectionSpacing: 24,
  headerHeight: 60,
  tabBarHeight: 80,
  tabPaddingHorizontal: 24,
  tabPaddingVertical: 12,
  tabBorderradius: 12,
  tabHeight: 40,
  tabFixedWidth: 80, // Figma design: 79.5px rounded to 80
  tabGap: 4, // Reduced from 8 to give tabs more width
  tabIndicatorWidth: 60, // Figma: Gold line width above selected tab
  tabIndicatorHeight: 1, // Figma: Gold line thickness
  tabIndicatorOffset: 12, // Figma: Distance above icon
  formFieldSpacing: 16,
  heartButtonSize: 40,
  heroImageHeight: 150,
  clubLogoContainerSize: 80,
  clubLogoSize: 60,
  clubLogoNegativeMargin: -40,
  clubInfoPaddingTop: 14,
  emptyStatePaddingVertical: 48,
  sectionListGap: 12,
  heartButtonMarginRight: 8,
  clubHeaderGap: 16,
  clubInfoGap: 8,
  locationRowGap: 6,
  clubLogoPadding: 10,
  tabsRowMarginTop: 24,
  tabsRowHeight: 50,
  joinButtonWidth: 100,
  joinButtonHeight: 50,
  statsCardHeight: 80,
  statsCardPadding: 17,
  statsCardGap: 5,
  statsItemGap: 14,
  statsItemContentGap: 3,
  playingTimesGap: 16,
  userListHeight: 80,
  userListPadding: 16,
  userListTextGap: 3,
  userListAvatarMargin: 12,
  dotSize: 10,
  mapHeight: 160,
  statsRowGap: 16,
  comingSoonMarginTop: 48,
  mapToPlayingTimesGap: 40,

  // --- Icon & Avatar Sizes ---
  iconSizeSmall: 16,
  iconSizeSmaller: 20,
  iconSizeMedium: 24,
  iconSizeLarge: 32,
  iconSizeXLarge: 64,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  avatarSizeSmall: 32,
  avatarSizeMedium: 40,
  avatarSizeLarge: 48,
  teamPhotoSize: 32,
  teamPhotoRadius: 16,
  profilePhotoSize: 128,
  profilePhotoOffset: 64,
  backgroundImageHeight: 150,

  // --- Border Radii ---
  buttonBorderRadius: 12, // AES says per Figma Design System
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  borderRadiusXl: 16,
  borderRadiusXLarge: 20,
  borderRadiusRound: 20,
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  borderWidthMd: 2,
  borderWidthThin: 1,
  borderWidthThick: 4,
  borderOpacityLight: 0.4, // Figma: 40% opacity for borders
  borderOpacityLighter: 0.2, // Figma: 20% opacity for lighter borders


  // --- Top Navigation Home ---
  topDropdown: 46,
  topNavHeight: 80, // Adjusted: Reduced height to remove gap
  topNavBorderHeight: 1, // Figma: Bottom border height
  topNavTabHeight: 40, // Figma: Tab row height
  topNavTabWidth: 195, // Figma: Half width for each tab (390/2)
  topNavIndicatorWidth: 48, // Figma: Gold underline width
  topNavIndicatorHeight: 1, // Figma: Gold underline height
  topNavLogoSize: 30, // Figma: Logo size at top
  topNavLogoTop: 10, // Adjusted: Logo closer to top to remove gap
  marginBottomModal: 94,
  marginBotBottomSheet:90,

  // --- Layout & Grid ---
  screenHorizontalPadding: 16,
  containerMargin: 16,
  containerPadding: 16,
  containerPaddingListItem: 17,
  gridGap: 16,
  adminButtonWidth: 165, // Figma: Admin button width
  adminButtonHeight: 120, // Figma: Admin button card height
  adminButtonWidthPercent: '48%', // Two columns with gap between
  adminButtonBorderRadius: 12,
  adminButtonIconTop: 28, // Figma: Icon position from top (top-7)
  adminButtonIconSize: 36, // Figma: Icon height (h-9)
  adminButtonTextTop: 72, // Figma: Text position from top
  adminButtonTextSize: 16, // Figma: Text size

  // --- Team Admin Components ---
  memberCardHeight: 80, // Height of member cards in admin screens
  memberCardButtonGap: 12, // Gap between Accept/Ignore buttons
  removeIconWidth: 12, // Horizontal bar width for remove icon
  removeIconHeight: 2, // Horizontal bar height for remove icon
  addMembersCardHeight: 88, // "Add members" card specific height
  alertIconContainerSize: 40, // Alert icon background container
  interestCardButtonWidth: 145, // Width for Accept/Ignore buttons

  fabButtonSize: 56, // Figma: Floating action button size
  fabButtonBottom: 40, // Halved distance from bottom for better positioning
  fabButtonRight: 60, // Figma: Distance from right (390 - 310 - 56/2 = ~60)
  fabButtonTextSize: 28, // Figma: Plus symbol size
  fabButtonTextLineHeight: 28,
  fabButtonShadowElevation: 6,
  fabButtonShadowRadius: 4.5,
  fabButtonShadowOpacity: 0.3,
  fabButtonShadowOffsetHeight: 3,
  listSeparator: 1,
  dividerHeight: 1,
  shadowElevation: 4,
  // borderWidthMd: 2,
  heightListItem: 78,
  emptyStateVerticalPadding: 96, // xxxl * 3
  zIndexDropdown: 1000,

  // --- Welcome Screen Specific ---
  welcomeContentWidth: 342,
  welcomeContentGap: 48,
  welcomeLogoMargin: 32,
  welcomeTextWidth: 284,
  ShWelcomeLogoContainerWidth: 316,
  ShWelcomeLogoWidth: 340,
  ShWelcomeLogoHeight: 40,

  // --- Auth Screen Specific ---
  authLogoSize: 64, // Small logo size for auth screens
  authTextMaxWidth: 307, // Max width for descriptive text in auth screens

  // --- Modal Specific ---
  modalBorderRadiusTop: 24, // Admin create modal top corners
  modalHeight: 587, // Admin create modal height
  modalHeaderPadding: 24, // Modal header padding
  modalContentPadding: 24, // Modal content side padding
  modalItemGap: 12, // Gap between modal items
  modalItemPadding: 16, // Padding inside each modal item
  modalItemBorderRadius: 12, // Border radius for modal items
  modalItemIconSize: 40, // Icon container size in modal items
  modalItemIconGap: 20, // Gap between icon and text in modal items
  modalCloseButtonSize: 13, // Close button (X) size - rounded from 12.506
  modalHeaderToContentGap: 77, // Gap from modal top to first item
  modalBackgroundOpacity: 0.3, // Modal item background opacity
  modalBorderOpacity: 0.2, // Modal item border opacity
  modalIconBackgroundOpacity: 0.1, // Icon background opacity (10% gold)

  // --- Typography Spacing ---
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,

  // --- Team Admin Specific ---
  lineHeightRelaxed: 1.6,
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,

  // --- Payment Detail Screen ---
  paymentDetailHeaderHeight: 56,
  paymentDetailIconButtonSize: 40,
  paymentDetailAvatarSmall: 24,
  paymentDetailBannerPadding: 16,
  paymentDetailButtonPadding: 20,
  paymentDetailSectionGap: 8,
  paymentDetailBorderRadius: 12,

  // --- Events Display ---
  eventCardPadding: 20,
  eventCardBorderRadius: 16,
  eventCardGap: 12,
  eventCardMarginBottom: 12,
  eventTypeTagPadding: 8,
  eventTypeTagPaddingHorizontal: 12,
  eventTypeTagBorderRadius: 8,
  eventButtonWidth: 97, // (342 - 20*2 - 8*2) / 3 ≈ 97
  eventButtonHeight: 44,
  eventButtonPadding: 12,
  eventButtonPaddingHorizontal: 40,
  eventButtonBorderRadius: 12,
  eventButtonGap: 8,
  eventActionBannerPadding: 16,
  eventActionBannerBorderRadius: 16,
  eventActionBannerGap: 8,
  eventFilterDropdownHeight: 24,
  eventSectionHeaderGap: 60,
  eventTimeRowGap: 8,
  eventAlertIconSize: 16,

  // --- Map Defaults ---
  mapDefaultLatitude: -37.8136,
  mapDefaultLongitude: 144.9631,
  mapDefaultLatitudeDelta: 0.005,
  mapDefaultLongitudeDelta: 0.005,
} as const;

export type SpacingKey = keyof typeof spacing;
