export function calculateRemainingTimeTAT(targetDate) {
    if (targetDate) {
        const currentDate = new Date();
        const timeDifference = new Date(targetDate) - currentDate;
        if (timeDifference <= 0) {
            return "Completed";
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        let remainingTime = "";
        if (days > 1) {
            remainingTime += days + " days ";
        } else if (days === 1) {
            remainingTime += "1 day ";
        }

        if (days < 1) {
            remainingTime += hours + ":";
        }

        if (days < 1 || (days === 1 && hours > 0)) {
            remainingTime += minutes + ":";
        }

        if (days < 1) {
            remainingTime += seconds;
        }

        return remainingTime;
    } else {
        return "";
    }
}

export function stringAvatar(userData) {
    return `${userData?.firstName
        ?.split("")[0]
        .toUpperCase()}${userData?.lastName?.split("")[0].toUpperCase()}`;
}

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
