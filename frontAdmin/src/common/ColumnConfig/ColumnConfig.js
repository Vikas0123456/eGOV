import { Plus } from 'feather-icons-react/build/IconComponents';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

const ColumnConfig = ({
  openColumnModal = false, // default to false
  handleOpenColumnModal = () => {}, // default to a no-op function
  handleApplyChanges = (e) => e.preventDefault(), // default prevent submission if not provided
  handleSelectAll = () => {}, // default to a no-op function
  selectedColumns = [], // default to empty array
  allColumns = [], // default to empty array
  handleColumnChange = () => {}, // default to a no-op function
  handleCancel = () => {} // default to a no-op function
}) => {
  return (
   
      <Dropdown
        show={openColumnModal}
        onToggle={handleOpenColumnModal}
        autoClose="outside" title='Add Column'
      >
        <Dropdown.Toggle
          variant="primary"
          id="dropdown-basic"
          className="btn btn-primary btn-label"
        >
          <i className="ri-menu-add-fill fs-18  label-icon"></i>
          {/* bg-light */}
          {/* <Plus className="me-2" width="16" height="16" /> */}
          Add Column
        </Dropdown.Toggle>

        <Dropdown.Menu
          style={{
            maxHeight: "calc(100vh - 50px)",
            overflowX: "auto",
            width: "250px",
          }}
        >
          <SimpleBar style={{ maxHeight: "100%", overflowX: "auto" }}>
            <form className="p-3" onSubmit={handleApplyChanges}>
              {/* Select All Checkbox */}
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAllColumns"
                  checked={selectedColumns?.length === allColumns?.length} // Check if all columns are selected
                  onChange={handleSelectAll}
                  disabled={!allColumns?.length} // Disable if no columns available
                />
                <label className="form-check-label" htmlFor="selectAllColumns">
                  Select All Columns
                </label>
              </div>

              {/* Individual Column Checkboxes */}
              {allColumns &&
                allColumns?.map((column) => (
                  <div className="form-check mb-2" key={column}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`column-${column}`}
                      checked={selectedColumns?.includes(column)}
                      onChange={() => handleColumnChange(column)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`column-${column}`}
                    >
                      {column && column?.charAt(0)?.toUpperCase() + column?.slice(1)}
                    </label>
                  </div>
                ))
               }

              {/* Footer Buttons */}
              <div className="d-flex justify-content-between mt-3">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Apply
                </button>
              </div>
            </form>
          </SimpleBar>
        </Dropdown.Menu>
      </Dropdown>
   
  );
};

export default ColumnConfig;
