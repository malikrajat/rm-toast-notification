# ⭐ Toast Notification Service

[![npm version](https://img.shields.io/npm/v/colorful-console-logger.svg)](https://www.npmjs.com/package/colorful-console-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A lightweight, customizable, and easy-to-use toast notification service for web applications. This library provides a flexible way to display timed notifications with various styles, animations, and auto-dismiss functionality. Ideal for adding non-intrusive alerts and messages to your web applications.

---

## 🚀 Features

- 🌈 **Customizable Notifications**: Supports customizable colors, icons, headers, footers, and action buttons.
- 📂 **Multiple Positioning**: Notifications can be shown in any corner of the screen (`top-left`, `top-right`, `bottom-left`, `bottom-right`).
- 📦 **Animations**: Includes animation options for sliding in and out of view.
- 🌈 **Auto-Dismiss**: Notifications automatically disappear after a set duration or can be dismissed manually.
- 🔒 **HTML Support**: Safely render HTML content within notifications with XSS protection using [DOMPurify](https://github.com/cure53/DOMPurify).
- 🛠 **Action Buttons**: Option to add action buttons to notifications.
- 🔒 **Custom Logo**: Add custom logos to the notification for branding.

---

## 📦 Installation

You can install the package via npm:

```bash
npm install toast-notification-service
```

Or with Yarn:

```bash
  yarn add toast-notification-service
```

---

## 🛠️ Usage

### 🔹 Basic Usage
Create a service and reuse it.

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

### 🔹 Available Options

| **Option**        | **Type**    | **Description**                                                                                       | **Default**      |
|-------------------|-------------|-------------------------------------------------------------------------------------------------------|------------------|
| `type`            | `string`    | Notification type. Available options: `success`, `error`, `warning`, `info`.                        | `info`           |
| `position`        | `string`    | Position of the toast on the screen. Available options: `top-left`, `top-right`, `bottom-left`, `bottom-right`. | `top-right`      |
| `duration`        | `number`    | Duration in milliseconds to show the toast. Set to `null` for a permanent toast.                     | `3000`           |
| `header`          | `string`    | The header text for the notification. (Optional)                                                    |                  |
| `body`            | `string`    | The body content. Can be plain text or sanitized HTML.                                               |                  |
| `footer`          | `string`    | The footer text. (Optional)                                                                         |                  |
| `logo`            | `string`    | URL of the logo image. (Optional)                                                                   |                  |
| `color`           | `string`    | Custom background color. (Optional)                                                                 |                  |
| `onClick`         | `function`  | Custom click event handler for the notification. (Optional)                                         |                  |
| `actionButton`    | `object`    | Custom action button with `text` and `onClick` function. (Optional)                                 |                  |
| `animation`       | `boolean`   | Enable or disable animation for showing the toast.                                                  | `true`           |

### 🔹 Example with Action Button

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

### 🔹 Example with HTML Content

```javascript
toastService.showToast({
  type: 'error',
  position: 'top-right',
  duration: 5000,
  body: '<strong>Error!</strong> <p>An unexpected error occurred.</p>',
});
```

## 🌐 Compatibility

This library works seamlessly in:

- Angular 8+
- React 16.8+
- Node.js 14+

*(Feel free to add compatibility notes for other environments.)*

---

## 🔏 Browser Support

This library is designed to work in modern browsers. It supports the following browsers:

- Chrome
- Firefox
- Safari
- Edge

---

## 🛡️ Security

This library does not store or expose any sensitive information. It is designed to operate purely on the client side. If you find any vulnerabilities, please report them.

---

## 🔖 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 🚨 Issues

If you identify any errors in this component, or have an idea for an improvement, please open
an [issue](https://github.com/malikrajat/rm-toast-notification/issues). I am excited to see what the community thinks of this
project, and I would love your input!

---

## 💎 Author Services

Are you interested in this library but lacks features? Write to the author, he can do it for you.

---

## 👤 Author

**Rajat Malik**

- [github/malikrajat](https://github.com/malikrajat)

---

## 📚 Keywords

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

