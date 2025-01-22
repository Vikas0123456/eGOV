export function calculateRemainingTimeTAT(targetDate, status = null ,type="") {
    if (targetDate) {
        const currentDate = new Date();
        const timeDifference = new Date(targetDate) - currentDate;

        // Check if status is "4", indicating completion regardless of time left
        if (status === "4" && type ==="service") {
            return "Completed";
        }
        if (status === "3" && type ==="ticket") {
            return "Completed";
        }
        // If status is not "4" and time has passed, it is overdue
        if (timeDifference <= 0) {
            return "Overdue";
        }

        // Calculate remaining time
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        let remainingTime = "";
        if (days > 0) {
            remainingTime += days + (days > 1 ? " days " : " day ");
            remainingTime += hours + " hrs left";
        } else {
            remainingTime += hours.toString().padStart(2, "0") + ":";
            remainingTime += minutes.toString().padStart(2, "0") + ":";
            remainingTime += seconds.toString().padStart(2, "0");
        }

        return remainingTime;
    } else {
        return "";
    }
}


export function formatedDate(inputDate) {
    // Convert the input string to a Date object
    const date = new Date(inputDate);

    // Months array
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    // Get the day, month, and year
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Construct the formatted date string
    const formattedDate = `${day} ${month},${year}`;

    return formattedDate;
}

// export function formatRelativeTime(createdAt) {

//   const now = new Date();
//   const createdDate = new Date(createdAt);
//   const timeDifference = now - createdDate;
//   const seconds = Math.floor(timeDifference / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);
//   const weeks = Math.floor(days / 7);
//   const months = Math.floor(days / 30);

//   if (seconds < 60) {
//     return seconds <= 0
//       ? "just now"
//       : `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
//   } else if (minutes < 60) {
//     return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
//   } else if (hours < 24) {
//     return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
//   } else if (days < 7) {
//     return `${days} ${days === 1 ? "day" : "days"} ago`;
//   } else if (weeks < 4) {
//     return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
//   } else if (months < 12) {
//     return `${months} ${months === 1 ? "month" : "months"} ago`;
//   } else {
//     const years = Math.floor(months / 12);
//     return `${years} ${years === 1 ? "year" : "years"} ago`;
//   }

// }

export function formatRelativeTime(dateFromDB) {
    if (dateFromDB == null || undefined || "") {
        return "-";
    }

    const now = new Date();
    const dbDate = new Date(dateFromDB);
    const diffInMs = now - dbDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInSeconds < 0) {
        return "Invalid date";
    }
    if (diffInSeconds < 60) {
        return "Just now";
    }
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    }
    const diffInMonths =
        (now.getFullYear() - dbDate.getFullYear()) * 12 +
        (now.getMonth() - dbDate.getMonth());
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    }
    const diffInYears = now.getFullYear() - dbDate.getFullYear();
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

export function hasViewPermission(module) {
    return module.permissions.some(
        (permission) => permission.permissionName === "View"
    );
}
export function hasEditPermission(module) {
    return module.permissions.some(
        (permission) => permission.permissionName === "Edit"
    );
}
export function hasDeletePermission(module) {
    return module.permissions.some(
        (permission) => permission.permissionName === "Delete"
    );
}
export function hasCreatePermission(module) {
    return module.permissions.some(
        (permission) => permission.permissionName === "Create"
    );
}
export function hasAssignPermission(module) {
    return module.permissions.some(
        (permission) => permission.permissionName === "AssignTo"
    );
}
