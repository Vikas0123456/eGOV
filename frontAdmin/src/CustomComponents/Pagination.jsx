import React, { useEffect, useState } from "react";
import Select from "react-select";

const calculateRange = (totalCount, pageSize, currentPage) => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    return [start, end];
};

const Pagination = ({
    totalCount,
    perPageSize,
    currentPage,
    totalPages,
    handleSelectPageSize,
    handlePageChange,
    isCard,
}) => {
    const [start, end] = calculateRange(totalCount, perPageSize, currentPage);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const getPaginationItems = () => {
        const items = [];
        const startPage = Math.max(currentPage - 2, 1);
        const endPage = Math.min(currentPage + 2, totalPages);

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <li
                    key={page}
                    role="button"
                    className={`page ${currentPage === page ? "active" : ""}`}>
                    <div
                        className="page"
                        onClick={() => handlePageChange(page)}>
                        {page}
                    </div>
                </li>
            );
        }

        if (startPage > 1) {
            items.unshift(
                <li key="start-dots" className="page dots" role="button">
                    ...
                </li>
            );
        }

        if (endPage < totalPages) {
            items.push(
                <li key="end-dots" className="page dots" role="button">
                    ...
                </li>
            );
        }

        return items;
    };

    const options = isCard
        ? [
            { value: 12, label: "12" },
            { value: 24, label: "24" },
            { value: 48, label: "48" },
            { value: 100, label: "100" },
        ]
        : [
            { value: 2, label: "2" },
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 25, label: "25" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
        ];
    const selectedOption = options.find(
        (option) => option.value === perPageSize
    );

    return (
        totalCount > 0 && (
            <div className="d-flex justify-content-between p-3 bg-white border-rounded-3" style={{ flexDirection: windowWidth < 767 ? "column" : "row", }}>
                <div className="d-flex align-items-center mb-3 mb-md-0" style={{ justifyContent: windowWidth < 767 ? "center" : "flex-start", }}>
                    <div className="me-2">
                        <p className="m-0">{`Showing ${start} to ${end} of ${totalCount} entries`}</p>
                    </div>
                    <div>
                        <Select menuPosition="fixed" value={selectedOption} id="named-select" name="demo-select"
                            onChange={(selectedOption) => handleSelectPageSize({ target: { value: selectedOption.value }, })}
                            options={options}
                            styles={{
                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                            }}
                        />
                    </div>
                </div>

                <div className="d-flex" style={{ justifyContent: windowWidth < 767 ? "center" : "flex-end", }}>
                    <div className="ms-2     d-flex pagination-wrap hstack gap-2  ">
                        <button role="button"
                            className={`page-item pagination-prev ${currentPage === 1 ? "disabled" : ""}`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            id="pagination-prev-button">
                            Previous
                        </button>
                        <ul className="pagination listjs-pagination mb-0">
                            {getPaginationItems()}
                        </ul>
                        <button
                            role="button" className={`page-item pagination-next ${currentPage === totalPages ? "disabled" : ""}`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            id="pagination-next-button">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default Pagination;
