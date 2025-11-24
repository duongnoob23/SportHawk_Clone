import { ImageSourcePropType } from 'react-native';

/**
 * Use a string enum for type-safe, readable icon identifiers.
 * This ensures you can only use icon names that are defined here.
 */
export enum IconName {
  SportHawkLogo = 'SportHawkLogo',
  Splash = 'Splash',
  // ico icons
    ArrowLeft = 'ArrowLeft',
  Add = 'Add',
  Admin = 'Admin',
  Alert = 'Alert',
  Alert2 = 'Alert2',
  Alert3 = 'Alert3',
  AlertCircleOutline = 'AlertCircleOutline',
  Announcment = 'Announcment',
  Apple = 'Apple',
  Apple2 = 'Apple2',
  ArrowForward = 'ArrowForward',
  Badge = 'Badge',
  BackArrow = 'BackArrow',
  BackArrow2 = 'BackArrow2',
  Basketball = 'Basketball',
  Bell2 = 'Bell2',
  Bell3 = 'Bell3',
  Bell32x36 = 'Bell32x36',
  BellOutline = 'BellOutline',
  Bowling = 'Bowling',
  Calendarvariant3 = 'Calendarvariant3',
  Camera = 'Camera',
  Card = 'Card',
  Card405x315 = 'Card405x315',
  CardPrimary = 'CardPrimary',
  CardWhite = 'CardWhite',
  CardWhite2 = 'CardWhite2',
  CashOutline = 'CashOutline',
  CheckSmallInverted = 'CheckSmallInverted',
  CheckboxActive = 'CheckboxActive',
  CheckboxCross = 'CheckboxCross',
  CheckboxInactive = 'CheckboxInactive',
  Checkmark = 'Checkmark',
  CheckmarkCircle = 'CheckmarkCircle',
  ChevronDown = 'ChevronDown',
  ChevronUp = 'ChevronUp',
  ChevronDown2 = 'ChevronDown2',
  Close = 'Close',
  Comment = 'Comment',
  Cross = 'Cross',
  DownArrow = 'DownArrow',
  DownArrow2 = 'DownArrow2',
  DownArrow3 = 'DownArrow3',
  Download = 'Download',
  Edit = 'Edit',
  EditPen = 'EditPen',
  Eye = 'Eye',
  Football = 'Football',
  Gallery = 'Gallery',
  Google = 'Google',
  Google2 = 'Google2',
  GooglePay = 'GooglePay',
  GooglePay2 = 'GooglePay2',
  Heart2 = 'Heart2',
  HeartFillSmall = 'HeartFillSmall',
  HelpCircleOutline = 'HelpCircleOutline',
  HelpVariant2 = 'HelpVariant2',
  Info = 'Info',
  Journey = 'Journey',
  Key = 'Key',
  Key2 = 'Key2',
  LocationPin = 'LocationPin',
  LockFillSmall = 'LockFillSmall',
  Mail = 'Mail',
  Maps = 'Maps',
  Markervariant3 = 'Markervariant3',
  Netball = 'Netball',
  PadlockUnlocked = 'PadlockUnlocked',
  PadlockUnlocked2 = 'PadlockUnlocked2',
  People = 'People',
  PersonFill2 = 'PersonFill2',
  PersonOutline = 'PersonOutline',
  PersonOutline2 = 'PersonOutline2',
  Pin = 'Pin',
  Pin2 = 'Pin2',
  RightArrow = 'RightArrow',
  RightSmall = 'RightSmall',
  Rugby = 'Rugby',
  SceneryOutline = 'SceneryOutline',
  Search = 'Search',
  Security = 'Security',
  Settings = 'Settings',
  Settings34x36 = 'Settings34x36',
  Shirt = 'Shirt',
  Signout = 'Signout',
  SyncOutline = 'SyncOutline',
  Team45x36 = 'Team45x36',
  Tennis = 'Tennis',
  Terms = 'Terms',
  Tick = 'Tick',
  Tick2 = 'Tick2',
  TrendingUp = 'TrendingUp',
  Trophy = 'Trophy',
  VerifyEmail = 'VerifyEmail',
  // icx icons
  Bell = 'Bell',
  BellDefault = 'BellDefault',
  BellGray = 'BellGray',
  Calendar = 'Calendar',
  CalendarDefault = 'CalendarDefault',
  CalendarOutline = 'CalendarOutline',
  CalendarOutlineDefault = 'CalendarOutlineDefault',
  CalendarOutlineV2 = 'CalendarOutlineV2',
  CalendarV2 = 'CalendarV2',
  Clock = 'Clock',
  ClockDefault = 'ClockDefault',
  ClockYellow = 'ClockYellow',
  Compass = 'Compass',
  CompassDefault = 'CompassDefault',
  CompassGray = 'CompassGray',
  Filters = 'Filters',
  FiltersDefault = 'FiltersDefault',
  FiltersGray = 'FiltersGray',
  Heart = 'Heart',
  HeartDefault = 'HeartDefault',
  HeartV2 = 'HeartV2',
  Help = 'Help',
  HelpDefault = 'HelpDefault',
  HelpV2 = 'HelpV2',
  Home = 'Home',
  HomeDefault = 'HomeDefault',
  HomeGray = 'HomeGray',
  LogoL = 'LogoL',
  LogoM = 'LogoM',
  LogoS = 'LogoS',
  LogoXS = 'LogoXS',
  Marker = 'Marker',
  Marker12X16 = 'Marker12X16',
  MarkerDefault = 'MarkerDefault',
  PersonFill = 'PersonFill',
  PersonFillDefault = 'PersonFillDefault',
  PersonFillGray = 'PersonFillGray',
  Team = 'Team',
  TeamDefault = 'TeamDefault',
  TeamGray = 'TeamGray',
}

/**
 * Define the structure for our icon asset data.
 * Each icon will have a source from require() and its original filename.
 */
type IconAsset = {
  source: ImageSourcePropType;
  filename: string;
};

/**
 * The icon map.
 * This is the single source of truth for all icon assets.
 * The `Record` type ensures that every key MUST be a member of `IconName` enum,
 * and every value MUST be an `IconAsset`.
 *
 * The `require()` calls are static, so the Metro bundler can find and
 * include these images in your app build.
 */

export const iconMap: Record<IconName, IconAsset> = {
  // ico icons
  [IconName.SportHawkLogo]: {
    source: require('@ico/sporthawk_logo.svg'),
    filename: 'sporthawk_logo.svg',
  },
  [IconName.ArrowLeft]: {
    source: require('@ico/arrow-left.svg'),
    filename: 'arrow-left.svg',
  },
  [IconName.Splash]: {
    source: require('@ico/splash.png'),
    filename: 'splash.png',
  },
  [IconName.Add]: {
    source: require('@ico/add_172-362.svg'),
    filename: 'add_172-362.svg',
  },
  [IconName.Admin]: {
    source: require('@ico/admin_559-2751.svg'),
    filename: 'admin_559-2751.svg',
  },
  [IconName.Alert]: {
    source: require('@ico/alert_153-610.svg'),
    filename: 'alert_153-610.svg',
  },
  [IconName.Alert2]: {
    source: require('@ico/alert_66-204.svg'),
    filename: 'alert_66-204.svg',
  },
  [IconName.Alert3]: {
    source: require('@ico/alert.svg'),
    filename: 'alert.svg',
  },
  [IconName.AlertCircleOutline]: {
    source: require('@ico/alert-circle-outline.svg'),
    filename: 'alert-circle-outline.svg',
  },
  [IconName.Announcment]: {
    source: require('@ico/announcment_66-206.svg'),
    filename: 'announcment_66-206.svg',
  },
  [IconName.Apple]: {
    source: require('@ico/apple.svg'),
    filename: 'apple.svg',
  },
  [IconName.Apple2]: {
    source: require('@ico/apple_219-949.svg'),
    filename: 'apple_219-949.svg',
  },
  [IconName.ArrowForward]: {
    source: require('@ico/arrow-forward.svg'),
    filename: 'arrow-forward.svg',
  },
  [IconName.BackArrow]: {
    source: require('@ico/back-arrow_172-960.svg'),
    filename: 'back-arrow_172-960.svg',
  },
  [IconName.BackArrow2]: {
    source: require('@ico/back-arrow.svg'),
    filename: 'back-arrow.svg',
  },
  [IconName.Badge]: {
    source: require('@ico/badge.svg'),
    filename: 'badge.svg',
  },
  [IconName.Basketball]: {
    source: require('@ico/basketball_339-203.svg'),
    filename: 'basketball_339-203.svg',
  },
  [IconName.Bell2]: {
    source: require('@ico/bell.svg'),
    filename: 'bell.svg',
  },
  [IconName.Bell3]: {
    source: require('@ico/bell_66-204.svg'),
    filename: 'bell_66-204.svg',
  },
  [IconName.Bell32x36]: {
    source: require('@ico/bell-32x36_241-1941.svg'),
    filename: 'bell-32x36_241-1941.svg',
  },
  [IconName.BellOutline]: {
    source: require('@ico/bell-outline_256-2193.svg'),
    filename: 'bell-outline_256-2193.svg',
  },
  [IconName.Bowling]: {
    source: require('@ico/bowling_241-1801.svg'),
    filename: 'bowling_241-1801.svg',
  },
  [IconName.Calendarvariant3]: {
    source: require('@ico/calendarVariant3_241-1931.svg'),
    filename: 'calendarVariant3_241-1931.svg',
  },
  [IconName.Camera]: {
    source: require('@ico/camera_25-424.svg'),
    filename: 'camera_25-424.svg',
  },
  [IconName.Card]: {
    source: require('@ico/card_66-207.svg'),
    filename: 'card_66-207.svg',
  },
  [IconName.Card405x315]: {
    source: require('@ico/card-405x315_241-1937.svg'),
    filename: 'card-405x315_241-1937.svg',
  },
  [IconName.CardPrimary]: {
    source: require('@ico/card-primary.svg'),
    filename: 'card-primary.svg',
  },
  [IconName.CardWhite]: {
    source: require('@ico/card-white_219-951.svg'),
    filename: 'card-white_219-951.svg',
  },
  [IconName.CardWhite2]: {
    source: require('@ico/card-white.svg'),
    filename: 'card-white.svg',
  },
  [IconName.CashOutline]: {
    source: require('@ico/cash-outline.svg'),
    filename: 'cash-outline.svg',
  },
  [IconName.CheckboxActive]: {
    source: require('@ico/checkbox-active_265-1559.svg'),
    filename: 'checkbox-active_265-1559.svg',
  },
  [IconName.CheckboxCross]: {
    source: require('@ico/checkbox-cross_265-1561.svg'),
    filename: 'checkbox-cross_265-1561.svg',
  },
  [IconName.CheckboxInactive]: {
    source: require('@ico/checkbox-inactive_265-1560.svg'),
    filename: 'checkbox-inactive_265-1560.svg',
  },
  [IconName.Checkmark]: {
    source: require('@ico/checkmark.svg'),
    filename: 'checkmark.svg',
  },
  [IconName.CheckmarkCircle]: {
    source: require('@ico/checkmark-circle.svg'),
    filename: 'checkmark-circle.svg',
  },
  [IconName.CheckSmallInverted]: {
    source: require('@ico/check-small-inverted.svg'),
    filename: 'check-small-inverted.svg',
  },
  [IconName.ChevronDown]: {
    source: require('@ico/chevron-down_309-1454.svg'),
    filename: 'chevron-down_309-1454.svg',
  },
   [IconName.ChevronUp]: {
    source: require('@ico/chevron-up_309-1454.svg'),
    filename: 'chevron-up_309-1454.svg',
  },
  [IconName.ChevronDown2]: {
    source: require('@ico/chevron-down.svg'),
    filename: 'chevron-down.svg',
  },
  [IconName.Close]: {
    source: require('@ico/close_10-159.svg'),
    filename: 'close_10-159.svg',
  },
  [IconName.Comment]: {
    source: require('@ico/comment_723-3622.svg'),
    filename: 'comment_723-3622.svg',
  },
  [IconName.Cross]: {
    source: require('@ico/cross_241-2135.svg'),
    filename: 'cross_241-2135.svg',
  },
  [IconName.DownArrow]: {
    source: require('@ico/down-arrow_240-1811.svg'),
    filename: 'down-arrow_240-1811.svg',
  },
  [IconName.DownArrow2]: {
    source: require('@ico/down-arrow_153-319.svg'),
    filename: 'down-arrow_153-319.svg',
  },
  [IconName.DownArrow3]: {
    source: require('@ico/down-arrow.svg'),
    filename: 'down-arrow.svg',
  },
  [IconName.Download]: {
    source: require('@ico/download-24px.svg'),
    filename: 'download-24px.svg',
  },
  [IconName.Edit]: {
    source: require('@ico/edit_172-961.svg'),
    filename: 'edit_172-961.svg',
  },
  [IconName.EditPen]: {
    source: require('@ico/edit-pen_306-1680.svg'),
    filename: 'edit-pen_306-1680.svg',
  },
  [IconName.Eye]: {
    source: require('@ico/eye_66-489.svg'),
    filename: 'eye_66-489.svg',
  },
  [IconName.Football]: {
    source: require('@ico/football_241-1799.svg'),
    filename: 'football_241-1799.svg',
  },
  [IconName.Gallery]: {
    source: require('@ico/gallery_25-441.svg'),
    filename: 'gallery_25-441.svg',
  },
  [IconName.Google]: {
    source: require('@ico/google.svg'),
    filename: 'google.svg',
  },
  [IconName.Google2]: {
    source: require('@ico/google_25-87.svg'),
    filename: 'google_25-87.svg',
  },
  [IconName.GooglePay]: {
    source: require('@ico/google-pay.svg'),
    filename: 'google-pay.svg',
  },
  [IconName.GooglePay2]: {
    source: require('@ico/google-pay_219-950.svg'),
    filename: 'google-pay_219-950.svg',
  },
  [IconName.Heart2]: {
    source: require('@ico/heart_25-564.svg'),
    filename: 'heart_25-564.svg',
  },
  [IconName.HeartFillSmall]: {
    source: require('@ico/heart-fill-small_378-2170.svg'),
    filename: 'heart-fill-small_378-2170.svg',
  },
  [IconName.HelpCircleOutline]: {
    source: require('@ico/help-circle-outline.svg'),
    filename: 'help-circle-outline.svg',
  },
  [IconName.HelpVariant2]: {
    source: require('@ico/help-variant2.svg'),
    filename: 'help-variant2.svg',
  },
  [IconName.Info]: {
    source: require('@ico/info.svg'),
    filename: 'info.svg',
  },
  [IconName.Journey]: {
    source: require('@ico/journey_57-175.svg'),
    filename: 'journey_57-175.svg',
  },
  [IconName.Key]: {
    source: require('@ico/key_66-211.svg'),
    filename: 'key_66-211.svg',
  },
  [IconName.Key2]: {
    source: require('@ico/key.svg'),
    filename: 'key.svg',
  },
  [IconName.LocationPin]: {
    source: require('@ico/location-pin.svg'),
    filename: 'location-pin.svg',
  },
  [IconName.LockFillSmall]: {
    source: require('@ico/lock-fill-small_378-2169.svg'),
    filename: 'lock-fill-small_378-2169.svg',
  },
  [IconName.Mail]: {
    source: require('@ico/mail_66-209.svg'),
    filename: 'mail_66-209.svg',
  },
  [IconName.Maps]: {
    source: require('@ico/maps_348-210.svg'),
    filename: 'maps_348-210.svg',
  },
  [IconName.Markervariant3]: {
    source: require('@ico/markerVariant3_172-1120.svg'),
    filename: 'markerVariant3_172-1120.svg',
  },
  [IconName.Netball]: {
    source: require('@ico/netball.svg'),
    filename: 'netball.svg',
  },
  [IconName.PadlockUnlocked]: {
    source: require('@ico/padlock-unlocked.svg'),
    filename: 'padlock-unlocked.svg',
  },
  [IconName.PadlockUnlocked2]: {
    source: require('@ico/padlock-unlocked_66-208.svg'),
    filename: 'padlock-unlocked_66-208.svg',
  },
  [IconName.People]: {
    source: require('@ico/people_192-1111.svg'),
    filename: 'people_192-1111.svg',
  },
  [IconName.PersonFill2]: {
    source: require('@ico/person-fill.svg'),
    filename: 'person-fill.svg',
  },
  [IconName.PersonOutline]: {
    source: require('@ico/person-outline_25-442.svg'),
    filename: 'person-outline_25-442.svg',
  },
  [IconName.PersonOutline2]: {
    source: require('@ico/person-outline.svg'),
    filename: 'person-outline.svg',
  },
  [IconName.Pin]: {
    source: require('@ico/pin.svg'),
    filename: 'pin.svg',
  },
  [IconName.Pin2]: {
    source: require('@ico/pin_265-742.svg'),
    filename: 'pin_265-742.svg',
  },
  [IconName.RightArrow]: {
    source: require('@ico/right-arrow.svg'),
    filename: 'right-arrow.svg',
  },
  [IconName.RightSmall]: {
    source: require('@ico/right-small_248-1888.svg'),
    filename: 'right-small_248-1888.svg',
  },
  [IconName.Rugby]: {
    source: require('@ico/rugby_339-201.svg'),
    filename: 'rugby_339-201.svg',
  },
  [IconName.SceneryOutline]: {
    source: require('@ico/scenery-outline.svg'),
    filename: 'scenery-outline.svg',
  },
  [IconName.Search]: {
    source: require('@ico/search_228-1001.svg'),
    filename: 'search_228-1001.svg',
  },
  [IconName.Security]: {
    source: require('@ico/security.svg'),
    filename: 'security.svg',
  },
  [IconName.Settings]: {
    source: require('@ico/settings_306-1654.svg'),
    filename: 'settings_306-1654.svg',
  },
  [IconName.Settings34x36]: {
    source: require('@ico/settings-34x36_241-1938.svg'),
    filename: 'settings-34x36_241-1938.svg',
  },
  [IconName.Signout]: {
    source: require('@ico/signout_378-2167.svg'),
    filename: 'signout_378-2167.svg',
  },
  [IconName.Shirt]: {
    source: require('@ico/shirt.svg'),
    filename: 'shirt.svg',
  },
  [IconName.SyncOutline]: {
    source: require('@ico/sync-outline.svg'),
    filename: 'sync-outline.svg',
  },
  [IconName.Team45x36]: {
    source: require('@ico/team-45x36_241-1939.svg'),
    filename: 'team-45x36_241-1939.svg',
  },
  [IconName.Tennis]: {
    source: require('@ico/tennis_241-1800.svg'),
    filename: 'tennis_241-1800.svg',
  },
  [IconName.Terms]: {
    source: require('@ico/terms.svg'),
    filename: 'terms.svg',
  },
  [IconName.Tick]: {
    source: require('@ico/tick.svg'),
    filename: 'tick.svg',
  },
  [IconName.Tick2]: {
    source: require('@ico/tick_25-455.svg'),
    filename: 'tick_25-455.svg',
  },
  [IconName.TrendingUp]: {
    source: require('@ico/trending-up.svg'),
    filename: 'trending-up.svg',
  },
  [IconName.Trophy]: {
    source: require('@ico/trophy_435-2478.svg'),
    filename: 'trophy_435-2478.svg',
  },
  [IconName.VerifyEmail]: {
    source: require('@ico/verify-email.svg'),
    filename: 'verify-email.svg',
  },
  // icx icons
  [IconName.PersonFillDefault]: {
    source: require('@icx/person-fill-default_91-250.svg'),
    filename: 'person-fill-default_91-250.svg',
  },
  [IconName.HelpV2]: {
    source: require('@icx/help-variant2_265-2195.svg'),
    filename: 'help-variant2_265-2195.svg',
  },
  [IconName.Compass]: {
    source: require('@icx/compass_57-172.svg'),
    filename: 'compass_57-172.svg',
  },
  [IconName.HeartDefault]: {
    source: require('@icx/heart-default_345-355.svg'),
    filename: 'heart-default_345-355.svg',
  },
  [IconName.ClockDefault]: {
    source: require('@icx/clock-default_153-545.svg'),
    filename: 'clock-default_153-545.svg',
  },
  [IconName.CompassDefault]: {
    source: require('@icx/compass-default_57-172.svg'),
    filename: 'compass-default_57-172.svg',
  },
  [IconName.MarkerDefault]: {
    source: require('@icx/marker-default_57-166.svg'),
    filename: 'marker-default_57-166.svg',
  },
  [IconName.ClockYellow]: {
    source: require('@icx/clock-yellow_172-1009.svg'),
    filename: 'clock-yellow_172-1009.svg',
  },
  [IconName.HomeDefault]: {
    source: require('@icx/home-default_91-247.svg'),
    filename: 'home-default_91-247.svg',
  },
  [IconName.CompassGray]: {
    source: require('@icx/compass-grey_91-244.svg'),
    filename: 'compass-grey_91-244.svg',
  },
  [IconName.HelpDefault]: {
    source: require('@icx/help-default_66-210.svg'),
    filename: 'help-default_66-210.svg',
  },
  [IconName.CalendarDefault]: {
    source: require('@icx/calendar-default_66-205.svg'),
    filename: 'calendar-default_66-205.svg',
  },
  [IconName.TeamDefault]: {
    source: require('@icx/team-default_91-248.svg'),
    filename: 'team-default_91-248.svg',
  },
  [IconName.BellDefault]: {
    source: require('@icx/bell-default_91-249.svg'),
    filename: 'bell-default_91-249.svg',
  },
  [IconName.CalendarOutlineDefault]: {
    source: require('@icx/calendar-outline-default_153-546.svg'),
    filename: 'calendar-outline-default_153-546.svg',
  },
  [IconName.Home]: {
    source: require('@icx/home_91-247.svg'),
    filename: 'home_91-247.svg',
  },
  [IconName.Filters]: {
    source: require('@icx/filters_332-291.svg'),
    filename: 'filters_332-291.svg',
  },
  [IconName.Marker12X16]: {
    source: require('@icx/marker-12x16_57-168.svg'),
    filename: 'marker-12x16_57-168.svg',
  },
  [IconName.Calendar]: {
    source: require('@icx/calendar_66-205.svg'),
    filename: 'calendar_66-205.svg',
  },
  [IconName.BellGray]: {
    source: require('@icx/bell-grey_91-258.svg'),
    filename: 'bell-grey_91-258.svg',
  },
  [IconName.LogoL]: {
    source: require('@icx/logo-l_7-6096.svg'),
    filename: 'logo-l_7-6096.svg',
  },
  [IconName.CalendarOutlineV2]: {
    source: require('@icx/calendar-outline-variant2_256-2140.svg'),
    filename: 'calendar-outline-variant2_256-2140.svg',
  },
  [IconName.Team]: {
    source: require('@icx/team_91-248.svg'),
    filename: 'team_91-248.svg',
  },
  [IconName.Help]: {
    source: require('@icx/help_66-210.svg'),
    filename: 'help_66-210.svg',
  },
  [IconName.Bell]: {
    source: require('@icx/bell_91-249.svg'),
    filename: 'bell_91-249.svg',
  },
  [IconName.FiltersGray]: {
    source: require('@icx/filters-grey_332-293.svg'),
    filename: 'filters-grey_332-293.svg',
  },
  [IconName.PersonFillGray]: {
    source: require('@icx/person-fill-grey_91-261.svg'),
    filename: 'person-fill-grey_91-261.svg',
  },
  [IconName.CalendarV2]: {
    source: require('@icx/calendar-variant2_153-535.svg'),
    filename: 'calendar-variant2_153-535.svg',
  },
  [IconName.Clock]: {
    source: require('@icx/clock_153-545.svg'),
    filename: 'clock_153-545.svg',
  },
  [IconName.Marker]: {
    source: require('@icx/marker_57-166.svg'),
    filename: 'marker_57-166.svg',
  },
  [IconName.TeamGray]: {
    source: require('@icx/team-grey_91-255.svg'),
    filename: 'team-grey_91-255.svg',
  },
  [IconName.HeartV2]: {
    source: require('@icx/heart-variant2_345-357.svg'),
    filename: 'heart-variant2_345-357.svg',
  },
  [IconName.FiltersDefault]: {
    source: require('@icx/filters-default_332-291.svg'),
    filename: 'filters-default_332-291.svg',
  },
  [IconName.HomeGray]: {
    source: require('@icx/home-grey_91-252.svg'),
    filename: 'home-grey_91-252.svg',
  },
  [IconName.PersonFill]: {
    source: require('@icx/person-fill_91-250.svg'),
    filename: 'person-fill_91-250.svg',
  },
  [IconName.LogoM]: {
    source: require('@icx/logo-m_7-6093.svg'),
    filename: 'logo-m_7-6093.svg',
  },
  [IconName.LogoXS]: {
    source: require('@icx/logo-xs_726-4030.svg'),
    filename: 'logo-xs_726-4030.svg',
  },
  [IconName.Heart]: {
    source: require('@icx/heart_345-355.svg'),
    filename: 'heart_345-355.svg',
  },
  [IconName.CalendarOutline]: {
    source: require('@icx/calendar-outline_153-546.svg'),
    filename: 'calendar-outline_153-546.svg',
  },
  [IconName.LogoS]: {
    source: require('@icx/logo-s_7-6090.svg'),
    filename: 'logo-s_7-6090.svg',
  },
};
