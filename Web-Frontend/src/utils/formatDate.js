// The formatDate.js in your utils folder is usually meant to standardize how dates and times are displayed across your app. For example, in notifications, activity logs, or any timestamps, you might want to show something like:

/*Mar 25, 2026, 12:15 PM
2 hours ago
25/03/2026

Instead of manually formatting dates in every component, you write a utility function once in formatDate.js and just call it wherever you need.*/
/*What formatDate.js does is take whatever date string or timestamp you get from the backend and display it nicely in the UI.

So in a real app flow:

Backend sends something like:
{
  "id": 1,
  "message": "Task assigned to you",
  "time": "2026-03-25T09:15:00Z",
  "type": "Task"
}
Frontend receives it and calls formatDate(notification.time) → displays Mar 25, 2026, 09:15 AM.*/
