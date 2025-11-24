# Home Screens As Components

## Home Feed (Figma Id: 845:4070)

- ShPostCard (contains multiple sub-components):
  - ShPostHeader
  - ShPostContent
  - ShPostImage
  - ShPostActions

## Create Post (Figma Id: 845:4091)

- ShFormFieldTextArea ("What do you want to talk about?")
- ShPhotoUploadArea
- ShText ("Post as \*")
- ShDropdownField ("Select team")
- ShText ("Schedule")
- ShDateTimePicker ("Select date and time")

## Comments (Figma Id: 845:4110)

- ShPostHeader
- ShPostContent
- ShText (muted, date)
- ShCommentCard (profile pic, name, role, comment text, timestamp)
- ShCommentInput ("Leave your comment")

## Edit Post (Figma Id: 845:4124)

- ShFormFieldTextArea (existing post content)
- ShPhotoUploadArea
- ShText ("Post as \*")
- ShDropdownField ("Select team")
- ShText ("Schedule \*")
- ShDateTimePicker ("Select date and time")
- ShDeleteButton ("Delete Post")

## Post Settings Modal (Figma Id: 845:4144)

- ShModalSheet ("Manage Post")
- ShModalMenuItem (edit icon, "Edit Post")
- ShModalMenuItem (trash icon, "Delete Post")
- ShModalMenuItem (block icon, "Block User")
- ShModalMenuItem (flag icon, "Report Post")

## Report Post (Figma Id: 845:4168)

- ShText ("Report Post", styled as heading)
- ShText ("Report")
- ShFormFieldTextArea ("Enter reason")
- ShText (muted, "Please ...")
