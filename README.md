

```markdown
# Toast Notification Service

A lightweight, customizable, and easy-to-use toast notification service for web applications. This library provides a flexible way to display timed notifications with various styles, animations, and auto-dismiss functionality. Ideal for adding non-intrusive alerts and messages to your web applications.

## Features

- **Customizable Notifications**: Supports customizable colors, icons, headers, footers, and action buttons.
- **Multiple Positioning**: Notifications can be shown in any corner of the screen (`top-left`, `top-right`, `bottom-left`, `bottom-right`).
- **Animations**: Includes animation options for sliding in and out of view.
- **Auto-Dismiss**: Notifications automatically disappear after a set duration or can be dismissed manually.
- **HTML Support**: Safely render HTML content within notifications with XSS protection using [DOMPurify](https://github.com/cure53/DOMPurify).
- **Action Buttons**: Option to add action buttons to notifications.
- **Custom Logo**: Add custom logos to the notification for branding.

## Installation

You can install the package via npm:

```bash
npm install toast-notification-service
```

## Usage

### Basic Usage

```javascript
import ToastNotification from 'rm-toast-notification';

const toastService = new ToastNotification();

toastService.showToast({
  type: 'info',          // Notification type (success, error, warning, info)
  position: 'top-right', // Position of the toast (top-left, top-right, bottom-left, bottom-right)
  duration: 3000,        // Duration in milliseconds (null for permanent)
  header: 'Information', // Header text (optional)
  body: 'This is a simple toast notification.', // Body content (can be plain text or HTML)
  footer: 'Footer content (optional)', // Footer text (optional)
  logo: 'https://example.com/logo.png', // Logo image (optional)
  color: '',             // Custom background color (optional)
  actionButton: {        // Action button (optional)
    text: 'Action',
    onClick: () => alert('Action clicked!'),
  },
  onClick: (e) => {      // Custom onClick event (optional)
    console.log('Toast clicked', e);
  },
  animation: true        // Animation for appearance (true or false)
});
```

### Available Options

- **`type`** (string): Notification type. Available options: `success`, `error`, `warning`, `info`. Default is `info`.
- **`position`** (string): Position of the toast on the screen. Available options: `top-left`, `top-right`, `bottom-left`, `bottom-right`. Default is `top-right`.
- **`duration`** (number|null): The duration in milliseconds to show the toast. Set to `null` for a permanent toast that needs to be dismissed manually. Default is `3000`.
- **`header`** (string): The header text for the notification (optional).
- **`body`** (string): The body content. You can pass plain text or HTML (HTML will be sanitized).
- **`footer`** (string): The footer text (optional).
- **`logo`** (string): URL of the logo image (optional).
- **`color`** (string): Custom background color (optional).
- **`onClick`** (function): Custom click event handler for the notification (optional).
- **`actionButton`** (object): Custom action button with `text` and `onClick` function (optional).
- **`animation`** (boolean): Enable or disable animation for showing the toast (optional, default is `true`).

### Example with Action Button

```javascript
toastService.showToast({
  type: 'success',
  position: 'bottom-left',
  duration: 4000,
  header: 'Success!',
  body: 'You have successfully completed the task.',
  actionButton: {
    text: 'Undo',
    onClick: () => alert('Undo clicked!'),
  },
});
```

### Example with HTML Content

```javascript
toastService.showToast({
  type: 'error',
  position: 'top-right',
  duration: 5000,
  body: '<strong>Error!</strong> <p>An unexpected error occurred.</p>',
});
```

## Styling

You can further customize the toast notifications by overriding the default styles or by using your own CSS. The notifications are already designed to be responsive, flexible, and suitable for all screen sizes.

### CSS Animations

The library includes CSS animations for sliding to/from the screen. These animations are customizable, and you can modify the `@keyframes` or add additional transitions in your own styles.

## Browser Support

This library is designed to work in modern browsers. It supports the following browsers:

- Chrome
- Firefox
- Safari
- Edge

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests to improve the functionality, add features, or fix bugs. Make sure to follow the coding conventions and write tests for new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Keywords

- toast
- notification
- UI
- web
- alerts
- frontend
- javascript
- toast-notification
- react
- angular
- vanilla-js
- custom-toast
```

---

### Key Sections:

1. **Features**: A concise list of the features that your library provides.
2. **Installation**: Instructions on how to install the package.
3. **Usage**: How to use the service with code examples for various scenarios.
4. **Available Options**: Explanation of all the configurable options for the toast notifications.
5. **CSS Animations**: Details about built-in animations and how to override them.
6. **Contributing**: A call to action for contributions, encouraging developers to improve the library.
7. **License**: Legal information on the license.

This should provide potential users of your library with all the information they need to get started quickly, as well as offer them a clear path for contributing.