/**
 * Overrides the default PushNotification implementation to create a
 * notification with a layout similar to the 'The Big Meeting' notification,
 * showing in the screenshot above.
 */
public class MyPushNotification extends PushNotification {

    public MyPushNotification(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper jsIoHelper) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, jsIoHelper);
    }

    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        final Resources resources = mContext.getResources();

        // First, get a builder initialized with defaults from the core class.
        final Notification.Builder builder = super.getNotificationBuilder(intent);

        // Set our custom overrides --

        // Enable 'extended' layout (extends on down-stroke gesture):
        final Notification.BigTextStyle extendedNotificationStyle =
                new Notification.BigTextStyle()
                    .bigText(mNotificationProps.getBody()); // "4:15 - 5:15 PM\nBig Conference Room"
        builder.setStyle(extendedNotificationStyle);

        // Set custom-action icon.
        builder.setSmallIcon(R.drawable.meeting_icon)
                .setColor(resources.getColor(R.color.notification_bkg_color)); // Blue-ish

        // Add 'map' action.
        Notification.Action openMapAction = new Notification.Action(
                R.drawable.action_map,
                resources.getString(R.string.action_map),
                MyIntentUtils.getMapIntent(mNotificationProps.asBundle().getString("location")));
        builder.addAction(openMapAction);

        // Add 'email guests' action.
        Notification.Action emailGuestsAction = new Notification.Action(
                R.drawable.action_email_guests,
                resources.getString(R.string.action_email_guests),
                MyIntentUtils.getComposeEmailIntent(mNotificationProps.asBundle().getStringArrayList("invited")));
        builder.addAction(emailGuestsAction);

        return builder;
    }
}