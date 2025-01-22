export function formatDateLog(inputDate) {
    // Convert the input string to a Date object
    const date = new Date(inputDate);
  
    // Months array
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    // Get the day, month, and year
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
  
    // Get the hours and minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();
  
    // AM or PM
    const ampm = hours >= 12 ? 'pm' : 'am';
  
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  
    // Add leading zero to minutes if needed
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    // Construct the formatted date string
    const formattedDate = `${day} ${month},${year} ${hours}:${minutes}${ampm}`;
  
    return formattedDate;
  }

  export function formatedDate(inputDate) {
    // Convert the input string to a Date object
    const date = new Date(inputDate);
  
    // Months array
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    // Get the day, month, and year
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
  
    // Construct the formatted date string
    const formattedDate = `${day} ${month},${year}`;
  
    return formattedDate;
  }
  