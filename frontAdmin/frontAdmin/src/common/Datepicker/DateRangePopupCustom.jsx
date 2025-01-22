import React, { useState, useEffect, useRef } from "react";
import Flatpickr from "react-flatpickr";

const DateRangePopupCustom = ({ dateStart, dateEnd, onChangeHandler, autoFocus }) => {
  const [selectedDates, setSelectedDates] = useState([dateStart, dateEnd]);
  const [maxEndDate, setMaxEndDate] = useState(new Date());
  const [close, setClose] = useState(false);
  const flatpickrRef = useRef(null);

  const handleDateChange = (dates) => {
    if (dates.length === 1) {
      const startDate = dates[0];
      const maxDateFromStart = new Date(startDate);
      maxDateFromStart.setDate(maxDateFromStart.getDate() + 31);

      const today = new Date();
      const calculatedMaxEndDate = maxDateFromStart < today ? maxDateFromStart : today;

      setMaxEndDate(calculatedMaxEndDate);
      setSelectedDates(dates);
    } else if (dates.length === 2) {
      onChangeHandler(dates);
      setSelectedDates(dates);
      setMaxEndDate(new Date());
    }
  };

  useEffect(() => {
    if (!dateStart && !dateEnd) {
      setSelectedDates([]);
      setMaxEndDate(new Date());
      setClose(!close);
    } else {
      setSelectedDates([dateStart, dateEnd]);
      if (dateStart) {
        const maxDateFromStart = new Date(dateStart);
        maxDateFromStart.setDate(maxDateFromStart.getDate() + 31);

        const today = new Date();
        const calculatedMaxEndDate = maxDateFromStart < today ? maxDateFromStart : today;

        setMaxEndDate(calculatedMaxEndDate);
      }
    }
  }, [dateStart, dateEnd]);

  useEffect(() => {
    if (autoFocus && flatpickrRef.current) {
      setTimeout(() => {
        flatpickrRef.current.flatpickr.open();
      }, 0); // Ensure Flatpickr initialization is complete
    }
  }, [autoFocus]);

  return (
    <Flatpickr
      options={{
        mode: "range",
        dateFormat: "d M Y",
        disableMobile: true,
        maxDate: maxEndDate,
      }}
      key={close}
      onChange={handleDateChange}
      placeholder="Select date range"
      className="form-control bg-white"
      value={selectedDates}
      ref={flatpickrRef}
    />
  );
};

export default DateRangePopupCustom;
